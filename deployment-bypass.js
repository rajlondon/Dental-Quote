// MyDentalFly Deployment Domain Bypass
// Forces deployment to serve complete application instead of health page

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;

console.log('MyDentalFly Deployment Bypass Activated');
console.log(`Target port: ${port}`);

// Check if we're in deployment environment
if (process.env.REPL_DEPLOYMENT || process.env.PORT) {
  console.log('Deployment environment detected - bypassing health page');
  
  try {
    // Start the complete server directly
    const command = `PORT=${port} NODE_ENV=development npx tsx server/index.ts`;
    console.log(`Executing: ${command}`);
    
    execSync(command, {
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: port,
        NODE_ENV: 'development'
      }
    });
  } catch (error) {
    console.error('Deployment bypass failed:', error);
    process.exit(1);
  }
} else {
  console.log('Development environment - using normal startup');
  const { spawn } = require('child_process');
  
  const server = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: process.env
  });
  
  server.on('error', (error) => {
    console.error('Server failed:', error);
    process.exit(1);
  });
}