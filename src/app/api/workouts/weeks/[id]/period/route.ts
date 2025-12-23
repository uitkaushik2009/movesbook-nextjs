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
    const decoded = await verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { periodId, updateAllDays = true } = await request.json();

    console.log(`📝 Updating week ${resolvedParams.id} with period: ${periodId}`);

    // Update the week's period
    const updatedWeek = await prisma.workoutWeek.update({
      where: { id: resolvedParams.id },
      data: { periodId: periodId || null },
      include: {
        period: true,
        days: true
      }
    });

    console.log(`✅ Week updated. Now updating ${updatedWeek.days.length} days...`);

    // If requested, update all days in this week with the same period
    if (updateAllDays && updatedWeek.days.length > 0 && periodId) {
      await prisma.workoutDay.updateMany({
        where: {
          workoutWeekId: resolvedParams.id
        },
        data: {
          periodId: periodId
        }
      });
      console.log(`✅ All days in week ${resolvedParams.id} updated with period ${periodId}`);
    }

    // Fetch the updated week with all relations
    const weekWithUpdates = await prisma.workoutWeek.findUnique({
      where: { id: resolvedParams.id },
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

    console.log(`✅ Returning updated week with period: ${weekWithUpdates?.period?.name || 'None'}`);

    return NextResponse.json(weekWithUpdates);
  } catch (error) {
    console.error('Error updating week period:', error);
    return NextResponse.json(
      { error: 'Failed to update week period' },
      { status: 500 }
    );
  }
}

