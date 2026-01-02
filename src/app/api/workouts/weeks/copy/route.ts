import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * POST /api/workouts/weeks/copy
 * Copy a week from one plan (template) to another plan (yearly plan)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { sourceSection, sourceWeekNumber, targetSection, targetWeekNumber } = body;

    console.log('📋 Copy week request:', {
      sourceSection,
      sourceWeekNumber,
      targetSection,
      targetWeekNumber,
      userId: decoded.userId
    });

    // Validate inputs
    if (!sourceSection || !sourceWeekNumber || !targetSection || !targetWeekNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get source plan type and storage zone
    const getSourcePlanConfig = (section: string) => {
      if (section === 'A' || section === 'B' || section === 'C') {
        return { type: 'TEMPLATE_WEEKS', storageZone: section };
      } else if (section === 'B') {
        return { type: 'YEARLY_PLAN', storageZone: null };
      }
      return { type: 'WORKOUTS_DONE', storageZone: null };
    };

    const getTargetPlanConfig = (section: string) => {
      if (section === 'B') {
        return { type: 'YEARLY_PLAN', storageZone: null };
      } else if (section === 'C') {
        return { type: 'WORKOUTS_DONE', storageZone: null };
      }
      return { type: 'TEMPLATE_WEEKS', storageZone: section };
    };

    const sourceConfig = getSourcePlanConfig(sourceSection);
    const targetConfig = getTargetPlanConfig(targetSection);

    // Find source plan
    const sourcePlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: decoded.userId,
        type: sourceConfig.type,
        ...(sourceConfig.storageZone ? { storageZone: sourceConfig.storageZone } : {})
      },
      include: {
        weeks: {
          where: {
            weekNumber: sourceWeekNumber
          },
          include: {
            days: {
              include: {
                workouts: {
                  include: {
                    moveframes: {
                      include: {
                        movelaps: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!sourcePlan || sourcePlan.weeks.length === 0) {
      return NextResponse.json(
        { success: false, error: `Source week ${sourceWeekNumber} not found in ${sourceSection}` },
        { status: 404 }
      );
    }

    // Find target plan
    const targetPlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: decoded.userId,
        type: targetConfig.type,
        ...(targetConfig.storageZone ? { storageZone: targetConfig.storageZone } : {})
      },
      include: {
        weeks: {
          where: {
            weekNumber: targetWeekNumber
          },
          include: {
            days: {
              include: {
                workouts: {
                  include: {
                    moveframes: {
                      include: {
                        movelaps: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!targetPlan) {
      return NextResponse.json(
        { success: false, error: `Target plan (${targetSection}) not found` },
        { status: 404 }
      );
    }

    const sourceWeek = sourcePlan.weeks[0];
    const targetWeek = targetPlan.weeks[0];

    if (!targetWeek) {
      return NextResponse.json(
        { success: false, error: `Target week ${targetWeekNumber} not found` },
        { status: 404 }
      );
    }

    console.log(`📋 Copying from week ${sourceWeekNumber} (${sourceWeek.days.length} days) to week ${targetWeekNumber}`);

    // Use transaction to copy all data
    await prisma.$transaction(async (tx) => {
      // Delete existing workouts in target week
      for (const day of targetWeek.days) {
        for (const workout of day.workouts) {
          // Delete movelaps
          for (const moveframe of workout.moveframes) {
            await tx.movelap.deleteMany({
              where: { moveframeId: moveframe.id }
            });
          }
          // Delete moveframes
          await tx.moveframe.deleteMany({
            where: { workoutSessionId: workout.id }
          });
        }
        // Delete workouts
        await tx.workoutSession.deleteMany({
          where: { workoutDayId: day.id }
        });
      }

      // Copy workouts from source to target
      for (const sourceDay of sourceWeek.days) {
        // Find corresponding target day (by day of week)
        const targetDay = targetWeek.days.find(d => d.dayOfWeek === sourceDay.dayOfWeek);
        if (!targetDay) {
          console.warn(`⚠️ Target day not found for ${sourceDay.dayOfWeek}`);
          continue;
        }

        // Copy each workout
        for (const sourceWorkout of sourceDay.workouts) {
          const newWorkout = await tx.workoutSession.create({
            data: {
              workoutDayId: targetDay.id,
              sessionNumber: sourceWorkout.sessionNumber,
              name: sourceWorkout.name,
              code: sourceWorkout.code,
              time: sourceWorkout.time,
              weather: sourceWorkout.weather,
              location: sourceWorkout.location,
              surface: sourceWorkout.surface,
              heartRateMax: sourceWorkout.heartRateMax,
              heartRateAvg: sourceWorkout.heartRateAvg,
              calories: sourceWorkout.calories,
              feelingStatus: sourceWorkout.feelingStatus,
              notes: sourceWorkout.notes,
              status: sourceWorkout.status,
              includeStretching: sourceWorkout.includeStretching,
              mainSport: sourceWorkout.mainSport
            }
          });

          // Copy moveframes
          for (const sourceMoveframe of sourceWorkout.moveframes) {
            const newMoveframe = await tx.moveframe.create({
              data: {
                workoutSessionId: newWorkout.id,
                sectionId: sourceMoveframe.sectionId,
                letter: sourceMoveframe.letter,
                sport: sourceMoveframe.sport,
                type: sourceMoveframe.type,
                description: sourceMoveframe.description,
                notes: sourceMoveframe.notes,
                macroFinal: sourceMoveframe.macroFinal,
                alarm: sourceMoveframe.alarm,
                annotationText: sourceMoveframe.annotationText,
                annotationBgColor: sourceMoveframe.annotationBgColor,
                annotationTextColor: sourceMoveframe.annotationTextColor,
                annotationBold: sourceMoveframe.annotationBold,
                workType: sourceMoveframe.workType,
                manualMode: sourceMoveframe.manualMode,
                favourite: sourceMoveframe.favourite
              }
            });

            // Copy movelaps
            for (const sourceMovelap of sourceMoveframe.movelaps) {
              await tx.movelap.create({
                data: {
                  moveframeId: newMoveframe.id,
                  repetitionNumber: sourceMovelap.repetitionNumber,
                  distance: sourceMovelap.distance,
                  time: sourceMovelap.time,
                  speed: sourceMovelap.speed,
                  pause: sourceMovelap.pause,
                  macropause: sourceMovelap.macropause,
                  heartRate: sourceMovelap.heartRate,
                  slope: sourceMovelap.slope,
                  cadence: sourceMovelap.cadence,
                  status: sourceMovelap.status,
                  notes: sourceMovelap.notes
                }
              });
            }
          }
        }
      }

      // Update target week metadata
      await tx.workoutWeek.update({
        where: { id: targetWeek.id },
        data: {
          colorCycle: sourceWeek.colorCycle,
          nameCycle: sourceWeek.nameCycle,
          periodName: sourceWeek.periodName,
          periodColor: sourceWeek.periodColor
        }
      });
    });

    console.log(`✅ Week ${sourceWeekNumber} copied to week ${targetWeekNumber} successfully`);

    return NextResponse.json({
      success: true,
      message: `Week ${sourceWeekNumber} copied to week ${targetWeekNumber}`
    });

  } catch (error: any) {
    console.error('❌ Error copying week:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
