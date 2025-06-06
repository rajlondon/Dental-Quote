#!/usr/bin/env node

/**
 * MyDentalFly Deployment Override
 * This script replaces the default deployment server to force complete application
 */

import { spawn } from 'child_process';

console.log('MyDentalFly Deployment Override: Starting complete application...');

const port = process.env.PORT || 8080;
console.log(`Deployment port: ${port}`);

// Force exact same server configuration as working external URL
const serverProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: port.toString(),
    NODE_ENV: 'development'
  }
});

serverProcess.on('error', (error) => {
  console.error('Deployment override failed:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Server exited with code ${code}`);
    process.exit(code);
  }
});

console.log('Complete MyDentalFly application will be available on deployment domain');