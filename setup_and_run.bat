@echo off
setlocal EnableDelayedExpansion

echo ===================================================
echo   API Sorter - One-Click Setup & Run (Windows)
echo ===================================================
echo.

:: 1. Check for Node.js
echo [1/5] Checking for Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed!
    echo Please install Node.js LTS from: https://nodejs.org/
    echo After installing, run this script again.
    pause
    exit /b 1
)
echo Node.js is installed.

:: 2. Install Dependencies
echo.
echo [2/5] Installing dependencies (this may take a while)...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

:: 3. Setup Environment Variables
echo.
echo [3/5] Setting up environment variables...
if not exist .env (
    copy .env.example .env
    echo Created .env file from template.
    echo IMPORTANT: You may need to edit .env to add your API keys later.
) else (
    echo .env file already exists. Skipping.
)

:: 4. Initialize Database
echo.
echo [4/5] Initializing embedded database...
:: Using the dev-db script which handles embedded postgres
:: We run it in a separate window or background if possible, but for setup we just need to init
:: Actually, dev-db.mjs starts the DB and keeps it running. 
:: We need a way to just init and seed if it's fresh.
:: Let's try to run the init-db script if it exists, or just rely on dev-db to start it.
:: The user wants to "run" it, so we will start the DB in a new window.

echo Starting Database in a new window...
start "API Sorter Database" cmd /k "node scripts/dev-db.mjs"

:: Wait a bit for DB to be ready (naive wait)
echo Waiting 10 seconds for database to initialize...
timeout /t 10 /nobreak >nul

:: 5. Start Application
echo.
echo [5/5] Starting API Sorter Application...
echo The application will open at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server.
call npm run dev

pause
