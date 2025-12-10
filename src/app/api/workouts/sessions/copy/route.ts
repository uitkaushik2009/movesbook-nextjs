import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// POST /api/workouts/sessions/copy - Copy a workout session to another day
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
    const { sourceWorkoutId, targetDayId, sessionNumber } = body;

    console.log('📋 Copying workout:', { sourceWorkoutId, targetDayId, sessionNumber });

    // Validate required fields
    if (!sourceWorkoutId || !targetDayId) {
      return NextResponse.json(
        { error: 'sourceWorkoutId and targetDayId are required' },
        { status: 400 }
      );
    }

    // Get the source workout with all its data
    const sourceWorkout = await prisma.workoutSession.findUnique({
      where: { id: sourceWorkoutId },
      include: {
        sports: true,
        moveframes: {
          include: {
            movelaps: true,
            section: true
          }
        }
      }
    });

    if (!sourceWorkout) {
      return NextResponse.json({ error: 'Source workout not found' }, { status: 404 });
    }

    // Determine session number if not provided
    let newSessionNumber = sessionNumber;
    if (!newSessionNumber) {
      const existingWorkouts = await prisma.workoutSession.findMany({
        where: { workoutDayId: targetDayId },
        select: { sessionNumber: true }
      });
      newSessionNumber = Math.max(0, ...existingWorkouts.map(w => w.sessionNumber)) + 1;
    }

    // Create new workout with copied data
    const newWorkout = await prisma.workoutSession.create({
      data: {
        workoutDayId: targetDayId,
        sessionNumber: newSessionNumber,
        name: sourceWorkout.name,
        code: sourceWorkout.code,
        time: sourceWorkout.time,
        location: sourceWorkout.location,
        notes: `${sourceWorkout.notes || ''} (Copied)`,
        status: 'PENDING', // Reset status
        symbol: sourceWorkout.symbol,
        includeStretching: sourceWorkout.includeStretching,
        // Copy sports
        sports: {
          create: sourceWorkout.sports.map((sport: any) => ({
            sportType: sport.sportType
          }))
        },
        // Copy moveframes
        moveframes: {
          create: sourceWorkout.moveframes.map((mf: any) => ({
            letter: mf.letter,
            code: mf.code,
            type: mf.type,
            description: mf.description,
            sport: mf.sport,
            distance: mf.distance,
            distanceUnit: mf.distanceUnit,
            speed: mf.speed,
            pace: mf.pace,
            pause: mf.pause,
            repetitions: mf.repetitions,
            style: mf.style,
            notes: mf.notes,
            sectionId: mf.sectionId,
            // Copy movelaps
            movelaps: {
              create: mf.movelaps.map((lap: any) => ({
                repetitionNumber: lap.repetitionNumber,
                distance: lap.distance,
                speed: lap.speed,
                style: lap.style,
                pace: lap.pace,
                time: lap.time,
                pause: lap.pause,
                alarm: lap.alarm,
                sound: lap.sound,
                notes: lap.notes,
                reps: lap.reps,
                weight: lap.weight,
                status: 'PENDING',
                isSkipped: false,
                isDisabled: false
              }))
            }
          }))
        }
      },
      include: {
        sports: true,
        moveframes: {
          include: {
            movelaps: true,
            section: true
          }
        }
      }
    });

    console.log('✅ Workout copied successfully:', newWorkout.id);

    return NextResponse.json({ workout: newWorkout }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error copying workout:', error);
    return NextResponse.json(
      { error: 'Failed to copy workout', details: error.message },
      { status: 500 }
    );
  }
}

