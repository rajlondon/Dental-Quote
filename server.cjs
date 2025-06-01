// Production server entry point with full authentication support
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting MyDentalFly production server with full authentication support v2.0...');

// Set production environment
process.env.NODE_ENV = 'production';

// Start the main server
const serverProcess = spawn('node', ['--loader', 'tsx/esm', 'server/index.ts'], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd()
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});