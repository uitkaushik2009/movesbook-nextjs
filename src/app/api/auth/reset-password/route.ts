import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { identifier, newPassword, userType } = await request.json();

    // Validate required fields
    if (!identifier || !newPassword) {
      return NextResponse.json(
        { error: 'Email/Username and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 6 characters)
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find user by email OR username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        userType: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found with the provided email or username' },
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

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}

