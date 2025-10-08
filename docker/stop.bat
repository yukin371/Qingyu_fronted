@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 青羽前端 - 停止服务
echo ========================================
echo.

echo 正在停止前端服务...
docker-compose -f docker-compose.dev.yml down

echo.
echo ========================================
echo 前端服务已停止！
echo ========================================

pause



