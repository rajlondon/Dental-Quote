/**
 * Test Runner Script for MyDentalFly
 * 
 * This script runs Jest tests for the application
 * Usage: node run-tests.js
 */

const { execSync } = require('child_process');
const path = require('path');

// Set environment variables for testing
process.env.NODE_ENV = 'test';

console.log('Running tests...');

try {
  // Run Jest with the config file
  execSync('npx jest --config=jest.config.ts', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname)
  });
  
  console.log('✅ All tests passed!');
} catch (error) {
  console.error('❌ Some tests failed');
  process.exit(1);
}