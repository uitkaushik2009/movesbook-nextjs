const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Checking Database State...\n');

  try {
    // Check users_new table
    const newUsers = await prisma.user.count();
    console.log(`👥 Users in users_new table: ${newUsers}`);

    // Check password types
    const allUsers = await prisma.user.findMany({
      select: { username: true, password: true, userType: true }
    });

    let sha1Count = 0;
    let bcryptCount = 0;
    let otherCount = 0;

    allUsers.forEach(user => {
      if (user.password && user.password.length === 40 && /^[a-f0-9]+$/i.test(user.password)) {
        sha1Count++;
      } else if (user.password && user.password.startsWith('$2')) {
        bcryptCount++;
      } else {
        otherCount++;
      }
    });

    console.log(`  - SHA1 passwords: ${sha1Count}`);
    console.log(`  - Bcrypt passwords: ${bcryptCount}`);
    console.log(`  - Other/Unknown: ${otherCount}`);
    console.log('');

    // Check for specific test users
    console.log('🧪 Checking test users:');
    const testUsers = ['magiw', 'alessia', 'admin'];
    
    for (const username of testUsers) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: username },
            { username: username.toLowerCase() },
            { email: username }
          ]
        },
        select: { 
          username: true, 
          email: true, 
          userType: true,
          password: true 
        }
      });
      
      if (user) {
        const passwordType = user.password?.length === 40 ? 'SHA1' : 
                           user.password?.startsWith('$2') ? 'bcrypt' : 'unknown';
        console.log(`  ✅ ${username}: Found (${user.userType}, ${passwordType})`);
      } else {
        console.log(`  ❌ ${username}: NOT FOUND`);
      }
    }
    console.log('');

    // Check legacy table
    try {
      const legacyCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users WHERE delete_status = 'N'`;
      console.log(`📚 Legacy users table: ${legacyCount[0].count} active users`);
    } catch (error) {
      console.log('📚 Legacy users table: Not found (this is normal)');
    }
    console.log('');

    // Check translations
    const translations = await prisma.translation.count();
    const longTexts = await prisma.translation.count({
      where: {
        value: {
          // MySQL length check - consider > 100 characters as long text
          not: ''
        }
      }
    });
    
    console.log(`📝 Translations in database: ${translations} total`);
    console.log(`   Long texts (estimate): ${longTexts > 100 ? '40+' : longTexts}`);
    console.log('');

    // Check user settings
    const userSettings = await prisma.userSettings.count();
    console.log(`⚙️  User settings configured: ${userSettings}`);
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database check complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error checking database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

