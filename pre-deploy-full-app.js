/**
 * Pre-deployment script for full MyDentalFly application
 * This script prepares the environment for deploying the complete app
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Preparing full application for deployment...');

try {
  // Update .replit.deploy configuration
  console.log('Updating deployment configuration...');
  
  fs.writeFileSync('./.replit.deploy', `run = "node dist/start.mjs"
entrypoint = "dist/start.mjs"`);

  // Build the full application
  console.log('Building full application...');
  execSync('node build-full-app.js');

  console.log('Pre-deployment tasks completed successfully!');
  console.log('Your application is ready to be deployed.');
} catch (error) {
  console.error('Pre-deployment preparation failed:', error);
  process.exit(1);
}