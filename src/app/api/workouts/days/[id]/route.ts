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

    const day = await prisma.workoutDay.findUnique({
      where: { id: params.id },
      include: {
        period: true,
        workouts: {
          include: {
            moveframes: {
              include: {
                section: true,
                movelaps: true
              }
            }
          }
        }
      }
    });

    if (!day) {
      return NextResponse.json({ error: 'Day not found' }, { status: 404 });
    }

    return NextResponse.json({ day });
  } catch (error) {
    console.error('Error fetching workout day:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout day' },
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
      periodId,
      weather,
      feelingStatus,
      notes
    } = body;

    const day = await prisma.workoutDay.update({
      where: { id: params.id },
      data: {
        periodId,
        weather,
        feelingStatus,
        notes
      }
    });

    return NextResponse.json({ day });
  } catch (error) {
    console.error('Error updating workout day:', error);
    return NextResponse.json(
      { error: 'Failed to update workout day' },
      { status: 500 }
    );
  }
}

