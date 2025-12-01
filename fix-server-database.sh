#!/bin/bash

# Fix Server Database Issues

echo "🔧 Fixing server database..."
echo ""

# Step 1: Check if users_new has any data
echo "1️⃣ Checking users_new table:"
USER_COUNT=$(mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs -sN -e "SELECT COUNT(*) FROM users_new;")
echo "   Current users in users_new: $USER_COUNT"
echo ""

# Step 2: Check if legacy users table exists
echo "2️⃣ Checking for legacy users table:"
LEGACY_EXISTS=$(mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs -sN -e "SHOW TABLES LIKE 'users';" 2>/dev/null || echo "")
if [ -z "$LEGACY_EXISTS" ]; then
    echo "   ❌ Legacy 'users' table NOT found"
    echo "   ℹ️  This means users need to be manually added or migrated from backup"
else
    LEGACY_COUNT=$(mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs -sN -e "SELECT COUNT(*) FROM users WHERE delete_status = 'N';")
    echo "   ✅ Legacy 'users' table found with $LEGACY_COUNT active users"
fi
echo ""

# Step 3: Fix database schema issues
echo "3️⃣ Fixing database schema..."

# Make all UserSettings fields nullable
mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs << 'EOF'
-- Make toolsSettings nullable if it exists
ALTER TABLE user_settings MODIFY COLUMN toolsSettings TEXT NULL;
ALTER TABLE user_settings MODIFY COLUMN colorSettings TEXT NULL;
ALTER TABLE user_settings MODIFY COLUMN adminSettings JSON NULL;
ALTER TABLE user_settings MODIFY COLUMN workoutPreferences TEXT NULL;
ALTER TABLE user_settings MODIFY COLUMN favouritesSettings TEXT NULL;
EOF

echo "   ✅ Schema updated"
echo ""

# Step 4: If legacy table exists, run migration
if [ ! -z "$LEGACY_EXISTS" ]; then
    echo "4️⃣ Running migration from legacy table..."
    cd ~/movesbook-nextjs
    node migrate-legacy-users.js
else
    echo "4️⃣ No legacy table - adding test users manually..."
    
    # Add magiw
    mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs << 'EOF'
INSERT INTO users_new (id, username, email, password, name, userType, createdAt, updatedAt)
VALUES (
    'test_magiw_001',
    'magiw',
    'magiw@movesbook.com',
    '001384aca695f54a8dca50aee28d7fa64630a86d',
    'Magiw',
    'ATHLETE',
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE password = '001384aca695f54a8dca50aee28d7fa64630a86d';
EOF
    
    # Add alessia
    mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs << 'EOF'
INSERT INTO users_new (id, username, email, password, name, userType, createdAt, updatedAt)
VALUES (
    'test_alessia_001',
    'alessia',
    'alessia@movesbook.com',
    '13c53cf038d9ac93e44f3fe97ac8c49ef2d1cfd7',
    'Alessia',
    'GROUP_ADMIN',
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE password = '13c53cf038d9ac93e44f3fe97ac8c49ef2d1cfd7';
EOF
    
    echo "   ✅ Test users added"
fi
echo ""

# Step 5: Verify users
echo "5️⃣ Verifying users..."
mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs -e "SELECT username, email, userType, LEFT(password, 15) as pwd_start, LENGTH(password) as pwd_len FROM users_new WHERE username IN ('magiw', 'alessia') ORDER BY username;"
echo ""

# Step 6: Restart app
echo "6️⃣ Restarting application..."
pm2 restart movesbook
echo ""

echo "✅ Fix complete! Try logging in now."

