import { NextRequest, NextResponse } from 'next/server';
import { UserType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken, hashPassword } from '@/lib/auth';


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

    // Find user by email OR username in NEW table first (case-insensitive for MySQL)
    // Try with exact match first, then lowercase match
    console.log(`🔍 Searching for user with identifier: ${loginIdentifier}`);
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginIdentifier },
          { username: loginIdentifier },
          { email: loginIdentifier.toLowerCase() },
          { username: loginIdentifier.toLowerCase() }
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
      console.log(`✅ User found: ${user.username} (${user.email}), ID: ${user.id}`);
      console.log(`🔐 Password hash length: ${user.password?.length || 0}, starts with: ${user.password?.substring(0, 10) || 'N/A'}`);
    } else {
      console.log(`❌ User not found in new table for identifier: ${loginIdentifier}`);
    }

    // If not found in new table, check LEGACY table and migrate on login (if legacy table exists)
    if (!user) {
      try {
        console.log(`User not found in new table, checking legacy table for: ${loginIdentifier}`);
        
        const legacyUser = await prisma.$queryRaw<any[]>`
          SELECT id, username, email, password, alternate_pass, staff_password,
                 COALESCE(firstname, '') as firstname,
                 COALESCE(lastname, '') as lastname,
                 role_id,
                 CASE WHEN created IS NULL OR created = '0000-00-00' THEN NOW() ELSE created END as created
          FROM users
          WHERE (email = ${loginIdentifier} OR username = ${loginIdentifier})
          AND delete_status = 'N'
          LIMIT 1
        `;

      if (legacyUser.length > 0) {
        const legacy = legacyUser[0];
        console.log(`Found user in legacy table: ${legacy.username}`);
        console.log(`Checking password fields: main=${!!legacy.password}, alternate=${!!legacy.alternate_pass}, staff=${!!legacy.staff_password}`);

        // Try multiple password fields from old PHP system
        let isPasswordValid = false;
        let whichPasswordWorked = '';
        
        // 1. Try main password
        if (legacy.password) {
          isPasswordValid = await verifyPassword(password, legacy.password);
          if (isPasswordValid) whichPasswordWorked = 'main';
        }
        
        // 2. Try alternate password
        if (!isPasswordValid && legacy.alternate_pass) {
          isPasswordValid = await verifyPassword(password, legacy.alternate_pass);
          if (isPasswordValid) whichPasswordWorked = 'alternate';
        }
        
        // 3. Try plaintext staff password
        if (!isPasswordValid && legacy.staff_password) {
          isPasswordValid = password === legacy.staff_password;
          if (isPasswordValid) whichPasswordWorked = 'staff';
        }
        
        console.log(`Password verification result: ${isPasswordValid ? `✅ matched ${whichPasswordWorked}` : '❌ no match'}`);
        
        if (!isPasswordValid) {
          return NextResponse.json(
            { error: 'Invalid email/username or password' },
            { status: 401 }
          );
        }

        // Migrate user to new table on successful login
        const newId = `legacy_${legacy.id}_${Date.now()}`;
        const name = `${legacy.firstname || ''} ${legacy.lastname || ''}`.trim() || legacy.username;
        
        try {
          // Create user in new table
          user = await prisma.user.create({
            data: {
              id: newId,
              email: legacy.email || `user${legacy.id}@movesbook.temp`,
              username: legacy.username || `user${legacy.id}`,
              password: legacy.password || '',
              name: name,
              userType: mapUserType(legacy.role_id || 1),
              createdAt: legacy.created || new Date(),
              updatedAt: new Date(),
            },
          });

          console.log(`✅ Migrated user ${legacy.username} to new table on login`);

          // Save legacy ID mapping
          await prisma.$executeRaw`
            INSERT INTO legacy_id_mappings (id, legacy_table, legacy_id, new_id)
            VALUES (${newId + '_map'}, 'users', ${legacy.id}, ${newId})
            ON DUPLICATE KEY UPDATE new_id = ${newId}
          `;

        } catch (error) {
          console.error(`Failed to migrate user on login:`, error);
          // Continue with login even if migration fails
          user = {
            id: `temp_legacy_${legacy.id}`,
            name: name,
            username: legacy.username,
            email: legacy.email,
            password: legacy.password,
            userType: mapUserType(legacy.role_id || 1),
            createdAt: legacy.created || new Date(),
            updatedAt: new Date(),
          } as any;
        }
      }
      } catch (legacyError: any) {
        // Legacy table doesn't exist or query failed - that's okay for new installations
        console.log('Legacy users table not found or inaccessible (this is normal for new installations)');
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 401 }
      );
    }

    // Verify password (supports both SHA1 from old system and bcrypt from new system)
    console.log(`🔐 Verifying password for user: ${user.username}`);
    console.log(`🔐 Password hash: ${user.password.substring(0, 20)}... (length: ${user.password.length})`);
    const isPasswordValid = await verifyPassword(password, user.password);
    console.log(`🔐 Password verification result: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);
    if (!isPasswordValid) {
      console.log(`❌ Password verification failed for user: ${user.username}`);
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 401 }
      );
    }
    console.log(`✅ Password verified successfully for user: ${user.username}`);

    // Auto-upgrade disabled - keeping SHA1 passwords as-is

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
    console.error('❌ Login error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Map legacy role_id to UserType
function mapUserType(roleIdOrType: number | string): UserType {
  // If it's already a string UserType, return it
  if (typeof roleIdOrType === 'string') {
    const typeMap: { [key: string]: UserType } = {
      'athlete': UserType.ATHLETE,
      'ATHLETE': UserType.ATHLETE,
      'coach': UserType.COACH,
      'COACH': UserType.COACH,
      'team': UserType.TEAM,
      'TEAM': UserType.TEAM,
      'TEAM_MANAGER': UserType.TEAM,
      'team_manager': UserType.TEAM,
      'club': UserType.CLUB,
      'CLUB': UserType.CLUB,
      'CLUB_TRAINER': UserType.CLUB,
      'club_trainer': UserType.CLUB,
      'group': UserType.GROUP,
      'GROUP': UserType.GROUP,
      'groupAdmin': UserType.GROUP_ADMIN,
      'GROUP_ADMIN': UserType.GROUP_ADMIN,
      'group_admin': UserType.GROUP_ADMIN,
      'admin': UserType.ADMIN,
      'ADMIN': UserType.ADMIN
    };
    return typeMap[roleIdOrType] || UserType.ATHLETE;
  }
  
  // Map legacy role_id (number) to UserType
  const roleMap: { [key: number]: UserType } = {
    1: UserType.ATHLETE,
    2: UserType.COACH,
    3: UserType.TEAM,
    4: UserType.CLUB,
    5: UserType.GROUP,
    6: UserType.GROUP_ADMIN,
    99: UserType.ADMIN
  };
  return roleMap[roleIdOrType as number] || UserType.ATHLETE;
}