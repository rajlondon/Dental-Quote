// MyDentalFly Entry Point Override for Deployment
// This file ensures deployment serves complete application

const { spawn } = require('child_process');

console.log('MyDentalFly: Forcing complete application for deployment...');

const port = process.env.PORT || 8080;

// Start the complete server with tsx
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port
  }
});

server.on('error', (err) => {
  console.error('Server failed:', err);
  process.exit(1);
});

console.log(`Starting complete MyDentalFly application on port ${port}`);