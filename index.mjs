#!/usr/bin/env node

// MyDentalFly Deployment Entry Point Override
import { spawn } from 'child_process';

const port = process.env.PORT || 8080;

console.log('MyDentalFly deployment starting...');
console.log(`Port: ${port}`);

// Force complete application for deployment
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port,
    NODE_ENV: 'development'
  }
});

server.on('error', (error) => {
  console.error('Server failed:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    process.exit(code);
  }
});

console.log('Complete application deployment initialized');