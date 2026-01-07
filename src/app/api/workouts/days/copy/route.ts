import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';


// POST /api/workouts/days/copy - Copy a day to a new date
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
    const { sourceDayId, targetDate, targetWeekId } = body;

    console.log('📋 Copying day:', { sourceDayId, targetDate, targetWeekId });

    // Validate required fields
    if (!sourceDayId || !targetDate || !targetWeekId) {
      return NextResponse.json(
        { error: 'sourceDayId, targetDate, and targetWeekId are required' },
        { status: 400 }
      );
    }

    // Get the source day with all its data
    const sourceDay = await prisma.workoutDay.findUnique({
      where: { id: sourceDayId },
      include: {
        workouts: {
          include: {
            sports: true,
            moveframes: {
              include: {
                movelaps: true,
                section: true
              }
            }
          }
        },
        period: true
      }
    });

    if (!sourceDay) {
      return NextResponse.json({ error: 'Source day not found' }, { status: 404 });
    }

    // Check if target date already has a day
    const existingDay = await prisma.workoutDay.findFirst({
      where: {
        userId: decoded.userId,
        date: new Date(targetDate)
      }
    });

    if (existingDay) {
      return NextResponse.json(
        { error: 'A workout day already exists on this date' },
        { status: 409 }
      );
    }

    // Determine storageZone from the target week's plan
    const targetWeek = await prisma.workoutWeek.findUnique({
      where: { id: targetWeekId },
      include: { workoutPlan: { select: { type: true } } }
    });

    let storageZone: 'A' | 'B' | 'C' | 'D' = sourceDay.storageZone || 'B';
    if (targetWeek?.workoutPlan) {
      if (targetWeek.workoutPlan.type === 'TEMPLATE_WEEKS') storageZone = 'A';
      else if (targetWeek.workoutPlan.type === 'YEARLY_PLAN') storageZone = 'B';
      else if (targetWeek.workoutPlan.type === 'WORKOUTS_DONE') storageZone = 'C';
      else if (targetWeek.workoutPlan.type === 'ARCHIVE') storageZone = 'D';
    }

    // Create new day with copied data
    const newDay = await prisma.workoutDay.create({
      data: {
        userId: decoded.userId,
        workoutWeekId: targetWeekId,
        date: new Date(targetDate),
        weekNumber: sourceDay.weekNumber,
        dayOfWeek: sourceDay.dayOfWeek,
        periodId: sourceDay.periodId,
        storageZone,
        weather: sourceDay.weather,
        feelingStatus: sourceDay.feelingStatus,
        notes: `${sourceDay.notes || ''} (Copied from ${new Date(sourceDay.date).toLocaleDateString()})`,
        // Copy workouts
        workouts: {
          create: sourceDay.workouts.map((workout: any) => ({
            sessionNumber: workout.sessionNumber,
            name: workout.name,
            code: workout.code,
            time: workout.time,
            location: workout.location,
            notes: workout.notes,
            status: 'NOT_PLANNED', // Reset status for copied workout
            symbol: workout.symbol,
            includeStretching: workout.includeStretching,
            // Copy sports
            sports: {
              create: workout.sports.map((sport: any) => ({
                sport: sport.sport
              }))
            },
            // Copy moveframes
            moveframes: {
              create: workout.moveframes.map((mf: any) => ({
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
                    status: 'PENDING', // Reset status
                    isSkipped: false,
                    isDisabled: false
                  }))
                }
              }))
            }
          }))
        }
      },
      include: {
        workouts: {
          include: {
            sports: true,
            moveframes: {
              include: {
                movelaps: true,
                section: true
              }
            }
          }
        },
        period: true
      }
    });

    console.log('✅ Day copied successfully:', newDay.id);

    return NextResponse.json({ day: newDay }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error copying day:', error);
    return NextResponse.json(
      { error: 'Failed to copy day', details: error.message },
      { status: 500 }
    );
  }
}

