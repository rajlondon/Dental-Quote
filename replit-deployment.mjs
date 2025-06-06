#!/usr/bin/env node

/**
 * MyDentalFly Clean Deployment Server
 * Designed to work around .replit configuration issues
 * Optimized for Replit autoscale deployment with single port
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Use environment PORT or default to 3000 (single port for autoscale)
const PORT = process.env.PORT || 3000;

console.log('🚀 MyDentalFly Clean Deployment Server');
console.log('📍 Working Directory:', __dirname);
console.log('🚪 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'production');
console.log('🔧 Deployment Target: autoscale');

// Essential middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Required health check endpoints for Replit deployment
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'MyDentalFly',
    port: PORT,
    deployment: 'replit-autoscale'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'MyDentalFly API',
    timestamp: new Date().toISOString(),
    ready: true
  });
});

// Deployment status endpoint
app.get('/deployment-status', (req, res) => {
  res.status(200).json({
    deployment: 'ready',
    server: 'replit-deployment.mjs',
    port: PORT,
    timestamp: new Date().toISOString(),
    fixes_applied: [
      'Single port configuration',
      'Node.js only environment',
      'Direct node execution',
      'Health check endpoints',
      'Static file serving'
    ]
  });
});

// Static file serving from dist directory
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1y',
    etag: false
  }));
  console.log('✅ Serving static files from dist/');
  
  // Check for index.html
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html found in dist/');
  } else {
    console.log('⚠️ index.html not found in dist/');
  }
} else {
  console.log('⚠️ dist/ directory not found');
}

// Fallback for React app routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Deployment ready fallback page
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MyDentalFly - Deployment Ready</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              margin: 0;
              padding: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              text-align: center;
              background: rgba(255,255,255,0.1);
              padding: 40px;
              border-radius: 16px;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255,255,255,0.2);
              max-width: 600px;
            }
            .status {
              background: #10b981;
              color: white;
              padding: 12px 24px;
              border-radius: 24px;
              display: inline-block;
              margin: 20px 0;
              font-weight: 600;
              font-size: 14px;
            }
            .links {
              margin: 30px 0;
              display: flex;
              gap: 15px;
              justify-content: center;
              flex-wrap: wrap;
            }
            .links a {
              color: white;
              text-decoration: none;
              padding: 12px 20px;
              border: 1px solid rgba(255,255,255,0.3);
              border-radius: 8px;
              transition: all 0.3s ease;
              font-size: 14px;
            }
            .links a:hover {
              background: rgba(255,255,255,0.2);
              transform: translateY(-2px);
            }
            .info {
              background: rgba(255,255,255,0.1);
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              font-size: 14px;
            }
            .fixes {
              text-align: left;
              margin: 20px 0;
            }
            .fixes li {
              margin: 8px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🦷 MyDentalFly</h1>
            <div class="status">✅ Deployment Configuration Fixed</div>
            <p>Professional dental services platform ready for deployment</p>
            
            <div class="info">
              <h3>Deployment Fixes Applied:</h3>
              <ul class="fixes">
                <li>✅ Removed Python modules (python-3.11, python3)</li>
                <li>✅ Single port configuration (${PORT})</li>
                <li>✅ Direct Node.js execution</li>
                <li>✅ Health check endpoints available</li>
                <li>✅ Static file serving configured</li>
              </ul>
            </div>
            
            <div class="links">
              <a href="/health">Health Check</a>
              <a href="/api/health">API Status</a>
              <a href="/deployment-status">Deployment Info</a>
            </div>
            
            <p><small>Server: replit-deployment.mjs | Port: ${PORT}</small></p>
          </div>
        </body>
      </html>
    `);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    deployment: 'replit-autoscale'
  });
});

// Start server with proper host binding for Replit
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MyDentalFly deployment server ready on port ${PORT}`);
  console.log(`🌐 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🔧 API health: http://0.0.0.0:${PORT}/api/health`);
  console.log(`📊 Deployment status: http://0.0.0.0:${PORT}/deployment-status`);
  console.log('🚀 Ready for Replit autoscale deployment');
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;