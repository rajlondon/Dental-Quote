#!/usr/bin/env node

/**
 * MyDentalFly Start Script - Deployment Override
 * This replaces the default start script to force complete application deployment
 */

import { spawn } from 'child_process';

console.log('MyDentalFly: Starting complete application for deployment...');

const port = process.env.PORT || 8080;
console.log(`Port: ${port}`);

// Force the exact same server command as working external URL
const serverProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: port.toString(),
    NODE_ENV: 'development'  // Ensure complete application features
  }
});

serverProcess.on('error', (error) => {
  console.error('MyDentalFly server failed:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`MyDentalFly server exited with code ${code}`);
    process.exit(code);
  }
});

console.log('Complete MyDentalFly application starting...');