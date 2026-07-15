@echo off
echo ========================================
echo  Arresto Server BlackOut Pub
echo ========================================
echo.

REM Uccide il processo Node.js
taskkill /F /IM node.exe >nul 2>nul

if %ERRORLEVEL% EQU 0 (
    echo Server arrestato con successo!
) else (
    echo Nessun server in esecuzione.
)

echo.
pause
