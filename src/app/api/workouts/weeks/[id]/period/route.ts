import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * PATCH /api/workouts/weeks/[id]/period
 * Update the period for a week and optionally update all days in that week
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { periodId, updateAllDays = true } = await request.json();

    // Update the week's period
    const updatedWeek = await prisma.workoutWeek.update({
      where: { id: params.id },
      data: { periodId: periodId || null },
      include: {
        period: true,
        days: true
      }
    });

    // If requested, update all days in this week with the same period
    if (updateAllDays && updatedWeek.days.length > 0) {
      await prisma.workoutDay.updateMany({
        where: {
          workoutWeekId: params.id
        },
        data: {
          periodId: periodId || updatedWeek.days[0]?.periodId || ''
        }
      });
    }

    // Fetch the updated week with all relations
    const weekWithUpdates = await prisma.workoutWeek.findUnique({
      where: { id: params.id },
      include: {
        period: true,
        days: {
          include: {
            period: true,
            workouts: {
              include: {
                moveframes: {
                  include: {
                    movelaps: true,
                    section: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(weekWithUpdates);
  } catch (error) {
    console.error('Error updating week period:', error);
    return NextResponse.json(
      { error: 'Failed to update week period' },
      { status: 500 }
    );
  }
}

