import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params for Next.js compatibility
    const params = context.params instanceof Promise ? await context.params : context.params;
    
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { workType } = body;
    const moveframeId = params.id;

    if (!['NONE', 'MAIN', 'SECONDARY'].includes(workType)) {
      return NextResponse.json({ success: false, error: 'Invalid work type' }, { status: 400 });
    }

    // Get the moveframe to know its sport and day
    const moveframe = await prisma.moveframe.findUnique({
      where: { id: moveframeId },
      include: {
        workoutSession: {
          include: {
            workoutDay: true
          }
        }
      }
    });

    if (!moveframe) {
      return NextResponse.json({ success: false, error: 'Moveframe not found' }, { status: 404 });
    }

    const dayId = moveframe.workoutSession.workoutDayId;
    const sport = moveframe.sport;

    console.log(`🎯 Setting work type for moveframe ${moveframeId}:`);
    console.log(`   Sport: ${sport}, New work type: ${workType}`);

    // If setting to MAIN or SECONDARY, reset other moveframes OF THE SAME SPORT in the day
    // (Per sport rule: only ONE MAIN and ONE SECONDARY per sport per day)
    if (workType === 'MAIN' || workType === 'SECONDARY') {
      // Find ALL moveframes of the SAME SPORT in this day
      const dayWorkouts = await prisma.workoutSession.findMany({
        where: { workoutDayId: dayId },
        include: {
          moveframes: {
            where: {
              sport: sport, // Same sport only!
              NOT: { id: moveframeId }
            }
          }
        }
      });

      // Get ALL moveframes of this sport in the day
      const sameSportMoveframes = dayWorkouts.flatMap(w => w.moveframes);
      console.log(`   Found ${sameSportMoveframes.length} other moveframes of sport ${sport} in this day`);

      // Filter and reset ONLY those with the same work type we're trying to set
      const moveframesToReset = sameSportMoveframes.filter(mf => mf.workType === workType);
      console.log(`   Resetting ${moveframesToReset.length} moveframes with workType=${workType}`);

      // Reset them to NONE
      for (const mfToReset of moveframesToReset) {
        await prisma.moveframe.update({
          where: { id: mfToReset.id },
          data: { workType: 'NONE' }
        });
        console.log(`   ✅ Reset moveframe ${mfToReset.id} to NONE`);
      }
    }

    // If RESETTING a MAIN work to NONE, promote SECONDARY to MAIN for this sport
    if (workType === 'NONE' && moveframe.workType === 'MAIN') {
      console.log(`   🔄 Resetting MAIN work, checking for SECONDARY to promote...`);
      
      // Find SECONDARY work of the same sport in this day
      const dayWorkouts = await prisma.workoutSession.findMany({
        where: { workoutDayId: dayId },
        include: {
          moveframes: {
            where: {
              sport: sport,
              workType: 'SECONDARY',
              NOT: { id: moveframeId }
            }
          }
        }
      });

      const secondaryMoveframes = dayWorkouts.flatMap(w => w.moveframes);
      
      if (secondaryMoveframes.length > 0) {
        const secondaryToPromote = secondaryMoveframes[0];
        await prisma.moveframe.update({
          where: { id: secondaryToPromote.id },
          data: { workType: 'MAIN' }
        });
        console.log(`   ⬆️ Promoted moveframe ${secondaryToPromote.id} from SECONDARY to MAIN`);
      } else {
        console.log(`   ℹ️ No SECONDARY work found to promote`);
      }
    }

    // Update the target moveframe
    const updatedMoveframe = await prisma.moveframe.update({
      where: { id: moveframeId },
      data: { workType },
      include: {
        section: true,
        movelaps: {
          orderBy: { repetitionNumber: 'asc' }
        }
      }
    });

    // Get ALL moveframes in the day to return updated state (all sports)
    const allDayWorkouts = await prisma.workoutSession.findMany({
      where: { workoutDayId: dayId },
      include: {
        moveframes: true
      }
    });

    const allDayMoveframes = allDayWorkouts.flatMap(w => w.moveframes);

    console.log(`✅ Work type updated successfully`);
    console.log(`   Returning ${allDayMoveframes.length} moveframes in this day`);

    return NextResponse.json({
      success: true,
      moveframe: updatedMoveframe,
      affectedMoveframes: allDayMoveframes // Return ALL moveframes in the day with their updated work types
    });
  } catch (error) {
    console.error('Error setting work type:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to set work type',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

