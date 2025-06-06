// MyDentalFly Deployment Server Override
// Forces deployment domain to serve complete application

const { spawn } = require('child_process');

const port = process.env.PORT || 8080;

console.log('MyDentalFly deployment override starting...');
console.log(`Port: ${port}`);
console.log('Launching complete application server');

// Start the complete MyDentalFly server
const app = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port.toString()
  }
});

app.on('error', (error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});

app.on('exit', (code) => {
  console.log(`Application exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

console.log('Complete MyDentalFly application will be available on deployment domain');