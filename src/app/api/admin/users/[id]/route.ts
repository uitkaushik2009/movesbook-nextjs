import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE - Delete admin user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id },
      select: { id: true, userType: true, username: true }
    });

    if (!admin || admin.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Delete admin user
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: `Admin user ${admin.username} deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json(
      { error: 'Failed to delete admin user' },
      { status: 500 }
    );
  }
}

// GET - Get single admin user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const admin = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        userType: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!admin || admin.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ admin }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin user' },
      { status: 500 }
    );
  }
}

// PUT - Update admin user details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { username, email, name, isActive } = body;

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { id },
      select: { id: true, userType: true }
    });

    if (!existingAdmin || existingAdmin.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Check if new username/email conflicts with other users
    if (username || email) {
      const conflict = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(username ? [{ username }] : []),
                ...(email ? [{ email }] : [])
              ]
            }
          ]
        }
      });

      if (conflict) {
        return NextResponse.json(
          { error: 'Username or email already in use' },
          { status: 409 }
        );
      }
    }

    // Update admin
    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(name !== undefined && { name }),
        ...(isActive !== undefined && { isActive })
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        userType: true,
        isActive: true,
        updatedAt: true
      }
    });

    return NextResponse.json(
      { 
        message: 'Admin user updated successfully',
        admin: updatedAdmin 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to update admin user' },
      { status: 500 }
    );
  }
}

