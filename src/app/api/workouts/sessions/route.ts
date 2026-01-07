import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';


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

    // Validate sports array (if provided)
    // NOTE: Sports are now optional - they will be auto-loaded from moveframes
    if (sports && Array.isArray(sports) && sports.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 sports allowed per workout' },
        { status: 400 }
      );
    }
    
    // Ensure sports is always an array (even if empty)
    const sportsList = sports && Array.isArray(sports) ? sports.filter(s => s) : [];

    // Check existing workouts for this day
    const existingWorkouts = await prisma.workoutSession.findMany({
      where: { workoutDayId },
      select: { id: true }
    });

    // Validate: max 3 workouts per day
    if (existingWorkouts.length >= 3) {
      return NextResponse.json(
        { error: 'Cannot add workout: Maximum 3 workouts per day allowed' },
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

    // Create workout session with sports (if any)
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
        ...(sportsList.length > 0 && {
          sports: {
            create: sportsList.map((sport: string) => ({
              sport: sport as any
            }))
          }
        })
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

