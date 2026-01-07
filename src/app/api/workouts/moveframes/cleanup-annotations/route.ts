import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * POST /api/workouts/moveframes/cleanup-annotations
 * Clean up annotation fields from non-ANNOTATION type moveframes
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

    console.log('🧹 Starting cleanup of annotation fields from non-ANNOTATION moveframes...');

    // Find all moveframes that are NOT ANNOTATION type but have annotation colors set
    const moveframesToClean = await prisma.moveframe.findMany({
      where: {
        type: { not: 'ANNOTATION' },
        OR: [
          { annotationBgColor: { not: null } },
          { annotationTextColor: { not: null } },
          { annotationText: { not: null } }
        ]
      },
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

    // Filter to only user's moveframes
    const userMoveframes = moveframesToClean.filter(
      mf => mf.workoutSession.workoutDay.userId === decoded.userId
    );

    console.log(`📊 Found ${userMoveframes.length} moveframes to clean for user ${decoded.userId}`);

    // Update all found moveframes to clear annotation fields
    const updatePromises = userMoveframes.map(mf =>
      prisma.moveframe.update({
        where: { id: mf.id },
        data: {
          annotationText: null,
          annotationBgColor: null,
          annotationTextColor: null,
          annotationBold: false
        }
      })
    );

    await Promise.all(updatePromises);

    console.log(`✅ Cleaned ${userMoveframes.length} moveframes`);

    return NextResponse.json({
      success: true,
      cleanedCount: userMoveframes.length,
      message: `Cleaned annotation fields from ${userMoveframes.length} non-annotation moveframes`
    });

  } catch (error) {
    console.error('❌ Error cleaning up annotations:', error);
    return NextResponse.json(
      {
        error: 'Failed to cleanup annotations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

