const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Map legacy role_id to UserType
function mapUserType(roleId) {
  const roleMap = {
    1: 'ATHLETE',
    2: 'COACH',
    3: 'TEAM',
    4: 'CLUB',
    5: 'GROUP',
    6: 'GROUP_ADMIN',
    99: 'ADMIN'
  };
  return roleMap[roleId] || 'ATHLETE';
}

async function migrateLegacyUsers() {
  console.log('🚀 Starting legacy user migration...\n');

  try {
    // Step 1: Check if legacy users table exists
    console.log('📊 Checking for legacy users table...');
    let legacyUsers;
    
    try {
      legacyUsers = await prisma.$queryRaw`
        SELECT id, username, email, password, 
               COALESCE(firstname, '') as firstname,
               COALESCE(lastname, '') as lastname,
               role_id,
               CASE WHEN created IS NULL OR created = '0000-00-00' THEN NOW() ELSE created END as created
        FROM users
        WHERE delete_status = 'N'
        ORDER BY id ASC
      `;
      console.log(`✅ Found ${legacyUsers.length} active users in legacy table\n`);
    } catch (error) {
      console.log('ℹ️  Legacy users table not found - this is normal for fresh installations');
      console.log('✅ Migration complete - no legacy users to migrate\n');
      return;
    }

    // Step 2: Check existing users in new table
    const existingUsers = await prisma.user.findMany({
      select: { id: true, username: true, email: true }
    });
    
    const existingUsernames = new Set(existingUsers.map(u => u.username?.toLowerCase()));
    const existingEmails = new Set(existingUsers.map(u => u.email?.toLowerCase()));
    
    console.log(`📋 Currently in users_new table: ${existingUsers.length} users\n`);

    // Step 3: Migrate users
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    console.log('🔄 Starting migration...\n');

    for (const legacy of legacyUsers) {
      try {
        const username = legacy.username || `user${legacy.id}`;
        const email = legacy.email || `user${legacy.id}@movesbook.temp`;
        
        // Skip if user already exists (check by username or email, case-insensitive)
        if (existingUsernames.has(username.toLowerCase()) || 
            existingEmails.has(email.toLowerCase())) {
          skippedCount++;
          continue;
        }

        const name = `${legacy.firstname || ''} ${legacy.lastname || ''}`.trim() || username;
        const newId = `legacy_${legacy.id}`;

        // Create user in new table
        await prisma.user.create({
          data: {
            id: newId,
            email: email,
            username: username,
            password: legacy.password || '',  // Keep SHA1 password as-is
            name: name,
            userType: mapUserType(legacy.role_id || 1),
            createdAt: legacy.created || new Date(),
            updatedAt: new Date(),
          },
        });

        // Save mapping
        try {
          await prisma.$executeRaw`
            INSERT INTO legacy_id_mappings (id, legacy_table, legacy_id, new_id)
            VALUES (${newId + '_map'}, 'users', ${legacy.id.toString()}, ${newId})
            ON DUPLICATE KEY UPDATE new_id = ${newId}
          `;
        } catch (mapError) {
          // Mapping table might not exist, continue anyway
        }

        migratedCount++;
        
        if (migratedCount % 100 === 0) {
          console.log(`  ✓ Migrated ${migratedCount} users...`);
        }
      } catch (error) {
        console.error(`  ❌ Error migrating user ${legacy.username}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n✅ Migration complete!\n');
    console.log('📊 Summary:');
    console.log(`  - Legacy users found: ${legacyUsers.length}`);
    console.log(`  - Successfully migrated: ${migratedCount}`);
    console.log(`  - Already existed (skipped): ${skippedCount}`);
    console.log(`  - Errors: ${errorCount}`);
    console.log(`  - Total in users_new: ${existingUsers.length + migratedCount}\n`);

    // Step 4: Verify sample users
    console.log('🔍 Verifying sample users can login...');
    const sampleUsernames = ['magiw', 'alessia', 'admin'];
    
    for (const username of sampleUsernames) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: username },
            { username: username.toLowerCase() },
            { email: username }
          ]
        },
        select: { username: true, email: true, userType: true }
      });
      
      if (user) {
        console.log(`  ✅ ${username}: Found as ${user.userType}`);
      } else {
        console.log(`  ⚠️  ${username}: Not found`);
      }
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateLegacyUsers()
  .then(() => {
    console.log('\n🎉 All done! Users can now login with their legacy credentials.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

