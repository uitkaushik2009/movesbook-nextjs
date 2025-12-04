import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * POST /api/workouts/sessions/duplicate
 * Duplicate a workout to another day
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
    const { workoutId, targetDayId } = body;

    if (!workoutId || !targetDayId) {
      return NextResponse.json(
        { error: 'workoutId and targetDayId are required' },
        { status: 400 }
      );
    }

    // Get the source workout with all its moveframes and movelaps
    const sourceWorkout = await prisma.workoutSession.findUnique({
      where: { id: workoutId },
      include: {
        moveframes: {
          include: {
            movelaps: true
          }
        }
      }
    });

    if (!sourceWorkout) {
      return NextResponse.json({ error: 'Source workout not found' }, { status: 404 });
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

    // Calculate next session number
    const nextSessionNumber = targetDay.workouts.length > 0 
      ? (targetDay.workouts[0].sessionNumber + 1) 
      : 1;

    // Create duplicate workout
    const duplicatedWorkout = await prisma.workoutSession.create({
      data: {
        workoutDayId: targetDayId,
        sessionNumber: nextSessionNumber,
        name: sourceWorkout.name,
        code: sourceWorkout.code || '',
        time: sourceWorkout.time || '',
        status: sourceWorkout.status || 'NOT_PLANNED',
        weather: sourceWorkout.weather,
        location: sourceWorkout.location,
        surface: sourceWorkout.surface,
        heartRateMax: sourceWorkout.heartRateMax,
        heartRateAvg: sourceWorkout.heartRateAvg,
        calories: sourceWorkout.calories,
        feelingStatus: sourceWorkout.feelingStatus,
        notes: sourceWorkout.notes,
        moveframes: {
          create: sourceWorkout.moveframes.map((mf) => ({
            letter: mf.letter,
            code: mf.code,
            sport: mf.sport,
            type: mf.type,
            description: mf.description,
            repetitions: mf.repetitions,
            distance: mf.distance,
            duration: mf.duration,
            intensity: mf.intensity,
            heartRate: mf.heartRate,
            pace: mf.pace,
            speed: mf.speed,
            calories: mf.calories,
            elevationGain: mf.elevationGain,
            cadence: mf.cadence,
            power: mf.power,
            temperature: mf.temperature,
            gear: mf.gear,
            terrain: mf.terrain,
            weather: mf.weather,
            equipment: mf.equipment,
            macro: mf.macro,
            alarm: mf.alarm,
            notes: mf.notes,
            orderIndex: mf.orderIndex,
            sectionId: mf.sectionId,
            movelaps: {
              create: mf.movelaps.map((lap) => ({
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
          }))
        }
      },
      include: {
        moveframes: {
          include: {
            movelaps: true
          }
        }
      }
    });

    console.log('✅ Workout duplicated:', workoutId, '→', targetDayId);

    return NextResponse.json({
      success: true,
      workout: duplicatedWorkout
    });
  } catch (error) {
    console.error('❌ Error duplicating workout:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate workout', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

