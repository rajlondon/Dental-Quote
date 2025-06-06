// MyDentalFly Production Server - Force Complete Application for Deployment
import { spawn } from 'child_process';

console.log('=== MyDentalFly Deployment Domain Fix ===');
console.log('Forcing complete application instead of health page');

const port = process.env.PORT || 8080;
console.log(`Deployment port: ${port}`);
console.log('Using same configuration as working external URL');

// Use tsx directly to match working external URL configuration
const serverProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: port.toString(),
    NODE_ENV: 'development'  // Force development mode for complete application
  }
});

serverProcess.on('error', (error) => {
  console.error('Deployment server failed:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Deployment server exited with code ${code}`);
    process.exit(code);
  }
});

console.log('Deployment configured to serve complete MyDentalFly application');