@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 백엔드 서버를 시작합니다...
python run_server.py
pause
