import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

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
      sport,
      sectionId,
      type,
      description,
      movelaps
    } = body;

    // Delete existing movelaps and create new ones
    await prisma.movelap.deleteMany({
      where: { moveframeId: params.id }
    });

    const moveframe = await prisma.moveframe.update({
      where: { id: params.id },
      data: {
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
    console.error('Error updating moveframe:', error);
    return NextResponse.json(
      { error: 'Failed to update moveframe' },
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

    await prisma.moveframe.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting moveframe:', error);
    return NextResponse.json(
      { error: 'Failed to delete moveframe' },
      { status: 500 }
    );
  }
}

