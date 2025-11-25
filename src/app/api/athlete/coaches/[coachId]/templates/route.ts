import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/athlete/coaches/[coachId]/templates - Get shared templates from a coach
export async function GET(
  request: NextRequest,
  { params }: { params: { coachId: string } }
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

    const { coachId } = params;

    // Verify coach-athlete relationship
    const relationship = await prisma.coachAthlete.findUnique({
      where: {
        coachId_athleteId: {
          coachId: coachId,
          athleteId: decoded.userId
        }
      }
    });

    if (!relationship) {
      return NextResponse.json(
        { error: 'No relationship with this coach' },
        { status: 403 }
      );
    }

    // Get coach's shared templates
    const templates = await prisma.workoutTemplate.findMany({
      where: {
        userId: coachId,
        isShared: true  // Only shared templates
      },
      orderBy: [
        { timesUsed: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching coach templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coach templates' },
      { status: 500 }
    );
  }
}

