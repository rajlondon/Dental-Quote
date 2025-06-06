// MyDentalFly Production Server - Force Development Mode for Full Functionality
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting MyDentalFly Full Application...');

// Force development mode to ensure Vite serves the complete application
process.env.NODE_ENV = 'development';
const port = process.env.PORT || 8080;

// Start the complete application with Vite development server
const serverProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { 
    ...process.env, 
    NODE_ENV: 'development', 
    PORT: port.toString()
  }
});

serverProcess.on('error', (error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Application exited with code ${code}`);
    process.exit(code);
  }
});