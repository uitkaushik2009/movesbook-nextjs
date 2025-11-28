#!/bin/bash

# ⚡ Quick Restart Script
# Use this for minor changes that don't need a full rebuild

echo "⚡ Quick restarting application..."

pm2 restart movesbook --update-env
sleep 2

echo "✅ Done!"
pm2 logs movesbook --lines 20

