import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';


// GET: Load default settings for a specific language (PUBLIC - any user can load defaults)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');

    if (!language) {
      return NextResponse.json(
        { success: false, error: 'Language parameter is required' },
        { status: 400 }
      );
    }

    // Load all default settings for the specified language
    let colorDefaults, toolsDefaults, favouritesDefaults, myBestDefaults, gridDefaults;
    
    try {
      [colorDefaults, toolsDefaults, favouritesDefaults] = await Promise.all([
        prisma.colorDefaults.findUnique({ where: { language } }),
        prisma.toolsDefaults.findUnique({ where: { language } }),
        prisma.favouritesDefaults.findUnique({ where: { language } })
      ]);
      
      // Try to load new models if they exist
      if ((prisma as any).myBestDefaults) {
        myBestDefaults = await (prisma as any).myBestDefaults.findUnique({ where: { language } });
      }
      if ((prisma as any).gridDefaults) {
        gridDefaults = await (prisma as any).gridDefaults.findUnique({ where: { language } });
      }
    } catch (error) {
      console.error('Error loading defaults:', error);
    }

    return NextResponse.json({
      success: true,
      language,
      defaults: {
        colors: colorDefaults?.data || null,
        tools: toolsDefaults?.data || null,
        favourites: favouritesDefaults?.data || null,
        myBest: myBestDefaults?.data || null,
        grid: gridDefaults?.data || null
      }
    });
  } catch (error) {
    console.error('Error loading admin default settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load default settings' },
      { status: 500 }
    );
  }
}

// POST: Save default settings for a specific language (ADMIN ONLY)
export async function POST(request: Request) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { userType: true }
    });

    const isAdmin = user && (
      user.userType === 'ADMIN' || 
      user.userType === 'CLUB_TRAINER' || 
      user.userType === 'CLUB' ||
      user.userType === 'TEAM_MANAGER' ||
      user.userType === 'TEAM' ||
      user.userType === 'GROUP_ADMIN' ||
      user.userType === 'GROUP' ||
      user.userType === 'COACH'
    );

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { language, settingsType, data } = body;

    if (!language || !settingsType || !data) {
      return NextResponse.json(
        { success: false, error: 'Language, settingsType, and data are required' },
        { status: 400 }
      );
    }

    let result;

    switch (settingsType) {
      case 'colors':
        result = await prisma.colorDefaults.upsert({
          where: { language },
          update: { data, updatedAt: new Date() },
          create: { language, data }
        });
        break;

      case 'tools':
        result = await prisma.toolsDefaults.upsert({
          where: { language },
          update: { data, updatedAt: new Date() },
          create: { language, data }
        });
        break;

      case 'favourites':
        result = await prisma.favouritesDefaults.upsert({
          where: { language },
          update: { data, updatedAt: new Date() },
          create: { language, data }
        });
        break;

      case 'myBest':
        if ((prisma as any).myBestDefaults) {
          result = await (prisma as any).myBestDefaults.upsert({
            where: { language },
            update: { data, updatedAt: new Date() },
            create: { language, data }
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'MyBestDefaults model not yet available. Please regenerate Prisma Client.' },
            { status: 503 }
          );
        }
        break;

      case 'grid':
        if ((prisma as any).gridDefaults) {
          result = await (prisma as any).gridDefaults.upsert({
            where: { language },
            update: { data, updatedAt: new Date() },
            create: { language, data }
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'GridDefaults model not yet available. Please regenerate Prisma Client.' },
            { status: 503 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid settingsType' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Default ${settingsType} settings saved for ${language}`,
      result
    });
  } catch (error) {
    console.error('Error saving admin default settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save default settings' },
      { status: 500 }
    );
  }
}

