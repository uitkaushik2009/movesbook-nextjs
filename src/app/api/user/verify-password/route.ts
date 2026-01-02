import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, verifyPassword } from '@/lib/auth';

/**
 * Verify user's own password
 * Used when users need to confirm their identity for sensitive operations
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('🔐 Verify password - Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
      return NextResponse.json(
        { valid: false, error: 'Unauthorized - No valid token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('🔑 Token extracted, length:', token.length);
    
    let decoded;
    try {
      decoded = verifyToken(token);
      console.log('✅ Token decoded:', decoded);
    } catch (err) {
      console.log('❌ Token verification failed:', err);
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.userId) {
      console.log('❌ Decoded token missing userId');
      return NextResponse.json(
        { valid: false, error: 'Invalid token payload' },
        { status: 401 }
      );
    }

    const { password } = await request.json();
    console.log('🔐 Password received:', password ? 'Yes' : 'No');

    if (!password) {
      return NextResponse.json(
        { valid: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { password: true, username: true }
    });

    console.log('👤 User found:', user ? user.username : 'Not found');

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password (supports both SHA1 and bcrypt)
    const isValid = await verifyPassword(password, user.password);
    console.log('🔑 Password valid:', isValid);

    if (!isValid) {
      return NextResponse.json(
        { valid: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'Password verified successfully'
    });

  } catch (error) {
    console.error('❌ Error verifying user password:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

