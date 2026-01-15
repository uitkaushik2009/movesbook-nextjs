import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Helper function to get the Monday of a given week
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysToSubtract = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - daysToSubtract);
  return d;
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

    console.log('POST /api/workouts/plan/create-completed - Creating completed workouts plan');

    // Get user settings to find the yearly plan start date
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: decoded.userId },
      select: { yearlyPlanStartDate: true }
    });

    let startDate: Date;
    if (userSettings?.yearlyPlanStartDate) {
      // Use the same start date as Section B (Yearly Plan)
      startDate = new Date(userSettings.yearlyPlanStartDate);
      console.log(`✓ Using yearly plan start date: ${startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`);
    } else {
      // If no start date set, use current Monday as fallback
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate = getMondayOfWeek(today);
      console.log(`⚠️ No yearly plan start date found, using current Monday: ${startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`);
    }

    // Ensure start date is a Monday
    if (startDate.getDay() !== 1) {
      startDate = getMondayOfWeek(startDate);
      console.log(`✓ Adjusted to Monday: ${startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`);
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 364); // 52 weeks = 364 days

    // Delete existing WORKOUTS_DONE plan if exists
    const existingPlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: decoded.userId,
        type: 'WORKOUTS_DONE'
      }
    });

    if (existingPlan) {
      console.log('🗑️ Deleting existing completed workouts plan...');
      
      // Delete all days in the plan's date range
      await prisma.workoutDay.deleteMany({
        where: {
          userId: decoded.userId,
          workoutWeek: {
            workoutPlanId: existingPlan.id
          }
        }
      });

      // Delete all weeks
      await prisma.workoutWeek.deleteMany({
        where: {
          workoutPlanId: existingPlan.id
        }
      });

      // Delete the plan
      await prisma.workoutPlan.delete({
        where: { id: existingPlan.id }
      });

      console.log('✓ Old completed workouts plan deleted');
    }

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

    // Create new WORKOUTS_DONE plan
    console.log('Creating new completed workouts plan...');
    const plan = await prisma.workoutPlan.create({
      data: {
        userId: decoded.userId,
        name: 'Workouts Done',
        type: 'WORKOUTS_DONE',
        startDate,
        endDate
      }
    });

    console.log('✓ Plan created with ID:', plan.id);

    // Create all 52 weeks with 7 days each (same structure as Section B)
    const numberOfWeeks = 52;
    console.log(`Creating ${numberOfWeeks} weeks...`);

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

        await prisma.workoutDay.upsert({
          where: {
            userId_date_storageZone: {
              userId: decoded.userId,
              date: dayDate,
              storageZone: 'C'
            }
          },
          update: {
            workoutWeekId: week.id,
            dayOfWeek,
            weekNumber: i + 1,
            periodId: defaultPeriod.id,
            storageZone: 'C'
          },
          create: {
            workoutWeekId: week.id,
            userId: decoded.userId,
            dayOfWeek,
            weekNumber: i + 1,
            date: dayDate,
            periodId: defaultPeriod.id,
            storageZone: 'C',
            weather: '',
            feelingStatus: '5',
            notes: ''
          }
        });
      }
    }

    console.log(`✅ Created completed workouts plan with ${numberOfWeeks} weeks and ${numberOfWeeks * 7} days`);

    // Fetch and return the newly created plan
    const newPlan = await prisma.workoutPlan.findUnique({
      where: { id: plan.id },
      include: {
        weeks: {
          include: {
            period: true,
            days: {
              where: { storageZone: 'C' },
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
      }
    });

    return NextResponse.json({
      success: true,
      plan: newPlan,
      message: `Created completed workouts plan with ${numberOfWeeks} weeks`
    });

  } catch (error) {
    console.error('Error creating completed workouts plan:', error);
    return NextResponse.json({
      error: 'Failed to create completed workouts plan',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

