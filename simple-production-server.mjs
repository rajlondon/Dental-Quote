#!/usr/bin/env node

// Simplified MyDentalFly Production Server
// This server uses minimal dependencies and focuses on reliability

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Port configuration - use Replit's PORT or fallback to 5000 for deployment
const PORT = process.env.PORT || 5000;

console.log('🚀 MyDentalFly Starting...');
console.log('📂 Directory:', __dirname);
console.log('🚪 Port:', PORT);

// Basic middleware
app.use(express.static('dist'));
app.use(express.json());

// Health check endpoint for Replit deployment
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MyDentalFly API' });
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback HTML if dist/index.html doesn't exist
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MyDentalFly</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div id="root">
            <h1>MyDentalFly</h1>
            <p>Service is starting...</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MyDentalFly server running on port ${PORT}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});