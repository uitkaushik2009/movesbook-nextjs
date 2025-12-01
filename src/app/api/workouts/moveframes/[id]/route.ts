import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// PATCH /api/workouts/moveframes/[id] - Update moveframe (e.g., move to another workout)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const moveframeId = params.id;
    const body = await req.json();
    const { workoutSessionId, ...updateData } = body;

    console.log('[API] PATCH /api/workouts/moveframes/[id]');
    console.log('Moveframe ID:', moveframeId);
    console.log('Update data:', body);

    // Update the moveframe
    const updatedMoveframe = await prisma.moveframe.update({
      where: { id: moveframeId },
      data: {
        ...(workoutSessionId && { workoutSessionId }),
        ...updateData
      },
      include: {
        movelaps: true,
        section: true,
        workoutSession: true
      }
    });

    console.log('[API] Moveframe updated successfully:', updatedMoveframe.id);

    return NextResponse.json({ moveframe: updatedMoveframe });
  } catch (error: any) {
    console.error('[API] Error updating moveframe:', error);
    return NextResponse.json(
      { error: 'Failed to update moveframe', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/workouts/moveframes/[id] - Delete moveframe
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const moveframeId = params.id;

    console.log('[API] DELETE /api/workouts/moveframes/[id]');
    console.log('Moveframe ID:', moveframeId);

    // Delete associated movelaps first
    await prisma.movelap.deleteMany({
      where: { moveframeId }
    });

    // Delete the moveframe
    await prisma.moveframe.delete({
      where: { id: moveframeId }
    });

    console.log('[API] Moveframe deleted successfully');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] Error deleting moveframe:', error);
    return NextResponse.json(
      { error: 'Failed to delete moveframe', details: error.message },
      { status: 500 }
    );
  }
}
