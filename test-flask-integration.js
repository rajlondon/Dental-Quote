/**
 * Test script for Flask integration with React
 * 
 * This script tests the communication between our Express server, Flask backend,
 * and React frontend to verify that the hybrid approach is working correctly.
 */
const axios = require('axios');
const chalk = require('chalk');

// Utility functions for output formatting
const log = {
  info: (msg) => console.log(chalk.blue('INFO: ') + msg),
  success: (msg) => console.log(chalk.green('SUCCESS: ') + msg),
  error: (msg) => console.log(chalk.red('ERROR: ') + msg),
  warning: (msg) => console.log(chalk.yellow('WARNING: ') + msg),
  step: (msg) => console.log(chalk.cyan('\n>> ') + chalk.cyan.bold(msg))
};

// Base URLs for different services
const EXPRESS_URL = 'http://localhost:3000'; // Express server
const FLASK_URL = 'http://localhost:8080';   // Flask server

// Test functions
async function testExpressServer() {
  log.step('Testing Express server health...');
  try {
    const response = await axios.get(`${EXPRESS_URL}/api/health`);
    if (response.status === 200 && response.data.status === 'ok') {
      log.success('Express server is running and healthy');
      return true;
    } else {
      log.error(`Express server returned unexpected response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    log.error(`Failed to connect to Express server: ${error.message}`);
    return false;
  }
}

async function testFlaskServer() {
  log.step('Testing Flask server connection...');
  try {
    const response = await axios.get(`${FLASK_URL}/api/special-offers`);
    if (response.status === 200 && Array.isArray(response.data)) {
      log.success(`Flask server is running and returned ${response.data.length} special offers`);
      return true;
    } else {
      log.error(`Flask server returned unexpected response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    log.error(`Failed to connect to Flask server: ${error.message}`);
    return false;
  }
}

async function testFlaskBridge() {
  log.step('Testing Flask bridge via Express server...');
  try {
    const response = await axios.get(`${EXPRESS_URL}/api/special-offers`);
    if (response.status === 200 && Array.isArray(response.data)) {
      log.success(`Flask bridge is working and returned ${response.data.length} special offers`);
      return true;
    } else {
      log.error(`Flask bridge returned unexpected response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    log.error(`Failed to connect to Flask bridge: ${error.message}`);
    return false;
  }
}

async function testPromoCode() {
  log.step('Testing promo code validation...');
  try {
    const validPromo = 'WELCOME10';
    const invalidPromo = 'INVALID';
    
    // Test valid promo code
    const validResponse = await axios.post(`${EXPRESS_URL}/api/apply-promo`, {
      promoCode: validPromo
    });
    
    if (validResponse.status === 200 && validResponse.data.success) {
      log.success(`Valid promo code "${validPromo}" was accepted`);
    } else {
      log.error(`Valid promo code "${validPromo}" was rejected: ${JSON.stringify(validResponse.data)}`);
      return false;
    }
    
    // Test invalid promo code
    try {
      const invalidResponse = await axios.post(`${EXPRESS_URL}/api/apply-promo`, {
        promoCode: invalidPromo
      });
      
      if (invalidResponse.status === 400 && !invalidResponse.data.success) {
        log.success(`Invalid promo code "${invalidPromo}" was correctly rejected`);
      } else {
        log.error(`Invalid promo code "${invalidPromo}" was incorrectly accepted: ${JSON.stringify(invalidResponse.data)}`);
        return false;
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log.success(`Invalid promo code "${invalidPromo}" was correctly rejected`);
      } else {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to test promo code: ${error.message}`);
    return false;
  }
}

async function testPackages() {
  log.step('Testing treatment packages API...');
  try {
    const response = await axios.get(`${EXPRESS_URL}/api/treatment-packages`);
    if (response.status === 200 && Array.isArray(response.data)) {
      log.success(`Treatment packages API returned ${response.data.length} packages`);
      return true;
    } else {
      log.error(`Treatment packages API returned unexpected response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    log.error(`Failed to get treatment packages: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  log.info('Starting integration tests for MyDentalFly Hybrid Quote System');
  
  let success = true;
  
  success = await testExpressServer() && success;
  success = await testFlaskServer() && success;
  success = await testFlaskBridge() && success;
  success = await testPromoCode() && success;
  success = await testPackages() && success;
  
  log.step('Integration test summary');
  if (success) {
    log.success('All integration tests passed successfully!');
    log.info('The hybrid approach between React and Flask is working correctly.');
  } else {
    log.error('One or more integration tests failed.');
    log.info('Please check the logs above for specific errors and troubleshooting.');
  }
}

// Run the tests
runTests().catch(error => {
  log.error(`Unexpected error during test execution: ${error.message}`);
  process.exit(1);
});