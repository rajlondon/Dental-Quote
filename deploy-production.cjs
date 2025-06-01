#!/usr/bin/env node

// Production deployment script for MyDentalFly with full authentication
console.log('🚀 Starting MyDentalFly production deployment with complete authentication system...');

const { spawn } = require('child_process');
const path = require('path');

// Ensure production environment
process.env.NODE_ENV = 'production';

// Log environment check
console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- Google OAuth configured:', !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET));
console.log('- Mailjet configured:', !!(process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY));
console.log('- Database configured:', !!process.env.DATABASE_URL);

// Start the full TypeScript server with authentication
console.log('🔧 Starting server with tsx loader for TypeScript support...');

const serverProcess = spawn('node', ['--loader', 'tsx/esm', 'server/index.ts'], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd()
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start production server:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`📊 Server process exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});

// Log successful startup
setTimeout(() => {
  console.log('✅ Production server startup initiated successfully');
  console.log('📋 Available authentication methods:');
  console.log('   - Email registration and login');
  console.log('   - Google OAuth authentication');
  console.log('🌐 Server should be accessible on production domain');
}, 2000);