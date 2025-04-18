// Production server for MyDentalFly domains
// This server loads environment variables and serves the static content

// Required modules
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Debug mode for Replit environment
const DEBUG = process.env.DEBUG || false;

// Load environment variables and secrets
function loadEnvironment() {
  try {
    // First try to load from .env file
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('Loading environment variables from .env file');
      const envContents = fs.readFileSync(envPath, 'utf8');
      envContents.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^['"](.*)['"]$/, '$1'); // Remove quotes if present
          }
        }
      });
    }

    // Ensure critical variables are set from environment secrets if not in .env
    const criticalVars = [
      { env: 'STRIPE_SECRET_KEY', replit: 'STRIPE_SECRET_KEY' },
      { env: 'STRIPE_PUBLIC_KEY', replit: 'STRIPE_PUBLIC_KEY' },
      { env: 'VITE_STRIPE_PUBLIC_KEY', replit: 'VITE_STRIPE_PUBLIC_KEY' }
    ];

    criticalVars.forEach(({env, replit}) => {
      if (!process.env[env]) {
        process.env[env] = process.env[replit];
        if (DEBUG) console.log(`Set ${env} from environment secrets`);
      }
    });

    if (DEBUG) {
      console.log('Environment variables loaded:');
      console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET');
      console.log('- STRIPE_PUBLIC_KEY:', process.env.STRIPE_PUBLIC_KEY ? 'SET' : 'NOT SET');
      console.log('- VITE_STRIPE_PUBLIC_KEY:', process.env.VITE_STRIPE_PUBLIC_KEY ? 'SET' : 'NOT SET');
    }
    
    return true;
  } catch (error) {
    console.error('Error loading environment:', error);
    return false;
  }
}

// Load environment variables
loadEnvironment();

// Configure Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    host: req.headers.host,
    environment: process.env.NODE_ENV || 'production'
  });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// For single page application routing - send index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MyDentalFly server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Server ready at http://0.0.0.0:${PORT}`);
});