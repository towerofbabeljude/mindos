# MindOS Full-Stack PowerShell Launcher
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "                    MINDOS — FULL STACK LAUNCHER                      " -ForegroundColor White
Write-Host "         Software-only Student Wellbeing & Early Signal Intelligence  " -ForegroundColor Gray
Write-Host "=====================================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Launching MindOS FastAPI Backend (Port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend'; python run.py"

Write-Host "[2/2] Launching MindOS React Frontend (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User'); cd '$scriptDir\frontend'; npm run dev"

Write-Host "`nMindOS is starting up!" -ForegroundColor Cyan
Write-Host "- Backend API & Swagger Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "- Frontend Web Application:   http://localhost:5173" -ForegroundColor Yellow
