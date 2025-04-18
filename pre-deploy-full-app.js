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

  // IMPORTANT REMINDER for Deployment Environment Variables
  console.log('\n\n========== IMPORTANT REMINDER ==========');
  console.log('Before deploying, please add these secrets to your deployment environment:');
  console.log(' 1. Go to the "Deployments" tab in Replit');
  console.log(' 2. Click on "Environment variables"');
  console.log(' 3. Add the following environment variables:');
  console.log('    - STRIPE_SECRET_KEY');
  console.log('    - STRIPE_PUBLIC_KEY');
  console.log('    - VITE_STRIPE_PUBLIC_KEY');
  console.log('========================================\n\n');

  console.log('Pre-deployment tasks completed successfully!');
  console.log('Your application is ready to be deployed.');
} catch (error) {
  console.error('Pre-deployment preparation failed:', error);
  process.exit(1);
}