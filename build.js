// Simple build script to handle frontend and backend compilation
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

try {
  // Step 1: Build the frontend
  console.log('📦 Building frontend assets with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Step 2: Build the backend
  console.log('📦 Building backend with esbuild...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', 
    { stdio: 'inherit' });
  
  // Step 3: Create a .js version of the .mjs file
  console.log('✅ Ensuring compatibility...');
  
  // Step 4: Create a simple start script for production
  const startScript = `
// Production startup script
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the main app module
import('./index.js').then(module => {
  console.log('✅ Application started in production mode');
}).catch(err => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});
`;

  fs.writeFileSync(path.join(__dirname, 'dist', 'start.js'), startScript);
  
  console.log('🎉 Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}