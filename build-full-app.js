/**
 * Full Application Build Script for MyDentalFly
 * 
 * This script:
 * 1. Cleans previous build files
 * 2. Builds the Vite application
 * 3. Prepares server files
 * 4. Creates proper entry point for deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting full application build process...');

try {
  // Clean previous build
  if (fs.existsSync('./dist')) {
    console.log('Cleaning previous build...');
    fs.rmSync('./dist', { recursive: true, force: true });
  }

  // Create dist directory
  fs.mkdirSync('./dist', { recursive: true });
  fs.mkdirSync('./dist/public', { recursive: true });

  // Build the Vite app
  console.log('Building Vite application...');
  execSync('cd client && npx vite build');

  // Copy the built files to dist/public
  console.log('Copying built files to dist/public...');
  if (fs.existsSync('./client/dist')) {
    execSync('cp -r ./client/dist/* ./dist/public/');
  } else {
    console.warn('Warning: Vite build directory not found. Check client/dist path.');
  }

  // Prepare server files
  console.log('Preparing server files...');
  execSync('cp -r server ./dist/');
  execSync('cp -r shared ./dist/');

  // Create start.mjs
  console.log('Creating application entry point...');
  const startScript = `
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import path from 'path';

// Stripe configuration check
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('Warning: STRIPE_SECRET_KEY is not set. Stripe functionality will not work.');
  } else {
    console.log('Stripe configuration detected.');
  }
} catch (error) {
  console.error('Error checking Stripe configuration:', error);
}

// Set up Express
const app = express();
const PORT = process.env.PORT || 3000;

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'production'
  });
});

try {
  // Import and register routes (with fallback)
  console.log('Registering API routes...');
  let httpServer;
  
  try {
    const { registerRoutes } = await import('./server/routes.js');
    httpServer = await registerRoutes(app);
  } catch (error) {
    console.error('Error registering routes:', error);
    console.log('Falling back to basic HTTP server...');
    httpServer = createServer(app);
  }

  // Serve static files from Vite build
  console.log('Setting up static file serving...');
  app.use(express.static(join(process.cwd(), 'dist/public')));

  // Always return index.html for any unknown routes (SPA)
  app.get('*', (req, res) => {
    res.sendFile(join(process.cwd(), 'dist/public', 'index.html'));
  });

  // Start the server
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(\`MyDentalFly server running on http://0.0.0.0:\${PORT}\`);
    console.log(\`Health check available at: http://0.0.0.0:\${PORT}/api/health\`);
  });
} catch (error) {
  console.error('Fatal server error:', error);
  process.exit(1);
}
`;

  fs.writeFileSync('./dist/start.mjs', startScript);

  console.log('Build completed successfully!');
  console.log('Your application is ready for deployment.');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}