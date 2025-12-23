import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/workouts/moveframes/move-to-workout
 * Move a moveframe to a different workout (cross-workout drag)
 * 
 * Request Body:
 * {
 *   moveframeId: string,
 *   targetWorkoutId: string,
 *   targetIndex: number (optional, position in target workout)
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
    const { moveframeId, targetWorkoutId, targetIndex } = body;

    if (!moveframeId || !targetWorkoutId) {
      return NextResponse.json(
        { error: 'moveframeId and targetWorkoutId are required' },
        { status: 400 }
      );
    }

    // Verify the moveframe belongs to the user
    const moveframe = await prisma.moveframe.findUnique({
      where: { id: moveframeId },
      include: {
        workoutSession: {
          include: {
            workoutDay: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!moveframe) {
      return NextResponse.json({ error: 'Moveframe not found' }, { status: 404 });
    }

    if (moveframe.workoutSession.workoutDay.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify the target workout belongs to the user
    const targetWorkout = await prisma.workoutSession.findUnique({
      where: { id: targetWorkoutId },
      include: {
        workoutDay: {
          select: { userId: true }
        },
        moveframes: {
          orderBy: { letter: 'asc' }
        }
      }
    });

    if (!targetWorkout) {
      return NextResponse.json({ error: 'Target workout not found' }, { status: 404 });
    }

    if (targetWorkout.workoutDay.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Move the moveframe to the target workout
    await prisma.$transaction(async (tx) => {
      // Update the moveframe's workoutSessionId
      await tx.moveframe.update({
        where: { id: moveframeId },
        data: {
          workoutSessionId: targetWorkoutId
        }
      });

      // Get all moveframes in the target workout (including the one we just moved)
      const allMoveframes = await tx.moveframe.findMany({
        where: { workoutSessionId: targetWorkoutId },
        orderBy: { letter: 'asc' }
      });

      // If targetIndex is provided, reorder accordingly
      if (typeof targetIndex === 'number' && targetIndex >= 0) {
        const reordered = [...allMoveframes];
        const movedItem = reordered.find(mf => mf.id === moveframeId);
        const currentIndex = reordered.findIndex(mf => mf.id === moveframeId);
        
        if (movedItem && currentIndex !== -1) {
          reordered.splice(currentIndex, 1);
          reordered.splice(Math.min(targetIndex, reordered.length), 0, movedItem);
          
          // Re-assign letters alphabetically
          for (let i = 0; i < reordered.length; i++) {
            await tx.moveframe.update({
              where: { id: reordered[i].id },
              data: { letter: String.fromCharCode(65 + i) } // A, B, C, D...
            });
          }
        }
      } else {
        // Just re-letter all moveframes alphabetically
        for (let i = 0; i < allMoveframes.length; i++) {
          await tx.moveframe.update({
            where: { id: allMoveframes[i].id },
            data: { letter: String.fromCharCode(65 + i) }
          });
        }
      }
    });

    return NextResponse.json(
      { success: true, message: 'Moveframe moved successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error moving moveframe:', error);
    return NextResponse.json(
      { error: 'Failed to move moveframe' },
      { status: 500 }
    );
  }
}

