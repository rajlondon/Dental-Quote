// MyDentalFly Full Application Server - Production Deployment
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting MyDentalFly Full Application...');

// Set production environment
process.env.NODE_ENV = 'production';
const port = process.env.PORT || 8080;

// Start the complete application server
const serverProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { 
    ...process.env, 
    NODE_ENV: 'production', 
    PORT: port.toString()
  }
});

serverProcess.on('error', (error) => {
  console.error('Failed to start application server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`Application server exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});