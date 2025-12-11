# Free Fire Market Server v2.0

Modern payment backend server with automatic monitoring and health checks.

## Features

- ✅ Auto-restart on file changes (development mode)
- ✅ Graceful shutdown handling
- ✅ Health monitoring endpoint
- ✅ Request logging
- ✅ Error handling middleware
- ✅ CORS configuration
- ✅ Supabase integration

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_service_key
PORT=5000
NODE_ENV=development
```

### 3. Start Server

**Development (with auto-restart):**
```bash
npm run dev
# or
./start-server.sh
```

**Production:**
```bash
npm run prod
```

**Standard:**
```bash
npm start
```

## Health Monitoring

Monitor server health automatically:

```bash
npm run monitor
```

Or manually check:
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "version": "2.0",
  "timestamp": "2025-12-11T...",
  "environment": "development",
  "supabase": "connected"
}
```

## API Endpoints

### Health Check
- **GET** `/health` - Server health status
- **GET** `/` - API information

### Payment
- **POST** `/api/payment/*` - Payment routes (see payment-routes.js)

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start server (standard) |
| `npm run dev` | Start with auto-restart |
| `npm run prod` | Production mode |
| `npm run health` | One-time health check |
| `npm run monitor` | Continuous health monitoring |

## Auto-Restart

The server uses Node.js `--watch` flag for automatic restart on file changes in development mode.

Changes to any `.js` file will trigger an automatic restart.

## Graceful Shutdown

The server handles shutdown signals gracefully:
- `CTRL+C` (SIGINT)
- `SIGTERM`

All connections are closed properly before exit.

## Logging

- All requests are logged with timestamps
- Errors are logged to console
- In production: minimal error details
- In development: full error stack traces

## Troubleshooting

### Server won't start
1. Check `.env` file exists
2. Verify Supabase credentials
3. Ensure port 5000 is available

### Health check fails
```bash
# Check if server is running
curl http://localhost:5000/health

# Check logs
cat ../server.log
```

### Port already in use
Change port in `.env`:
```env
PORT=5001
```

## Development Tips

1. **Auto-restart**: File changes trigger automatic restart
2. **Logs**: Check `../server.log` for backend logs
3. **Health**: Run monitor in separate terminal
4. **Environment**: Use `development` for detailed errors

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use process manager (PM2, systemd)
3. Configure reverse proxy (nginx)
4. Enable HTTPS
5. Set proper CORS origins

Example PM2:
```bash
pm2 start index.js --name "ffm-server"
pm2 startup
pm2 save
```

## Support

For issues, check:
1. Server logs: `server.log`
2. Health endpoint: `/health`
3. Environment variables in `.env`
