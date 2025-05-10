/**
 * Test Runner Script for MyDentalFly
 * 
 * This script runs Jest tests for the application
 * Usage: node run-tests.mjs
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variables for testing
process.env.NODE_ENV = 'test';

console.log('Running tests...');

try {
  // Run Jest with the config file
  execSync('npx jest --config=jest.config.ts', {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('✅ All tests passed!');
} catch (error) {
  console.error('❌ Some tests failed');
  process.exit(1);
}