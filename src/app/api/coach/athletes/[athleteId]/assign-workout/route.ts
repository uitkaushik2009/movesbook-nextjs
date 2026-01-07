import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// POST /api/coach/athletes/[athleteId]/assign-workout - Assign workout from template to athlete
export async function POST(
  request: NextRequest,
  { params }: { params: { athleteId: string } }
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

    const { athleteId } = params;

    // Verify coach-athlete relationship
    const relationship = await prisma.coachAthlete.findUnique({
      where: {
        coachId_athleteId: {
          coachId: decoded.userId,
          athleteId: athleteId
        }
      }
    });

    if (!relationship) {
      return NextResponse.json(
        { error: 'No relationship with this athlete' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { workoutDayId, workoutData } = body;
    // workoutData includes: name, code, time, location, moveframes, etc.

    if (!workoutDayId || !workoutData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the day belongs to the athlete
    const day = await prisma.workoutDay.findUnique({
      where: { id: workoutDayId },
      include: {
        workoutWeek: {
          include: {
            workoutPlan: true
          }
        },
        workouts: true
      }
    });

    if (!day || day.workoutWeek.workoutPlan.userId !== athleteId) {
      return NextResponse.json(
        { error: 'Invalid workout day for this athlete' },
        { status: 404 }
      );
    }

    // Check max 3 workouts per day
    if (day.workouts.length >= 3) {
      return NextResponse.json(
        { error: 'Maximum 3 workout sessions per day reached' },
        { status: 400 }
      );
    }

    // Determine session number
    const sessionNumber = day.workouts.length + 1;

    // Determine workout status based on date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const workoutDate = new Date(day.date);
    workoutDate.setHours(0, 0, 0, 0);

    let status = 'NOT_PLANNED';
    if (workoutDate.getTime() > today.getTime()) {
      const currentWeekNumber = Math.ceil((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
      const workoutWeekNumber = day.weekNumber;

      if (workoutWeekNumber === currentWeekNumber + 1) {
        status = 'PLANNED_NEXT_WEEK';
      } else if (workoutWeekNumber === currentWeekNumber) {
        status = 'PLANNED_CURRENT_WEEK';
      } else {
        status = 'PLANNED_FUTURE';
      }
    } else if (workoutDate.getTime() === today.getTime()) {
      status = 'PLANNED_CURRENT_WEEK';
    }

    // Create the workout session
    const workoutSession = await prisma.workoutSession.create({
      data: {
        workoutDayId,
        sessionNumber,
        name: workoutData.name || `Session ${sessionNumber}`,
        code: workoutData.code || '',
        time: workoutData.time || '00:00',
        location: workoutData.location,
        surface: workoutData.surface,
        heartRateMax: workoutData.heartRateMax,
        heartRateAvg: workoutData.heartRateAvg,
        calories: workoutData.calories,
        feelingStatus: workoutData.feelingStatus,
        notes: workoutData.notes,
        status: status as any,
      }
    });

    // Create moveframes
    if (workoutData.moveframes && Array.isArray(workoutData.moveframes)) {
      for (const mfData of workoutData.moveframes) {
        const moveframe = await prisma.moveframe.create({
          data: {
            workoutSessionId: workoutSession.id,
            letter: mfData.letter || 'A',
            sport: mfData.sport,
            type: mfData.type || 'WORK',
            sectionId: mfData.workoutSectionId || mfData.sectionId,
            description: mfData.description || ''
          }
        });

        // Create movelaps
        if (mfData.movelaps && Array.isArray(mfData.movelaps)) {
          for (const lapData of mfData.movelaps) {
            await prisma.movelap.create({
              data: {
                moveframeId: moveframe.id,
                repetitionNumber: lapData.repetitionNumber || 1,
                distance: lapData.distance,
                speed: lapData.speed,
                style: lapData.style,
                pace: lapData.pace,
                restType: lapData.restType,
                pause: lapData.pause,
                alarm: lapData.alarm,
                sound: lapData.sound,
                notes: lapData.notes,
                status: lapData.status || 'PENDING',
                isDisabled: lapData.isDisabled || false
              }
            });
          }
        }
      }
    }

    return NextResponse.json({ workoutSession });
  } catch (error) {
    console.error('Error assigning workout:', error);
    return NextResponse.json(
      { error: 'Failed to assign workout' },
      { status: 500 }
    );
  }
}

