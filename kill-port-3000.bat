@echo off
echo ====================================
echo Killing process on port 3000...
echo ====================================
echo.

REM Find process using port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    set PID=%%a
    goto :kill
)

:kill
if defined PID (
    echo Found process using port 3000: PID %PID%
    taskkill /PID %PID% /F
    echo.
    echo ✓ Port 3000 is now free!
) else (
    echo ℹ No process found using port 3000
)
echo.
pause

