const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('🔍 Checking admin users...\n');
    
    const admins = await prisma.user.findMany({
      where: {
        OR: [
          { username: 'admin' },
          { email: 'admin@movesbook.com' },
          { email: 'lerkos000@gmail.com' },
          { userType: 'ADMIN' }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        userType: true,
        password: true,
      }
    });

    if (admins.length === 0) {
      console.log('❌ No admin users found!\n');
      process.exit(1);
    }

    console.log(`✅ Found ${admins.length} admin user(s):\n`);
    
    admins.forEach((admin, i) => {
      console.log(`Admin ${i + 1}:`);
      console.log(`  ID: ${admin.id}`);
      console.log(`  Username: ${admin.username}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Name: ${admin.name}`);
      console.log(`  UserType: ${admin.userType} ${admin.userType !== 'ADMIN' ? '⚠️  SHOULD BE ADMIN' : '✅'}`);
      console.log(`  Password: ${admin.password.substring(0, 30)}... (${admin.password.length} chars)`);
      
      const passwordType = admin.password.length === 40 
        ? 'SHA1 (legacy)' 
        : admin.password.startsWith('$2') 
          ? 'bcrypt (modern)' 
          : 'Unknown';
      console.log(`  Hash Type: ${passwordType}`);
      console.log('');
    });

    // Check for issues
    console.log('📋 Issues Found:\n');
    let hasIssues = false;
    
    admins.forEach(admin => {
      if (admin.userType !== 'ADMIN') {
        console.log(`⚠️  ${admin.username} has userType="${admin.userType}" (should be "ADMIN")`);
        console.log('   Fix: npm run admin:update-usertype\n');
        hasIssues = true;
      }
    });

    if (!hasIssues) {
      console.log('✅ No issues found! Admin users look good.\n');
      console.log('If login still fails, the password might be incorrect.');
      console.log('To reset password: npm run admin:update-password\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();

