import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Update moveframe (for drag and drop)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { workoutSessionId } = body;

    console.log('📝 Updating moveframe:', { id, workoutSessionId });

    // Update moveframe
    const updatedMoveframe = await prisma.moveframe.update({
      where: { id },
      data: {
        workoutSessionId: workoutSessionId,
      },
      include: {
        movelaps: true,
      },
    });

    console.log('✅ Moveframe updated successfully');

    return NextResponse.json({ 
      success: true,
      moveframe: updatedMoveframe 
    });

  } catch (error) {
    console.error('❌ Update moveframe error:', error);
    return NextResponse.json(
      { error: 'Failed to update moveframe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete moveframe
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('🗑️ Deleting moveframe:', id);

    // Delete all movelaps first
    await prisma.movelap.deleteMany({
      where: { moveframeId: id }
    });

    // Delete moveframe
    await prisma.moveframe.delete({
      where: { id }
    });

    console.log('✅ Moveframe deleted successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Moveframe deleted' 
    });

  } catch (error) {
    console.error('❌ Delete moveframe error:', error);
    return NextResponse.json(
      { error: 'Failed to delete moveframe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
