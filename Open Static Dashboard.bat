@echo off
cd /d "%~dp0"
if not exist "dist\index.html" (
  echo Static build not found. Running build first...
  call npm run build:static
)
start "" "%~dp0dist\index.html"
