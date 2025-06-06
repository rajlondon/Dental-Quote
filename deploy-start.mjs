#!/usr/bin/env node

// MyDentalFly Deployment Script - Force Development Server
import { spawn } from 'child_process';

console.log('Starting MyDentalFly with development server for deployment...');

const port = process.env.PORT || 8080;
console.log(`Deployment port: ${port}`);

// Start the exact same server as working development environment
const server = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: port.toString()
  }
});

server.on('error', (error) => {
  console.error('Server failed:', error);
  process.exit(1);
});
