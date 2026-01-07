import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPasswordSHA1 } from '@/lib/auth';


export async function POST(request: NextRequest) {
  try {
    const { identifier, answer, newPassword } = await request.json();

    if (!identifier || !answer || !newPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
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

    // Verify the security answer again
    const hashedAnswer = hashPasswordSHA1(answer.toLowerCase().trim());
    
    if (hashedAnswer !== user.securityAnswer) {
      return NextResponse.json(
        { error: 'Incorrect security answer' },
        { status: 401 }
      );
    }

    // Hash the new password with SHA1 (for consistency with your existing system)
    const hashedPassword = hashPasswordSHA1(newPassword);

    // Update the password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
