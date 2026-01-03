import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
    const { workoutIds, targetDate } = body;

    if (!workoutIds || !Array.isArray(workoutIds) || workoutIds.length === 0) {
      return NextResponse.json({ error: 'Workout IDs are required' }, { status: 400 });
    }

    console.log('POST /api/workouts/import-from-plan - Importing', workoutIds.length, 'workouts');

    // Get the Workouts Done plan
    const donePlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: decoded.userId,
        type: 'WORKOUTS_DONE'
      },
      include: {
        weeks: {
          orderBy: { weekNumber: 'asc' }
        }
      }
    });

    if (!donePlan) {
      return NextResponse.json({ error: 'Workouts Done plan not found. Please create a yearly plan first.' }, { status: 404 });
    }

    const importedWorkouts = [];

    for (const workoutId of workoutIds) {
      // Get the source workout with all its data
      const sourceWorkout = await prisma.workoutSession.findUnique({
        where: { id: workoutId },
        include: {
          workoutDay: true,
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

      if (!sourceWorkout) {
        console.log(`⚠️ Workout ${workoutId} not found, skipping...`);
        continue;
      }

      console.log(`📋 Importing workout: ${sourceWorkout.name} from ${sourceWorkout.workoutDay.date}`);

      // Determine target date (use provided date or original date)
      const workoutDate = targetDate ? new Date(targetDate) : new Date(sourceWorkout.workoutDay.date);

      // Calculate week number and day of week
      const dayOfWeek = workoutDate.getDay() === 0 ? 7 : workoutDate.getDay();
      const planStartDate = new Date(donePlan.startDate);
      const diffDays = Math.floor((workoutDate.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.floor(diffDays / 7) + 1;

      // Find or create the corresponding week in Done plan
      let targetWeek = donePlan.weeks.find(w => w.weekNumber === weekNumber);
      if (!targetWeek) {
        console.log(`Creating week ${weekNumber} in Done plan...`);
        targetWeek = await prisma.workoutWeek.create({
          data: {
            workoutPlanId: donePlan.id,
            weekNumber: weekNumber
          }
        });
      }

      // Find or create the day in Done plan
      let targetDay = await prisma.workoutDay.findUnique({
        where: {
          userId_date_storageZone: {
            userId: decoded.userId,
            date: workoutDate,
            storageZone: 'C'
          }
        }
      });

      if (!targetDay) {
        console.log(`Creating day ${workoutDate.toLocaleDateString()} in Done plan...`);
        
        // Get period from source day
        const period = await prisma.period.findFirst({
          where: { userId: decoded.userId }
        });

        // Determine storageZone - import-from-plan creates days in WORKOUTS_DONE (Section C)
        const storageZone: 'A' | 'B' | 'C' | 'D' = 'C';

        targetDay = await prisma.workoutDay.create({
          data: {
            workoutWeekId: targetWeek.id,
            userId: decoded.userId,
            dayOfWeek,
            weekNumber,
            date: workoutDate,
            periodId: period?.id || sourceWorkout.workoutDay.periodId,
            storageZone,
            weather: sourceWorkout.workoutDay.weather,
            feelingStatus: sourceWorkout.workoutDay.feelingStatus,
            notes: sourceWorkout.workoutDay.notes
          }
        });
      }

      // Create the workout in Done plan
      const newWorkout = await prisma.workoutSession.create({
        data: {
          workoutDayId: targetDay.id,
          name: sourceWorkout.name,
          code: sourceWorkout.code,
          sessionNumber: sourceWorkout.sessionNumber,
          mainSport: sourceWorkout.mainSport,
          time: sourceWorkout.time || '',
          weather: sourceWorkout.weather,
          location: sourceWorkout.location,
          surface: sourceWorkout.surface,
          heartRateMax: sourceWorkout.heartRateMax,
          heartRateAvg: sourceWorkout.heartRateAvg,
          calories: sourceWorkout.calories,
          feelingStatus: sourceWorkout.feelingStatus,
          notes: sourceWorkout.notes,
          status: sourceWorkout.status || 'PLANNED',
          includeStretching: sourceWorkout.includeStretching ?? true
        }
      });

      console.log(`✓ Created workout ${newWorkout.id}`);

      // Copy all sports
      if (sourceWorkout.sports && sourceWorkout.sports.length > 0) {
        for (const sport of sourceWorkout.sports) {
          await prisma.workoutSessionSport.create({
            data: {
              workoutSessionId: newWorkout.id,
              sport: sport.sport
            }
          });
        }
      }

      // Copy all moveframes with their movelaps
      if (sourceWorkout.moveframes && sourceWorkout.moveframes.length > 0) {
        for (const mf of sourceWorkout.moveframes) {
          const newMoveframe = await prisma.moveframe.create({
            data: {
              workoutSessionId: newWorkout.id,
              letter: mf.letter,
              sport: mf.sport,
              description: mf.description,
              type: mf.type,
              sectionId: mf.sectionId,
              notes: mf.notes,
              macroFinal: mf.macroFinal,
              alarm: mf.alarm,
              annotationText: mf.annotationText,
              annotationBgColor: mf.annotationBgColor,
              annotationTextColor: mf.annotationTextColor,
              annotationBold: mf.annotationBold,
              workType: mf.workType
            }
          });

          // Copy all movelaps
          if (mf.movelaps && mf.movelaps.length > 0) {
            for (const ml of mf.movelaps) {
              await prisma.movelap.create({
                data: {
                  moveframeId: newMoveframe.id,
                  repetitionNumber: ml.repetitionNumber,
                  distance: ml.distance,
                  time: ml.time,
                  pace: ml.pace,
                  speed: ml.speed,
                  style: ml.style,
                  restType: ml.restType,
                  pause: ml.pause,
                  alarm: ml.alarm,
                  sound: ml.sound,
                  reps: ml.reps,
                  weight: ml.weight,
                  tools: ml.tools,
                  rowPerMin: ml.rowPerMin,
                  notes: ml.notes,
                  status: ml.status || 'PLANNED',
                  isSkipped: ml.isSkipped ?? false,
                  isDisabled: ml.isDisabled ?? false,
                  isNewlyAdded: ml.isNewlyAdded ?? false,
                  macroFinal: ml.macroFinal,
                  r1: ml.r1,
                  r2: ml.r2,
                  exercise: ml.exercise,
                  muscularSector: ml.muscularSector
                }
              });
            }
          }
        }
      }

      importedWorkouts.push({
        id: newWorkout.id,
        name: newWorkout.name,
        date: workoutDate
      });
    }

    console.log(`✅ Successfully imported ${importedWorkouts.length} workouts`);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedWorkouts.length} workout(s) to Workouts Done`,
      importedWorkouts
    });
  } catch (error) {
    console.error('Error importing workouts:', error);
    return NextResponse.json(
      { error: 'Failed to import workouts', details: (error as Error).message },
      { status: 500 }
    );
  }
}

