import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { error: 'Username or email is required' },
        { status: 400 }
      );
    }

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { username: identifier.toLowerCase() },
          { email: identifier },
          { email: identifier.toLowerCase() }
        ]
      },
      select: {
        id: true,
        securityQuestion: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.securityQuestion) {
      return NextResponse.json(
        { error: 'No security question set for this account. Please contact support.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      question: user.securityQuestion
    });

  } catch (error) {
    console.error('Get security question error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

