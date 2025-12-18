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
      workoutDayId,
      sessionNumber,
      name,
      code,
      time,
      location,
      notes,
      status,
      sports,
      symbol,
      includeStretching
    } = body;

    console.log('📝 Creating workout session with data:', { 
      workoutDayId, 
      sessionNumber, 
      name, 
      code,
      sports,
      symbol,
      includeStretching
    });

    // Validate required fields
    if (!workoutDayId || !sessionNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate sports array
    if (!sports || !Array.isArray(sports) || sports.length === 0) {
      return NextResponse.json(
        { error: 'At least one sport is required' },
        { status: 400 }
      );
    }

    if (sports.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 sports allowed per workout' },
        { status: 400 }
      );
    }

    // Verify the workout day exists and belongs to user
    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: workoutDayId },
      include: {
        workoutWeek: {
          include: {
            workoutPlan: true
          }
        }
      }
    });

    if (!workoutDay) {
      return NextResponse.json(
        { error: 'Workout day not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (workoutDay.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - this day belongs to another user' },
        { status: 403 }
      );
    }

    // Check if session number already exists for this day
    const existingSession = await prisma.workoutSession.findFirst({
      where: {
        workoutDayId,
        sessionNumber
      }
    });

    if (existingSession) {
      return NextResponse.json(
        { error: 'Session number already exists for this day' },
        { status: 400 }
      );
    }

    // Check max 3 sessions per day
    const sessionsCount = await prisma.workoutSession.count({
      where: { workoutDayId }
    });

    if (sessionsCount >= 3) {
      return NextResponse.json(
        { error: 'Maximum 3 workout sessions per day' },
        { status: 400 }
      );
    }

    // Create workout session with sports
    const session = await prisma.workoutSession.create({
      data: {
        workoutDayId,
        sessionNumber,
        name: name || `Workout ${sessionNumber}`,
        code: code || '',
        time: time || '',
        location: location || '',
        notes: notes || (includeStretching ? `${symbol || ''} Includes stretching` : symbol || ''),
        status: status as any || 'PLANNED_FUTURE',
        sports: {
          create: sports.map((sport: string) => ({
            sport: sport as any
          }))
        }
      },
      include: {
        moveframes: {
          include: {
            section: true,
            movelaps: {
              orderBy: { repetitionNumber: 'asc' }
            }
          },
          orderBy: { letter: 'asc' }
        },
        sports: true
      }
    });

    console.log('✅ Workout session created successfully:', session.id);
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error creating workout session:', error);
    return NextResponse.json(
      { error: 'Failed to create workout session' },
      { status: 500 }
    );
  }
}

