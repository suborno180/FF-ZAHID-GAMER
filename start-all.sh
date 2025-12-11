#!/bin/bash

# Start both frontend and backend servers for Free Fire Market

echo "🚀 Starting Free Fire Market Application"
echo "=========================================="
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo "\n\n⏹️  Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend server stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend server stopped"
    fi
    echo "\n👋 Goodbye!"
    exit 0
}

# Trap exit signals
trap cleanup EXIT INT TERM

# Check and install backend dependencies
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd server && npm install && cd ..
fi

# Check and install frontend dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start backend server in background
echo "📡 Starting Backend Server (Port 5000)..."
cd server
npm run dev > ../server.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend server running (PID: $BACKEND_PID)"
else
    echo "❌ Backend server failed to start"
    echo "Check server.log for details"
    exit 1
fi

# Start frontend server
echo "🎨 Starting Frontend Server (Port 5173)..."
echo ""
echo "========================================="
echo "🌐 Frontend: http://localhost:5173"
echo "📡 Backend:  http://localhost:5000"
echo "========================================="
echo ""
echo "📝 Logs:"
echo "  - Backend: server.log"
echo "  - Frontend: console below"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

npm run dev

# Keep script running
wait
