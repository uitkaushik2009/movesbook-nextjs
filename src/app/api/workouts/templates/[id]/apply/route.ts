import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// POST /api/workouts/templates/[id]/apply - Apply template to a day/workout
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get template
    const template = await prisma.workoutTemplate.findUnique({
      where: { id: params.id }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check access
    if (template.userId !== decoded.userId && !template.isPublic && !template.isShared) {
      return NextResponse.json(
        { error: 'Unauthorized to use this template' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetDayId, targetWorkoutId } = body;

    if (!targetDayId) {
      return NextResponse.json(
        { error: 'targetDayId is required' },
        { status: 400 }
      );
    }

    // Parse template data
    const templateData = JSON.parse(template.templateData);

    // Verify target day exists and belongs to user
    const targetDay = await prisma.workoutDay.findUnique({
      where: { id: targetDayId },
      include: {
        workoutWeek: {
          include: {
            workoutPlan: true
          }
        },
        workouts: true
      }
    });

    if (!targetDay || targetDay.workoutWeek.workoutPlan.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Target day not found or unauthorized' },
        { status: 404 }
      );
    }

    let createdSessions: any[] = [];

    if (template.templateType === 'workout') {
      // Apply single workout template
      // Check max 3 workouts per day
      if (targetDay.workouts.length >= 3) {
        return NextResponse.json(
          { error: 'Maximum 3 workouts per day reached' },
          { status: 400 }
        );
      }

      const sessionNumber = targetDay.workouts.length + 1;

      // Create workout session
      const session = await prisma.workoutSession.create({
        data: {
          workoutDayId: targetDayId,
          sessionNumber,
          name: templateData.name || template.name,
          code: templateData.code || '',
          time: templateData.time || '',
          status: templateData.status || 'PLANNED_FUTURE',
          location: templateData.location || null,
          surface: templateData.surface || null,
          heartRateMax: templateData.heartRateMax || null,
          heartRateAvg: templateData.heartRateAvg || null,
          calories: templateData.calories || null,
          feelingStatus: templateData.feelingStatus || null,
          notes: templateData.notes || null
        }
      });

      // Create moveframes and movelaps
      if (templateData.moveframes) {
        for (const mfData of templateData.moveframes) {
          const moveframe = await prisma.moveframe.create({
            data: {
              workoutSessionId: session.id,
              letter: mfData.letter,
              sport: mfData.sport,
              sectionId: mfData.sectionId,
              type: mfData.type || 'STANDARD',
              description: mfData.description || ''
            }
          });

          // Create movelaps
          if (mfData.movelaps) {
            for (const lapData of mfData.movelaps) {
              await prisma.movelap.create({
                data: {
                  moveframeId: moveframe.id,
                  repetitionNumber: lapData.repetitionNumber,
                  distance: lapData.distance || null,
                  speed: lapData.speed || null,
                  style: lapData.style || null,
                  pace: lapData.pace || null,
                  time: lapData.time || null,
                  reps: lapData.reps || null,
                  restType: lapData.restType || null,
                  pause: lapData.pause || null,
                  alarm: lapData.alarm || null,
                  sound: lapData.sound || null,
                  notes: lapData.notes || null,
                  status: 'PENDING',
                  isSkipped: false,
                  isDisabled: false
                }
              });
            }
          }
        }
      }

      createdSessions.push(session);

    } else if (template.templateType === 'day') {
      // Apply full day template (multiple workouts)
      // This will create all workouts from the template
      
      if (templateData.workouts) {
        for (let i = 0; i < templateData.workouts.length && i < 3; i++) {
          const workoutData = templateData.workouts[i];
          const sessionNumber = targetDay.workouts.length + i + 1;

          if (sessionNumber > 3) break; // Max 3 workouts

          const session = await prisma.workoutSession.create({
            data: {
              workoutDayId: targetDayId,
              sessionNumber,
              name: workoutData.name || template.name,
              code: workoutData.code || '',
              time: workoutData.time || '',
              status: workoutData.status || 'PLANNED_FUTURE',
              location: workoutData.location || null,
              surface: workoutData.surface || null,
              heartRateMax: workoutData.heartRateMax || null,
              heartRateAvg: workoutData.heartRateAvg || null,
              calories: workoutData.calories || null,
              feelingStatus: workoutData.feelingStatus || null,
              notes: workoutData.notes || null
            }
          });

          // Create moveframes and movelaps for this workout
          if (workoutData.moveframes) {
            for (const mfData of workoutData.moveframes) {
              const moveframe = await prisma.moveframe.create({
                data: {
                  workoutSessionId: session.id,
                  letter: mfData.letter,
                  sport: mfData.sport,
                  sectionId: mfData.sectionId,
                  type: mfData.type || 'STANDARD',
                  description: mfData.description || ''
                }
              });

              if (mfData.movelaps) {
                for (const lapData of mfData.movelaps) {
                  await prisma.movelap.create({
                    data: {
                      moveframeId: moveframe.id,
                      repetitionNumber: lapData.repetitionNumber,
                      distance: lapData.distance || null,
                      speed: lapData.speed || null,
                      style: lapData.style || null,
                      pace: lapData.pace || null,
                      time: lapData.time || null,
                      reps: lapData.reps || null,
                      restType: lapData.restType || null,
                      pause: lapData.pause || null,
                      alarm: lapData.alarm || null,
                      sound: lapData.sound || null,
                      notes: lapData.notes || null,
                      status: 'PENDING',
                      isSkipped: false,
                      isDisabled: false
                    }
                  });
                }
              }
            }
          }

          createdSessions.push(session);
        }
      }
    }

    // Increment timesUsed counter
    await prisma.workoutTemplate.update({
      where: { id: params.id },
      data: {
        timesUsed: template.timesUsed + 1
      }
    });

    return NextResponse.json({ 
      success: true,
      createdSessions,
      message: `Template "${template.name}" applied successfully`
    });
  } catch (error) {
    console.error('Error applying workout template:', error);
    return NextResponse.json(
      { error: 'Failed to apply template' },
      { status: 500 }
    );
  }
}

