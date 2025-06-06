#!/usr/bin/env node

// MyDentalFly Deployment Server
// Optimized for Replit autoscale deployment

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Port configuration for Replit deployment
const PORT = process.env.PORT || 5000;

console.log('🚀 MyDentalFly Deployment Server Starting...');
console.log('📂 Directory:', __dirname);
console.log('🚪 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'production');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoints required for deployment
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'MyDentalFly',
    port: PORT
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'MyDentalFly API',
    timestamp: new Date().toISOString()
  });
});

// Static file serving
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('✅ Serving static files from dist/');
} else {
  console.log('⚠️ dist/ directory not found, creating fallback...');
}

// Catch-all handler for React app
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback HTML for deployment
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MyDentalFly - Deployment Ready</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
            }
            .status {
              background: #10b981;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              display: inline-block;
              margin: 20px 0;
              font-weight: 600;
            }
            .links {
              margin: 30px 0;
            }
            .links a {
              color: white;
              text-decoration: none;
              margin: 0 15px;
              padding: 10px 20px;
              border: 1px solid rgba(255,255,255,0.3);
              border-radius: 8px;
              display: inline-block;
              transition: all 0.3s ease;
            }
            .links a:hover {
              background: rgba(255,255,255,0.2);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🦷 MyDentalFly</h1>
            <div class="status">✅ Deployment Ready</div>
            <p>Professional dental services platform</p>
            <div class="links">
              <a href="/health">Health Check</a>
              <a href="/api/health">API Status</a>
            </div>
            <p><small>Server running on port ${PORT}</small></p>
          </div>
        </body>
      </html>
    `);
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MyDentalFly deployment server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API health: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

export default app;