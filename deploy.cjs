/**
 * Deployment preparation script for MyDentalFly domains
 */

const fs = require('fs');
const path = require('path');

console.log('Starting deployment preparation...');

// Copy our specific package.json for deployment
try {
  if (fs.existsSync('./deploy-package.json')) {
    console.log('Copying deploy-package.json to package.json...');
    fs.copyFileSync('./deploy-package.json', './package.json');
    console.log('package.json updated for deployment');
  } else {
    console.error('Error: deploy-package.json not found!');
  }
} catch (error) {
  console.error('Error updating package.json:', error);
}

// Ensure the server script exists
try {
  if (fs.existsSync('./domain-server.cjs')) {
    console.log('domain-server.cjs exists, proceeding with deployment...');
  } else {
    console.error('Error: domain-server.cjs not found!');
    process.exit(1);
  }
} catch (error) {
  console.error('Error checking server script:', error);
  process.exit(1);
}

// Start the server
require('./domain-server.cjs');