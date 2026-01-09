import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Safely parse JSON with error handling
    let sections;
    try {
      const body = await request.json();
      sections = body.sections;
    } catch (parseError) {
      console.error('❌ Error parsing request body:', parseError);
      return NextResponse.json({ 
        error: 'Invalid request body', 
        details: parseError instanceof Error ? parseError.message : 'Unable to parse JSON'
      }, { status: 400 });
    }
    
    // Handle fallback admin - accept but don't save
    if (decoded.userId === 'admin') {
      return NextResponse.json({
        success: true,
        sections: sections || [],
        message: 'Admin sections accepted (not persisted to database)'
      });
    }

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: 'Sections must be an array' }, { status: 400 });
    }

    console.log(`🔄 Syncing ${sections.length} workout sections for user ${decoded.userId}`);

    // Get existing sections from database
    const existingSections = await prisma.workoutSection.findMany({
      where: { userId: decoded.userId }
    });

    const existingIds = new Set(existingSections.map(s => s.id));
    const incomingIds = new Set(sections.map((s: any) => s.id).filter((id: string) => id && !id.startsWith('temp_')));

    // 1. Delete sections that are no longer in the incoming list
    const sectionsToDelete = existingSections.filter(s => !incomingIds.has(s.id));
    if (sectionsToDelete.length > 0) {
      await prisma.workoutSection.deleteMany({
        where: {
          id: { in: sectionsToDelete.map(s => s.id) },
          userId: decoded.userId
        }
      });
      console.log(`🗑️  Deleted ${sectionsToDelete.length} workout sections`);
    }

    // 2. Update or create sections
    for (const section of sections) {
      const sectionData = {
        userId: decoded.userId,
        name: section.title || section.name, // Support both 'title' and 'name'
        code: section.code || null, // Code field (max 5 chars)
        description: section.description || '',
        color: section.color || '#3b82f6'
      };

      // If section has an ID and it exists in database, update it
      if (section.id && existingIds.has(section.id)) {
        await prisma.workoutSection.update({
          where: { id: section.id },
          data: sectionData
        });
        console.log(`✏️  Updated workout section: ${sectionData.name} (Code: ${sectionData.code || 'N/A'})`);
      } 
      // Otherwise, create a new section
      else {
        await prisma.workoutSection.create({
          data: sectionData
        });
        console.log(`➕ Created new workout section: ${sectionData.name} (Code: ${sectionData.code || 'N/A'})`);
      }
    }

    // Fetch updated list
    const updatedSections = await prisma.workoutSection.findMany({
      where: { userId: decoded.userId },
      orderBy: { name: 'asc' }
    });

    console.log(`✅ Sync complete. Total workout sections: ${updatedSections.length}`);

    return NextResponse.json({ 
      success: true,
      sections: updatedSections 
    });

  } catch (error) {
    console.error('❌ Error syncing workout sections:', error);
    return NextResponse.json(
      { error: 'Failed to sync workout sections', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

