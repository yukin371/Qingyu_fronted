@echo off
chcp 65001 > nul
echo ========================================
echo 🚀 青羽前端 - 一键修复脚本
echo ========================================
echo.

echo [1/4] 停止可能运行的服务...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak > nul
echo.

echo [2/4] 清理 Vite 缓存...
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo ✓ 已删除 Vite 缓存
) else (
    echo - Vite 缓存不存在
)
echo.

echo [3/4] 清理构建文件...
if exist dist (
    rmdir /s /q dist
    echo ✓ 已删除 dist 目录
) else (
    echo - dist 目录不存在
)
echo.

echo [4/4] 启动开发服务器...
echo.
echo ========================================
echo ✅ 准备完成，正在启动...
echo ========================================
echo.
echo 📌 重要提示：
echo    1. 服务启动后，请在浏览器按 Ctrl+Shift+R 强制刷新
echo    2. 如果还有问题，请按 F12 → Application → Clear storage
echo    3. 前端访问：http://localhost:5173
echo.
npm run dev



