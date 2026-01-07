import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/user/favorite-sports - Get user's favorite sports
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const favoriteSports = await prisma.favoriteSport.findMany({
      where: { userId: decoded.userId },
      orderBy: { order: 'asc' }
    });

    const sportsList = favoriteSports.map(fs => fs.sport);
    console.log(`✅ Retrieved ${favoriteSports.length} favorite sports for user ${decoded.userId}:`, sportsList);

    return NextResponse.json({
      success: true,
      sports: sportsList
    });
  } catch (error: any) {
    console.error('❌ Error getting favorite sports:', error);
    return NextResponse.json(
      { error: 'Failed to get favorite sports', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/user/favorite-sports - Save user's favorite sports
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { sports } = body; // Array of sport types in order

    console.log('📥 Received sports data:', sports);
    console.log('📥 User ID:', decoded.userId);

    if (!Array.isArray(sports) || sports.length === 0) {
      console.error('❌ Invalid sports array:', sports);
      return NextResponse.json(
        { error: 'Sports array is required' },
        { status: 400 }
      );
    }

    // Limit to 5 favorite sports
    const sportsToSave = sports.slice(0, 5);

    console.log(`📝 Saving ${sportsToSave.length} favorite sports for user ${decoded.userId}:`, sportsToSave);

    // Use transaction to delete old and create new
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing favorites
      const deleted = await tx.favoriteSport.deleteMany({
        where: { userId: decoded.userId }
      });
      console.log(`🗑️ Deleted ${deleted.count} old favorites`);

      // Create new favorites
      const created = await Promise.all(
        sportsToSave.map((sport, index) => {
          console.log(`➕ Creating favorite: ${sport} (order: ${index + 1})`);
          return tx.favoriteSport.create({
            data: {
              userId: decoded.userId,
              sport: sport,
              order: index + 1
            }
          });
        })
      );
      
      return created;
    });

    console.log(`✅ Successfully saved ${result.length} favorite sports for user ${decoded.userId}`);

    // Verify by reading back what was saved
    const savedSports = await prisma.favoriteSport.findMany({
      where: { userId: decoded.userId },
      orderBy: { order: 'asc' }
    });
    console.log(`🔍 Verification: Found ${savedSports.length} sports in database:`, savedSports.map(s => s.sport));

    return NextResponse.json({
      success: true,
      message: 'Favorite sports saved successfully',
      saved: savedSports.map(s => s.sport) // Return what was actually saved
    });
  } catch (error: any) {
    console.error('❌ Error saving favorite sports:', error);
    return NextResponse.json(
      { error: 'Failed to save favorite sports', details: error.message },
      { status: 500 }
    );
  }
}

