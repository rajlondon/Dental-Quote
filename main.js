#!/usr/bin/env node

// MyDentalFly Main Entry Point - Forces Complete Application
const { spawn } = require('child_process');

const port = process.env.PORT || 8080;

console.log('MyDentalFly: Starting complete application...');
console.log(`Port: ${port}`);

// Launch the complete server directly with tsx
const app = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port
  }
});

app.on('error', (err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

app.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Exited with code ${code}`);
    process.exit(code);
  }
});

console.log('Complete application launching...');