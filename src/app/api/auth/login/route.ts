import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserType } from '@prisma/client';
import { verifyPassword, generateToken, hashPassword } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, username, identifier, password, userType } = await request.json();

    // Support both email/username separately or combined in identifier field
    const loginIdentifier = identifier || email || username;

    // Validate required fields
    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { error: 'Email/Username and password are required' },
        { status: 400 }
      );
    }

    // Find user by email OR username
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

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 401 }
      );
    }

    // Verify password (supports both SHA1 from old system and bcrypt from new system)
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 401 }
      );
    }

    // If user is using old SHA1 password, upgrade to bcrypt
    if (user.password.length === 40 && /^[a-f0-9]+$/i.test(user.password)) {
      const newHashedPassword = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHashedPassword }
      });
      console.log(`Upgraded password for user ${user.email} from SHA1 to bcrypt`);
    }

    // Check user type if specified
    if (userType) {
      const expectedUserType = mapUserType(userType);
      if (user.userType !== expectedUserType) {
        return NextResponse.json(
          { error: `This account is not registered as a ${userType}` },
          { status: 403 }
        );
      }
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token with RSA signing
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

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fixed user type mapping function
function mapUserType(frontendType: string): UserType {
  const typeMap: { [key: string]: UserType } = {
    'athlete': UserType.ATHLETE,
    'coach': UserType.COACH,
    'team': UserType.TEAM_MANAGER,
    'club': UserType.CLUB_TRAINER,
    'group': UserType.GROUP_ADMIN
  };
  
  return typeMap[frontendType] || UserType.ATHLETE;
}