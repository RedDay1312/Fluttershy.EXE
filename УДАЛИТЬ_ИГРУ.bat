@echo off
setlocal
chcp 65001 >nul

title Fluttershy.EXE - Удаление игры
color 0C

cls
echo.
echo  ==================================================
echo              FLUTTERSHY.EXE
echo                 УДАЛЕНИЕ ИГРЫ
echo  ==================================================
echo.
echo  ВНИМАНИЕ! Этот файл удалит папку с игрой целиком.
echo  Все файлы игры внутри этой папки будут удалены.
echo.
choice /C YN /N /M "Продолжить удаление? [Y/N]: "
if errorlevel 2 exit /b 0

set "GAME_DIR=%~dp0"
set "SELF=%~f0"

echo.
echo Удаление игры...
timeout /t 2 /nobreak >nul

rem Запускаем удаление после завершения этого BAT-файла.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$dir = [IO.Path]::GetFullPath($env:GAME_DIR); $self = [IO.Path]::GetFullPath($env:SELF); Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoProfile','-Command',('Start-Sleep -Seconds 1; Remove-Item -LiteralPath ' + [char]39 + $dir + [char]39 + ' -Recurse -Force -ErrorAction SilentlyContinue')"

exit /b 0
