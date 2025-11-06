@echo off
echo ========================================
echo   PHP Development Server Starting...
echo ========================================
echo.
echo Your website will be available at:
echo   http://localhost:8000
echo.
echo To test the contact form:
echo   1. Open http://localhost:8000/contact.html
echo   2. Fill out and submit the form
echo   3. Check resultl460@gmail.com for emails
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "D:\codes\image web"
php -S localhost:8000

pause
