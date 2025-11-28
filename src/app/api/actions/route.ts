import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(
      request.nextUrl.searchParams.get('limit') || '10',
      10
    );
    const search = request.nextUrl.searchParams.get('search') || '';
    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'createdAt';
    const sortOrder =
      (request.nextUrl.searchParams.get('sortOrder') as 'asc' | 'desc') ||
      'desc';
    const languageCode =
      request.nextUrl.searchParams.get('languageCode') || 'en';

    // Build where clause
    const where: any = {
      userId: decoded.userId, // Only get actions for the current user
    };

    // Add search filter - search in translations
    if (search) {
      where.translations = {
        some: {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        },
      };
    }

    // Build orderBy clause
    const orderBy: any = {};
    const validSortFields = ['createdAt', 'updatedAt', 'color'];
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.action.count({ where });

    // Get paginated actions with translations
    const actions = await prisma.action.findMany({
      where,
      include: {
        translations: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    // Transform actions to match frontend interface
    const transformedActions = actions.map((action: any) => {
      // Find translation for the requested language, or fallback to first translation
      const translation = action.translations.find(
        (t: any) => t.languageCode === languageCode
      ) ||
        action.translations[0] || { name: '', description: '' };

      return {
        id: action.id,
        name: translation.name || '',
        description: translation.description || '',
        iconUrl: action.iconUrl || '',
        color: action.color,
        translations: action.translations.map((t: any) => ({
          languageCode: t.languageCode,
          name: t.name || '',
          description: t.description || '',
        })),
      };
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      items: transformedActions,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error('Error fetching actions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
