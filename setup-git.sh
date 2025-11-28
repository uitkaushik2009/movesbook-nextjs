#!/bin/bash

# 🔧 Git Setup Script for Server
# Run this once to connect your server to GitHub

echo "================================================"
echo "🔧 Setting up Git on Server"
echo "================================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Installing git..."
    sudo apt update
    sudo apt install -y git
fi

# Get GitHub repository URL
echo "📝 Please enter your GitHub repository URL:"
echo "   Example: https://github.com/yourusername/movesbook-nextjs.git"
read -p "URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

# Check if .git exists
if [ -d .git ]; then
    echo "⚠️  Git already initialized"
    
    # Check current remote
    CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
    
    if [ -n "$CURRENT_REMOTE" ]; then
        echo "Current remote: $CURRENT_REMOTE"
        read -p "Update to new remote? (y/n): " UPDATE
        
        if [ "$UPDATE" = "y" ]; then
            git remote set-url origin "$REPO_URL"
            echo "✅ Remote updated"
        fi
    else
        git remote add origin "$REPO_URL"
        echo "✅ Remote added"
    fi
else
    # Initialize git
    echo "Initializing git..."
    git init
    git remote add origin "$REPO_URL"
    echo "✅ Git initialized"
fi

# Configure git user
echo ""
echo "📝 Configure git user (for commits):"
read -p "Your name: " GIT_NAME
read -p "Your email: " GIT_EMAIL

git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

echo ""
echo "✅ Git user configured"

# Pull code from repository
echo ""
echo "📥 Pulling code from GitHub..."
echo "   If prompted, enter your GitHub username and password"
echo "   (Or use Personal Access Token instead of password)"
echo ""

if git pull origin main 2>/dev/null || git pull origin master 2>/dev/null; then
    echo "✅ Code pulled successfully"
else
    echo "⚠️  Could not pull code"
    echo "   This is normal if the repository is empty"
    echo "   Push from your local machine first, then run this script again"
fi

echo ""
echo "================================================"
echo "✅ Git setup complete!"
echo "================================================"
echo ""
echo "📝 Next steps:"
echo "   1. On your LOCAL machine, push code to GitHub"
echo "   2. On this server, run: ./deploy.sh"
echo ""
echo "🔒 Security tip: Use SSH keys or Personal Access Token"
echo "   https://docs.github.com/en/authentication"

