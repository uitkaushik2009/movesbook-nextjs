import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Get a specific movelap
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

    const movelap = await prisma.movelap.findUnique({
      where: { id: params.id },
      include: {
        moveframe: {
          include: {
            section: true,
            workoutSession: true
          }
        }
      }
    });

    if (!movelap) {
      return NextResponse.json({ error: 'Movelap not found' }, { status: 404 });
    }

    return NextResponse.json({ movelap });
  } catch (error) {
    console.error('Error fetching movelap:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movelap' },
      { status: 500 }
    );
  }
}

// PUT - Update a movelap
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
      repetitionNumber,
      distance,
      speed,
      style,
      pace,
      time,
      reps,
      restType,
      pause,
      alarm,
      sound,
      notes,
      status,
      isSkipped,
      isDisabled
    } = body;

    const updateData: any = {};
    
    if (repetitionNumber !== undefined) updateData.repetitionNumber = repetitionNumber;
    if (distance !== undefined) updateData.distance = distance ? parseInt(distance) : null;
    if (speed !== undefined) updateData.speed = speed;
    if (style !== undefined) updateData.style = style;
    if (pace !== undefined) updateData.pace = pace;
    if (time !== undefined) updateData.time = time;
    if (reps !== undefined) updateData.reps = reps;
    if (restType !== undefined) updateData.restType = restType;
    if (pause !== undefined) updateData.pause = pause;
    if (alarm !== undefined) updateData.alarm = alarm ? parseInt(alarm) : null;
    if (sound !== undefined) updateData.sound = sound;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;
    if (isSkipped !== undefined) updateData.isSkipped = isSkipped;
    if (isDisabled !== undefined) updateData.isDisabled = isDisabled;

    const movelap = await prisma.movelap.update({
      where: { id: params.id },
      data: updateData
    });

    console.log('✅ Movelap updated:', movelap.id);

    return NextResponse.json({ movelap });
  } catch (error) {
    console.error('❌ Error updating movelap:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update movelap',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a movelap
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

    await prisma.movelap.delete({
      where: { id: params.id }
    });

    console.log('✅ Movelap deleted:', params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting movelap:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete movelap',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (for status changes, skip/disable toggles)
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

    const movelap = await prisma.movelap.update({
      where: { id: params.id },
      data: body
    });

    console.log('✅ Movelap patched:', movelap.id);

    return NextResponse.json({ movelap });
  } catch (error) {
    console.error('❌ Error patching movelap:', error);
    return NextResponse.json(
      { 
        error: 'Failed to patch movelap',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

