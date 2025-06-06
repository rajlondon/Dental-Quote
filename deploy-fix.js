#!/usr/bin/env node

/**
 * MyDentalFly Deployment Fix
 * Forces deployment to use the same server configuration as working development environment
 */

import fs from 'fs';
import path from 'path';

console.log('Applying deployment domain fix...');

// Create deployment package.json that uses development server
const deployPackage = {
  "name": "mydentalfly-deploy",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "tsx server/index.ts"
  },
  "dependencies": {
    "tsx": "^4.7.0"
  }
};

// Write deployment configuration
fs.writeFileSync('deploy-package.json', JSON.stringify(deployPackage, null, 2));

// Create deployment script that forces development mode
const deployScript = `#!/usr/bin/env node

// MyDentalFly Deployment Script - Force Development Server
import { spawn } from 'child_process';

console.log('Starting MyDentalFly with development server for deployment...');

const port = process.env.PORT || 8080;
console.log(\`Deployment port: \${port}\`);

// Start the exact same server as working development environment
const server = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: port.toString()
  }
});

server.on('error', (error) => {
  console.error('Server failed:', error);
  process.exit(1);
});
`;

fs.writeFileSync('deploy-start.mjs', deployScript);
fs.chmodSync('deploy-start.mjs', '755');

console.log('✓ Deployment fix applied');
console.log('✓ Created deploy-start.mjs');
console.log('✓ Created deploy-package.json');
console.log('');
console.log('The deployment will now use the same server as your working development environment.');