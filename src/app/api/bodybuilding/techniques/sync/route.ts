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

    console.log(`💾 Syncing ${techniques?.length || 0} execution techniques for user:`, decoded.userId);
    console.log(`📋 Techniques data:`, JSON.stringify(techniques, null, 2));

    if (!techniques || !Array.isArray(techniques)) {
      return NextResponse.json(
        { error: 'Techniques array is required' },
        { status: 400 }
      );
    }

    // Only delete and recreate if there are techniques to save
    // This prevents accidentally deleting everything with an empty array
    if (techniques.length === 0) {
      console.log('⚠️ Empty techniques array - not deleting existing techniques');
      const existing = await prisma.executionTechnique.findMany({
        where: { userId: decoded.userId }
      });
      return NextResponse.json({ techniques: existing });
    }

    // Delete existing techniques for this user
    await prisma.executionTechnique.deleteMany({
      where: {
        userId: decoded.userId,
      },
    });

    // Create new techniques
    const createdTechniques = [];
    for (const technique of techniques) {
      // Convert sports array to comma-separated string
      const sportsString = Array.isArray(technique.sports) ? technique.sports.join(',') : '';
      console.log(`  📝 Saving technique: ${technique.title || technique.name} | Sports: ${sportsString}`);
      
      const created = await prisma.executionTechnique.create({
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

