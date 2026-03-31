@echo off
echo ==========================================
echo   LANCEMENT DE L'APPLICATION SHIHARA
echo ==========================================
echo.

echo [1/2] Démarrage du Serveur Backend...
start "Backend Shihara" /D "d:\shihara\backend" node index.js

echo [2/2] Démarrage de l'Interface Frontend...
start "Frontend Shihara" /D "d:\shihara" npm start

echo.
echo ==========================================
echo   L'application est en cours de lancement.
echo   - Backend: http://localhost:5000
echo   - Frontend: http://localhost:3000
echo ==========================================
pause
