/**
 * Pre-deployment script for MyDentalFly without any secrets/environment variables
 * 
 * This script prepares a deployment that doesn't rely on any secrets
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Preparing zero-dependency deployment...');

try {
  // Update .replit.deploy configuration
  console.log('Updating deployment configuration...');
  
  fs.writeFileSync('./.replit.deploy', `run = "node dist/start.mjs"
entrypoint = "dist/start.mjs"`);

  // Build the application without secrets
  console.log('Building application without secrets dependency...');
  execSync('node build-no-secrets.mjs');

  console.log('\n\n========== IMPORTANT INFO ==========');
  console.log('This deployment will work WITHOUT any environment variables or secrets.');
  console.log('It uses a simplified server with static data instead of connecting to external services.');
  console.log('This is perfect for a landing page or demo without requiring API keys.');
  console.log('=====================================\n\n');

  console.log('Pre-deployment tasks completed successfully!');
  console.log('Your application is ready to be deployed.');
} catch (error) {
  console.error('Pre-deployment preparation failed:', error);
  process.exit(1);
}