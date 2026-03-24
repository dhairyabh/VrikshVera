@echo off
echo ==========================================
echo   VrikshVera AI - ML Backend Startup
echo ==========================================
echo.

cd backend

:: Check if virtual environment exists
if not exist venv (
    echo [STATUS] Creating virtual environment...
    python -m venv venv
)

echo [STATUS] Activating virtual environment...
call venv\Scripts\activate

echo [STATUS] Installing/Updating dependencies...
pip install -r requirements.txt

echo.
echo [SUCCESS] Backend is starting on http://localhost:5000
echo.
python app.py

pause
