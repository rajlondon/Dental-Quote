#!/usr/bin/env node

// Complete MyDentalFly Deployment Script
// Forces deployment domains to serve full application instead of health pages

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;

console.log('MyDentalFly Complete Deployment Script');
console.log(`Target port: ${port}`);

// Ensure we have the complete server available
const serverPath = path.join(process.cwd(), 'server', 'index.ts');
if (!fs.existsSync(serverPath)) {
  console.error('Server file not found:', serverPath);
  process.exit(1);
}

console.log('Starting complete MyDentalFly application for deployment...');

// Launch the complete server
const server = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port.toString(),
    NODE_ENV: 'production',
    DEPLOYMENT_MODE: 'true'
  }
});

server.on('error', (error) => {
  console.error('Deployment failed:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down deployment server...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Shutting down deployment server...');
  server.kill('SIGINT');
});

console.log('Complete application deployment initialized');