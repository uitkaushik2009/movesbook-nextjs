#!/bin/bash

# 🚀 Movesbook Deployment Script
# Run this script to deploy updates to your server

set -e  # Exit on any error

echo "================================================"
echo "🚀 Starting Movesbook Deployment"
echo "================================================"

# Step 1: Pull latest code (if using git)
echo ""
echo "📥 Step 1: Pulling latest code..."
if [ -d .git ]; then
    # Stash any local changes (like .env)
    git stash push -u -m "Auto-stash before deploy"
    
    # Pull latest code
    git pull origin main || git pull origin master
    
    # Restore stashed changes (keeps your .env safe)
    git stash pop || echo "No stash to restore"
    
    echo "✅ Code updated"
else
    echo "⚠️  Not a git repository"
    echo "To enable auto-pull, run:"
    echo "  git init"
    echo "  git remote add origin YOUR_GITHUB_REPO_URL"
    echo "  git pull origin main"
fi

# Step 2: Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Step 3: Generate Prisma Client
echo ""
echo "🔧 Step 3: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"

# Step 4: Build application
echo ""
echo "🏗️  Step 4: Building application..."
npm run build
echo "✅ Application built"

# Step 5: Restart PM2
echo ""
echo "🔄 Step 5: Restarting application..."
if pm2 describe movesbook > /dev/null 2>&1; then
    pm2 restart movesbook --update-env
    echo "✅ Application restarted"
else
    pm2 start npm --name movesbook -- start
    pm2 save
    echo "✅ Application started"
fi

# Step 6: Show status
echo ""
echo "📊 Step 6: Application status..."
pm2 status movesbook

echo ""
echo "================================================"
echo "✅ Deployment completed successfully!"
echo "🌐 Your app is running at http://localhost:3000"
echo "================================================"
echo ""
echo "📝 View logs with: pm2 logs movesbook"
echo "🔄 Restart with: pm2 restart movesbook"
echo "🛑 Stop with: pm2 stop movesbook"

