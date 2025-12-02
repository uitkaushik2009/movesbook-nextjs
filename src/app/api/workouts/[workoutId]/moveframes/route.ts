import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * Generate next moveframe code (A, B, C, ..., Z, AA, AB, AC, ...)
 */
function generateNextCode(existingCodes: string[]): string {
  if (existingCodes.length === 0) return 'A';

  const codeToNumber = (code: string): number => {
    let result = 0;
    for (let i = 0; i < code.length; i++) {
      result = result * 26 + (code.charCodeAt(i) - 64);
    }
    return result;
  };

  const numberToCode = (num: number): string => {
    let result = '';
    while (num > 0) {
      const remainder = (num - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      num = Math.floor((num - 1) / 26);
    }
    return result;
  };

  const numbers = existingCodes.map(codeToNumber);
  const maxNumber = Math.max(...numbers);
  return numberToCode(maxNumber + 1);
}

/**
 * POST /api/workouts/[workoutId]/moveframes
 * Add a moveframe with auto-generated movelaps
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { workoutId: string } }
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
      sport,
      sectionId,
      description,
      patternType = 'MONODISTANCE',
      type = 'STANDARD',
      // Monodistance fields
      distance,
      reps,
      speedCode,
      style,
      pace,
      time,
      restType,
      pause,
      restTo,
      alarm,
      sound
    } = body;

    // 3. Verify workout exists and user has access
    const workout = await prisma.workoutSession.findUnique({
      where: { id: params.workoutId },
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
        },
        moveframes: {
          select: { code: true }
        }
      }
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    if (workout.workoutDay.workoutWeek.workoutPlan.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // 4. Validate required fields
    if (!sport) {
      return NextResponse.json({ error: 'Sport is required' }, { status: 400 });
    }

    if (!sectionId) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 });
    }

    // 5. Fetch section for caching name and color
    const section = await prisma.workoutSection.findUnique({
      where: { id: sectionId }
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // 6. Generate next moveframe code
    const existingCodes = workout.moveframes.map(mf => mf.code);
    const newCode = generateNextCode(existingCodes);

    // 7. Validate pattern (MONODISTANCE)
    if (patternType === 'MONODISTANCE') {
      if (!distance || !reps) {
        return NextResponse.json(
          { error: 'Distance and reps are required for monodistance pattern' },
          { status: 400 }
        );
      }

      if (reps < 1) {
        return NextResponse.json(
          { error: 'Reps must be at least 1' },
          { status: 400 }
        );
      }
    }

    // 8. Create moveframe and movelaps in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create moveframe
      const moveframe = await tx.moveframe.create({
        data: {
          workoutSessionId: params.workoutId,
          code: newCode,
          letter: newCode, // Legacy compatibility
          sport,
          sectionId,
          sectionName: section.name,
          sectionColor: section.color,
          type,
          description: description || ''
        }
      });

      // Generate movelaps for MONODISTANCE pattern
      const movelaps = [];
      if (patternType === 'MONODISTANCE') {
        for (let i = 1; i <= reps; i++) {
          const movelap = await tx.movelap.create({
            data: {
              moveframeId: moveframe.id,
              index: i,
              repetitionNumber: i, // Legacy compatibility
              mfCode: newCode,
              distance: distance ? parseInt(distance) : null,
              speed: speedCode || null,
              speedCode: speedCode || null,
              style: style || null,
              pace: pace || null,
              time: time || null,
              reps: 1,
              restType: restType || null,
              pause: pause || null,
              restTo: restTo || null,
              alarm: alarm ? parseInt(alarm) : null,
              sound: sound || null,
              status: 'PENDING',
              origin: 'NORMAL'
            }
          });
          movelaps.push(movelap);
        }
      }

      // Calculate totals
      const totalDistance = movelaps.reduce((sum, lap) => sum + (lap.distance || 0), 0);
      const totalReps = movelaps.length;

      // Update moveframe with totals
      const updatedMoveframe = await tx.moveframe.update({
        where: { id: moveframe.id },
        data: {
          totalDistance,
          totalReps
        },
        include: {
          section: true,
          movelaps: {
            orderBy: { index: 'asc' }
          }
        }
      });

      return updatedMoveframe;
    });

    console.log(`✅ Moveframe created: ${newCode} with ${result.movelaps.length} movelaps`);

    return NextResponse.json({
      moveframe: result,
      message: `Moveframe ${newCode} created with ${result.movelaps.length} movelaps`
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating moveframe:', error);
    return NextResponse.json(
      { error: 'Failed to create moveframe', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workouts/[workoutId]/moveframes
 * Get all moveframes for a workout
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workoutId: string } }
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

    const moveframes = await prisma.moveframe.findMany({
      where: {
        workoutSessionId: params.workoutId
      },
      include: {
        section: true,
        movelaps: {
          orderBy: { index: 'asc' }
        }
      },
      orderBy: { code: 'asc' }
    });

    return NextResponse.json({ moveframes });

  } catch (error) {
    console.error('❌ Error fetching moveframes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moveframes' },
      { status: 500 }
    );
  }
}

