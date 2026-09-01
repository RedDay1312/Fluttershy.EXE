@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo        Fluttershy.EXE - DEV LAUNCHER
echo ========================================
echo.

if not exist "node_modules" (
    echo Dependencies are not installed. Installing them now...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed.
        pause
        exit /b 1
    )
    echo.
)

echo Starting the game server...
start "Fluttershy.EXE - Browser" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8080"
call npm run dev

pause
