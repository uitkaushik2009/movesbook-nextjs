const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAllPasswords() {
  console.log('\n⚠️  WARNING: This will reset ALL user passwords!\n');
  console.log('This is only for TESTING purposes.');
  console.log('In production, users should use "Forgot Password" feature.\n');
  
  const defaultPassword = 'reset123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);
  
  // Update all users to have the same test password
  const result = await prisma.user.updateMany({
    data: {
      password: hashedPassword
    }
  });
  
  console.log(`✅ Reset ${result.count} user passwords\n`);
  console.log('All users can now login with:');
  console.log('  Username: (their username)');
  console.log('  Password: reset123\n');
  console.log('Users affected: magiw, alessia, and', result.count - 2, 'others');
  
  await prisma.$disconnect();
}

// Uncomment to run:
// resetAllPasswords();

console.log('\n⚠️  SCRIPT NOT EXECUTED - Safety check');
console.log('To reset all passwords, edit this file and uncomment the last line.\n');

