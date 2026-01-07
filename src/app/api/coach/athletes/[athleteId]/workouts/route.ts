import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/coach/athletes/[athleteId]/workouts - Get athlete's workout plan as coach
export async function GET(
  request: NextRequest,
  { params }: { params: { athleteId: string } }
) {
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

    const { athleteId } = params;

    // Verify coach-athlete relationship
    const relationship = await prisma.coachAthlete.findUnique({
      where: {
        coachId_athleteId: {
          coachId: decoded.userId,
          athleteId: athleteId
        }
      }
    });

    if (!relationship) {
      return NextResponse.json(
        { error: 'No relationship with this athlete' },
        { status: 403 }
      );
    }

    // Get athlete's workout plan
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: { userId: athleteId },
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

    return NextResponse.json({ workoutPlan });
  } catch (error) {
    console.error('Error fetching athlete workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch athlete workouts' },
      { status: 500 }
    );
  }
}

