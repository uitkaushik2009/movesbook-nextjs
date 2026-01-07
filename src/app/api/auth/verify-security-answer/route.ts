import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPasswordSHA1 } from '@/lib/auth';


export async function POST(request: NextRequest) {
  try {
    const { identifier, answer } = await request.json();

    if (!identifier || !answer) {
      return NextResponse.json(
        { error: 'Username/email and answer are required' },
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
        securityAnswer: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.securityAnswer) {
      return NextResponse.json(
        { error: 'No security answer set for this account' },
        { status: 404 }
      );
    }

    // Hash the provided answer and compare with stored hash
    const hashedAnswer = hashPasswordSHA1(answer.toLowerCase().trim());
    
    if (hashedAnswer !== user.securityAnswer) {
      return NextResponse.json(
        { error: 'Incorrect answer' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true
    });

  } catch (error) {
    console.error('Verify security answer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

