// MyDentalFly Deployment Override - Force Complete Application
const { spawn } = require('child_process');

console.log('=== MyDentalFly Deployment Domain Fix ===');
console.log('Forcing complete application instead of health page');

const port = process.env.PORT || 8080;
console.log(`Deployment port: ${port}`);
console.log('Starting exact same server as working external URL');

// Launch the complete server directly
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: port.toString(),
    NODE_ENV: 'development'  // Force complete application mode
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