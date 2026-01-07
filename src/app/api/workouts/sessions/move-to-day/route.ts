import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/workouts/sessions/move-to-day
 * Move a workout session to a different day (cross-day drag)
 * 
 * Request Body:
 * {
 *   workoutId: string,
 *   targetDayId: string,
 *   targetIndex: number (optional, position in target day)
 * }
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
    const { workoutId, targetDayId, targetIndex } = body;

    if (!workoutId || !targetDayId) {
      return NextResponse.json(
        { error: 'workoutId and targetDayId are required' },
        { status: 400 }
      );
    }

    // Verify the workout belongs to the user
    const workout = await prisma.workoutSession.findUnique({
      where: { id: workoutId },
      include: {
        workoutDay: {
          select: { userId: true }
        }
      }
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    if (workout.workoutDay.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify the target day belongs to the user
    const targetDay = await prisma.workoutDay.findUnique({
      where: { id: targetDayId },
      select: { userId: true }
    });

    if (!targetDay) {
      return NextResponse.json({ error: 'Target day not found' }, { status: 404 });
    }

    if (targetDay.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if target day already has 3 workouts (max limit)
    const existingWorkoutsCount = await prisma.workoutSession.count({
      where: { 
        workoutDayId: targetDayId,
        id: { not: workoutId } // Exclude the workout being moved if it's in the same day
      }
    });

    if (existingWorkoutsCount >= 3) {
      return NextResponse.json(
        { error: 'Cannot move workout: Maximum 3 workouts per day allowed' },
        { status: 400 }
      );
    }

    // Move the workout to the target day
    await prisma.$transaction(async (tx) => {
      // Update the workout's workoutDayId
      await tx.workoutSession.update({
        where: { id: workoutId },
        data: {
          workoutDayId: targetDayId
        }
      });

      // Get all workouts in the target day (including the one we just moved)
      const allWorkouts = await tx.workoutSession.findMany({
        where: { workoutDayId: targetDayId },
        orderBy: { sessionNumber: 'asc' }
      });

      // Reassign session numbers (1, 2, 3)
      if (typeof targetIndex === 'number' && targetIndex >= 0) {
        const reordered = [...allWorkouts];
        const movedItem = reordered.find(w => w.id === workoutId);
        const currentIndex = reordered.findIndex(w => w.id === workoutId);
        
        if (movedItem && currentIndex !== -1) {
          reordered.splice(currentIndex, 1);
          reordered.splice(Math.min(targetIndex, reordered.length), 0, movedItem);
          
          // Re-assign session numbers
          for (let i = 0; i < reordered.length; i++) {
            await tx.workoutSession.update({
              where: { id: reordered[i].id },
              data: { sessionNumber: i + 1 } // 1, 2, 3
            });
          }
        }
      } else {
        // Just re-number all workouts sequentially
        for (let i = 0; i < allWorkouts.length; i++) {
          await tx.workoutSession.update({
            where: { id: allWorkouts[i].id },
            data: { sessionNumber: i + 1 }
          });
        }
      }
    });

    return NextResponse.json(
      { success: true, message: 'Workout moved successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error moving workout:', error);
    return NextResponse.json(
      { error: 'Failed to move workout' },
      { status: 500 }
    );
  }
}

