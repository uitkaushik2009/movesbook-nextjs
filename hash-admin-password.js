/**
 * Generate hashed admin password
 * Run this to generate a secure hash for your admin password
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function generateHashedPasswords() {
  console.log('\n🔐 Admin Password Hash Generator\n');
  console.log('='.repeat(60));
  
  rl.question('\nEnter admin password: ', async (input) => {
    const plainPassword = input.trim();
    
    console.log('\n⏳ Generating hashes...\n');
    
    // Generate bcrypt hash (recommended)
    const bcryptHash = await bcrypt.hash(plainPassword, 12);
    console.log('Bcrypt Hash (RECOMMENDED - Use this):');
    console.log('─'.repeat(60));
    console.log(bcryptHash);
    console.log('─'.repeat(60));
    
    // Generate SHA1 hash (for compatibility)
    const sha1Hash = crypto.createHash('sha1').update(plainPassword).digest('hex');
    console.log('\nSHA1 Hash (For backward compatibility):');
    console.log('─'.repeat(60));
    console.log(sha1Hash);
    console.log('─'.repeat(60));
    
    console.log('\n📝 How to use:');
    console.log('');
    console.log('Option 1: Update .env file (RECOMMENDED)');
    console.log('─'.repeat(60));
    console.log('ADMIN_PASSWORD_HASH="' + bcryptHash + '"');
    console.log('─'.repeat(60));
    console.log('');
    console.log('Option 2: Update code directly (less secure)');
    console.log('In src/app/api/auth/admin/login/route.ts:');
    console.log('passwordHash: "' + bcryptHash + '"');
    console.log('');
    console.log('✓ Password will be securely hashed in code');
    console.log('✓ No plain text passwords stored');
    console.log('');
    
    rl.close();
  });
}

generateHashedPasswords();
