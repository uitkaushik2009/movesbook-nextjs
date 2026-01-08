import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch a shared workout (public endpoint)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workoutId = params.id;

    if (!workoutId) {
      return NextResponse.json(
        { error: 'Workout ID is required' },
        { status: 400 }
      );
    }

    // Fetch the workout with all related data
    const workout = await prisma.workoutSession.findUnique({
      where: { id: workoutId },
      include: {
        sports: true,
        moveframes: {
          include: {
            movelaps: {
              orderBy: { repetitionNumber: 'asc' }
            },
            section: true
          },
          orderBy: { letter: 'asc' }
        },
        day: {
          include: {
            period: true
          }
        }
      }
    });

    if (!workout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    // Return the workout data (public, no auth required)
    return NextResponse.json({
      workout: {
        id: workout.id,
        name: workout.name,
        code: workout.code,
        sessionNumber: workout.sessionNumber,
        time: workout.time,
        weather: workout.weather,
        location: workout.location,
        surface: workout.surface,
        notes: workout.notes,
        status: workout.status,
        moveframes: workout.moveframes.map(mf => ({
          id: mf.id,
          letter: mf.letter,
          sport: mf.sport,
          type: mf.type,
          description: mf.description,
          notes: mf.notes,
          movelaps: mf.movelaps.map(ml => ({
            id: ml.id,
            repetitionNumber: ml.repetitionNumber,
            distance: ml.distance,
            speed: ml.speed,
            style: ml.style,
            pace: ml.pace,
            time: ml.time,
            reps: ml.reps,
            exercise: ml.exercise,
            restType: ml.restType,
            pause: ml.pause,
            notes: ml.notes
          }))
        }))
      },
      day: workout.day ? {
        date: workout.day.date,
        weekNumber: workout.day.weekNumber,
        period: workout.day.period ? {
          name: workout.day.period.name
        } : null
      } : null
    });
  } catch (error: any) {
    console.error('Error fetching shared workout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout', details: error.message },
      { status: 500 }
    );
  }
}

