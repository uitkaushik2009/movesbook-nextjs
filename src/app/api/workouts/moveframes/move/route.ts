import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';


// POST /api/workouts/moveframes/move - Move a moveframe to another workout
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
      targetWorkoutId,
      position = 'after',
      targetMoveframeId
    } = body;

    console.log('📝 Moving moveframe:', { 
      moveframeId, 
      targetWorkoutId, 
      position, 
      targetMoveframeId 
    });

    // Validate required fields
    if (!moveframeId || !targetWorkoutId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get source moveframe
    const moveframe = await prisma.moveframe.findUnique({
      where: { id: moveframeId },
      include: {
        movelaps: true,
        section: true
      }
    });

    if (!moveframe) {
      return NextResponse.json(
        { error: 'Moveframe not found' },
        { status: 404 }
      );
    }

    // Handle position-based operations
    let newLetter = moveframe.letter;
    
    if (position === 'replace' && targetMoveframeId) {
      // Delete the target moveframe first
      const targetMoveframe = await prisma.moveframe.findUnique({
        where: { id: targetMoveframeId },
        select: { letter: true }
      });
      
      await prisma.moveframe.delete({
        where: { id: targetMoveframeId }
      });
      
      newLetter = targetMoveframe?.letter || moveframe.letter;
    } else if (targetWorkoutId !== moveframe.workoutSessionId) {
      // Moving to a different workout - get next available letter
      const existingMoveframes = await prisma.moveframe.findMany({
        where: { workoutSessionId: targetWorkoutId },
        select: { letter: true }
      });
      
      const usedLetters = new Set(existingMoveframes.map(mf => mf.letter));
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      newLetter = letters.split('').find(l => !usedLetters.has(l)) || moveframe.letter;
    }

    // Update moveframe with new workout and letter
    const updatedMoveframe = await prisma.moveframe.update({
      where: { id: moveframeId },
      data: {
        workoutSessionId: targetWorkoutId,
        letter: newLetter
      },
      include: {
        movelaps: {
          orderBy: { repetitionNumber: 'asc' }
        },
        section: true
      }
    });

    console.log('✅ Moveframe moved successfully:', updatedMoveframe.id);

    return NextResponse.json(updatedMoveframe);
  } catch (error: any) {
    console.error('❌ Error moving moveframe:', error);
    return NextResponse.json(
      { error: 'Failed to move moveframe', details: error.message },
      { status: 500 }
    );
  }
}
