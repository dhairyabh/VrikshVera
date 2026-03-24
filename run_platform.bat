@echo off
echo ===========================================
echo   VrikshVera Unified Platform Launcher
echo ===========================================
echo.

:: 1. Start the ML Backend in a new window
echo [STEP 1] Starting ML Backend (Flask)...
start "VrikshVera AI Backend" cmd /c "start_vrikshvera_ml.bat"

:: 2. Wait for backend to initialize (approx 5 sec)
timeout /t 5 >nul

:: 3. Start a local server for the Frontend to avoid CORS issues
echo [STEP 2] Starting local web server...
echo.
echo [INFO] Access your website at: http://localhost:8000
echo.

:: Try starting with Python (most reliable)
python -m http.server 8000
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python not found. Trying to open index.html directly...
    echo [WARNING] Direct file opening may cause CORS errors with the AI models.
    start index.html
)

pause
