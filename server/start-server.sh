#!/bin/bash

echo "🚀 Starting Payment Server..."
echo "================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file with required variables:"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_SERVICE_KEY"
    echo "  - PORT (optional, defaults to 5000)"
    echo ""
fi

# Start the server with auto-restart on file changes
echo "🔥 Starting server with auto-restart..."
echo "Press Ctrl+C to stop"
echo ""
npm run dev
