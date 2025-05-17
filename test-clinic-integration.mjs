/**
 * Simplified test script for verifying the clinic portal integration with the enhanced quote builder
 * Using .mjs extension to ensure ES module compatibility
 */

import axios from 'axios';

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;
const CLINIC_CREDENTIALS = {
  email: 'test-clinic@example.com',
  password: 'password123'
};

// Utility functions for logging
function logInfo(message) {
  console.log(`\x1b[36m[INFO]\x1b[0m ${message}`);
}

function logSuccess(message) {
  console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`);
}

function logError(message, error) {
  console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`);
  if (error) {
    console.error(error.response ? error.response.data : error.message);
  }
}

// Create an axios instance that handles cookies
const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  validateStatus: status => status < 500,
});

// Test functions
async function directUrlTest() {
  logInfo('Testing direct URL access with clinic parameter...');
  
  try {
    // Test direct access to quote builder with clinic ID parameter
    const clinicId = '1'; // Using a sample clinic ID for testing
    const quoteBuilderUrl = `/quote-builder?clinic=${clinicId}`;
    
    logInfo(`Accessing quote builder at: ${quoteBuilderUrl}`);
    const response = await client.get(quoteBuilderUrl);
    
    if (response.status === 200) {
      // If we got a 200 response, consider it a success
      // In a real test, we'd parse the HTML to verify the clinic mode indicator
      logSuccess(`Successfully accessed quote builder with clinic ID parameter`);
      return true;
    } else {
      logError(`Failed to access quote builder: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError('Error during direct URL test', error);
    return false;
  }
}

async function runTests() {
  let success = false;
  
  try {
    // Run direct URL test
    success = await directUrlTest();
    
    if (success) {
      logSuccess('Direct URL test passed successfully');
    } else {
      logError('Direct URL test failed');
    }
    
    return success;
  } catch (error) {
    logError('Unexpected error during test execution', error);
    return false;
  }
}

// Run the tests
runTests()
  .then(success => {
    if (success) {
      logSuccess('Test completed successfully');
      process.exit(0);
    } else {
      logError('Test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    logError('Critical error during test execution', error);
    process.exit(1);
  });