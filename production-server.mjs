// MyDentalFly Production Server - Force Complete Application Deployment
import { spawn } from 'child_process';

const port = process.env.PORT || 8080;

console.log('=== MyDentalFly Deployment Override ===');
console.log('Bypassing health page, starting complete application');
console.log(`Deployment port: ${port}`);

// Force the complete server to start on deployment port
const serverProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: port.toString(),
    NODE_ENV: 'development'  // Ensure all features are available
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

console.log('Complete MyDentalFly application launching for deployment...');