#!/bin/bash

# 🗄️ Database Migration Script
# Use this when you update the database schema

set -e

echo "🗄️  Running database migrations..."

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Push schema changes to database
echo "Pushing schema to database..."
npx prisma db push

echo "✅ Database updated!"
echo ""
echo "🔄 Restart your app with: ./quick-restart.sh"

