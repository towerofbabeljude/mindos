@echo off
title MindOS Full-Stack Launcher
echo =====================================================================
echo                     MINDOS — FULL STACK LAUNCHER
echo          Software-only Student Wellbeing & Early Signal Intelligence
echo =====================================================================
echo.

REM Refresh PATH in current shell to pick up user-installed Node.js and Python
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USER_PATH=%%b"
for /f "tokens=2*" %%a in ('reg query "HKLM\System\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SYS_PATH=%%b"
set "PATH=%USER_PATH%;%SYS_PATH%;%PATH%"

echo [1/2] Starting MindOS FastAPI Backend (Port 8000)...
start "MindOS Backend" cmd /k "cd /d %~dp0backend && python run.py"

echo [2/2] Starting MindOS React Frontend (Port 5173)...
start "MindOS Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo MindOS is booting!
echo - Backend API & Swagger Docs: http://127.0.0.1:8000/docs
echo - Frontend Web Application:   http://localhost:5173
echo.
echo You can close this launcher window anytime.
pause
