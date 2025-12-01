#!/bin/bash

# Debug Login Issues Script

echo "🔍 Debugging Login Issues..."
echo ""

# Check if users exist
echo "1️⃣ Checking if test users exist in database:"
mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs << EOF
SELECT username, email, userType, LENGTH(password) as pwd_len 
FROM users_new 
WHERE username IN ('magiw', 'alessia', 'admin')
ORDER BY username;
EOF
echo ""

# Check password format
echo "2️⃣ Checking password formats:"
mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs << EOF
SELECT 
    username,
    LEFT(password, 10) as pwd_start,
    LENGTH(password) as pwd_len,
    CASE 
        WHEN LENGTH(password) = 40 THEN 'SHA1'
        WHEN password LIKE '$2%' THEN 'bcrypt'
        ELSE 'unknown'
    END as pwd_type
FROM users_new 
WHERE username IN ('magiw', 'alessia', 'admin')
ORDER BY username;
EOF
echo ""

# Check PM2 logs for errors
echo "3️⃣ Checking recent PM2 logs for errors:"
pm2 logs movesbook --lines 30 --nostream 2>&1 | tail -20
echo ""

# Test password hashing
echo "4️⃣ Testing SHA1 hash for 'magiw' password (7221):"
node -e "const crypto = require('crypto'); console.log('Expected SHA1:', crypto.createHash('sha1').update('7221').digest('hex'));"
echo ""

mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs << EOF
SELECT username, password as actual_hash
FROM users_new 
WHERE username = 'magiw';
EOF
echo ""

echo "5️⃣ Checking Node.js version:"
node --version
echo ""

echo "6️⃣ Checking if bcryptjs is installed:"
cd ~/movesbook-nextjs && npm list bcryptjs
echo ""

echo "✅ Debug complete!"

