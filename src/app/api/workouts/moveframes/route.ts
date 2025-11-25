import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

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
    const {
      workoutSessionId,
      sport,
      sectionId,
      type,
      description,
      movelaps
    } = body;

    // Get existing moveframes count to determine letter
    const existingCount = await prisma.moveframe.count({
      where: { workoutSessionId }
    });

    const moveframe = await prisma.moveframe.create({
      data: {
        workoutSessionId,
        letter: indexToLetter(existingCount),
        sport: sport as any,
        sectionId,
        type: type as any,
        description,
        movelaps: {
          create: movelaps.map((lap: any, index: number) => ({
            repetitionNumber: index + 1,
            distance: lap.distance,
            speed: lap.speed,
            style: lap.style,
            pace: lap.pace,
            time: lap.time,
            reps: lap.reps,
            restType: lap.restType as any,
            pause: lap.pause,
            alarm: lap.alarm,
            sound: lap.sound,
            notes: lap.notes,
            status: lap.status as any,
            isSkipped: lap.isSkipped || false,
            isDisabled: lap.isDisabled || false
          }))
        }
      },
      include: {
        section: true,
        movelaps: true
      }
    });

    return NextResponse.json({ moveframe });
  } catch (error) {
    console.error('Error creating moveframe:', error);
    return NextResponse.json(
      { error: 'Failed to create moveframe' },
      { status: 500 }
    );
  }
}

function indexToLetter(index: number): string {
  let result = '';
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result;
    index = Math.floor(index / 26) - 1;
  }
  return result;
}

