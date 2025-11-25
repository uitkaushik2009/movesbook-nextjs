import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// POST /api/workouts/sessions/reorder - Reorder workout sessions within a day
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
    const { workoutDayId, sessionOrders } = body;
    // sessionOrders: [{ sessionId: string, newSessionNumber: number }]

    if (!workoutDayId || !sessionOrders || !Array.isArray(sessionOrders)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the day belongs to user
    const day = await prisma.workoutDay.findUnique({
      where: { id: workoutDayId },
      include: {
        workoutWeek: {
          include: {
            workoutPlan: true
          }
        }
      }
    });

    if (!day || day.workoutWeek.workoutPlan.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Day not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update each session's session number
    const updatePromises = sessionOrders.map((order: any) =>
      prisma.workoutSession.update({
        where: { id: order.sessionId },
        data: { sessionNumber: order.newSessionNumber }
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering workout sessions:', error);
    return NextResponse.json(
      { error: 'Failed to reorder workout sessions' },
      { status: 500 }
    );
  }
}

