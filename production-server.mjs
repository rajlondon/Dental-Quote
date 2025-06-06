// MyDentalFly Production Server - Deployment Configuration
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting MyDentalFly for Deployment...');

// Configure for deployment with development server capabilities
const port = process.env.PORT || 8080;

console.log(`Deployment port: ${port}`);
console.log('Starting complete application server...');

// Use tsx to start the TypeScript server directly
const serverProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { 
    ...process.env, 
    PORT: port.toString()
  }
});

serverProcess.on('error', (error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Server exited with code ${code}`);
    process.exit(code);
  }
});