import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';


// POST /api/workouts/moveframes/copy - Copy a moveframe to another workout
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
      sourceMoveframeId,
      targetWorkoutId,
      position = 'after',
      targetMoveframeId
    } = body;

    console.log('📝 Copying moveframe:', { 
      sourceMoveframeId, 
      targetWorkoutId, 
      position, 
      targetMoveframeId 
    });

    // Validate required fields
    if (!sourceMoveframeId || !targetWorkoutId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get source moveframe with all movelaps
    const sourceMoveframe = await prisma.moveframe.findUnique({
      where: { id: sourceMoveframeId },
      include: {
        movelaps: {
          orderBy: { repetitionNumber: 'asc' }
        },
        section: true
      }
    });

    if (!sourceMoveframe) {
      return NextResponse.json(
        { error: 'Source moveframe not found' },
        { status: 404 }
      );
    }

    // Handle position-based insertion
    let newLetter = sourceMoveframe.letter;
    
    if (position === 'replace' && targetMoveframeId) {
      // Delete the target moveframe first
      await prisma.moveframe.delete({
        where: { id: targetMoveframeId }
      });
      
      // Get the letter from the deleted moveframe
      const targetMoveframe = await prisma.moveframe.findUnique({
        where: { id: targetMoveframeId },
        select: { letter: true }
      });
      newLetter = targetMoveframe?.letter || sourceMoveframe.letter;
    } else if (position === 'before' && targetMoveframeId) {
      // Get existing moveframes to calculate new letter
      const targetMoveframe = await prisma.moveframe.findUnique({
        where: { id: targetMoveframeId },
        select: { letter: true }
      });
      
      // For simplicity, we'll use the next available letter
      const existingMoveframes = await prisma.moveframe.findMany({
        where: { workoutSessionId: targetWorkoutId },
        select: { letter: true }
      });
      
      const usedLetters = new Set(existingMoveframes.map(mf => mf.letter));
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      newLetter = letters.split('').find(l => !usedLetters.has(l)) || 'A';
    } else {
      // position === 'after' - get next available letter
      const existingMoveframes = await prisma.moveframe.findMany({
        where: { workoutSessionId: targetWorkoutId },
        select: { letter: true }
      });
      
      const usedLetters = new Set(existingMoveframes.map(mf => mf.letter));
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      newLetter = letters.split('').find(l => !usedLetters.has(l)) || 'A';
    }

    // Create new moveframe (copy)
    const newMoveframe = await prisma.moveframe.create({
      data: {
        workoutSessionId: targetWorkoutId,
        letter: newLetter,
        sport: sourceMoveframe.sport,
        sectionId: sourceMoveframe.sectionId,
        type: sourceMoveframe.type,
        description: sourceMoveframe.description
      }
    });

    // Copy all movelaps
    for (const movelap of sourceMoveframe.movelaps) {
      await prisma.movelap.create({
        data: {
          moveframeId: newMoveframe.id,
          repetitionNumber: movelap.repetitionNumber,
          distance: movelap.distance,
          speed: movelap.speed,
          style: movelap.style,
          pace: movelap.pace,
          time: movelap.time,
          reps: movelap.reps,
          restType: movelap.restType,
          pause: movelap.pause,
          alarm: movelap.alarm,
          sound: movelap.sound,
          notes: movelap.notes,
          status: 'PENDING', // Reset status for copied movelaps
          isSkipped: false,
          isDisabled: false
        }
      });
    }

    // Fetch the complete new moveframe with movelaps
    const completeMoveframe = await prisma.moveframe.findUnique({
      where: { id: newMoveframe.id },
      include: {
        movelaps: {
          orderBy: { repetitionNumber: 'asc' }
        },
        section: true
      }
    });

    console.log('✅ Moveframe copied successfully:', completeMoveframe?.id);

    return NextResponse.json(completeMoveframe, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error copying moveframe:', error);
    return NextResponse.json(
      { error: 'Failed to copy moveframe', details: error.message },
      { status: 500 }
    );
  }
}

