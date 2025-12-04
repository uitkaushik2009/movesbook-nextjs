import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * PATCH /api/workouts/sessions/move
 * Move a workout to another day
 */
export async function PATCH(request: NextRequest) {
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
    const { workoutId, targetDayId } = body;

    if (!workoutId || !targetDayId) {
      return NextResponse.json(
        { error: 'workoutId and targetDayId are required' },
        { status: 400 }
      );
    }

    // Verify workout exists
    const workout = await prisma.workoutSession.findUnique({
      where: { id: workoutId }
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Verify target day exists and get existing workouts to calculate sessionNumber
    const targetDay = await prisma.workoutDay.findUnique({
      where: { id: targetDayId },
      include: {
        workouts: {
          orderBy: { sessionNumber: 'desc' },
          take: 1
        }
      }
    });

    if (!targetDay) {
      return NextResponse.json({ error: 'Target day not found' }, { status: 404 });
    }

    // Calculate next session number for target day
    const nextSessionNumber = targetDay.workouts.length > 0 
      ? (targetDay.workouts[0].sessionNumber + 1) 
      : 1;

    // Move workout to new day with new session number
    const updatedWorkout = await prisma.workoutSession.update({
      where: { id: workoutId },
      data: {
        workoutDayId: targetDayId,
        sessionNumber: nextSessionNumber
      },
      include: {
        moveframes: {
          include: {
            movelaps: true
          }
        }
      }
    });

    console.log('✅ Workout moved:', workoutId, '→', targetDayId);

    return NextResponse.json({
      success: true,
      workout: updatedWorkout
    });
  } catch (error) {
    console.error('❌ Error moving workout:', error);
    return NextResponse.json(
      { error: 'Failed to move workout', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

