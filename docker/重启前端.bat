@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在停止前端容器...
docker compose -f docker-compose.dev.yml down
echo.
echo 正在重新构建并启动前端容器...
docker compose -f docker-compose.dev.yml up -d --build
echo.
echo 查看容器状态...
docker compose -f docker-compose.dev.yml ps
echo.
echo 查看容器日志（按Ctrl+C退出）...
timeout /t 2 >nul
docker compose -f docker-compose.dev.yml logs -f frontend

