const crypto = require('crypto');

// The hash from magiw user
const targetHash = 'cce4660c74ab2ce96ca1497815e0211bd7bb975f';

// Common passwords to test
const commonPasswords = [
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  'baseball', '111111', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123',
  '654321', 'superman', 'qazwsx', 'michael', 'football',
  // Movesbook specific
  'movesbook', 'magiw', 'test', 'demo', 'admin',
  'Magiw', 'MAGIW', 'magiw123', 'magiw2024',
  // Common Italian passwords
  'ciao', 'prova', 'amministratore'
];

console.log('🔍 Searching for password that matches hash:', targetHash);
console.log('Testing', commonPasswords.length, 'common passwords...\n');

let found = false;
for (const password of commonPasswords) {
  const hash = crypto.createHash('sha1').update(password).digest('hex');
  if (hash === targetHash) {
    console.log('✅ FOUND! Password is:', password);
    found = true;
    break;
  }
}

if (!found) {
  console.log('❌ Password not found in common list.');
  console.log('\nThe password might be:');
  console.log('1. A custom password specific to the user');
  console.log('2. An email-based password');
  console.log('3. A variation with special characters\n');
  console.log('You can:');
  console.log('- Reset the password for testing: node reset-user-password.js');
  console.log('- Check the old production system for the actual password');
  console.log('- Contact the user (magiw) to ask for their password');
}

