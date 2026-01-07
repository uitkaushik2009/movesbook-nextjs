import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * POST /api/workouts/sessions/switch
 * Switch two workouts between days
 */
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
    const { workout1Id, workout2Id } = body;

    if (!workout1Id || !workout2Id) {
      return NextResponse.json(
        { error: 'workout1Id and workout2Id are required' },
        { status: 400 }
      );
    }

    // Get both workouts
    const workout1 = await prisma.workoutSession.findUnique({
      where: { id: workout1Id },
      select: { id: true, workoutDayId: true }
    });

    const workout2 = await prisma.workoutSession.findUnique({
      where: { id: workout2Id },
      select: { id: true, workoutDayId: true }
    });

    if (!workout1 || !workout2) {
      return NextResponse.json({ error: 'One or both workouts not found' }, { status: 404 });
    }

    // Store original days
    const day1 = workout1.workoutDayId;
    const day2 = workout2.workoutDayId;

    // Switch the workouts between days
    // Use a transaction to ensure atomicity
    const [updatedWorkout1, updatedWorkout2] = await prisma.$transaction([
      prisma.workoutSession.update({
        where: { id: workout1Id },
        data: { workoutDayId: day2 },
        include: {
          moveframes: {
            include: {
              movelaps: true
            }
          }
        }
      }),
      prisma.workoutSession.update({
        where: { id: workout2Id },
        data: { workoutDayId: day1 },
        include: {
          moveframes: {
            include: {
              movelaps: true
            }
          }
        }
      })
    ]);

    console.log('✅ Workouts switched:', workout1Id, '↔', workout2Id);

    return NextResponse.json({
      success: true,
      workouts: [updatedWorkout1, updatedWorkout2]
    });
  } catch (error) {
    console.error('❌ Error switching workouts:', error);
    return NextResponse.json(
      { error: 'Failed to switch workouts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

