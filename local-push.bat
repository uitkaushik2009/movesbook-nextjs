@echo off
REM 🚀 Quick Push Script for Windows
REM Double-click to commit and push your changes

echo ================================================
echo 🚀 Pushing Changes to GitHub
echo ================================================
echo.

REM Check if there are changes
git status --short
if errorlevel 1 (
    echo ❌ Not a git repository
    pause
    exit /b 1
)

echo.
set /p COMMIT_MSG="📝 Commit message: "

if "%COMMIT_MSG%"=="" (
    echo ❌ Commit message required
    pause
    exit /b 1
)

REM Add all changes
echo.
echo 📦 Adding files...
git add .

REM Commit
echo.
echo 💾 Committing...
git commit -m "%COMMIT_MSG%"

REM Push
echo.
echo 📤 Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo ❌ Push failed. Check your internet connection and GitHub credentials
    pause
    exit /b 1
)

echo.
echo ================================================
echo ✅ Changes pushed successfully!
echo ================================================
echo.
echo 📝 Next steps on your Ubuntu server:
echo    1. git pull origin main
echo    2. ./deploy-complete.sh
echo.
pause

