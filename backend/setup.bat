@echo off
echo 🏥 EmblemHealth Component Tracker - Backend Setup
echo ================================================

echo.
echo 📦 Creating Python virtual environment...
python -m venv venv

echo.
echo 🔧 Activating virtual environment...
call venv\Scripts\activate

echo.
echo 📥 Installing Python dependencies...
pip install -r requirements.txt

echo.
echo ✅ Backend setup complete!
echo.
echo 🚀 To start the backend server:
echo    1. Run: venv\Scripts\activate
echo    2. Run: python app.py
echo.
echo 🌐 Backend will be available at: http://localhost:5000
echo ⚡ WebSocket support: Enabled
echo.
pause
