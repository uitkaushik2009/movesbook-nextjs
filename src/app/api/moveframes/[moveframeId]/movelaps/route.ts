import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * POST /api/moveframes/[moveframeId]/movelaps
 * Add a single movelap to a moveframe
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { moveframeId: string } }
) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    // 2. Parse request body
    const body = await request.json();
    const {
      mode = 'APPEND', // "APPEND" or "INSERT_AFTER"
      afterIndex,
      distance,
      speedCode,
      style,
      pace,
      time,
      reps = 1,
      restType,
      pause,
      restTo,
      alarm,
      sound,
      notes,
      isNoteOnly = false
    } = body;

    // 3. Verify moveframe exists and user has access
    const moveframe = await prisma.moveframe.findUnique({
      where: { id: params.moveframeId },
      include: {
        workoutSession: {
          include: {
            workoutDay: {
              include: {
                workoutWeek: {
                  include: {
                    workoutPlan: {
                      select: { userId: true }
                    }
                  }
                }
              }
            }
          }
        },
        movelaps: {
          orderBy: { index: 'asc' }
        }
      }
    });

    if (!moveframe) {
      return NextResponse.json({ error: 'Moveframe not found' }, { status: 404 });
    }

    if (moveframe.workoutSession.workoutDay.workoutWeek.workoutPlan.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // 4. Determine new index
    let newIndex: number;

    if (mode === 'APPEND') {
      // Append at the end
      const maxIndex = moveframe.movelaps.length > 0
        ? Math.max(...moveframe.movelaps.map(lap => lap.index))
        : 0;
      newIndex = maxIndex + 1;

    } else if (mode === 'INSERT_AFTER') {
      // Insert after specified index
      if (afterIndex === undefined) {
        return NextResponse.json(
          { error: 'afterIndex is required for INSERT_AFTER mode' },
          { status: 400 }
        );
      }
      newIndex = afterIndex + 1;

    } else {
      return NextResponse.json(
        { error: 'Invalid mode. Must be APPEND or INSERT_AFTER' },
        { status: 400 }
      );
    }

    // 5. Create movelap and update indexes in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // If inserting in the middle, shift subsequent indexes
      if (mode === 'INSERT_AFTER') {
        await tx.movelap.updateMany({
          where: {
            moveframeId: params.moveframeId,
            index: {
              gte: newIndex
            }
          },
          data: {
            index: {
              increment: 1
            }
          }
        });
      }

      // Create new movelap
      const movelap = await tx.movelap.create({
        data: {
          moveframeId: params.moveframeId,
          index: newIndex,
          repetitionNumber: newIndex, // Legacy compatibility
          mfCode: moveframe.code,
          distance: distance ? parseInt(distance) : null,
          speed: speedCode || null,
          speedCode: speedCode || null,
          style: style || null,
          pace: pace || null,
          time: time || null,
          reps: reps || 1,
          restType: restType || null,
          pause: pause || null,
          restTo: restTo || null,
          alarm: alarm ? parseInt(alarm) : null,
          sound: sound || null,
          notes: notes || null,
          status: 'PENDING',
          isDisabled: isNoteOnly, // Note-only laps are typically disabled
          origin: 'NEW'
        }
      });

      // Recalculate moveframe totals
      const allLaps = await tx.movelap.findMany({
        where: {
          moveframeId: params.moveframeId,
          isDisabled: false
        }
      });

      const totalDistance = allLaps.reduce((sum, lap) => sum + (lap.distance || 0), 0);
      const totalReps = allLaps.length;

      // Update moveframe
      await tx.moveframe.update({
        where: { id: params.moveframeId },
        data: {
          totalDistance,
          totalReps
        }
      });

      return {
        movelap,
        totals: {
          totalDistance,
          totalReps
        }
      };
    });

    console.log(`✅ Movelap created at index ${newIndex} for moveframe ${moveframe.code}`);

    return NextResponse.json({
      movelap: result.movelap,
      updatedTotals: result.totals,
      message: `Movelap added at position ${newIndex}`
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating movelap:', error);
    return NextResponse.json(
      { error: 'Failed to create movelap', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/moveframes/[moveframeId]/movelaps
 * Get all movelaps for a moveframe
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { moveframeId: string } }
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

    const movelaps = await prisma.movelap.findMany({
      where: {
        moveframeId: params.moveframeId
      },
      orderBy: { index: 'asc' }
    });

    return NextResponse.json({ movelaps });

  } catch (error) {
    console.error('❌ Error fetching movelaps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movelaps' },
      { status: 500 }
    );
  }
}

