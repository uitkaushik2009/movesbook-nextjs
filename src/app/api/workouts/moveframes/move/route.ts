import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * PATCH /api/workouts/moveframes/move
 * Move a moveframe to another workout (or reorder within same workout)
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
    const { moveframeId, targetWorkoutId, position, insertBeforeId } = body;

    if (!moveframeId || !targetWorkoutId) {
      return NextResponse.json(
        { error: 'moveframeId and targetWorkoutId are required' },
        { status: 400 }
      );
    }

    // Get the source moveframe
    const moveframe = await prisma.moveframe.findUnique({
      where: { id: moveframeId },
      select: { id: true, workoutSessionId: true, orderIndex: true }
    });

    if (!moveframe) {
      return NextResponse.json({ error: 'Moveframe not found' }, { status: 404 });
    }

    // Verify target workout exists
    const targetWorkout = await prisma.workoutSession.findUnique({
      where: { id: targetWorkoutId }
    });

    if (!targetWorkout) {
      return NextResponse.json({ error: 'Target workout not found' }, { status: 404 });
    }

    const sourceWorkoutId = moveframe.workoutSessionId;
    const isSameWorkout = sourceWorkoutId === targetWorkoutId;

    // Determine new order index
    let newOrderIndex = 0;
    if (position === 'append') {
      // Get max order index and add 1
      const maxOrder = await prisma.moveframe.findFirst({
        where: { workoutSessionId: targetWorkoutId },
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true }
      });
      newOrderIndex = (maxOrder?.orderIndex || 0) + 1;
    } else if (insertBeforeId) {
      // Get order index of the moveframe to insert before
      const beforeMoveframe = await prisma.moveframe.findUnique({
        where: { id: insertBeforeId },
        select: { orderIndex: true }
      });
      newOrderIndex = beforeMoveframe?.orderIndex || 0;
      
      // Shift other moveframes down in target workout
      await prisma.moveframe.updateMany({
        where: {
          workoutSessionId: targetWorkoutId,
          orderIndex: { gte: newOrderIndex },
          id: { not: moveframeId } // Don't shift the moving one
        },
        data: {
          orderIndex: { increment: 1 }
        }
      });
    }

    // If moving to different workout, clean up gaps in source workout
    if (!isSameWorkout) {
      await prisma.moveframe.updateMany({
        where: {
          workoutSessionId: sourceWorkoutId,
          orderIndex: { gt: moveframe.orderIndex }
        },
        data: {
          orderIndex: { decrement: 1 }
        }
      });
    }

    // Move the moveframe
    const updatedMoveframe = await prisma.moveframe.update({
      where: { id: moveframeId },
      data: {
        workoutSessionId: targetWorkoutId,
        orderIndex: newOrderIndex
      },
      include: {
        movelaps: true
      }
    });

    console.log('✅ Moveframe moved:', moveframeId, '→', targetWorkoutId);

    return NextResponse.json({
      success: true,
      moveframe: updatedMoveframe
    });
  } catch (error) {
    console.error('❌ Error moving moveframe:', error);
    return NextResponse.json(
      { error: 'Failed to move moveframe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

