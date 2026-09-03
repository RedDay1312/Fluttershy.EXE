@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title FLUTTERSHY.EXE // REBORN
color 0F
cls
echo.
echo ============================================================
echo             FLUTTERSHY.EXE // REBORN
echo                    CLEAN BUILD
 echo ============================================================
echo.
where node >nul 2>&1 || (echo Node.js 20+ is required.&pause&exit /b 1)
if not exist node_modules (echo Installing dependencies...&call npm install&if errorlevel 1 (echo Install failed.&pause&exit /b 1))
echo Starting local game server...
call npm run dev
