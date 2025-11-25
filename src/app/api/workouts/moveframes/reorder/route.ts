import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Helper function to convert index to letter (0=A, 1=B, ... 26=AA, etc.)
function indexToLetter(index: number): string {
  let result = '';
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result;
    index = Math.floor(index / 26) - 1;
  }
  return result;
}

// POST /api/workouts/moveframes/reorder - Reorder moveframes within a workout
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
    const { workoutSessionId, moveframeOrders } = body;
    // moveframeOrders: [{ moveframeId: string, newIndex: number }]

    if (!workoutSessionId || !moveframeOrders || !Array.isArray(moveframeOrders)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the workout session belongs to user
    const session = await prisma.workoutSession.findUnique({
      where: { id: workoutSessionId },
      include: {
        workoutDay: {
          include: {
            workoutWeek: {
              include: {
                workoutPlan: true
              }
            }
          }
        }
      }
    });

    if (!session || session.workoutDay.workoutWeek.workoutPlan.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Workout session not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update each moveframe's letter based on new index
    const updatePromises = moveframeOrders.map((order: any) =>
      prisma.moveframe.update({
        where: { id: order.moveframeId },
        data: { letter: indexToLetter(order.newIndex) }
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering moveframes:', error);
    return NextResponse.json(
      { error: 'Failed to reorder moveframes' },
      { status: 500 }
    );
  }
}

