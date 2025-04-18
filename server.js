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
    console.log('Loading environment variables...');
    
    // First try to load from .env file
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('Loading from .env file');
      const envContents = fs.readFileSync(envPath, 'utf8');
      envContents.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
          const parts = line.split('=');
          if (parts.length >= 2) {
            const key = parts[0].trim();
            // Join back in case there are multiple = in the value
            const value = parts.slice(1).join('=').trim().replace(/^['"](.*)['"]$/, '$1'); // Remove quotes if present
            
            if (key && value) {
              process.env[key] = value;
              if (DEBUG) console.log(`Loaded ${key} from .env file`);
            }
          }
        }
      });
    }

    // Explicitly set critical variables from environment - use fallbacks if needed
    console.log('Setting critical environment variables...');
    
    // Force direct assignment of Stripe variables from environment
    if (process.env.STRIPE_SECRET_KEY) {
      console.log('STRIPE_SECRET_KEY already set in environment');
    } else {
      // Try different possible environment variable names for Stripe Secret Key
      const possibleSecretKeyNames = [
        'STRIPE_SECRET_KEY', 'REPLIT_STRIPE_SECRET_KEY', 
        'STRIPE_SK', 'REPLIT_STRIPE_SK'
      ];
      
      for (const varName of possibleSecretKeyNames) {
        if (process.env[varName]) {
          process.env.STRIPE_SECRET_KEY = process.env[varName];
          console.log(`Set STRIPE_SECRET_KEY from ${varName}`);
          break;
        }
      }
      
      // If still not set, use a placeholder for development only
      if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'production') {
        console.log('WARNING: Using placeholder STRIPE_SECRET_KEY for development');
        process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder_for_development_only';
      }
    }
    
    // Same for public key
    if (process.env.STRIPE_PUBLIC_KEY) {
      console.log('STRIPE_PUBLIC_KEY already set in environment');
    } else {
      const possiblePublicKeyNames = [
        'STRIPE_PUBLIC_KEY', 'REPLIT_STRIPE_PUBLIC_KEY',
        'STRIPE_PK', 'REPLIT_STRIPE_PK'
      ];
      
      for (const varName of possiblePublicKeyNames) {
        if (process.env[varName]) {
          process.env.STRIPE_PUBLIC_KEY = process.env[varName];
          console.log(`Set STRIPE_PUBLIC_KEY from ${varName}`);
          break;
        }
      }
      
      // If still not set, use a placeholder for development only
      if (!process.env.STRIPE_PUBLIC_KEY && process.env.NODE_ENV !== 'production') {
        console.log('WARNING: Using placeholder STRIPE_PUBLIC_KEY for development');
        process.env.STRIPE_PUBLIC_KEY = 'pk_test_placeholder_for_development_only';
      }
    }
    
    // Same for Vite public key
    if (process.env.VITE_STRIPE_PUBLIC_KEY) {
      console.log('VITE_STRIPE_PUBLIC_KEY already set in environment');
    } else {
      if (process.env.STRIPE_PUBLIC_KEY) {
        process.env.VITE_STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;
        console.log('Set VITE_STRIPE_PUBLIC_KEY from STRIPE_PUBLIC_KEY');
      } else {
        const possibleViteKeyNames = [
          'VITE_STRIPE_PUBLIC_KEY', 'REPLIT_VITE_STRIPE_PUBLIC_KEY'
        ];
        
        for (const varName of possibleViteKeyNames) {
          if (process.env[varName]) {
            process.env.VITE_STRIPE_PUBLIC_KEY = process.env[varName];
            console.log(`Set VITE_STRIPE_PUBLIC_KEY from ${varName}`);
            break;
          }
        }
      }
      
      // If still not set, use a placeholder for development only
      if (!process.env.VITE_STRIPE_PUBLIC_KEY && process.env.NODE_ENV !== 'production') {
        console.log('WARNING: Using placeholder VITE_STRIPE_PUBLIC_KEY for development');
        process.env.VITE_STRIPE_PUBLIC_KEY = 'pk_test_placeholder_for_development_only';
      }
    }

    // Log environment status
    console.log('Environment variables status:');
    console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET');
    console.log('- STRIPE_PUBLIC_KEY:', process.env.STRIPE_PUBLIC_KEY ? 'SET' : 'NOT SET');
    console.log('- VITE_STRIPE_PUBLIC_KEY:', process.env.VITE_STRIPE_PUBLIC_KEY ? 'SET' : 'NOT SET');
    
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