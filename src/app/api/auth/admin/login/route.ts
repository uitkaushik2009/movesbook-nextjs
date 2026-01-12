import { NextRequest, NextResponse } from 'next/server';
import { UserType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken, hashPassword } from '@/lib/auth';

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
        // Check if actual admin user exists in database (use real user ID if found)
        // Note: We don't filter by userType because the admin user might have ATHLETE type
        const realAdminUser = await prisma.user.findFirst({
          where: {
            OR: [
              { username: FALLBACK_ADMIN.username },
              { email: FALLBACK_ADMIN.email },
              { username: 'admin' },
              { email: 'lerkos000@gmail.com' }
            ]
          },
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            userType: true
          }
        });

        if (realAdminUser) {
          // Use real admin user from database
          const token = generateToken(
            realAdminUser.id,
            realAdminUser.email,
            realAdminUser.username,
            realAdminUser.userType
          );

          return NextResponse.json({
            success: true,
            token,
            user: {
              id: realAdminUser.id,
              name: realAdminUser.name,
              username: realAdminUser.username,
              email: realAdminUser.email,
              userType: realAdminUser.userType
            }
          });
        } else {
          // Fallback: use 'admin' ID if no real user found (shouldn't happen in production)
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
    }

    // First, check if Super Admin exists in super_admins table - case-insensitive
    const superAdmin = await prisma.superAdmin.findFirst({
      where: {
        OR: [
          { email: loginIdentifier },
          { username: loginIdentifier },
          { email: loginIdentifier.toLowerCase() },
          { username: loginIdentifier.toLowerCase() }
        ],
        isActive: true
      }
    });

    if (superAdmin) {
      // Verify Super Admin password
      const isPasswordValid = await verifyPassword(password, superAdmin.password);
      
      if (isPasswordValid) {
        // Update last login
        await prisma.superAdmin.update({
          where: { id: superAdmin.id },
          data: { lastLogin: new Date() }
        });

        // Generate admin token
        const token = generateToken(
          superAdmin.id,
          superAdmin.email,
          superAdmin.username,
          'ADMIN'
        );

        return NextResponse.json({
          success: true,
          token,
          user: {
            id: superAdmin.id,
            name: superAdmin.name || superAdmin.username,
            username: superAdmin.username,
            email: superAdmin.email,
            userType: 'ADMIN',
            isSuperAdmin: true
          }
        });
      }
    }

    // Try to find user in NEW database
    // First try with ADMIN userType, then try without userType filter for admin username/email (backward compatibility)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginIdentifier },
          { username: loginIdentifier },
          { email: loginIdentifier.toLowerCase() },
          { username: loginIdentifier.toLowerCase() }
        ],
        userType: 'ADMIN'
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

    // If not found in new table, check LEGACY table (if it exists)
    if (!user) {
      try {
        const legacyUser = await prisma.$queryRaw<any[]>`
          SELECT id, username, email, password, role_id,
                 COALESCE(firstname, '') as firstname,
                 COALESCE(lastname, '') as lastname
          FROM users
          WHERE (email = ${loginIdentifier} OR username = ${loginIdentifier})
          AND delete_status = 'N'
          AND role_id IN (5, 6)
          LIMIT 1
        `;

        if (legacyUser.length > 0) {
          const legacy = legacyUser[0];
          const name = `${legacy.firstname || ''} ${legacy.lastname || ''}`.trim() || legacy.username;
          
          user = {
            id: `legacy_${legacy.id}`,
            name: name,
            username: legacy.username,
            email: legacy.email,
            password: legacy.password,
            userType: legacy.role_id === 6 ? 'ADMIN' : 'GROUP_ADMIN',
            createdAt: new Date(),
          };
        }
      } catch (legacyError: any) {
        // Legacy table doesn't exist or query failed - that's okay, just skip it
        console.log('Legacy users table not found or inaccessible (this is normal for new installations)');
      }
    }

    if (user) {
      // User found in database - verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid email/username or password' },
          { status: 401 }
        );
      }

      // Auto-upgrade disabled - keeping SHA1 passwords as-is

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