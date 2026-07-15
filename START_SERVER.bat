@echo off
echo ========================================
echo    BLACKOUT PUB - Avvio Sistema
echo ========================================
echo.

REM Controlla se Node.js è installato
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRORE] Node.js non installato!
    echo.
    echo Scarica Node.js da: https://nodejs.org
    echo Installa la versione LTS (consigliata)
    echo.
    pause
    exit /b 1
)

REM Controlla se i moduli sono installati
if not exist "node_modules" (
    echo Installazione dipendenze (solo la prima volta)...
    call npm install
    echo.
)

echo Avvio server BlackOut Pub...
echo.
echo ========================================
echo  Server in esecuzione!
echo ========================================
echo.
echo  Admin Dashboard: http://localhost:3000/admin.html
echo  Menu Clienti:    http://localhost:3000/cliente.html
echo.
echo  Password Admin: admin123
echo.
echo  TIENI QUESTA FINESTRA APERTA!
echo  Per fermare: CTRL+C o chiudi finestra
echo ========================================
echo.

REM Apre automaticamente il browser
timeout /t 2 /nobreak >nul
start http://localhost:3000

call npm start
