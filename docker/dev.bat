@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 青羽前端 - 开发环境启动
echo ========================================
echo.

echo [1] 检查网络是否存在...
docker network inspect qingyu-network >nul 2>&1
if %errorlevel% neq 0 (
    echo 创建Docker网络...
    docker network create qingyu-network
)

echo.
echo [2] 启动前端服务...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo [3] 等待服务启动...
timeout /t 3 >nul

echo.
echo [4] 显示服务状态
docker-compose -f docker-compose.dev.yml ps

echo.
echo ========================================
echo 前端服务已启动！
echo ========================================
echo 访问地址: http://localhost:5173
echo ========================================
echo.
echo 查看日志: docker-compose -f docker-compose.dev.yml logs -f
echo 停止服务: docker-compose -f docker-compose.dev.yml down
echo ========================================

pause



