@echo off
echo.
echo 🏥 EmblemHealth Component Tracker - Backend Server
echo ================================================
echo.
echo 📊 Model + Business Logic Layer Starting...
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Virtual environment not found!
    echo 🔧 Please run setup.bat first to install dependencies
    echo.
    pause
    exit /b 1
)

echo 🔧 Activating Python virtual environment...
call venv\Scripts\activate

echo ✅ Environment activated
echo.
echo 🚀 Starting Flask server with WebSocket support...
echo 📊 Database: SQLite (auto-initialized)
echo 🌐 API: http://localhost:5000
echo ⚡ WebSocket: Real-time features enabled
echo 🔄 CORS: Enabled for http://localhost:3000
echo.

python app.py

echo.
echo 🛑 Backend server stopped.
echo.
pause
