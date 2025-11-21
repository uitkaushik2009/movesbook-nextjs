import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, newUsername, userType } = await request.json();

    // Validate required fields
    if (!email || !newUsername) {
      return NextResponse.json(
        { error: 'Email and new username are required' },
        { status: 400 }
      );
    }

    // Validate username (minimum 3 characters, alphanumeric and underscore)
    if (newUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    // Check if new username is already taken
    const existingUser = await prisma.user.findFirst({
      where: { username: newUsername }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken. Please choose a different one.' },
        { status: 409 }
      );
    }

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        userType: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found with the provided email' },
        { status: 404 }
      );
    }

    // Check user type if specified
    if (userType) {
      const typeMap: { [key: string]: string } = {
        'athlete': 'ATHLETE',
        'coach': 'COACH',
        'team': 'TEAM_MANAGER',
        'club': 'CLUB_TRAINER',
        'group': 'GROUP_ADMIN'
      };
      const expectedType = typeMap[userType.toLowerCase()];
      if (expectedType && user.userType !== expectedType) {
        return NextResponse.json(
          { error: 'User type does not match' },
          { status: 403 }
        );
      }
    }

    // Update username
    await prisma.user.update({
      where: { id: user.id },
      data: { username: newUsername }
    });

    return NextResponse.json({
      success: true,
      message: 'Username has been reset successfully',
      newUsername
    });

  } catch (error: any) {
    console.error('Username reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset username. Please try again.' },
      { status: 500 }
    );
  }
}

