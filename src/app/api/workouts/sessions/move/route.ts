import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// POST /api/workouts/sessions/move - Move a workout session to another day
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
    const { workoutId, targetDayId, sessionNumber } = body;

    console.log('🚚 Moving workout:', { workoutId, targetDayId, sessionNumber });

    // Validate required fields
    if (!workoutId || !targetDayId) {
      return NextResponse.json(
        { error: 'workoutId and targetDayId are required' },
        { status: 400 }
      );
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

    // Update the workout with new day and session number
    const movedWorkout = await prisma.workoutSession.update({
      where: { id: workoutId },
      data: {
        workoutDayId: targetDayId,
        sessionNumber: newSessionNumber
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

    console.log('✅ Workout moved successfully:', movedWorkout.id);

    return NextResponse.json({ workout: movedWorkout });
  } catch (error: any) {
    console.error('❌ Error moving workout:', error);
    return NextResponse.json(
      { error: 'Failed to move workout', details: error.message },
      { status: 500 }
    );
  }
}
