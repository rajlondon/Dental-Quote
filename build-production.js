#!/usr/bin/env node

/**
 * Production Build Script for MyDentalFly
 * This script creates a proper production build that aligns with the existing server architecture
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏗️  Building MyDentalFly for production...');

try {
  // 1. Build the client-side application
  console.log('📦 Building client application...');
  execSync('npx vite build', { stdio: 'inherit' });

  // 2. Create production server entry point
  console.log('🖥️  Creating production server...');
  
  const productionServer = `
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Register API routes
const server = await registerRoutes(app);

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(\`🚀 MyDentalFly server running on port \${PORT}\`);
});
`;

  fs.writeFileSync('dist/index.mjs', productionServer);

  // 3. Copy server files to dist
  console.log('📁 Copying server files...');
  execSync('cp -r server dist/', { stdio: 'inherit' });
  execSync('cp -r shared dist/', { stdio: 'inherit' });

  console.log('✅ Production build completed successfully!');
  console.log('📍 Entry point: dist/index.mjs');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}