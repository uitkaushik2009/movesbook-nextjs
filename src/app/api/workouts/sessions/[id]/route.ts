import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
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

    const workout = await prisma.workoutSession.findUnique({
      where: { id: params.id },
      include: {
        moveframes: {
          include: {
            section: true,
            movelaps: true
          }
        }
      }
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    return NextResponse.json({ workout });
  } catch (error) {
    console.error('Error fetching workout session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout session' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
      surface,
      heartRateMax,
      heartRateAvg,
      calories,
      feelingStatus,
      notes,
      status
    } = body;

    const workout = await prisma.workoutSession.update({
      where: { id: params.id },
      data: {
        name,
        code,
        time,
        location,
        surface,
        heartRateMax: heartRateMax ? parseInt(heartRateMax) : null,
        heartRateAvg: heartRateAvg ? parseInt(heartRateAvg) : null,
        calories: calories ? parseInt(calories) : null,
        feelingStatus,
        notes,
        status: status as any
      }
    });

    return NextResponse.json({ workout });
  } catch (error) {
    console.error('Error updating workout session:', error);
    return NextResponse.json(
      { error: 'Failed to update workout session' },
      { status: 500 }
    );
  }
}

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

    await prisma.workoutSession.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout session:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout session' },
      { status: 500 }
    );
  }
}

