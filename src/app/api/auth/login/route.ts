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

    // Find user by email OR username in NEW table first
    let user = await prisma.user.findFirst({
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

    // If not found in new table, check LEGACY table and migrate on login
    if (!user) {
      console.log(`User not found in new table, checking legacy table for: ${loginIdentifier}`);
      
      const legacyUser = await prisma.$queryRaw<any[]>`
        SELECT id, username, email, password, 
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

        // Verify password with legacy hash first
        const isPasswordValid = await verifyPassword(password, legacy.password || '');
        
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
          };
        }
      }
    }

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

// Map legacy role_id to UserType
function mapUserType(roleIdOrType: number | string): UserType {
  // If it's already a string UserType, return it
  if (typeof roleIdOrType === 'string') {
    const typeMap: { [key: string]: UserType } = {
      'athlete': UserType.ATHLETE,
      'ATHLETE': UserType.ATHLETE,
      'coach': UserType.COACH,
      'COACH': UserType.COACH,
      'team': UserType.TEAM_MANAGER,
      'TEAM_MANAGER': UserType.TEAM_MANAGER,
      'team_manager': UserType.TEAM_MANAGER,
      'club': UserType.CLUB_TRAINER,
      'CLUB_TRAINER': UserType.CLUB_TRAINER,
      'club_trainer': UserType.CLUB_TRAINER,
      'group': UserType.GROUP_ADMIN,
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
    3: UserType.TEAM_MANAGER,
    4: UserType.CLUB_TRAINER,
    5: UserType.GROUP_ADMIN,
    6: UserType.ADMIN
  };
  return roleMap[roleIdOrType as number] || UserType.ATHLETE;
}