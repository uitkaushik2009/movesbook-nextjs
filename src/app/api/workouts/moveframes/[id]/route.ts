import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/workouts/moveframes/[id] - Get a single moveframe with movelaps
export async function GET(
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

    // Fetch moveframe with movelaps
    const moveframe = await prisma.moveframe.findUnique({
      where: { id: params.id },
      include: {
        movelaps: {
          orderBy: { repetitionNumber: 'asc' }
        },
        section: true,
        workoutSession: {
          include: {
            workoutDay: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!moveframe) {
      return NextResponse.json({ error: 'Moveframe not found' }, { status: 404 });
    }

    // Verify ownership
    if (moveframe.workoutSession.workoutDay.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized - not your moveframe' }, { status: 403 });
    }

    return NextResponse.json(moveframe);
  } catch (error: any) {
    console.error('❌ Error fetching moveframe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moveframe', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/workouts/moveframes/[id] - Update a moveframe
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

    const body = await request.json();
    const {
      letter,
      sport,
      sectionId,
      type,
      description,
      notes,
      macroFinal,
      alarm,
      annotationText,
      annotationBgColor,
      annotationTextColor,
      annotationBold,
      manualMode,
      favourite
    } = body;

    console.log('📝 Updating moveframe:', params.id, body);

    // First verify user ownership through workout session -> day
    const existingMoveframe = await prisma.moveframe.findUnique({
      where: { id: params.id },
      include: {
        workoutSession: {
          include: {
            workoutDay: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!existingMoveframe) {
      return NextResponse.json({ error: 'Moveframe not found' }, { status: 404 });
    }

    if (existingMoveframe.workoutSession.workoutDay.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized - not your moveframe' }, { status: 403 });
    }

    // Log update data for debugging
    console.log('📝 Updating moveframe with data:', {
      descriptionLength: description?.length || 0,
      notesLength: notes?.length || 0,
      descriptionPreview: description?.substring(0, 200) || '',
      notesPreview: notes?.substring(0, 200) || '',
      manualMode: manualMode
    });

    // Update moveframe
    const moveframe = await prisma.moveframe.update({
      where: { id: params.id },
      data: {
        letter: letter || undefined,
        sport: sport || undefined,
        sectionId: sectionId || undefined,
        type: type as any || undefined,
        description: description || undefined,
        notes: notes !== undefined ? notes : undefined,
        macroFinal: macroFinal !== undefined ? macroFinal : undefined,
        alarm: alarm !== undefined ? (alarm ? parseInt(alarm) : null) : undefined,
        manualMode: manualMode !== undefined ? manualMode : undefined,
        favourite: favourite !== undefined ? favourite : undefined,
        // Annotation fields: only save if type is ANNOTATION, otherwise clear them
        annotationText: type === 'ANNOTATION' ? (annotationText || null) : null,
        annotationBgColor: type === 'ANNOTATION' ? (annotationBgColor || null) : null,
        annotationTextColor: type === 'ANNOTATION' ? (annotationTextColor || null) : null,
        annotationBold: type === 'ANNOTATION' ? (annotationBold || false) : false
      },
      include: {
        movelaps: {
          orderBy: { repetitionNumber: 'asc' }
        },
        section: true
      }
    });

    console.log('✅ Moveframe updated:', moveframe.id);

    return NextResponse.json(moveframe);
  } catch (error: any) {
    console.error('❌ Error updating moveframe:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    return NextResponse.json(
      { 
        error: 'Failed to update moveframe', 
        details: error.message,
        errorName: error.name,
        errorCode: error.code
      },
      { status: 500 }
    );
  }
}

// DELETE /api/workouts/moveframes/[id] - Delete a moveframe
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

    console.log('🗑️ Deleting moveframe:', params.id);

    // First verify user ownership through workout session -> day
    const existingMoveframe = await prisma.moveframe.findUnique({
      where: { id: params.id },
      include: {
        workoutSession: {
          include: {
            workoutDay: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!existingMoveframe) {
      return NextResponse.json({ error: 'Moveframe not found' }, { status: 404 });
    }

    if (existingMoveframe.workoutSession.workoutDay.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized - not your moveframe' }, { status: 403 });
    }

    // Delete moveframe (cascade will delete movelaps)
    await prisma.moveframe.delete({
      where: { id: params.id }
    });

    console.log('✅ Moveframe deleted');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting moveframe:', error);
    return NextResponse.json(
      { error: 'Failed to delete moveframe', details: error.message },
      { status: 500 }
    );
  }
}
