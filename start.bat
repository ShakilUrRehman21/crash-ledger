@echo off
title CrashLedger - localhost:3001
cd /d "%~dp0"
if not exist node_modules\framer-motion (
  echo Installing dependencies...
  call npm install
)
echo Starting CrashLedger on http://localhost:3001
start "" cmd /c "timeout /t 10 /nobreak >nul && start http://localhost:3001"
call npm run dev -- -p 3001
pause
