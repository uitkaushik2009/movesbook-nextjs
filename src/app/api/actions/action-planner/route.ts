import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { uploadImageFile } from '@/utils/imageUpload';

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

    if (user.userType === 'ATHLETE') {
      return NextResponse.json(
        { error: 'Forbidden - You do not have enough Permissions.' },
        { status: 403 }
      );
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

    // Build where clause
    const where: any = {
      userId: decoded.userId, // Only get action planners for the current user
    };

    // Add search filter (SQLite doesn't support case-insensitive mode)
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { username: { contains: search } },
        { category: { contains: search } },
        { origin: { contains: search } },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    const validSortFields = [
      'fullName',
      'category',
      'startDate',
      'createFrom',
      'origin',
    ];

    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.actionPlanner.count({ where });
    // Get paginated action planners
    const actionPlanners = await prisma.actionPlanner.findMany({
      where,
      select: {
        id: true,
        username: true,
        fullName: true,
        imageUrl: true,
        category: true,
        startDate: true,
        createFrom: true,
        origin: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Format response to match frontend expectations
    const items = actionPlanners.map((planner: any) => ({
      id: planner.id,
      username: planner.username,
      fullName: planner.fullName,
      imageUrl: planner.imageUrl || '',
      category: planner.category || '',
      startDate: planner.startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      createFrom: planner.createFrom,
      origin: planner.origin,
    }));

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error('Error fetching action planners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user exists and has permission
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.userType === 'ATHLETE') {
      return NextResponse.json(
        { error: 'Forbidden - You do not have enough Permissions.' },
        { status: 403 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const name = formData.get('name') as string;
    const surname = formData.get('surname') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const category = formData.get('category') as string;
    const annotation = formData.get('annotation') as string;
    const startDate = formData.get('startDate') as string;
    const image = formData.get('image') as File | null;
    const createFrom = formData.get('createFrom') as 'SCRATCH' | 'IMPORTED';
    const origin = formData.get('origin') as string;

    // Validate required fields
    if (
      !username ||
      !name ||
      !surname ||
      !fullName ||
      !email ||
      !startDate ||
      !createFrom ||
      !origin
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: username, name, surname, fullName, email, startDate, createFrom, and origin are required',
        },
        { status: 400 }
      );
    }

    // Check for duplicate username or email in ActionPlanner table
    const existingPlanner = await prisma.actionPlanner.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingPlanner) {
      return NextResponse.json(
        {
          error: 'Action planner with this username or email already exists',
        },
        { status: 409 }
      );
    }

    // Handle image upload
    let imageUrl: string | null = null;
    if (image && image.size > 0) {
      const result = await uploadImageFile(image, 'action-planners');
      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 500 }
        );
      }
      imageUrl = result.url;
    }

    // Parse dates
    const dateOfBirthDate = dateOfBirth
      ? new Date(dateOfBirth)
      : new Date('1900-01-01'); // Default date if not provided
    const startDateDate = new Date(startDate);

    // Create action planner
    const actionPlanner = await prisma.actionPlanner.create({
      data: {
        userId: decoded.userId,
        username,
        name,
        surname,
        fullName,
        email,
        dateOfBirth: dateOfBirthDate,
        imageUrl,
        category: category || null,
        annotation: annotation || null,
        startDate: startDateDate,
        createFrom,
        origin,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        imageUrl: true,
        category: true,
        startDate: true,
        createFrom: true,
        origin: true,
      },
    });

    // Format response
    return NextResponse.json({
      success: true,
      data: {
        id: actionPlanner.id,
        username: actionPlanner.username,
        fullName: actionPlanner.fullName,
        imageUrl: actionPlanner.imageUrl || '',
        category: actionPlanner.category || '',
        startDate: actionPlanner.startDate.toISOString().split('T')[0],
        createFrom: actionPlanner.createFrom,
        origin: actionPlanner.origin,
      },
    });
  } catch (error: any) {
    console.error('Error creating action planner:', error);

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'Action planner with this username or email already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
