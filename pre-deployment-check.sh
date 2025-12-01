#!/bin/bash

# Pre-Deployment Checklist for Movesbook
# Run this BEFORE deploying to ensure everything is correct

echo "🔍 Pre-Deployment Checklist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: Prisma Schema has @@map("users_new")
echo "1️⃣ Checking Prisma schema..."
if grep -q '@@map("users_new")' prisma/schema.prisma; then
    echo -e "${GREEN}✅ User model has @@map('users_new')${NC}"
else
    echo -e "${RED}❌ Missing @@map('users_new') in User model!${NC}"
    ERRORS=$((ERRORS+1))
fi
echo ""

# Check 2: Authentication files exist
echo "2️⃣ Checking authentication files..."
AUTH_FILES=(
    "src/app/api/auth/login/route.ts"
    "src/app/api/auth/admin/login/route.ts"
    "src/lib/auth.ts"
)

for file in "${AUTH_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        ERRORS=$((ERRORS+1))
    fi
done
echo ""

# Check 3: SHA1 password support
echo "3️⃣ Checking SHA1 password support..."
if grep -q "hashPasswordSHA1" src/lib/auth.ts; then
    echo -e "${GREEN}✅ SHA1 hashing function exists${NC}"
else
    echo -e "${RED}❌ SHA1 function missing in auth.ts${NC}"
    ERRORS=$((ERRORS+1))
fi

if grep -q "hashedPassword.length === 40" src/lib/auth.ts; then
    echo -e "${GREEN}✅ SHA1 verification logic present${NC}"
else
    echo -e "${RED}❌ SHA1 verification missing${NC}"
    ERRORS=$((ERRORS+1))
fi
echo ""

# Check 4: Migration scripts
echo "4️⃣ Checking migration scripts..."
MIGRATION_FILES=(
    "migrate-legacy-users.js"
    "check-database.js"
    "prisma/seed-translations.ts"
)

for file in "${MIGRATION_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Missing: $file (optional)${NC}"
    fi
done
echo ""

# Check 5: Deployment scripts
echo "5️⃣ Checking deployment scripts..."
if [ -f "deploy-complete.sh" ]; then
    echo -e "${GREEN}✅ deploy-complete.sh exists${NC}"
else
    echo -e "${YELLOW}⚠️  deploy-complete.sh missing${NC}"
fi
echo ""

# Check 6: Package.json has required dependencies
echo "6️⃣ Checking dependencies..."
REQUIRED_DEPS=("bcryptjs" "@prisma/client" "jsonwebtoken")

for dep in "${REQUIRED_DEPS[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        echo -e "${GREEN}✅ $dep in package.json${NC}"
    else
        echo -e "${RED}❌ Missing dependency: $dep${NC}"
        ERRORS=$((ERRORS+1))
    fi
done
echo ""

# Check 7: Environment variables template
echo "7️⃣ Checking .env.example..."
if [ -f ".env.example" ] || [ -f ".env" ]; then
    echo -e "${GREEN}✅ Environment file exists${NC}"
else
    echo -e "${YELLOW}⚠️  No .env.example found${NC}"
fi
echo ""

# Check 8: Database connection test
echo "8️⃣ Testing local database connection..."
if command -v npx &> /dev/null; then
    if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection works${NC}"
    else
        echo -e "${YELLOW}⚠️  Cannot connect to database (check if it's running)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  npx not found, skipping test${NC}"
fi
echo ""

# Check 9: Test if Prisma Client can find users
echo "9️⃣ Testing Prisma Client..."
if [ -d "node_modules/@prisma/client" ]; then
    echo -e "${GREEN}✅ Prisma Client installed${NC}"
else
    echo -e "${RED}❌ Prisma Client not generated${NC}"
    echo "   Run: npx prisma generate"
    ERRORS=$((ERRORS+1))
fi
echo ""

# Check 10: Build test (TypeScript)
echo "🔟 Checking TypeScript compilation..."
if command -v npx &> /dev/null; then
    if npx tsc --noEmit > /dev/null 2>&1; then
        echo -e "${GREEN}✅ TypeScript compiles without errors${NC}"
    else
        echo -e "${YELLOW}⚠️  TypeScript has warnings/errors${NC}"
        echo "   Run: npm run build to see details"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot test TypeScript${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    echo ""
    echo "📋 Ready to deploy with:"
    echo "   git add ."
    echo "   git commit -m 'Ready for deployment'"
    echo "   git push origin main"
    echo ""
    echo "Then on server:"
    echo "   cd movesbook-nextjs"
    echo "   git pull origin main"
    echo "   ./deploy-complete.sh"
else
    echo -e "${RED}❌ Found $ERRORS critical error(s)${NC}"
    echo "   Please fix errors before deploying"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

