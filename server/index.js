import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isDev = process.env.NODE_ENV !== 'production';

// Middleware
app.use(cors({
    origin: isDev ? '*' : [FRONTEND_URL, 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({ 
        error: 'Internal server error', 
        message: isDev ? err.message : 'Something went wrong'
    });
});

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase connected');
} else {
    console.warn('⚠️ Supabase credentials missing');
}

// Routes - use dynamic import to ensure dotenv loads first
(async () => {
    try {
        const paymentRoutes = await import('./payment-routes.js');
        app.use('/api/payment', paymentRoutes.default);

        // Health check endpoint with detailed info
        app.get('/health', (req, res) => {
            res.json({ 
                status: 'ok', 
                version: '2.0',
                timestamp: new Date().toISOString(),
                environment: isDev ? 'development' : 'production',
                supabase: supabase ? 'connected' : 'disconnected'
            });
        });

        // Root endpoint
        app.get('/', (req, res) => {
            res.json({
                message: 'Free Fire Market Payment Server',
                version: '2.0',
                endpoints: {
                    health: '/health',
                    payment: '/api/payment'
                }
            });
        });

        // 404 handler
        app.use((req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });

        // Start Server
        const server = app.listen(PORT, () => {
            console.log('\n========================================');
            console.log('🚀 Free Fire Market Server v2.0');
            console.log('========================================');
            console.log(`📡 Server: http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${isDev ? 'Development' : 'Production'}`);
            console.log(`⏰ Started: ${new Date().toLocaleString()}`);
            console.log('========================================\n');
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('\n⚠️  SIGINT received, shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });

        // Handle uncaught errors
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
})();

export { supabase };
