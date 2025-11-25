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

    // Get or create workout plan
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
      }
    });

    // If plan doesn't exist, create it
    if (!plan) {
      const startDate = new Date();
      const endDate = new Date();
      
      if (type === 'CURRENT_WEEKS') {
        endDate.setDate(endDate.getDate() + 21); // 3 weeks
      } else if (type === 'YEARLY_PLAN') {
        endDate.setDate(endDate.getDate() + 364); // ~52 weeks
      }

      plan = await prisma.workoutPlan.create({
        data: {
          userId: decoded.userId,
          name: type === 'CURRENT_WEEKS' ? 'Current 3 Weeks' : 'Yearly Plan',
          type: type as any,
          startDate,
          endDate,
          weeks: {
            create: []
          }
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
                    }
                  }
                }
              }
            }
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

    const body = await request.json();
    const { name, type, startDate, numberOfWeeks } = body;

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (numberOfWeeks * 7));

    const plan = await prisma.workoutPlan.create({
      data: {
        userId: decoded.userId,
        name,
        type: type as any,
        startDate: new Date(startDate),
        endDate
      }
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return NextResponse.json(
      { error: 'Failed to create workout plan' },
      { status: 500 }
    );
  }
}

