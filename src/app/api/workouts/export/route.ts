import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/workouts/export - Export workouts as JSON/CSV
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
    const format = searchParams.get('format') || 'json';
    const weekNumber = searchParams.get('weekNumber');
    const dayId = searchParams.get('dayId');

    // Build where clause
    let workoutPlan;
    
    if (dayId) {
      // Export single day
      const day = await prisma.workoutDay.findUnique({
        where: { id: dayId },
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
          },
          workoutWeek: {
            include: {
              workoutPlan: true
            }
          }
        }
      });

      if (!day || day.workoutWeek.workoutPlan.userId !== decoded.userId) {
        return NextResponse.json({ error: 'Day not found or unauthorized' }, { status: 404 });
      }

      workoutPlan = { days: [day] };
    } else if (weekNumber) {
      // Export single week
      const week = await prisma.workoutWeek.findFirst({
        where: {
          weekNumber: parseInt(weekNumber),
          workoutPlan: {
            userId: decoded.userId
          }
        },
        include: {
          days: {
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
        }
      });

      if (!week) {
        return NextResponse.json({ error: 'Week not found' }, { status: 404 });
      }

      workoutPlan = { weeks: [week] };
    } else {
      // Export entire plan
      workoutPlan = await prisma.workoutPlan.findFirst({
        where: { userId: decoded.userId },
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
    }

    if (!workoutPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }

    if (format === 'csv') {
      // Convert to CSV
      const csvLines = ['Week,Day,Workout,Sport,Exercise,Distance,Reps,Pace,Notes'];
      
      const processWorkouts = (day: any, weekNumber: number) => {
        day.workouts?.forEach((workout: any) => {
          workout.moveframes?.forEach((mf: any) => {
            mf.movelaps?.forEach((lap: any) => {
              csvLines.push([
                weekNumber,
                day.dayOfWeek,
                workout.sessionNumber,
                mf.sport,
                mf.letter,
                lap.distance || '',
                mf.movelaps?.length || '',
                lap.pace || '',
                lap.notes || ''
              ].map(v => `"${v}"`).join(','));
            });
          });
        });
      };

      if ((workoutPlan as any).weeks) {
        (workoutPlan as any).weeks.forEach((week: any) => {
          week.days?.forEach((day: any) => processWorkouts(day, week.weekNumber));
        });
      } else if ((workoutPlan as any).days) {
        (workoutPlan as any).days.forEach((day: any) => processWorkouts(day, day.weekNumber));
      }

      const csv = csvLines.join('\n');
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="workouts.csv"'
        }
      });
    }

    // Return as JSON
    return NextResponse.json({ workoutPlan });
  } catch (error) {
    console.error('Error exporting workouts:', error);
    return NextResponse.json(
      { error: 'Failed to export workouts' },
      { status: 500 }
    );
  }
}

