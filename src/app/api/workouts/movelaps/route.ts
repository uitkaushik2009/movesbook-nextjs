import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * POST /api/workouts/movelaps
 * Create a new movelap for an existing moveframe
 */
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

    console.log('POST /api/workouts/movelaps - Request received');
    
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const {
      moveframeId,
      mode = 'APPEND',
      distance,
      speedCode,
      style,
      pace,
      time,
      pause,
      restType,
      alarm,
      notes
    } = body;
    
    // Validate required fields
    if (!moveframeId) {
      console.error('Missing moveframeId');
      return NextResponse.json({ error: 'moveframeId is required' }, { status: 400 });
    }
    
    // Verify moveframe exists and user has access
    const moveframe = await prisma.moveframe.findUnique({
      where: { id: moveframeId },
      include: {
        workoutSession: {
          include: {
            workoutDay: true
          }
        },
        movelaps: {
          orderBy: { repetitionNumber: 'desc' },
          take: 1
        }
      }
    });
    
    if (!moveframe) {
      return NextResponse.json({ error: 'Moveframe not found' }, { status: 404 });
    }
    
    // Get the next repetition number
    const lastMovelap = moveframe.movelaps[0];
    const nextRepNumber = lastMovelap ? lastMovelap.repetitionNumber + 1 : 1;
    
    console.log('Creating movelap for moveframe:', moveframeId);
    console.log('Next repetition number:', nextRepNumber);
    
    // Create the movelap
    const movelapData = {
      moveframeId,
      repetitionNumber: nextRepNumber,
      distance: distance ? parseInt(distance.toString()) : null,
      speed: speedCode || null,
      style: style || null,
      pace: pace || null,
      time: time || null,
      pause: pause || null,
      restType: restType || 'SET_TIME',
      alarm: alarm ? parseInt(alarm.toString()) : null,
      notes: notes || null,
      status: 'PENDING' as any,
      isSkipped: false,
      isDisabled: false
    };
    
    console.log('Movelap data:', JSON.stringify(movelapData, null, 2));
    
    const movelap = await prisma.movelap.create({
      data: movelapData
    });
    
    console.log('✅ Movelap created successfully:', movelap.id);
    
    return NextResponse.json({ movelap });
  } catch (error: any) {
    console.error('❌ Error creating movelap:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    return NextResponse.json(
      { 
        error: 'Failed to create movelap',
        details: error.message,
        code: error.code,
        name: error.name
      },
      { status: 500 }
    );
  }
}

