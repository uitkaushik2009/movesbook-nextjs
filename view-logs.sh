#!/bin/bash

# 📋 View Logs Script
# Quickly view application logs

echo "📋 Showing latest logs (Ctrl+C to exit)..."
echo ""

pm2 logs movesbook --lines 50

