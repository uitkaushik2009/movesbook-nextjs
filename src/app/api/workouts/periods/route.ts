import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/workouts/periods
 * Get all workout periods for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Handle fallback admin - return default periods
    if (decoded.userId === 'admin') {
      const defaultPeriods = [
        { id: 'admin-base', name: 'Base', description: 'Base training period', color: '#93C5FD' },
        { id: 'admin-build', name: 'Build', description: 'Build training period', color: '#FCD34D' },
        { id: 'admin-peak', name: 'Peak', description: 'Peak/Competition period', color: '#FCA5A5' },
        { id: 'admin-recovery', name: 'Recovery', description: 'Recovery period', color: '#86EFAC' }
      ];
      return NextResponse.json({ periods: defaultPeriods });
    }

    // Get all periods for this user
    const periods = await prisma.period.findMany({
      where: { userId: decoded.userId },
      orderBy: { name: 'asc' }
    });

    console.log(`📊 Found ${periods.length} periods for user ${decoded.userId}`);
    periods.forEach((p, i) => console.log(`  ${i+1}. ${p.name} (ID: ${p.id}, Color: ${p.color})`));

    // If user has no periods, create default ones
    if (periods.length === 0) {
      console.log('🔨 Creating default periods...');
      const defaultPeriods = await prisma.$transaction([
        prisma.period.create({
          data: {
            userId: decoded.userId,
            name: 'Base',
            description: 'Base training period',
            color: '#93C5FD' // Light Blue
          }
        }),
        prisma.period.create({
          data: {
            userId: decoded.userId,
            name: 'Build',
            description: 'Build training period',
            color: '#FCD34D' // Yellow
          }
        }),
        prisma.period.create({
          data: {
            userId: decoded.userId,
            name: 'Peak',
            description: 'Peak/Competition period',
            color: '#FCA5A5' // Red
          }
        }),
        prisma.period.create({
          data: {
            userId: decoded.userId,
            name: 'Recovery',
            description: 'Recovery period',
            color: '#86EFAC' // Green
          }
        })
      ]);

      console.log('✅ Created default periods:', defaultPeriods.map(p => p.name).join(', '));
      return NextResponse.json({ periods: defaultPeriods });
    }

    console.log('✅ Returning periods:', periods.map(p => p.name).join(', '));
    return NextResponse.json({ periods });

  } catch (error) {
    console.error('❌ Error fetching periods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch periods', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workouts/periods
 * Create a new workout period
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

    // Handle fallback admin - accept but don't save
    if (decoded.userId === 'admin') {
      const body = await request.json();
      return NextResponse.json({ 
        period: { 
          id: `admin-${Date.now()}`, 
          userId: 'admin',
          ...body 
        },
        message: 'Admin period accepted (not persisted to database)'
      }, { status: 201 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const period = await prisma.period.create({
      data: {
        userId: decoded.userId,
        name,
        description: description || '',
        color: color || '#9CA3AF' // Gray default
      }
    });

    return NextResponse.json({ period }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating period:', error);
    return NextResponse.json(
      { error: 'Failed to create period', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
