import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

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

    const sections = await prisma.workoutSection.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Error fetching workout sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout sections' },
      { status: 500 }
    );
  }
}

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
    const { name, description, color } = body;

    const section = await prisma.workoutSection.create({
      data: {
        userId: decoded.userId,
        name,
        description,
        color
      }
    });

    return NextResponse.json({ section });
  } catch (error) {
    console.error('Error creating workout section:', error);
    return NextResponse.json(
      { error: 'Failed to create workout section' },
      { status: 500 }
    );
  }
}

