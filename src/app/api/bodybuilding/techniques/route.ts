import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/bodybuilding/techniques
 * Fetch all body building techniques for the current user
 */
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

    const techniques = await prisma.bodyBuildingTechnique.findMany({
      where: {
        userId: decoded.userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ techniques });
  } catch (error) {
    console.error('Error fetching body building techniques:', error);
    return NextResponse.json(
      { error: 'Failed to fetch techniques', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bodybuilding/techniques
 * Create a new body building technique
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

    const { name, description, color } = await request.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      );
    }

    const technique = await prisma.bodyBuildingTechnique.create({
      data: {
        userId: decoded.userId,
        name,
        description: description || '',
        color,
      },
    });

    return NextResponse.json({ technique }, { status: 201 });
  } catch (error) {
    console.error('Error creating body building technique:', error);
    return NextResponse.json(
      { error: 'Failed to create technique', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/bodybuilding/techniques
 * Update an existing body building technique
 */
export async function PUT(request: NextRequest) {
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

    const { id, name, description, color } = await request.json();

    if (!id || !name || !color) {
      return NextResponse.json(
        { error: 'ID, name, and color are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingTechnique = await prisma.bodyBuildingTechnique.findUnique({
      where: { id },
    });

    if (!existingTechnique || existingTechnique.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Technique not found or unauthorized' },
        { status: 404 }
      );
    }

    const technique = await prisma.bodyBuildingTechnique.update({
      where: { id },
      data: {
        name,
        description: description || '',
        color,
      },
    });

    return NextResponse.json({ technique });
  } catch (error) {
    console.error('Error updating body building technique:', error);
    return NextResponse.json(
      { error: 'Failed to update technique', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bodybuilding/techniques
 * Delete a body building technique
 */
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existingTechnique = await prisma.bodyBuildingTechnique.findUnique({
      where: { id },
    });

    if (!existingTechnique || existingTechnique.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Technique not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.bodyBuildingTechnique.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting body building technique:', error);
    return NextResponse.json(
      { error: 'Failed to delete technique', details: (error as Error).message },
      { status: 500 }
    );
  }
}

