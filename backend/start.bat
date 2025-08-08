@echo off
echo Starting EH Component Tracker Backend API...
echo.
echo Activating Python virtual environment...
call venv\Scripts\activate.bat

echo.
echo Installing/updating dependencies...
pip install -r requirements.txt

echo.
echo Starting Flask API server...
echo API will be available at: http://localhost:5000
echo Frontend should connect to: http://localhost:3000
echo.
python app.py

pause
