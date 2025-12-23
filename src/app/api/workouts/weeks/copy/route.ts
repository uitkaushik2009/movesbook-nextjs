import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';


/**
 * POST /api/workouts/weeks/copy
 * Copy all workouts from source week to target week
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { sourceWeekId, targetWeekId } = body;

    if (!sourceWeekId || !targetWeekId) {
      return NextResponse.json(
        { error: 'Source and target week IDs are required' },
        { status: 400 }
      );
    }

    // Get source week with all workouts, moveframes, and movelaps
    const sourceWeek = await prisma.workoutWeek.findUnique({
      where: { id: sourceWeekId },
      include: {
        days: {
          include: {
            workouts: {
              include: {
                sports: true,
                moveframes: {
                  include: {
                    movelaps: {
                      orderBy: { repetitionNumber: 'asc' }
                    }
                  },
                  orderBy: { letter: 'asc' }
                }
              },
              orderBy: { sessionNumber: 'asc' }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!sourceWeek) {
      return NextResponse.json({ error: 'Source week not found' }, { status: 404 });
    }

    // Get target week
    const targetWeek = await prisma.workoutWeek.findUnique({
      where: { id: targetWeekId },
      include: {
        days: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!targetWeek) {
      return NextResponse.json({ error: 'Target week not found' }, { status: 404 });
    }

    // Delete existing workouts in target week
    for (const day of targetWeek.days) {
      await prisma.workoutSession.deleteMany({
        where: { workoutDayId: day.id } // Changed from dayId to workoutDayId
      });
    }

    // Copy workouts from source to target
    for (let i = 0; i < sourceWeek.days.length; i++) {
      const sourceDay = sourceWeek.days[i];
      const targetDay = targetWeek.days[i];
      
      if (!targetDay) continue; // Skip if target week has fewer days

      for (const workout of sourceDay.workouts) {
        // Create workout in target day
        const newWorkout = await prisma.workoutSession.create({
          data: {
            workoutDayId: targetDay.id, // Changed from dayId
            name: workout.name,
            code: workout.code,
            sessionNumber: workout.sessionNumber,
            time: workout.time,
            weather: workout.weather,
            location: workout.location,
            surface: workout.surface,
            status: workout.status,
            sports: {
              create: workout.sports.map((ws) => ({
                sport: ws.sport
              }))
            }
          }
        });

        // Copy moveframes and movelaps
        for (const moveframe of workout.moveframes) {
          const newMoveframe = await prisma.moveframe.create({
            data: {
              workoutSessionId: newWorkout.id,
              letter: moveframe.letter,
              sport: moveframe.sport,
              sectionId: moveframe.sectionId,
              type: moveframe.type,
              description: moveframe.description,
              notes: moveframe.notes,
              macroFinal: moveframe.macroFinal,
              alarm: moveframe.alarm
            }
          });

          // Copy movelaps
          for (const movelap of moveframe.movelaps) {
            await prisma.movelap.create({
              data: {
                moveframeId: newMoveframe.id,
                repetitionNumber: movelap.repetitionNumber,
                distance: movelap.distance,
                time: movelap.time,
                pace: movelap.pace,
                speed: movelap.speed,
                style: movelap.style,
                pause: movelap.pause,
                reps: movelap.reps,
                r1: movelap.r1,
                r2: movelap.r2,
                muscularSector: movelap.muscularSector,
                exercise: movelap.exercise,
                restType: movelap.restType,
                macroFinal: movelap.macroFinal,
                alarm: movelap.alarm,
                sound: movelap.sound,
                notes: movelap.notes,
                status: movelap.status, // Required field
                isSkipped: movelap.isSkipped,
                isDisabled: movelap.isDisabled
              }
            });
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Week copied successfully' 
    });
  } catch (error) {
    console.error('Error copying week:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
