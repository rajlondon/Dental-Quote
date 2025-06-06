// MyDentalFly Production Server - Using Working Development Architecture
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 MyDentalFly Production Server Starting...');
console.log('📂 Directory:', __dirname);
console.log('🌍 Environment:', process.env.NODE_ENV);

// Set production environment and ensure proper port configuration
process.env.NODE_ENV = 'production';
// Use port 5000 for consistent Cloud Run deployment
if (!process.env.PORT) {
  process.env.PORT = '5000';
}

console.log('🚪 Starting server on port:', process.env.PORT);

// Start the working server architecture
const serverProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: process.env
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});