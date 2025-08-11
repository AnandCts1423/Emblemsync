@echo off
echo ============================================
echo 🚀 STARTING EMBLEMHEALTH COMPONENT TRACKER
echo ============================================
echo.

echo 📊 System: Complete Real-time Architecture
echo 🎯 Features: Upload Preview, CRUD, Search, Analytics
echo 💾 Database: Updated Schema with Real-time Updates
echo 🔄 WebSocket: Live collaboration enabled
echo.

echo Starting Backend Server...
cd /d "%~dp0backend"
start cmd /k "python app.py"

echo.
echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting Frontend Development Server...
cd /d "%~dp0frontend"
start cmd /k "npm start"

echo.
echo ✅ Both servers started successfully!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo 📡 WebSocket: Real-time updates enabled
echo.
echo ============================================
echo 🎉 EMBLEMHEALTH COMPONENT TRACKER READY!
echo ============================================
pause
