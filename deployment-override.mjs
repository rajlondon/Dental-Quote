#!/usr/bin/env node

/**
 * MyDentalFly Deployment Override
 * Forces deployment domain to serve complete application instead of health page
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

console.log('MyDentalFly Deployment Override: Starting...');

// Override package.json start script temporarily
const originalPackage = `{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build", 
    "start": "tsx server/index.ts",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}`;

// Write deployment package.json that forces development server
writeFileSync('package.json.deploy', originalPackage);

console.log('Starting complete MyDentalFly application for deployment...');

// Start the exact same server as working external URL
const serverProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: process.env.PORT || 8080,
    NODE_ENV: 'development'  // Force development mode for complete features
  }
});

serverProcess.on('error', (error) => {
  console.error('MyDentalFly deployment server failed:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`MyDentalFly server exited with code ${code}`);
    process.exit(code);
  }
});