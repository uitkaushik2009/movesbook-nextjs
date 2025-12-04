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

    // Determine order index
    let orderIndex = 0;
    if (position === 'append') {
      // Get max order index and add 1
      const maxOrder = await prisma.moveframe.findFirst({
        where: { workoutSessionId: targetWorkoutId },
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true }
      });
      orderIndex = (maxOrder?.orderIndex || 0) + 1;
    } else if (insertBeforeId) {
      // Get order index of the moveframe to insert before
      const beforeMoveframe = await prisma.moveframe.findUnique({
        where: { id: insertBeforeId },
        select: { orderIndex: true }
      });
      orderIndex = beforeMoveframe?.orderIndex || 0;
      
      // Shift other moveframes down
      await prisma.moveframe.updateMany({
        where: {
          workoutSessionId: targetWorkoutId,
          orderIndex: { gte: orderIndex }
        },
        data: {
          orderIndex: { increment: 1 }
        }
      });
    }

    // Create duplicate moveframe
    const duplicatedMoveframe = await prisma.moveframe.create({
      data: {
        workoutSessionId: targetWorkoutId,
        letter: sourceMoveframe.letter,
        code: sourceMoveframe.code,
        sport: sourceMoveframe.sport,
        type: sourceMoveframe.type,
        description: sourceMoveframe.description,
        repetitions: sourceMoveframe.repetitions,
        distance: sourceMoveframe.distance,
        duration: sourceMoveframe.duration,
        intensity: sourceMoveframe.intensity,
        heartRate: sourceMoveframe.heartRate,
        pace: sourceMoveframe.pace,
        speed: sourceMoveframe.speed,
        calories: sourceMoveframe.calories,
        elevationGain: sourceMoveframe.elevationGain,
        cadence: sourceMoveframe.cadence,
        power: sourceMoveframe.power,
        temperature: sourceMoveframe.temperature,
        gear: sourceMoveframe.gear,
        terrain: sourceMoveframe.terrain,
        weather: sourceMoveframe.weather,
        equipment: sourceMoveframe.equipment,
        macro: sourceMoveframe.macro,
        alarm: sourceMoveframe.alarm,
        notes: sourceMoveframe.notes,
        orderIndex: orderIndex,
        sectionId: sourceMoveframe.sectionId,
        movelaps: {
          create: sourceMoveframe.movelaps.map((lap) => ({
            repetitionNumber: lap.repetitionNumber,
            distance: lap.distance,
            duration: lap.duration,
            style: lap.style,
            speed: lap.speed,
            time: lap.time,
            pace: lap.pace,
            pause: lap.pause,
            restType: lap.restType,
            reps: lap.reps,
            alarm: lap.alarm,
            sound: lap.sound,
            notes: lap.notes,
            status: lap.status || 'PENDING',
            isSkipped: lap.isSkipped || false,
            isDisabled: lap.isDisabled || false,
            orderIndex: lap.orderIndex
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

