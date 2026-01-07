import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * Sync Periods to WorkoutSections
 * Creates or updates WorkoutSections to match user's Periods
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

    const { periods } = await request.json();

    if (!Array.isArray(periods)) {
      return NextResponse.json({ error: 'Periods must be an array' }, { status: 400 });
    }

    console.log(`📋 Syncing ${periods.length} periods to workout sections for user ${decoded.userId}`);

    // Get all existing workout sections for this user
    const existingSections = await prisma.workoutSection.findMany({
      where: { userId: decoded.userId }
    });

    // Get period names
    const periodNames = new Set(periods.map((p: any) => p.name));

    // Delete sections that don't match any period (but only if not in use)
    const sectionsToDelete = existingSections.filter(s => !periodNames.has(s.name));
    if (sectionsToDelete.length > 0) {
      console.log(`🗑️ Found ${sectionsToDelete.length} old sections that don't match periods`);
      
      // Check which sections are actually in use by moveframes
      for (const section of sectionsToDelete) {
        const moveframeCount = await prisma.moveframe.count({
          where: { sectionId: section.id }
        });
        
        if (moveframeCount === 0) {
          // Safe to delete - not in use
          await prisma.workoutSection.delete({
            where: { id: section.id }
          });
          console.log(`  ✅ Deleted unused section: ${section.name}`);
        } else {
          console.log(`  ⚠️ Keeping section "${section.name}" - used by ${moveframeCount} moveframes`);
        }
      }
    }

    // For each period, create or update a matching workout section
    const syncPromises = periods.map(async (period: any) => {
      // Check if section with same name exists
      const existing = existingSections.find(s => s.name === period.name);

      if (existing) {
        // Update existing section to match period
        return prisma.workoutSection.update({
          where: { id: existing.id },
          data: {
            description: period.description || `Period: ${period.name}`,
            color: period.color || '#3b82f6'
          }
        });
      } else {
        // Create new section from period
        return prisma.workoutSection.create({
          data: {
            userId: decoded.userId,
            name: period.name,
            description: period.description || `Period: ${period.name}`,
            color: period.color || '#3b82f6'
          }
        });
      }
    });

    const syncedSections = await Promise.all(syncPromises);

    console.log('✅ Successfully synced periods to workout sections');

    // Return the synced sections directly
    return NextResponse.json({ 
      success: true,
      sections: syncedSections 
    });
  } catch (error: any) {
    console.error('❌ Error syncing periods to sections:', error);
    return NextResponse.json(
      { error: 'Failed to sync periods', details: error.message },
      { status: 500 }
    );
  }
}

