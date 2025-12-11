#!/usr/bin/env node

/**
 * Health Check Monitor for Free Fire Market Server
 * Monitors server health and automatically restarts if needed
 */

import http from 'http';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL) || 30000; // 30 seconds
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES) || 3;

let failCount = 0;
let lastCheckTime = null;

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    const timestamp = new Date().toLocaleString();
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function checkHealth() {
    return new Promise((resolve, reject) => {
        const url = new URL('/health', SERVER_URL);
        
        const req = http.get(url, { timeout: 5000 }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const health = JSON.parse(data);
                        resolve(health);
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function monitor() {
    try {
        const health = await checkHealth();
        
        if (health.status === 'ok') {
            if (failCount > 0) {
                log(`✅ Server recovered! Health: ${JSON.stringify(health)}`, colors.green);
            } else {
                log(`✅ Server healthy | Version: ${health.version} | Supabase: ${health.supabase}`, colors.green);
            }
            failCount = 0;
        } else {
            throw new Error(`Unhealthy status: ${health.status}`);
        }
        
    } catch (error) {
        failCount++;
        log(`❌ Health check failed (${failCount}/${MAX_RETRIES}): ${error.message}`, colors.red);
        
        if (failCount >= MAX_RETRIES) {
            log(`🚨 Server unresponsive after ${MAX_RETRIES} attempts!`, colors.red);
            log(`💡 Action required: Check server logs and restart manually`, colors.yellow);
            failCount = 0; // Reset to continue monitoring
        }
    }
    
    lastCheckTime = new Date();
}

// Start monitoring
log(`🔍 Starting health monitor for ${SERVER_URL}`, colors.cyan);
log(`⏱️  Check interval: ${CHECK_INTERVAL / 1000}s`, colors.cyan);
log(`🔄 Max retries: ${MAX_RETRIES}`, colors.cyan);
log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, colors.cyan);

// Initial check
monitor();

// Schedule periodic checks
setInterval(monitor, CHECK_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
    log('\n👋 Stopping health monitor...', colors.yellow);
    process.exit(0);
});

process.on('SIGTERM', () => {
    log('\n👋 Stopping health monitor...', colors.yellow);
    process.exit(0);
});
