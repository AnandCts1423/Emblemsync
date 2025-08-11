@echo off
cls
echo.
echo     ███████╗██╗  ██╗    ████████╗██████╗  █████╗  ██████╗██╗  ██╗███████╗██████╗ 
echo     ██╔════╝██║  ██║    ╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
echo     █████╗  ███████║       ██║   ██████╔╝███████║██║     █████╔╝ █████╗  ██████╔╝
echo     ██╔══╝  ██╔══██║       ██║   ██╔══██╗██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
echo     ███████╗██║  ██║       ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║
echo     ╚══════╝╚═╝  ╚═╝       ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
echo.
echo                        🏥 EmblemHealth Component Tracker
echo                           MVP Architecture Setup
echo.
echo ================================================================================
echo.

:menu
echo 🚀 Setup Options:
echo.
echo    1. 🏗️  Full Setup (Backend + Frontend)
echo    2. 🔧  Backend Only Setup (Python Flask + WebSocket)
echo    3. 🎨  Frontend Only Setup (React TypeScript)
echo    4. 🧹  Clean & Reset Everything
echo    5. ❓  Show Architecture Info
echo    6. 🚪  Exit
echo.
set /p choice=Enter your choice (1-6): 

if "%choice%"=="1" goto full_setup
if "%choice%"=="2" goto backend_setup
if "%choice%"=="3" goto frontend_setup
if "%choice%"=="4" goto clean_reset
if "%choice%"=="5" goto show_info
if "%choice%"=="6" goto exit

echo Invalid choice. Please try again.
goto menu

:full_setup
echo.
echo 🏗️ Setting up complete MVP architecture...
echo.
echo 📊 Step 1: Backend Setup (Model + Business Logic)
cd backend
call setup.bat
cd ..
echo.
echo 🎨 Step 2: Frontend Setup (View + UI Layer)
cd frontend  
call setup.bat
cd ..
echo.
echo ✅ Full setup complete!
echo.
goto show_start_instructions

:backend_setup
echo.
echo 📊 Setting up Backend (Model + Business Logic)...
cd backend
call setup.bat
cd ..
echo.
echo ✅ Backend setup complete!
goto show_backend_instructions

:frontend_setup
echo.
echo 🎨 Setting up Frontend (View + UI Layer)...
cd frontend
call setup.bat
cd ..
echo.
echo ✅ Frontend setup complete!
goto show_frontend_instructions

:clean_reset
echo.
echo 🧹 Cleaning and resetting environment...
if exist backend\venv rmdir /s /q backend\venv
if exist frontend\node_modules rmdir /s /q frontend\node_modules
if exist frontend\build rmdir /s /q frontend\build
echo ✅ Clean complete! Run setup again.
goto menu

:show_info
echo.
echo 📋 EmblemHealth Component Tracker - MVP Architecture
echo =====================================================
echo.
echo 📊 BACKEND (Model + Business Logic):
echo    - Python Flask REST API
echo    - Real-time WebSocket server
echo    - SQLite database with SQLAlchemy ORM
echo    - File processing (CSV, JSON, Excel)
echo    - Business logic and data validation
echo    - Location: /backend/
echo.
echo 🎨 FRONTEND (View + Pure UI):
echo    - React 18 with TypeScript
echo    - Professional glassmorphism UI
echo    - Real-time WebSocket client
echo    - Pure presentation layer (no business logic)
echo    - Location: /frontend/
echo.
echo 🔄 COMMUNICATION:
echo    - REST API calls for data operations
echo    - WebSocket for real-time updates
echo    - Clean separation of concerns
echo.
pause
goto menu

:show_start_instructions
echo.
echo 🚀 TO START THE APPLICATION:
echo ============================================
echo.
echo 💡 You need TWO terminal windows:
echo.
echo 📊 Terminal 1 - Backend Server:
echo    cd backend
echo    venv\Scripts\activate
echo    python app.py
echo    (Server runs on http://localhost:5000)
echo.
echo 🎨 Terminal 2 - Frontend Dev Server:
echo    cd frontend
echo    npm start
echo    (UI runs on http://localhost:3000)
echo.
echo 🌐 Open http://localhost:3000 in your browser
echo ⚡ Real-time features will be active!
echo.
goto end

:show_backend_instructions
echo.
echo 📊 TO START BACKEND SERVER:
echo ========================
echo    cd backend
echo    venv\Scripts\activate
echo    python app.py
echo.
echo Server will run on http://localhost:5000
goto end

:show_frontend_instructions
echo.
echo 🎨 TO START FRONTEND:
echo ===================
echo    cd frontend
echo    npm start
echo.
echo UI will run on http://localhost:3000
echo (Make sure backend is running first!)
goto end

:end
echo.
echo 📖 For detailed architecture info, see: ARCHITECTURE.md
echo.
pause
goto menu

:exit
echo.
echo 👋 Thanks for using EmblemHealth Component Tracker!
echo.
pause
exit
