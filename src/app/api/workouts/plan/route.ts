import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Helper function to get the Monday of the current week
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  console.log(`📅 getMondayOfWeek input: ${d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} (day ${day})`);
  
  // Calculate days to subtract to get to Monday of this week
  // Sunday (0) → go back 6 days to reach Monday
  // Monday (1) → stay (0 days back)
  // Tuesday (2) → go back 1 day
  // Wednesday (3) → go back 2 days
  // Thursday (4) → go back 3 days
  // Friday (5) → go back 4 days
  // Saturday (6) → go back 5 days
  const daysToSubtract = day === 0 ? 6 : day - 1;
  
  d.setDate(d.getDate() - daysToSubtract);
  
  console.log(`📅 getMondayOfWeek output: ${d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} (went back ${daysToSubtract} days)`);
  
  return d;
}

// Helper function to get the next Monday (or current day if it's Monday)
function getNextMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // If today is Monday, return today
  if (day === 1) {
    return d;
  }
  
  // Calculate days to add to get to next Monday
  // Sunday (0) -> add 1 day
  // Tuesday (2) -> add 6 days
  // Wednesday (3) -> add 5 days
  // Thursday (4) -> add 4 days
  // Friday (5) -> add 3 days
  // Saturday (6) -> add 2 days
  const daysToAdd = day === 0 ? 1 : 8 - day;
  
  d.setDate(d.getDate() + daysToAdd);
  return d;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'CURRENT_WEEKS';
    const forceRecreate = searchParams.get('forceRecreate') === 'true';
    
    console.log('GET - Finding NEWEST plan for type:', type, '| Force recreate:', forceRecreate);

    // Calculate date ranges for sections
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('📅 Today (server time):', today.toISOString(), '/', today.toLocaleDateString(), 'Day of week:', today.getDay());
    
    // Calculate Monday of current week for proper date alignment
    const mondayOfThisWeek = getMondayOfWeek(today);
    console.log('📅 Monday of this week:', mondayOfThisWeek.toLocaleDateString());
    
    // Date filter based on section type
    // NOTE: For Section A (CURRENT_WEEKS), we don't filter by date because
    // the plan itself is created with exactly 3 weeks starting from Monday
    let dateFilter: any = {};
    
    if (type === 'YEARLY_PLAN') {
      // Section B: Only show future dates beyond the current 3-week window
      const threeWeeksFromMonday = new Date(mondayOfThisWeek);
      threeWeeksFromMonday.setDate(threeWeeksFromMonday.getDate() + 21); // Day 22 onwards
      dateFilter = {
        gte: threeWeeksFromMonday
      };
      console.log(`Section B date filter: from ${threeWeeksFromMonday.toISOString()} onwards`);
    } else {
      console.log(`Section ${type}: No date filter, showing all days in plan`);
    }

    // Get or create workout plan - ORDER BY NEWEST FIRST!
    let plan = await prisma.workoutPlan.findFirst({
      where: {
        userId: decoded.userId,
        type: type as any
      },
      include: {
        weeks: {
          include: {
            days: {
              where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
              include: {
                period: true,
                workouts: {
                  include: {
                    sports: true,
                    moveframes: {
                      include: {
                        section: true,
                        movelaps: {
                          orderBy: { repetitionNumber: 'asc' }
                        }
                      },
                      orderBy: { letter: 'asc' }
                    }
                  },
                  orderBy: { sessionNumber: 'asc' }
                }
              },
              orderBy: { dayOfWeek: 'asc' }
            }
          },
          orderBy: { weekNumber: 'asc' }
        }
      },
      orderBy: {
        createdAt: 'desc' // GET NEWEST PLAN FIRST!
      }
    });

    console.log('GET - Found plan:', plan?.id, 'with', plan?.weeks?.length || 0, 'weeks');
    
    if (plan) {
      console.log('📊 Existing plan details:', {
        id: plan.id,
        startDate: plan.startDate,
        endDate: plan.endDate,
        weeksCount: plan.weeks?.length || 0,
        createdAt: plan.createdAt
      });
    }

    // Check if plan is empty or doesn't start on Monday
    let isPlanEmpty = false;
    let needsRecreation = false;
    
    if (plan) {
      // Check if empty
      if (plan.weeks.length === 0) {
        isPlanEmpty = true;
        console.log('⚠️ Plan has no weeks!');
      } else {
        const totalDays = plan.weeks.reduce((sum, week) => sum + (week.days?.length || 0), 0);
        if (totalDays === 0) {
          isPlanEmpty = true;
          console.log('⚠️ Plan has weeks but no days!');
        }
      }
      
      // Check if plan starts on Monday
      if (!isPlanEmpty && plan.startDate) {
        const planStart = new Date(plan.startDate);
        const dayOfWeek = planStart.getDay(); // 0 = Sunday, 1 = Monday
        if (dayOfWeek !== 1) {
          needsRecreation = true;
          console.log(`⚠️ Plan does not start on Monday! It starts on day ${dayOfWeek} (${planStart.toLocaleDateString('en-US', { weekday: 'long' })})`);
        }
      }
    }

    // If plan is empty, doesn't start on Monday, or force recreate is requested, delete and recreate it
    if (plan && (isPlanEmpty || needsRecreation || forceRecreate)) {
      const reason = forceRecreate ? 'force recreate requested' : 
                     isPlanEmpty ? 'empty plan' : 
                     'plan does not start on Monday';
      console.log(`🗑️ Deleting plan (${reason}) to recreate with correct data...`);
      
      // Calculate the date range for cleanup
      const cleanupStartDate = type === 'CURRENT_WEEKS' ? mondayOfThisWeek : mondayOfThisWeek;
      const cleanupEndDate = new Date(cleanupStartDate);
      if (type === 'CURRENT_WEEKS') {
        cleanupEndDate.setDate(cleanupEndDate.getDate() + 20); // 3 weeks
      } else {
        cleanupEndDate.setDate(cleanupEndDate.getDate() + 400); // Yearly plan range
      }
      
      console.log(`   Date range cleanup: ${cleanupStartDate.toLocaleDateString()} to ${cleanupEndDate.toLocaleDateString()}`);
      
      // Step 1: Delete ALL workout days for this user in the date range (including orphaned ones)
      const deletedDaysInRange = await prisma.workoutDay.deleteMany({
        where: {
          userId: decoded.userId,
          date: {
            gte: cleanupStartDate,
            lte: cleanupEndDate
          }
        }
      });
      console.log(`   ✓ Deleted ${deletedDaysInRange.count} workout days in date range`);
      
      // Step 2: Delete all weeks from this plan
      const deletedWeeks = await prisma.workoutWeek.deleteMany({
        where: {
          workoutPlanId: plan.id
        }
      });
      console.log(`   ✓ Deleted ${deletedWeeks.count} workout weeks`);
      
      // Step 3: Delete the plan itself
      await prisma.workoutPlan.delete({ where: { id: plan.id } });
      plan = null; // Force recreation
      console.log('   ✓ Old plan deleted, will create new one starting on Monday');
    }

    // If plan doesn't exist, create it
    if (!plan) {
      let startDate = new Date();
      let endDate = new Date();
      let numberOfWeeks = 0;
      
      if (type === 'CURRENT_WEEKS') {
        // Section A: Start from the Monday of current week, 3 weeks (21 days)
        startDate = mondayOfThisWeek;
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 20); // 21 days total (0-20)
        numberOfWeeks = 3; // 3 weeks for current 2-3 weeks section
        console.log(`✓ Section A will start on Monday: ${startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`);
      } else if (type === 'YEARLY_PLAN') {
        // Section B: Start from Monday after 3-week window, 52 weeks for full year
        const threeWeeksFromMonday = new Date(mondayOfThisWeek);
        threeWeeksFromMonday.setDate(threeWeeksFromMonday.getDate() + 21); // 21 days from Monday
        startDate = getMondayOfWeek(threeWeeksFromMonday); // Get Monday of that week (should already be Monday in this case)
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 364); // 52 weeks = 364 days
        numberOfWeeks = 52; // Create all 52 weeks for yearly plan
        console.log(`✓ Section B will start on Monday: ${startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`);
      }

      console.log(`📝 Creating new ${type} plan:`, {
        numberOfWeeks,
        startDate: startDate.toISOString(),
        startDateLocal: startDate.toLocaleDateString(),
        endDate: endDate.toISOString(),
        endDateLocal: endDate.toLocaleDateString(),
        todayWas: today.toISOString()
      });

      // Get or create default period
      let defaultPeriod = await prisma.period.findFirst({
        where: { userId: decoded.userId }
      });
      
      if (!defaultPeriod) {
        console.log('No period found, creating default...');
        defaultPeriod = await prisma.period.create({
          data: {
            userId: decoded.userId,
            name: 'Base Period',
            description: 'Default training period',
            color: '#3b82f6'
          }
        });
      }

      // Create plan with weeks and days
      const newPlan = await prisma.workoutPlan.create({
        data: {
          userId: decoded.userId,
          name: type === 'CURRENT_WEEKS' ? 'Current 3 Weeks' : 'Yearly Plan',
          type: type as any,
          startDate,
          endDate
        }
      });

      // Create weeks and days
      for (let i = 0; i < numberOfWeeks; i++) {
        const week = await prisma.workoutWeek.create({
          data: {
            workoutPlanId: newPlan.id,
            weekNumber: i + 1
          }
        });
        
        // Create all 7 days for this week
        const weekStartDate = new Date(startDate);
        weekStartDate.setDate(weekStartDate.getDate() + (i * 7));
        
        for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
          const dayDate = new Date(weekStartDate);
          dayDate.setDate(weekStartDate.getDate() + (dayOfWeek - 1));
          
          // Use upsert to avoid duplicate key violations on userId + date
          await prisma.workoutDay.upsert({
            where: {
              userId_date: {
                userId: decoded.userId,
                date: dayDate
              }
            },
            update: {
              workoutWeekId: week.id,
              dayOfWeek,
              weekNumber: i + 1,
              periodId: defaultPeriod.id
            },
            create: {
              workoutWeekId: week.id,
              userId: decoded.userId,
              dayOfWeek,
              weekNumber: i + 1,
              date: dayDate,
              periodId: defaultPeriod.id,
              weather: '',
              feelingStatus: '5',
              notes: ''
            }
          });
        }
      }

      console.log(`Created plan with ${numberOfWeeks} weeks and ${numberOfWeeks * 7} days`);

      // Fetch the complete plan with all includes and date filter
      plan = await prisma.workoutPlan.findUnique({
        where: { id: newPlan.id },
        include: {
          weeks: {
            include: {
              days: {
                where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
                include: {
                  period: true,
                  workouts: {
                    include: {
                      moveframes: {
                        include: {
                          section: true,
                          movelaps: {
                            orderBy: { repetitionNumber: 'asc' }
                          }
                        },
                        orderBy: { letter: 'asc' }
                      }
                    },
                    orderBy: { sessionNumber: 'asc' }
                  }
                },
                orderBy: { dayOfWeek: 'asc' }
              }
            },
            orderBy: { weekNumber: 'asc' }
          }
        }
      });
      
      // Filter out weeks with no days (after date filtering)
      if (plan && plan.weeks) {
        plan.weeks = plan.weeks.filter((week: any) => week.days && week.days.length > 0);
      }
    }
    
    // Also filter weeks on existing plans
    if (plan && plan.weeks) {
      plan.weeks = plan.weeks.filter((week: any) => week.days && week.days.length > 0);
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout plan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('POST /api/workouts/plan - Request received');
    
    const body = await request.json();
    const { name, type, startDate: requestedStartDate, numberOfWeeks, autoCreateDays } = body;
    
    console.log('Request body:', { name, type, numberOfWeeks, autoCreateDays, requestedStartDate });

    // Ensure startDate is always a Monday
    const startDate = getMondayOfWeek(new Date(requestedStartDate));
    console.log(`✓ Adjusted start date to Monday: ${startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (numberOfWeeks * 7));

    // Get or create default period
    console.log('Looking for existing period...');
    let defaultPeriod = await prisma.period.findFirst({
      where: { userId: decoded.userId }
    });
    
    if (!defaultPeriod) {
      console.log('No period found, creating default...');
      defaultPeriod = await prisma.period.create({
        data: {
          userId: decoded.userId,
          name: 'Base Period',
          description: 'Default training period',
          color: '#3b82f6'
        }
      });
      console.log('Default period created:', defaultPeriod.id);
    } else {
      console.log('Using existing period:', defaultPeriod.id);
    }

    // Create plan
    console.log('Creating workout plan...');
    const plan = await prisma.workoutPlan.create({
      data: {
        userId: decoded.userId,
        name,
        type: type as any,
        startDate: startDate, // Already a Date object adjusted to Monday
        endDate
      }
    });
    console.log('Plan created with ID:', plan.id, 'starting on', startDate.toLocaleDateString('en-US', { weekday: 'long' }));

    // Generate weeks - For Section A (CURRENT_WEEKS), create all 3 weeks immediately
    // For others, create first 10 weeks (or all if <= 10)
    let weeksToCreate;
    if (type === 'CURRENT_WEEKS') {
      weeksToCreate = numberOfWeeks; // Always create all weeks for Section A (3 weeks)
      console.log(`Section A: Creating all ${weeksToCreate} weeks with all days`);
    } else {
      weeksToCreate = Math.min(numberOfWeeks, 10); // Create first 10 weeks for other sections
      console.log(`Will create ${weeksToCreate} weeks (requested ${numberOfWeeks}, creating initial batch)`);
    }
    
    for (let i = 0; i < weeksToCreate; i++) {
      console.log(`Creating week ${i + 1}...`);
      
      try {
        const week = await prisma.workoutWeek.create({
          data: {
            workoutPlanId: plan.id,
            weekNumber: i + 1
          }
        });
        console.log(`Week ${i + 1} created: ${week.id}`);
        
        // Create all 7 days for this week
        const weekStartDate = new Date(startDate);
        weekStartDate.setDate(weekStartDate.getDate() + (i * 7));
        
        for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
          const dayDate = new Date(weekStartDate);
          dayDate.setDate(weekStartDate.getDate() + (dayOfWeek - 1));
          
          // Use upsert to avoid duplicate key violations on userId + date
          await prisma.workoutDay.upsert({
            where: {
              userId_date: {
                userId: decoded.userId,
                date: dayDate
              }
            },
            update: {
              workoutWeekId: week.id,
              dayOfWeek,
              weekNumber: i + 1,
              periodId: defaultPeriod.id
            },
            create: {
              workoutWeekId: week.id,
              userId: decoded.userId,
              dayOfWeek,
              weekNumber: i + 1,
              date: dayDate,
              periodId: defaultPeriod.id,
              weather: '',
              feelingStatus: '5',
              notes: ''
            }
          });
        }
        console.log(`Week ${i + 1}: All 7 days created`);
      } catch (weekError) {
        console.error(`Error creating week ${i + 1}:`, weekError);
        throw weekError;
      }
    }
    
    console.log('All weeks created successfully!');

    // Return plan with weeks
    const fullPlan = await prisma.workoutPlan.findUnique({
      where: { id: plan.id },
      include: {
        weeks: {
          include: {
            days: {
              include: {
                period: true,
                workouts: true
              }
            }
          },
          orderBy: { weekNumber: 'asc' }
        }
      }
    });
    
    console.log('Returning plan with', fullPlan?.weeks?.length, 'weeks');

    return NextResponse.json({ plan: fullPlan });
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return NextResponse.json(
      { error: 'Failed to create workout plan', details: (error as Error).message },
      { status: 500 }
    );
  }
}

