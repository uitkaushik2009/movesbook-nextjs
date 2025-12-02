import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// POST - Create a single movelap
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
      moveframeId,
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
      status
    } = body;

    // Validate required fields
    if (!moveframeId || !repetitionNumber) {
      return NextResponse.json(
        { error: 'moveframeId and repetitionNumber are required' },
        { status: 400 }
      );
    }

    // Create movelap
    const movelap = await prisma.movelap.create({
      data: {
        moveframeId,
        repetitionNumber,
        distance: distance ? parseInt(distance) : null,
        speed: speed || null,
        style: style || null,
        pace: pace || null,
        time: time || null,
        reps: reps || 1,
        restType: restType as any || null,
        pause: pause || null,
        alarm: alarm ? parseInt(alarm) : null,
        sound: sound || null,
        notes: notes || null,
        status: (status as any) || 'PENDING',
        isSkipped: false,
        isDisabled: false
      }
    });

    console.log('✅ Movelap created:', movelap.id);

    return NextResponse.json({ movelap });
  } catch (error) {
    console.error('❌ Error creating movelap:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create movelap',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

// GET - Get all movelaps for a moveframe
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const moveframeId = searchParams.get('moveframeId');

    if (!moveframeId) {
      return NextResponse.json(
        { error: 'moveframeId is required' },
        { status: 400 }
      );
    }

    const movelaps = await prisma.movelap.findMany({
      where: { moveframeId },
      orderBy: { repetitionNumber: 'asc' }
    });

    return NextResponse.json({ movelaps });
  } catch (error) {
    console.error('Error fetching movelaps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movelaps' },
      { status: 500 }
    );
  }
}

