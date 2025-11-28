#!/bin/bash

# 🔨 Quick Build Script
# Use this when you need to rebuild without updating dependencies

set -e

echo "🔨 Building and restarting..."

# Build
echo "Building..."
npm run build

# Restart
echo "Restarting PM2..."
pm2 restart movesbook --update-env
sleep 2

echo "✅ Done!"
pm2 logs movesbook --lines 20

