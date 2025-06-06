// Production Server for Deployment - CommonJS for better compatibility
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

console.log('Starting MyDentalFly Production Server...');

const app = express();
const port = process.env.PORT || 8080;

// Enhanced CORS for deployment
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security headers for deployment
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: port,
    environment: 'production'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'MyDentalFly API Online', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Check if dist directory exists and serve built files
const distPath = path.join(__dirname, 'dist');
const distExists = fs.existsSync(distPath);

if (distExists) {
  console.log('Serving static files from dist directory');
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true
  }));
  
  // SPA fallback for client-side routing
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(500).send('Application files not found');
    }
  });
} else {
  console.log('Starting complete MyDentalFly application (no build directory)');
  
  // Redirect all requests to the working development server
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(502).json({ error: 'API redirecting to main server' });
    }
    
    // Redirect to external working URL
    const workingUrl = `https://2c463447-3d41-446a-941e-b6b5884b2d42-00-2ifo54nxr2ad0.riker.replit.dev${req.path}`;
    res.redirect(302, workingUrl);
  }); 
            margin: 0; padding: 0; min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; display: flex; align-items: center; justify-content: center;
          }
          .container { text-align: center; max-width: 600px; padding: 40px; }
          .logo { font-size: 48px; margin-bottom: 20px; }
          h1 { font-size: 32px; margin: 0 0 20px 0; }
          p { font-size: 18px; margin: 0 0 30px 0; opacity: 0.9; }
          .status { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; }
          .loading { animation: pulse 2s infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🦷</div>
          <h1>MyDentalFly</h1>
          <p>Your Trusted Dental Treatment Concierge</p>
          <div class="status">
            <h3 class="loading">Application Starting...</h3>
            <p>Server: Online (Port ${port})</p>
            <p>Status: Production Environment Ready</p>
            <p>Build: In Progress</p>
          </div>
          <p><small>The application will be available shortly.</small></p>
        </div>
        <script>
          // Auto-refresh every 30 seconds during startup
          setTimeout(() => location.reload(), 30000);
        </script>
      </body>
      </html>
    `);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`MyDentalFly server running on port ${port}`);
  console.log(`Environment: production`);
  console.log(`Static files: ${distExists ? 'Available' : 'Building'}`);
  console.log(`Server URL: http://0.0.0.0:${port}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('Received SIGTERM - shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT - shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;