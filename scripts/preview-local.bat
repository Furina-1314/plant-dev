@echo off
where npm >nul 2>nul
if errorlevel 1 (
  echo npm 未安装，请先安装 Node.js
  exit /b 1
)
call npm install
if errorlevel 1 exit /b 1
call npm run build
if errorlevel 1 exit /b 1
call npm start
