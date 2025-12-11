# Free Fire Market - Quick Start Guide

## 🚀 Starting the Application

### Method 1: Start Everything (Recommended)
```bash
./start-all.sh
```
This will:
- ✅ Auto-install dependencies if needed
- ✅ Start backend server (Port 5000) with auto-restart
- ✅ Start frontend app (Port 5173) with hot reload
- ✅ Show all URLs and logs
- ✅ Graceful shutdown on Ctrl+C

### Method 2: Start Servers Separately

**Backend Only:**
```bash
cd server
./start-server.sh
```

**Frontend Only:**
```bash
npm run dev
```

## 🔍 Server Monitoring

Monitor server health automatically:
```bash
cd server
npm run monitor
```

## 📱 Mobile Version Improvements

### What's Fixed:
1. **Price Filter Inputs**
   - Min/Max inputs now have proper width constraints
   - Better touch targets on mobile
   - Centered text for better readability
   - Prevents iOS auto-zoom (16px font size)

2. **Responsive Layout**
   - Improved spacing on small screens
   - Better button sizes for touch
   - Optimized filter layout for phones

3. **Input Validation**
   - Min/Max values validated
   - Auto-swap if min > max
   - Step increment of 0.01 for decimal prices

## 🛠️ Server Features

### Auto-Restart
The server automatically restarts when you edit code files in development mode.

### Health Monitoring
- Real-time health checks
- Automatic retry on failures
- Alerts when server is down

### Graceful Shutdown
- Properly closes connections
- Handles Ctrl+C and SIGTERM
- Cleans up resources

### Error Handling
- Request logging with timestamps
- Detailed errors in development
- Safe error messages in production

## 📋 Available Scripts

### Backend (in `/server` directory)
```bash
npm start        # Standard start
npm run dev      # Auto-restart on changes
npm run prod     # Production mode
npm run health   # One-time health check
npm run monitor  # Continuous monitoring
```

### Frontend (in root directory)
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🌐 Access URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Info**: http://localhost:5000/

## 📝 Logs

- **Backend logs**: `server.log` (in root directory)
- **Frontend logs**: Terminal console
- **Monitor logs**: Real-time in terminal

## ⚙️ Configuration

### Backend Environment (.env in /server)
```env
SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Change Ports
Edit `.env` file to use different ports if needed.

## 🐛 Troubleshooting

### Server won't start
1. Check if `.env` file exists in `/server`
2. Verify Supabase credentials
3. Check if port is already in use

### Frontend errors
1. Clear browser cache
2. Delete `node_modules` and reinstall
3. Check console for specific errors

### Mobile issues
1. Clear browser cache on mobile
2. Test in incognito/private mode
3. Check responsive design tools (F12)

## 💡 Tips

1. **Development**: Use `./start-all.sh` for best experience
2. **Debugging**: Check `server.log` for backend issues
3. **Mobile Testing**: Use browser dev tools responsive mode
4. **Monitoring**: Run health monitor in separate terminal
5. **Changes**: Server auto-restarts, frontend hot-reloads

## 🔄 Updates Made

### Mobile Improvements
- ✅ Fixed min/max input widths on phones
- ✅ Better touch targets and spacing
- ✅ Prevented iOS zoom on inputs
- ✅ Improved button sizes for mobile

### Server Enhancements
- ✅ Auto-restart on code changes
- ✅ Health monitoring system
- ✅ Graceful shutdown handling
- ✅ Better error messages
- ✅ Request logging
- ✅ Environment-based configuration
- ✅ Dependency auto-install
- ✅ .env validation

## 📞 Need Help?

1. Check server health: `curl http://localhost:5000/health`
2. View logs: `cat server.log`
3. Monitor server: `cd server && npm run monitor`
