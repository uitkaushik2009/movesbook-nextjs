import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * POST /api/workouts/moveframes/duplicate
 * Duplicate a moveframe (with its movelaps) to another workout
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
    const { moveframeId, targetWorkoutId, position, insertBeforeId } = body;

    if (!moveframeId || !targetWorkoutId) {
      return NextResponse.json(
        { error: 'moveframeId and targetWorkoutId are required' },
        { status: 400 }
      );
    }

    // Get the source moveframe with all its movelaps
    const sourceMoveframe = await prisma.moveframe.findUnique({
      where: { id: moveframeId },
      include: {
        movelaps: true
      }
    });

    if (!sourceMoveframe) {
      return NextResponse.json({ error: 'Source moveframe not found' }, { status: 404 });
    }

    // Verify target workout exists
    const targetWorkout = await prisma.workoutSession.findUnique({
      where: { id: targetWorkoutId }
    });

    if (!targetWorkout) {
      return NextResponse.json({ error: 'Target workout not found' }, { status: 404 });
    }

    // Create duplicate moveframe (ordering handled by createdAt timestamp)
    // Only include fields that exist in the Moveframe model
    const duplicatedMoveframe = await prisma.moveframe.create({
      data: {
        workoutSessionId: targetWorkoutId,
        letter: sourceMoveframe.letter,
        sport: sourceMoveframe.sport,
        type: sourceMoveframe.type,
        description: sourceMoveframe.description,
        sectionId: sourceMoveframe.sectionId,
        movelaps: {
          create: sourceMoveframe.movelaps.map((lap) => ({
            repetitionNumber: lap.repetitionNumber,
            distance: lap.distance,
            speed: lap.speed,
            style: lap.style,
            pace: lap.pace,
            time: lap.time,
            reps: lap.reps,
            restType: lap.restType,
            pause: lap.pause,
            alarm: lap.alarm,
            sound: lap.sound,
            notes: lap.notes,
            status: lap.status || 'PENDING',
            isSkipped: lap.isSkipped || false,
            isDisabled: lap.isDisabled || false
          }))
        }
      },
      include: {
        movelaps: true
      }
    });

    console.log('✅ Moveframe duplicated:', moveframeId, '→', targetWorkoutId);

    return NextResponse.json({
      success: true,
      moveframe: duplicatedMoveframe
    });
  } catch (error) {
    console.error('❌ Error duplicating moveframe:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate moveframe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

