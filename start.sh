#!/bin/bash
echo "=== 课程资源共享平台 启动脚本 ==="

echo "[1/3] 检查后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
  npm install
fi

echo "[2/3] 启动后端服务..."
npm run dev &
BACKEND_PID=$!
echo "后端PID: $BACKEND_PID"

echo "[3/3] 启动前端开发服务..."
cd ../frontend
if [ ! -d "node_modules" ]; then
  npm install
fi
npm run dev &
FRONTEND_PID=$!
echo "前端PID: $FRONTEND_PID"

echo ""
echo "=== 启动完成 ==="
echo "前端: http://localhost:5173"
echo "后端: http://localhost:3000"
echo "按 Ctrl+C 停止所有服务"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
