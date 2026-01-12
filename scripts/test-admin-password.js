/**
 * Test Admin Password Script
 * 
 * This script tests if a password matches the admin user's hash in the database
 * 
 * Usage: node scripts/test-admin-password.js [password]
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const readline = require('readline');

const prisma = new PrismaClient();

// Helper to get input from user
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

// Verify password (same logic as in the app)
async function verifyPassword(inputPassword, storedHash) {
  // Try bcrypt first (modern hashing)
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    return await bcrypt.compare(inputPassword, storedHash);
  }
  
  // Try SHA1 (legacy hashing)
  if (storedHash.length === 40) {
    const sha1Hash = crypto.createHash('sha1').update(inputPassword).digest('hex');
    return sha1Hash === storedHash;
  }
  
  return false;
}

async function testPassword() {
  try {
    console.log('🔐 Admin Password Tester\n');

    // Get password from command line or prompt
    let testPassword = process.argv[2];
    
    if (!testPassword) {
      testPassword = await askQuestion('Enter password to test: ');
    }

    if (!testPassword) {
      console.log('❌ No password provided');
      process.exit(1);
    }

    console.log('🔍 Finding admin user...\n');

    // Find admin user
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
        password: true,
        userType: true
      }
    });

    if (!adminUser) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    console.log(`✅ Found admin user:`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   UserType: ${adminUser.userType}`);
    console.log(`   Password Hash: ${adminUser.password.substring(0, 30)}...`);
    
    const hashType = adminUser.password.startsWith('$2') 
      ? 'bcrypt (modern)' 
      : adminUser.password.length === 40 
        ? 'SHA1 (legacy)' 
        : 'Unknown';
    console.log(`   Hash Type: ${hashType}`);
    console.log('');

    // Test password
    console.log('🧪 Testing password...\n');
    
    const isValid = await verifyPassword(testPassword, adminUser.password);

    if (isValid) {
      console.log('✅ PASSWORD MATCHES! ✅');
      console.log('   The password you entered is correct.');
      console.log('   Login should work with this password.\n');
      
      console.log('💡 If login still fails, check:');
      console.log('   1. Are you entering the same password on the login form?');
      console.log('   2. Did you restart the app? (pm2 restart movesbook)');
      console.log('   3. Try clearing browser cache or use incognito mode');
      console.log('   4. Check browser console for specific error messages\n');
    } else {
      console.log('❌ PASSWORD DOES NOT MATCH ❌');
      console.log('   The password you entered is incorrect.');
      console.log('   This is why login is failing.\n');
      
      console.log('💡 Solutions:');
      console.log('   1. Try the correct password (check password manager, notes, etc.)');
      console.log('   2. Reset the password: npm run admin:update-password');
      console.log('   3. Check .env for FALLBACK_ADMIN_PASSWORD if using fallback\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();

