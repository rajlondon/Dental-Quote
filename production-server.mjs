// MyDentalFly Production Server - Complete Application Override
import { spawn } from 'child_process';

console.log('=== MyDentalFly Deployment Override ===');
console.log('Starting complete application for deployment domain');

const port = process.env.PORT || 8080;
console.log(`Deployment port: ${port}`);

// Force the exact same server command as your working development environment
const serverProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
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

console.log('Production server configured to use development environment for full functionality');