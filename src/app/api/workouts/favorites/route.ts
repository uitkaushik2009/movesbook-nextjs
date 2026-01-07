import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - List all favorite workouts for the user
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = decoded.userId;
    
    const favorites = await prisma.favoriteWorkout.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(favorites, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching favorite workouts:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch favorites' }, { status: 500 });
  }
}

// POST - Save a workout as favorite
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = decoded.userId;
    const { workoutId } = await req.json();
    
    if (!workoutId) {
      return NextResponse.json({ error: 'Workout ID is required' }, { status: 400 });
    }
    
    // Fetch the complete workout with all its data
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
        }
      }
    });
    
    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    
    // Calculate totals
    let totalDistance = 0;
    let totalDuration = 0;
    const sportsSet = new Set<string>();
    
    workout.moveframes.forEach(mf => {
      sportsSet.add(mf.sport);
      mf.movelaps.forEach(ml => {
        // Handle distance: could be number, string, or null
        if (ml.distance !== null) {
          totalDistance += typeof ml.distance === 'string' 
            ? parseInt(ml.distance) || 0 
            : ml.distance;
        }
        // Handle time: could be number, string, or null
        if (ml.time !== null) {
          totalDuration += typeof ml.time === 'string' 
            ? parseFloat(ml.time) || 0 
            : ml.time;
        }
      });
    });
    
    // Create favorite workout
    const favorite = await prisma.favoriteWorkout.create({
      data: {
        userId,
        name: workout.name,
        description: workout.notes || `Saved from ${new Date().toLocaleDateString()}`,
        workoutData: JSON.stringify({
          workout: {
            name: workout.name,
            code: workout.code,
            sessionNumber: workout.sessionNumber,
            time: workout.time,
            weather: workout.weather,
            location: workout.location,
            surface: workout.surface,
            notes: workout.notes,
            status: workout.status
          },
          sports: workout.sports.map(s => ({ sport: s.sport })),
          moveframes: workout.moveframes.map(mf => ({
            letter: mf.letter,
            sport: mf.sport,
            type: mf.type,
            description: mf.description,
            notes: mf.notes,
            macroFinal: mf.macroFinal,
            alarm: mf.alarm,
            movelaps: mf.movelaps.map(ml => ({
              repetitionNumber: ml.repetitionNumber,
              distance: ml.distance,
              speed: ml.speed,
              style: ml.style,
              pace: ml.pace,
              time: ml.time,
              reps: ml.reps,
              r1: ml.r1,
              r2: ml.r2,
              muscularSector: ml.muscularSector,
              exercise: ml.exercise,
              restType: ml.restType,
              pause: ml.pause,
              macroFinal: ml.macroFinal,
              alarm: ml.alarm,
              sound: ml.sound,
              notes: ml.notes,
              status: ml.status,
              isSkipped: ml.isSkipped,
              isDisabled: ml.isDisabled
            }))
          }))
        }),
        sports: Array.from(sportsSet).join(','),
        totalDistance,
        totalDuration: Math.round(totalDuration)
      }
    });
    
    return NextResponse.json({ 
      message: 'Workout saved to favorites successfully',
      favorite 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving favorite workout:', error);
    return NextResponse.json({ error: error.message || 'Failed to save favorite' }, { status: 500 });
  }
}

