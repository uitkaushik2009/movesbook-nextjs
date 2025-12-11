#!/bin/bash

# ============================================
# Database Connection Setup Script
# ============================================
# This script helps you configure and test database connection
# ============================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔧 Database Connection Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env 2>/dev/null || touch .env
fi

echo -e "${BLUE}Current DATABASE_URL in .env:${NC}"
grep "DATABASE_URL" .env | head -1
echo ""

echo -e "${YELLOW}Enter your database credentials:${NC}"
echo ""

# Get database credentials
read -p "Database Host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database Port (default: 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "Database Name (default: movesbook_nextjs): " DB_NAME
DB_NAME=${DB_NAME:-movesbook_nextjs}

read -p "Database User (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -sp "Database Password: " DB_PASS
echo ""
echo ""

# Construct DATABASE_URL
NEW_DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Test connection
echo -e "${BLUE}Testing database connection...${NC}"
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection successful!${NC}"
    echo ""
    
    # Update .env file
    echo -e "${BLUE}Updating .env file...${NC}"
    
    # Remove old DATABASE_URL
    sed -i '/^DATABASE_URL=/d' .env
    
    # Add new DATABASE_URL
    echo "DATABASE_URL=\"${NEW_DATABASE_URL}\"" >> .env
    
    echo -e "${GREEN}✅ .env file updated${NC}"
    echo ""
    
    # Check if database exists
    echo -e "${BLUE}Checking if database exists...${NC}"
    DB_EXISTS=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "SHOW DATABASES LIKE '${DB_NAME}';" | grep -c "${DB_NAME}")
    
    if [ $DB_EXISTS -eq 0 ]; then
        echo -e "${YELLOW}⚠️  Database '${DB_NAME}' does not exist${NC}"
        read -p "Create database? (y/n): " CREATE_DB
        
        if [ "$CREATE_DB" = "y" ] || [ "$CREATE_DB" = "Y" ]; then
            mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            echo -e "${GREEN}✅ Database created${NC}"
        fi
    else
        echo -e "${GREEN}✅ Database exists${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}================================"
    echo -e "✅ Setup Complete!"
    echo -e "================================${NC}"
    echo ""
    echo "You can now run: ./clean-deploy.sh"
    
else
    echo -e "${RED}❌ Database connection failed!${NC}"
    echo ""
    echo "Please check:"
    echo "  1. MySQL server is running"
    echo "  2. Database credentials are correct"
    echo "  3. User has proper permissions"
    echo ""
    echo "To check MySQL status: sudo systemctl status mysql"
    echo "To reset MySQL root password, see: https://dev.mysql.com/doc/refman/8.0/en/resetting-permissions.html"
    exit 1
fi

