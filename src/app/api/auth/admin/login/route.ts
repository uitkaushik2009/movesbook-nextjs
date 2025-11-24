import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserType } from '@prisma/client';
import { verifyPassword, generateToken, hashPassword } from '@/lib/auth';

const prisma = new PrismaClient();

// Fallback admin credentials (used if no admin in database)
// Note: Password is hashed for security. Original password: Set via ADMIN_PASSWORD env var or default hashed value
const FALLBACK_ADMIN = {
  username: process.env.ADMIN_USERNAME || 'admin',
  email: process.env.ADMIN_EMAIL || 'admin@movesbook.com',
  // Bcrypt hashed admin password - for production, set ADMIN_PASSWORD_HASH in environment
  passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2a$12$XabKUB4Yas3AafvzbTWcWO2/oXZfsNb7VJvvi.LxJJxZlXRnkZNGW'
};

export async function POST(request: NextRequest) {
  try {
    const { username, email, identifier, password } = await request.json();

    // Support both email/username separately or combined in identifier field
    const loginIdentifier = identifier || email || username;

    // Validate input
    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { error: 'Email/Username and password are required' },
        { status: 400 }
      );
    }

    // First, check fallback admin credentials (for quick access)
    if (loginIdentifier === FALLBACK_ADMIN.username || 
        loginIdentifier === FALLBACK_ADMIN.email) {
      
      // Verify password against hashed value
      const isPasswordValid = await verifyPassword(password, FALLBACK_ADMIN.passwordHash);
      
      if (isPasswordValid) {
        // Generate admin token
        const token = generateToken(
          'admin', 
          FALLBACK_ADMIN.email, 
          FALLBACK_ADMIN.username, 
          'ADMIN'
        );

        return NextResponse.json({
          success: true,
          token,
          user: {
            id: 'admin',
            name: 'Admin',
            username: FALLBACK_ADMIN.username,
            email: FALLBACK_ADMIN.email,
            userType: 'ADMIN'
          }
        });
      }
    }

    // Try to find user in database
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginIdentifier },
          { username: loginIdentifier }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        password: true,
        userType: true,
        createdAt: true,
      }
    });

    if (user) {
      // User found in database - verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid email/username or password' },
          { status: 401 }
        );
      }

      // If user is using old SHA1 password, upgrade to bcrypt
      if (user.password.length === 40 && /^[a-f0-9]+$/i.test(user.password)) {
        try {
          const newHashedPassword = await hashPassword(password);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: newHashedPassword }
          });
          console.log(`Upgraded admin password for ${user.email} from SHA1 to bcrypt`);
        } catch (err) {
          console.error('Password upgrade failed:', err);
          // Continue anyway - password was verified
        }
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Generate JWT token
      const token = generateToken(
        user.id,
        user.email,
        user.username,
        user.userType
      );

      return NextResponse.json({
        success: true,
        token,
        user: userWithoutPassword
      });
    }

    // Invalid credentials
    return NextResponse.json(
      { error: 'Invalid email/username or password' },
      { status: 401 }
    );

  } catch (error: any) {
    console.error('Admin login error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}