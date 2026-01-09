import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/workouts/sections
 * Get all workout sections for the authenticated user
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

    // Get all sections for this user
    const sections = await prisma.workoutSection.findMany({
      where: { userId: decoded.userId },
      orderBy: { name: 'asc' }
    });

    // If user has no sections, create default ones
    if (sections.length === 0) {
      const defaultSections = await prisma.$transaction([
        prisma.workoutSection.create({
          data: {
            userId: decoded.userId,
            name: 'Warm-up',
            description: 'Warm-up exercises',
            color: '#FEF3C7' // Yellow
          }
        }),
        prisma.workoutSection.create({
          data: {
            userId: decoded.userId,
            name: 'Main Set',
            description: 'Main workout exercises',
            color: '#DBEAFE' // Blue
          }
        }),
        prisma.workoutSection.create({
          data: {
            userId: decoded.userId,
            name: 'Cool-down',
            description: 'Cool-down exercises',
            color: '#D1FAE5' // Green
          }
        })
      ]);

      return NextResponse.json({ sections: defaultSections });
    }

    return NextResponse.json({ sections });

  } catch (error) {
    console.error('❌ Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workouts/sections
 * Create a new workout section
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

    const body = await request.json();
    const { name, code, description, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const section = await prisma.workoutSection.create({
      data: {
        userId: decoded.userId,
        name,
        code: code || null, // Short code for compact display
        description: description || '',
        color: color || '#E5E7EB' // Gray default
      }
    });

    return NextResponse.json({ section }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
