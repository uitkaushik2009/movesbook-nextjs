import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { uploadImageFile } from '@/utils/imageUpload';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { actionplannerId: string } }
) {
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

    const actionplannerId = params.actionplannerId;

    // Find the action planner and verify ownership
    const actionPlanner = await prisma.actionPlanner.findUnique({
      where: { id: actionplannerId },
    });

    if (!actionPlanner) {
      return NextResponse.json(
        { error: 'Action planner not found' },
        { status: 404 }
      );
    }

    // Verify that the action planner belongs to the current user
    if (actionPlanner.userId !== decoded.userId) {
      return NextResponse.json(
        {
          error:
            'Forbidden - You do not have permission to view this action planner',
        },
        { status: 403 }
      );
    }

    // Format response
    return NextResponse.json({
      id: actionPlanner.id,
      username: actionPlanner.username,
      name: actionPlanner.name,
      surname: actionPlanner.surname,
      fullName: actionPlanner.fullName,
      email: actionPlanner.email,
      dateOfBirth: actionPlanner.dateOfBirth
        ? actionPlanner.dateOfBirth.toISOString().split('T')[0]
        : '',
      imageUrl: actionPlanner.imageUrl || null,
      category: actionPlanner.category || '',
      annotation: actionPlanner.annotation || '',
      startDate: actionPlanner.startDate.toISOString().split('T')[0],
      createFrom: actionPlanner.createFrom,
      origin: actionPlanner.origin,
    });
  } catch (error: any) {
    console.error('Error fetching action planner:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { actionplannerId: string } }
) {
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

    const actionplannerId = params.actionplannerId;

    // Find the action planner and verify ownership
    const existingPlanner = await prisma.actionPlanner.findUnique({
      where: { id: actionplannerId },
      select: {
        id: true,
        userId: true,
        imageUrl: true,
        username: true,
        email: true,
      },
    });

    if (!existingPlanner) {
      return NextResponse.json(
        { error: 'Action planner not found' },
        { status: 404 }
      );
    }

    // Verify that the action planner belongs to the current user
    if (existingPlanner.userId !== decoded.userId) {
      return NextResponse.json(
        {
          error:
            'Forbidden - You do not have permission to update this action planner',
        },
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

    // Check for duplicate username or email (excluding current action planner)
    const duplicatePlanner = await prisma.actionPlanner.findFirst({
      where: {
        AND: [
          { id: { not: actionplannerId } },
          {
            OR: [{ username }, { email }],
          },
        ],
      },
    });

    if (duplicatePlanner) {
      return NextResponse.json(
        {
          error: 'Action planner with this username or email already exists',
        },
        { status: 409 }
      );
    }

    // Handle image upload
    let imageUrl: string | null = existingPlanner.imageUrl;
    if (image && image.size > 0) {
      const result = await uploadImageFile(
        image,
        'action-planners',
        existingPlanner.imageUrl
      );
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
      : new Date('1900-01-01');
    const startDateDate = new Date(startDate);

    // Update action planner
    const updatedPlanner = await prisma.actionPlanner.update({
      where: { id: actionplannerId },
      data: {
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
        id: updatedPlanner.id,
        username: updatedPlanner.username,
        fullName: updatedPlanner.fullName,
        imageUrl: updatedPlanner.imageUrl || '',
        category: updatedPlanner.category || '',
        startDate: updatedPlanner.startDate.toISOString().split('T')[0],
        createFrom: updatedPlanner.createFrom,
        origin: updatedPlanner.origin,
      },
    });
  } catch (error: any) {
    console.error('Error updating action planner:', error);

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'Action planner with this username or email already exists',
        },
        { status: 409 }
      );
    }

    // Handle Prisma record not found errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Action planner not found' },
        { status: 404 }
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { actionplannerId: string } }
) {
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

    const actionplannerId = params.actionplannerId;

    // Find the action planner and verify ownership
    const actionPlanner = await prisma.actionPlanner.findUnique({
      where: { id: actionplannerId },
      select: {
        id: true,
        userId: true,
        imageUrl: true,
      },
    });

    if (!actionPlanner) {
      return NextResponse.json(
        { error: 'Action planner not found' },
        { status: 404 }
      );
    }

    // Verify that the action planner belongs to the current user
    if (actionPlanner.userId !== decoded.userId) {
      return NextResponse.json(
        {
          error:
            'Forbidden - You do not have permission to delete this action planner',
        },
        { status: 403 }
      );
    }

    // Delete the image file if it exists
    if (actionPlanner.imageUrl) {
      try {
        const imagePath = join(
          process.cwd(),
          'public',
          actionPlanner.imageUrl.startsWith('/')
            ? actionPlanner.imageUrl.slice(1)
            : actionPlanner.imageUrl
        );
        if (existsSync(imagePath)) {
          unlinkSync(imagePath);
        }
      } catch (imageError) {
        console.warn('Error deleting image file:', imageError);
        // Continue with deletion even if image deletion fails
      }
    }

    // Delete the action planner
    await prisma.actionPlanner.delete({
      where: { id: actionplannerId },
    });

    return NextResponse.json({
      success: true,
      message: 'Action planner deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting action planner:', error);

    // Handle Prisma record not found errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Action planner not found' },
        { status: 404 }
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
