// MyDentalFly Production Server - Force Complete Application
import { exec } from 'child_process';

process.env.NODE_ENV = 'development';
const port = process.env.PORT || 8080;

console.log('=== MyDentalFly Deployment Override ===');
console.log('Starting complete application on deployment domain');
console.log(`Port: ${port}`);

const command = `PORT=${port} npx tsx server/index.ts`;
console.log(`Command: ${command}`);

const serverProcess = exec(command, {
  env: {
    ...process.env,
    PORT: port,
    NODE_ENV: 'development'
  }
});

serverProcess.stdout.on('data', (data) => {
  process.stdout.write(data);
});

serverProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Process exited with code ${code}`);
    process.exit(code);
  }
});

console.log('Complete MyDentalFly application starting for deployment...');