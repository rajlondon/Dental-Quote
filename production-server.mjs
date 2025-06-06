// MyDentalFly Production Server - Force Complete Application
import { spawn } from 'child_process';

console.log('=== MyDentalFly Deployment Server Override ===');
console.log('Forcing complete application instead of health page');

const port = process.env.PORT || 8080;
console.log(`Deployment port: ${port}`);
console.log('Starting same server as working external URL');

// Start the exact same server command as working external URL
const serverProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: port.toString(),
    NODE_ENV: 'development'  // Force complete application features
  }
});

serverProcess.on('error', (error) => {
  console.error('Deployment server startup failed:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Deployment server exited with code ${code}`);
    process.exit(code);
  }
});

console.log('Deployment will serve complete MyDentalFly application');