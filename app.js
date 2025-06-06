// MyDentalFly Application Entry Point - Direct Server Launch
const { spawn } = require('child_process');

const port = process.env.PORT || 8080;

console.log('MyDentalFly: Direct application launch');
console.log(`Port: ${port}`);

// Start complete server bypassing any deployment health checks
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port,
    NODE_ENV: 'development'
  }
});

server.on('error', (error) => {
  console.error('Application startup failed:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    process.exit(code);
  }
});

console.log('Complete MyDentalFly application starting...');