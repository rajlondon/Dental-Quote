#!/usr/bin/env node

// Force deployment to serve complete MyDentalFly application
const { spawn } = require('child_process');

const port = process.env.PORT || 8080;

console.log('FORCE DEPLOY: Starting complete MyDentalFly application');
console.log(`Port: ${port}`);

// Bypass all caching by starting server directly
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port,
    NODE_ENV: 'development',
    FORCE_DEPLOY: 'true'
  }
});

server.on('error', (error) => {
  console.error('FORCE DEPLOY: Server failed:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`FORCE DEPLOY: Exited with code ${code}`);
    process.exit(code);
  }
});

console.log('FORCE DEPLOY: Complete application launching...');