// MyDentalFly Production Server - Complete Implementation
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 MyDentalFly Production Server Starting...');
console.log('📂 Directory:', __dirname);
console.log('🌍 Environment:', process.env.NODE_ENV);

// Set production environment
process.env.NODE_ENV = 'production';
const port = process.env.PORT || 5000;

console.log('🚪 Starting server on port:', port);

// Build the application first
console.log('📦 Building application...');
try {
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    cwd: __dirname,
    env: process.env
  });

  buildProcess.on('close', (buildCode) => {
    if (buildCode !== 0) {
      console.error('Build failed with code:', buildCode);
      process.exit(1);
    }
    
    console.log('✅ Build completed successfully');
    
    // Check if dist directory exists
    const distPath = path.join(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
      console.error('❌ Dist directory not found after build');
      process.exit(1);
    }
    
    // Start the server with the working development architecture
    console.log('🚀 Starting production server...');
    const serverProcess = spawn('node', ['--loader', 'tsx/esm', 'server/index.ts'], {
      stdio: 'inherit',
      cwd: __dirname,
      env: { ...process.env, NODE_ENV: 'production', PORT: port.toString() }
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    });

    serverProcess.on('exit', (code) => {
      console.log(`Server process exited with code ${code}`);
      process.exit(code);
    });
  });

  buildProcess.on('error', (error) => {
    console.error('❌ Build process failed:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Failed to start build process:', error);
  process.exit(1);
}