#!/bin/bash

# Migration script to add and populate userId column in workout_days table
# This script safely migrates existing data without data loss

set -e  # Exit on any error

echo "=================================="
echo "WorkoutDay userId Migration Script"
echo "=================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    echo -e "${BLUE}📋 Loading environment variables...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

# Extract database credentials from DATABASE_URL
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DB_URL="${DATABASE_URL}"

# Try multiple parsing patterns
if [[ $DB_URL =~ mysql://([^:]+):([^@]+)@([^:]+):([^/]+)/([^\?]+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
elif [[ $DB_URL =~ mysql://([^:]+):([^@]+)@([^:]+)/([^\?]+) ]]; then
    # Format without port (defaults to 3306)
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="3306"
    DB_NAME="${BASH_REMATCH[4]}"
else
    echo -e "${RED}❌ Error: Could not parse DATABASE_URL${NC}"
    echo "Current DATABASE_URL format: ${DB_URL:0:30}..."
    echo "Expected format: mysql://USER:PASSWORD@HOST:PORT/DATABASE"
    echo ""
    echo "Please check your .env file"
    exit 1
fi

echo -e "${GREEN}✓ Database configuration loaded${NC}"
echo "  Host: $DB_HOST:$DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Function to run MySQL commands
run_mysql() {
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "$1" 2>&1
}

# Function to check if column exists
column_exists() {
    local result=$(run_mysql "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='workout_days' AND COLUMN_NAME='userId';")
    if echo "$result" | grep -q "1"; then
        return 0
    else
        return 1
    fi
}

# Function to check if column is nullable
column_is_nullable() {
    local result=$(run_mysql "SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='workout_days' AND COLUMN_NAME='userId';")
    if echo "$result" | grep -q "YES"; then
        return 0
    else
        return 1
    fi
}

# Step 1: Check if column already exists
echo -e "${BLUE}Step 1: Checking if userId column exists...${NC}"
if column_exists; then
    echo -e "${YELLOW}⚠️  userId column already exists${NC}"
    
    if column_is_nullable; then
        echo -e "${YELLOW}   Column is nullable - will proceed with population${NC}"
    else
        echo -e "${GREEN}   Column is already NOT NULL - checking if data is populated${NC}"
        
        # Check if there are any NULL values
        null_count=$(run_mysql "SELECT COUNT(*) as count FROM workout_days WHERE userId IS NULL;" | tail -n1)
        if [ "$null_count" -eq "0" ]; then
            echo -e "${GREEN}✓ All userId values are already populated!${NC}"
            echo -e "${GREEN}✓ Migration already completed!${NC}"
            echo ""
            echo -e "${BLUE}Running Prisma generate to sync client...${NC}"
            npx prisma generate
            echo -e "${GREEN}✅ Migration script completed successfully!${NC}"
            exit 0
        else
            echo -e "${RED}❌ Error: Column is NOT NULL but has NULL values${NC}"
            echo "   This should not happen. Manual intervention required."
            exit 1
        fi
    fi
else
    echo -e "${BLUE}Adding userId column as nullable...${NC}"
    run_mysql "ALTER TABLE workout_days ADD COLUMN userId VARCHAR(191) NULL;"
    echo -e "${GREEN}✓ userId column added${NC}"
    
    echo -e "${BLUE}Adding index on userId...${NC}"
    run_mysql "ALTER TABLE workout_days ADD INDEX idx_userId (userId);"
    echo -e "${GREEN}✓ Index created${NC}"
fi
echo ""

# Step 2: Count rows that need population
echo -e "${BLUE}Step 2: Checking data status...${NC}"
total_count=$(run_mysql "SELECT COUNT(*) as count FROM workout_days;" | tail -n1)
null_count=$(run_mysql "SELECT COUNT(*) as count FROM workout_days WHERE userId IS NULL;" | tail -n1)

echo "  Total workout_days records: $total_count"
echo "  Records without userId: $null_count"
echo ""

if [ "$null_count" -eq "0" ]; then
    echo -e "${GREEN}✓ All records already have userId populated!${NC}"
else
    # Step 3: Run the Node.js population script
    echo -e "${BLUE}Step 3: Populating userId values...${NC}"
    echo -e "${YELLOW}Running population script...${NC}"
    echo ""
    
    if [ -f "scripts/populate-workout-day-userId.js" ]; then
        node scripts/populate-workout-day-userId.js
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✓ Population script completed successfully${NC}"
        else
            echo ""
            echo -e "${RED}❌ Population script failed${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Error: populate-workout-day-userId.js script not found${NC}"
        exit 1
    fi
fi
echo ""

# Step 4: Verify all records have userId
echo -e "${BLUE}Step 4: Verifying data integrity...${NC}"
remaining_nulls=$(run_mysql "SELECT COUNT(*) as count FROM workout_days WHERE userId IS NULL;" | tail -n1)

if [ "$remaining_nulls" -ne "0" ]; then
    echo -e "${RED}❌ Error: Still have $remaining_nulls records without userId${NC}"
    echo "   Please check for orphaned records and fix manually"
    exit 1
fi
echo -e "${GREEN}✓ All records have userId populated${NC}"
echo ""

# Step 5: Make column NOT NULL
echo -e "${BLUE}Step 5: Making userId column required (NOT NULL)...${NC}"
if column_is_nullable; then
    run_mysql "ALTER TABLE workout_days MODIFY COLUMN userId VARCHAR(191) NOT NULL;"
    echo -e "${GREEN}✓ userId column is now NOT NULL${NC}"
else
    echo -e "${GREEN}✓ userId column is already NOT NULL${NC}"
fi
echo ""

# Step 6: Add foreign key constraint
echo -e "${BLUE}Step 6: Adding foreign key constraint...${NC}"

# Check if foreign key already exists
fk_exists=$(run_mysql "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA='$DB_NAME' AND TABLE_NAME='workout_days' AND CONSTRAINT_NAME='workout_days_userId_fkey' AND CONSTRAINT_TYPE='FOREIGN KEY';" | tail -n1)

if [ "$fk_exists" -eq "1" ]; then
    echo -e "${GREEN}✓ Foreign key constraint already exists${NC}"
else
    run_mysql "ALTER TABLE workout_days ADD CONSTRAINT workout_days_userId_fkey FOREIGN KEY (userId) REFERENCES users_new(id) ON DELETE CASCADE ON UPDATE CASCADE;"
    echo -e "${GREEN}✓ Foreign key constraint added${NC}"
fi
echo ""

# Step 7: Add unique constraint for userId + date
echo -e "${BLUE}Step 7: Checking unique constraint...${NC}"

# Check if unique constraint already exists
unique_exists=$(run_mysql "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA='$DB_NAME' AND TABLE_NAME='workout_days' AND CONSTRAINT_NAME='workout_days_userId_date_key' AND CONSTRAINT_TYPE='UNIQUE';" | tail -n1)

if [ "$unique_exists" -eq "1" ]; then
    echo -e "${GREEN}✓ Unique constraint (userId, date) already exists${NC}"
else
    echo -e "${BLUE}Adding unique constraint on (userId, date)...${NC}"
    
    # First, check for duplicate records
    duplicates=$(run_mysql "SELECT userId, date, COUNT(*) as cnt FROM workout_days WHERE userId IS NOT NULL GROUP BY userId, date HAVING cnt > 1;" | tail -n +2)
    
    if [ ! -z "$duplicates" ]; then
        echo -e "${YELLOW}⚠️  Found duplicate (userId, date) combinations${NC}"
        echo "   Please resolve duplicates before adding unique constraint"
        echo "   Run: SELECT userId, date, COUNT(*) FROM workout_days GROUP BY userId, date HAVING COUNT(*) > 1;"
        echo ""
        echo -e "${YELLOW}⚠️  Skipping unique constraint creation${NC}"
    else
        run_mysql "ALTER TABLE workout_days ADD CONSTRAINT workout_days_userId_date_key UNIQUE (userId, date);"
        echo -e "${GREEN}✓ Unique constraint added${NC}"
    fi
fi
echo ""

# Step 8: Generate Prisma client
echo -e "${BLUE}Step 8: Syncing Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"
echo ""

# Final verification
echo -e "${GREEN}=================================="
echo -e "✅ Migration Completed Successfully!"
echo -e "==================================${NC}"
echo ""
echo "Summary:"
echo "  - userId column added and populated"
echo "  - Column set to NOT NULL"
echo "  - Foreign key constraint added"
echo "  - Prisma client synchronized"
echo ""
echo -e "${BLUE}You can now run: npx prisma db push${NC}"
echo ""

