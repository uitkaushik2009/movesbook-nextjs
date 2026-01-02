const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  console.log('\n=== Resetting magiw password ===\n');
  
  // Set new password (you can change this)
  const newPassword = 'newpassword123';
  
  // Hash with bcrypt (more secure than SHA1)
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  // Update user
  await prisma.user.update({
    where: { username: 'magiw' },
    data: { password: hashedPassword }
  });
  
  console.log('✅ Password reset successfully!\n');
  console.log('New credentials:');
  console.log('  Username: magiw');
  console.log('  Password: newpassword123');
  console.log('\nYou can now login with these credentials!');
  
  await prisma.$disconnect();
}

resetPassword();

