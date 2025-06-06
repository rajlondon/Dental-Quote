// MyDentalFly Production Server - JavaScript Implementation
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

console.log('🚀 MyDentalFly Production Server Starting...');
console.log('📂 Directory:', __dirname);
console.log('🌍 Environment:', process.env.NODE_ENV || 'production');

// Set production environment
process.env.NODE_ENV = 'production';
const port = process.env.PORT || 5000;

console.log('🚪 Starting server on port:', port);

const app = express();

// CORS configuration for production
app.use(cors({
  origin: [
    'https://*.replit.app',
    'https://*.replit.dev',
    'https://mydentalfly.co.uk',
    'https://mydentalfly.com'
  ],
  credentials: true
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: port,
    environment: process.env.NODE_ENV
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'API Online', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve static files from dist if it exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('✅ Serving static files from dist directory');
  app.use(express.static(distPath));
  
  // SPA fallback
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Application not built. Please run: npm run build');
    }
  });
} else {
  console.log('⚠️ Dist directory not found. Serving development fallback.');
  
  // Development fallback
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; text-align: center;">
        <h1>MyDentalFly</h1>
        <p>Application is starting up...</p>
        <p>If you see this message, the application needs to be built first.</p>
        <p><strong>Status:</strong> ${process.env.NODE_ENV} mode</p>
        <p><strong>Port:</strong> ${port}</p>
      </div>
    `);
  });
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    res.redirect('/');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🌐 Server accessible at http://0.0.0.0:${port}`);
  console.log(`📁 Static files: ${fs.existsSync(distPath) ? 'dist/' : 'none'}`);
});

// Graceful shutdown
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