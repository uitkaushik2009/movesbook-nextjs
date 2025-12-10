import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * PATCH /api/moveframes/[id]
 * Update a moveframe
 */
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

    const moveframeId = params.id;
    const body = await request.json();

    // Verify the moveframe belongs to the user
    const existingMoveframe = await prisma.moveframe.findUnique({
      where: { id: moveframeId },
      include: {
        workoutSession: {
          include: {
            workoutDay: true
          }
        }
      }
    });

    if (!existingMoveframe) {
      return NextResponse.json({ error: 'Moveframe not found' }, { status: 404 });
    }

    if (existingMoveframe.workoutSession.workoutDay.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the moveframe
    const updatedMoveframe = await prisma.moveframe.update({
      where: { id: moveframeId },
      data: {
        sport: body.sport,
        description: body.description,
        sectionName: body.sectionName,
        macroRest: body.macroRest,
        notes: body.notes
      },
      include: {
        movelaps: true
      }
    });

    return NextResponse.json({
      success: true,
      moveframe: updatedMoveframe
    });

  } catch (error) {
    console.error('❌ Error updating moveframe:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update moveframe', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/moveframes/[id]
 * Delete a moveframe and all its movelaps
 */
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

    const moveframeId = params.id;

    // Verify the moveframe belongs to the user
    const existingMoveframe = await prisma.moveframe.findUnique({
      where: { id: moveframeId },
      include: {
        workoutSession: {
          include: {
            workoutDay: true
          }
        }
      }
    });

    if (!existingMoveframe) {
      return NextResponse.json({ error: 'Moveframe not found' }, { status: 404 });
    }

    if (existingMoveframe.workoutSession.workoutDay.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the moveframe (movelaps will be deleted automatically due to cascade)
    await prisma.moveframe.delete({
      where: { id: moveframeId }
    });

    return NextResponse.json({
      success: true,
      message: 'Moveframe deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting moveframe:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete moveframe', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

