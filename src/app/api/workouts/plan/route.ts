import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

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

    console.log('GET - Finding NEWEST plan for type:', type);

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
              include: {
                period: true,
                workouts: {
                  include: {
                    moveframes: {
                      include: {
                        section: true,
                        movelaps: true
                      }
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

    // If plan doesn't exist, create it
    if (!plan) {
      const startDate = new Date();
      const endDate = new Date();
      
      let numberOfWeeks = 0;
      if (type === 'CURRENT_WEEKS') {
        endDate.setDate(endDate.getDate() + 21); // 3 weeks
        numberOfWeeks = 3;
      } else if (type === 'YEARLY_PLAN') {
        endDate.setDate(endDate.getDate() + 364); // ~52 weeks
        numberOfWeeks = 10; // Create first 10 weeks for yearly plan
      }

      console.log(`Creating new ${type} plan with ${numberOfWeeks} weeks`);

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
      plan = await prisma.workoutPlan.create({
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
            workoutPlanId: plan.id,
            weekNumber: i + 1
          }
        });
        
        // Create all 7 days for this week
        const weekStartDate = new Date(startDate);
        weekStartDate.setDate(weekStartDate.getDate() + (i * 7));
        
        for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
          const dayDate = new Date(weekStartDate);
          dayDate.setDate(weekStartDate.getDate() + (dayOfWeek - 1));
          
          await prisma.workoutDay.create({
            data: {
              workoutWeekId: week.id,
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

      // Fetch the complete plan with all includes
      plan = await prisma.workoutPlan.findUnique({
        where: { id: plan.id },
        include: {
          weeks: {
            include: {
              days: {
                include: {
                  period: true,
                  workouts: {
                    include: {
                      moveframes: {
                        include: {
                          section: true,
                          movelaps: true
                        }
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
    const { name, type, startDate, numberOfWeeks, autoCreateDays } = body;
    
    console.log('Request body:', { name, type, numberOfWeeks, autoCreateDays });

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
        startDate: new Date(startDate),
        endDate
      }
    });
    console.log('Plan created with ID:', plan.id);

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
          
          await prisma.workoutDay.create({
            data: {
              workoutWeekId: week.id,
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

