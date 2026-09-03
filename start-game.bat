@echo off
setlocal
cd /d "%~dp0"
chcp 65001 >nul

echo.
echo ========================================
echo       FLUTTERSHY.EXE - CLEAN BUILD
echo ========================================
echo.

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERROR: npm install failed.
    pause
    exit /b 1
  )
)

echo Starting local game...
echo Close this window to stop the server.
echo.
call npm run dev
