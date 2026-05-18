@echo off
echo === 课程资源共享平台 启动脚本 ===

echo [1/3] 启动后端服务...
start "后端服务" cmd /c "cd backend && npm run dev"

echo [2/3] 等待后端启动...
timeout /t 3 /nobreak >nul

echo [3/3] 启动前端开发服务...
start "前端服务" cmd /c "cd frontend && npm run dev"

echo.
echo === 启动完成 ===
echo 前端: http://localhost:5173
echo 后端: http://localhost:3000
pause
