import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// PATCH /api/workouts/sessions/[id] - Update a workout session
export async function PATCH(
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

    const body = await request.json();
    const {
      name,
      code,
      time,
      location,
      notes,
      weather,
      heartRateMax,
      heartRateAvg,
      calories,
      feelingStatus,
      status,
      sports
    } = body;

    console.log('📝 Updating workout session:', params.id, body);

    // First verify user ownership through day
    const existingSession = await prisma.workoutSession.findUnique({
      where: { id: params.id },
      include: {
        workoutDay: {
          select: { userId: true }
        }
      }
    });

    if (!existingSession) {
      return NextResponse.json({ error: 'Workout session not found' }, { status: 404 });
    }

    if (existingSession.workoutDay.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized - not your workout session' }, { status: 403 });
    }

    // Update workout session
    const session = await prisma.workoutSession.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        code: code || undefined,
        time: time || undefined,
        location: location || undefined,
        notes: notes || undefined,
        weather: weather || undefined,
        heartRateMax: heartRateMax ? parseInt(heartRateMax) : undefined,
        heartRateAvg: heartRateAvg ? parseInt(heartRateAvg) : undefined,
        calories: calories ? parseInt(calories) : undefined,
        feelingStatus: feelingStatus || undefined,
        status: status as any || undefined
      },
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

    // Update sports if provided
    if (sports && Array.isArray(sports)) {
      // Delete existing sports
      await prisma.workoutSessionSport.deleteMany({
        where: { workoutSessionId: params.id }
      });

      // Add new sports
      for (const sport of sports) {
        if (sport) {
          await prisma.workoutSessionSport.create({
            data: {
              workoutSessionId: params.id,
              sport: sport
            }
          });
        }
      }
    }

    console.log('✅ Workout session updated:', session.id);

    return NextResponse.json(session);
  } catch (error: any) {
    console.error('❌ Error updating workout session:', error);
    return NextResponse.json(
      { error: 'Failed to update workout session', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/workouts/sessions/[id] - Delete a workout session
export async function DELETE(
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

    console.log('🗑️ Deleting workout session:', params.id);

    // First verify user ownership through day
    const existingSession = await prisma.workoutSession.findUnique({
      where: { id: params.id },
      include: {
        workoutDay: {
          select: { userId: true }
        }
      }
    });

    if (!existingSession) {
      return NextResponse.json({ error: 'Workout session not found' }, { status: 404 });
    }

    if (existingSession.workoutDay.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized - not your workout session' }, { status: 403 });
    }

    // Delete workout session (cascade will delete moveframes and movelaps)
    await prisma.workoutSession.delete({
      where: { id: params.id }
    });

    console.log('✅ Workout session deleted');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting workout session:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout session', details: error.message },
      { status: 500 }
    );
  }
}
