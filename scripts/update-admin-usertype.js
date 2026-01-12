/**
 * Update Admin User Type Script
 * 
 * This script updates the admin user's userType to 'ADMIN'
 * 
 * Usage: node scripts/update-admin-usertype.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminUserType() {
  try {
    console.log('🔍 Finding admin user...');

    // Find admin user by username or email
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'admin' },
          { email: 'lerkos000@gmail.com' },
          { email: 'admin@movesbook.com' }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        userType: true,
        name: true
      }
    });

    if (!adminUser) {
      console.error('❌ Admin user not found');
      console.log('   Tried searching for:');
      console.log('   - username: admin');
      console.log('   - email: lerkos000@gmail.com');
      console.log('   - email: admin@movesbook.com');
      process.exit(1);
    }

    console.log(`✅ Found admin user:`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Current Type: ${adminUser.userType}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log('');

    if (adminUser.userType === 'ADMIN') {
      console.log('✅ User type is already ADMIN. No changes needed.');
      process.exit(0);
    }

    console.log(`⏳ Updating userType from '${adminUser.userType}' to 'ADMIN'...`);

    // Update userType to ADMIN
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { userType: 'ADMIN' }
    });

    console.log('✅ User type updated successfully!');
    console.log('');
    console.log('📝 Admin user can now login via /api/auth/admin/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminUserType();

