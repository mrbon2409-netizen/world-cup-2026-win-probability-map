@echo off
setlocal
cd /d "%~dp0"

if not exist "dist\index.html" (
  echo Static build not found. Running build first...
  call npm run build:static
)

set "DASHBOARD_URL=file:///%~dp0dist/index.html"
set "DASHBOARD_URL=%DASHBOARD_URL:\=/%"

set "CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME_PATH%" goto open_chrome

set "CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME_PATH%" goto open_chrome

set "CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME_PATH%" goto open_chrome

echo Google Chrome was not found. Opening with the default browser instead...
start "" "%~dp0dist\index.html"
goto done

:open_chrome
start "" "%CHROME_PATH%" "%DASHBOARD_URL%"

:done
endlocal
