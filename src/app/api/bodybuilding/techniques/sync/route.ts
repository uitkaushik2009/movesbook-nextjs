import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * POST /api/bodybuilding/techniques/sync
 * Bulk sync body building techniques (create/update/delete)
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

    const { techniques } = await request.json();

    if (!techniques || !Array.isArray(techniques)) {
      return NextResponse.json(
        { error: 'Techniques array is required' },
        { status: 400 }
      );
    }

    // Delete existing techniques for this user
    await prisma.bodyBuildingTechnique.deleteMany({
      where: {
        userId: decoded.userId,
      },
    });

    // Create new techniques
    const createdTechniques = [];
    for (const technique of techniques) {
      // Convert sports array to comma-separated string
      const sportsString = Array.isArray(technique.sports) ? technique.sports.join(',') : '';
      
      const created = await prisma.bodyBuildingTechnique.create({
        data: {
          userId: decoded.userId,
          name: technique.title || technique.name,
          description: technique.description || '',
          color: technique.color,
          sports: sportsString,
        },
      });
      createdTechniques.push(created);
    }

    return NextResponse.json({ techniques: createdTechniques });
  } catch (error) {
    console.error('Error syncing body building techniques:', error);
    return NextResponse.json(
      { error: 'Failed to sync techniques', details: (error as Error).message },
      { status: 500 }
    );
  }
}

