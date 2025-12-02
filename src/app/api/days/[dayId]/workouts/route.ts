import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * POST /api/days/[dayId]/workouts
 * Add a new workout (1, 2, or 3) to an existing day
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { dayId: string } }
) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    // 2. Parse request body
    const body = await request.json();
    const {
      sessionNumber,
      name,
      code,
      time,
      durationMinutes,
      location,
      surface,
      weather,
      heartRateMax,
      heartRateAvg,
      calories,
      feelingStatus,
      notes,
      statusColor
    } = body;

    // 3. Verify day exists and belongs to user
    const day = await prisma.workoutDay.findUnique({
      where: { id: params.dayId },
      include: {
        workouts: {
          select: { sessionNumber: true }
        }
      }
    });

    if (!day) {
      return NextResponse.json({ error: 'Day not found' }, { status: 404 });
    }

    // Verify ownership (day must belong to user's plan)
    const plan = await prisma.workoutWeek.findUnique({
      where: { id: day.workoutWeekId },
      include: {
        workoutPlan: {
          select: { userId: true }
        }
      }
    });

    if (plan?.workoutPlan.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized access to this day' }, { status: 403 });
    }

    // 4. Check max 3 workouts per day
    const existingWorkoutsCount = day.workouts.length;
    if (existingWorkoutsCount >= 3) {
      return NextResponse.json(
        { error: 'Max 3 workouts per day', message: 'A day can have maximum 3 workouts (Workout #1, #2, #3)' },
        { status: 400 }
      );
    }

    // 5. Determine session number
    let finalSessionNumber: number;

    if (sessionNumber !== undefined) {
      // User specified a number - validate it
      if (sessionNumber < 1 || sessionNumber > 3) {
        return NextResponse.json(
          { error: 'Invalid session number', message: 'Workout number must be 1, 2, or 3' },
          { status: 400 }
        );
      }

      // Check if this number is already used
      const existing = day.workouts.find(w => w.sessionNumber === sessionNumber);
      if (existing) {
        return NextResponse.json(
          { error: 'Workout number already used', message: `Workout #${sessionNumber} already exists for this day` },
          { status: 400 }
        );
      }

      finalSessionNumber = sessionNumber;
    } else {
      // Auto-assign next free number
      const usedNumbers = new Set(day.workouts.map(w => w.sessionNumber));
      
      for (let i = 1; i <= 3; i++) {
        if (!usedNumbers.has(i)) {
          finalSessionNumber = i;
          break;
        }
      }

      if (finalSessionNumber! === undefined) {
        return NextResponse.json(
          { error: 'No available workout slots', message: 'All 3 workout slots are occupied' },
          { status: 400 }
        );
      }
    }

    // 6. Create workout
    const workout = await prisma.workoutSession.create({
      data: {
        workoutDayId: params.dayId,
        sessionNumber: finalSessionNumber,
        name: name || `Workout ${finalSessionNumber}`,
        code: code || '',
        time: time || '',
        durationMinutes: durationMinutes || null,
        location: location || null,
        surface: surface || null,
        weather: weather || null,
        heartRateMax: heartRateMax || null,
        heartRateAvg: heartRateAvg || null,
        calories: calories || null,
        feelingStatus: feelingStatus || null,
        notes: notes || null,
        status: 'PLANNED_FUTURE', // Default status
        statusColor: statusColor || 'YELLOW' // Default color for planned workouts
      },
      include: {
        moveframes: {
          include: {
            movelaps: true
          }
        }
      }
    });

    console.log(`✅ Workout created: #${finalSessionNumber} for day ${params.dayId}`);

    return NextResponse.json({
      workout,
      message: `Workout #${finalSessionNumber} created successfully`
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating workout:', error);
    return NextResponse.json(
      { error: 'Failed to create workout', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/days/[dayId]/workouts
 * Get all workouts for a specific day
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { dayId: string } }
) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch workouts for this day
    const workouts = await prisma.workoutSession.findMany({
      where: {
        workoutDayId: params.dayId
      },
      include: {
        moveframes: {
          include: {
            section: true,
            movelaps: {
              orderBy: { index: 'asc' }
            }
          },
          orderBy: { code: 'asc' }
        }
      },
      orderBy: { sessionNumber: 'asc' }
    });

    return NextResponse.json({ workouts });

  } catch (error) {
    console.error('❌ Error fetching workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}

