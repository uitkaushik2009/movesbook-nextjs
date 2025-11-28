#!/bin/bash

# 📊 Status Check Script
# Check application health

echo "================================================"
echo "📊 Movesbook Application Status"
echo "================================================"
echo ""

# PM2 Status
echo "🔹 PM2 Status:"
pm2 status movesbook

echo ""
echo "🔹 MySQL Status:"
if systemctl is-active --quiet mysql; then
    echo "✅ MySQL is running"
    mysql -u movesbook_user -pSecurePassword2024! -e "SELECT COUNT(*) as translations FROM movesbook_nextjs.translations;" 2>/dev/null || echo "⚠️  Database connection issue"
else
    echo "❌ MySQL is not running"
fi

echo ""
echo "🔹 Disk Space:"
df -h / | grep -v Filesystem

echo ""
echo "🔹 Memory Usage:"
free -h | grep -v "Swap:"

echo ""
echo "================================================"
echo "📝 Quick Commands:"
echo "  • View logs:        ./view-logs.sh"
echo "  • Deploy update:    ./deploy.sh"
echo "  • Quick restart:    ./quick-restart.sh"
echo "  • Update database:  ./db-migrate.sh"
echo "================================================"

