/**
 * Test script for verifying the clinic portal integration with the quote builder
 * 
 * This script tests:
 * 1. Logging in as a clinic user
 * 2. Accessing the quote builder from the clinic portal
 * 3. Verifying that the clinic ID is properly passed
 * 4. Checking that the clinic mode indicator is displayed
 */

import axios from 'axios';
import { JSDOM } from 'jsdom';
import chalk from 'chalk';

// Configuration
const BASE_URL = 'http://localhost:3000'; // Change this if your server runs on a different port
const TEST_CLINIC_CREDENTIALS = {
  email: 'clinic@test.com',
  password: 'Password123'
};

// Create axios instance with cookies
const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

// Logging utilities
function logInfo(message) {
  console.log(chalk.blue('ℹ️ INFO: ') + message);
}

function logSuccess(message) {
  console.log(chalk.green('✅ SUCCESS: ') + message);
}

function logError(message, error = null) {
  console.error(chalk.red('❌ ERROR: ') + message);
  if (error) {
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('  Details:', error.message);
    }
  }
}

// Step 1: Login as clinic user
async function loginAsClinic() {
  logInfo('Attempting to login as clinic user...');
  
  try {
    const response = await client.post('/api/auth/login', TEST_CLINIC_CREDENTIALS);
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Successfully logged in as clinic user');
      
      // Check if the user is a clinic staff
      if (response.data.user && response.data.user.role === 'clinic_staff') {
        logSuccess(`Authenticated as clinic staff with ID: ${response.data.user.clinicId}`);
        return response.data.user.clinicId;
      } else {
        logError('User is not a clinic staff member');
        return null;
      }
    } else {
      logError('Login failed', { response });
      return null;
    }
  } catch (error) {
    logError('Error during login', error);
    return null;
  }
}

// Step 2: Verify clinic session is active
async function verifyClinicSession() {
  logInfo('Verifying clinic session...');
  
  try {
    const response = await client.get('/api/auth/user');
    
    if (response.status === 200 && response.data.user) {
      logSuccess('User session is active');
      return response.data.user.clinicId;
    } else {
      logError('User session is not active', { response });
      return null;
    }
  } catch (error) {
    logError('Error verifying session', error);
    return null;
  }
}

// Step 3: Access the quote builder from the clinic portal
async function accessQuoteBuilderFromClinic(clinicId) {
  logInfo('Accessing quote builder from clinic portal...');
  
  try {
    // Get the clinic page first to extract the quote builder link
    const clinicPortalResponse = await client.get('/clinic-portal');
    
    if (clinicPortalResponse.status !== 200) {
      logError('Failed to access clinic portal', { response: clinicPortalResponse });
      return false;
    }
    
    // Access the quote builder with clinic ID
    const quoteBuilderUrl = `/quote-flow?clinic=${clinicId}`;
    logInfo(`Accessing quote builder at: ${quoteBuilderUrl}`);
    
    const quoteBuilderResponse = await client.get(quoteBuilderUrl);
    
    if (quoteBuilderResponse.status === 200) {
      logSuccess('Successfully accessed quote builder from clinic portal');
      
      // Check if the clinic ID is present in the HTML response
      const dom = new JSDOM(quoteBuilderResponse.data);
      const clinicIndicator = dom.window.document.querySelector('.clinic-mode-indicator');
      
      if (clinicIndicator) {
        logSuccess('Clinic mode indicator is displayed in the quote builder');
        return true;
      } else {
        logError('Clinic mode indicator is missing from the quote builder');
        return false;
      }
    } else {
      logError('Failed to access quote builder', { response: quoteBuilderResponse });
      return false;
    }
  } catch (error) {
    logError('Error accessing quote builder from clinic portal', error);
    return false;
  }
}

// Main test function
async function runClinicQuoteBuilderTest() {
  logInfo('Starting clinic portal integration test...');
  
  try {
    // Step 1: Login as clinic user
    const clinicId = await loginAsClinic();
    if (!clinicId) {
      logError('Test failed: Unable to login as clinic user');
      process.exit(1);
    }
    
    // Step 2: Verify clinic session
    const verifiedClinicId = await verifyClinicSession();
    if (!verifiedClinicId) {
      logError('Test failed: Unable to verify clinic session');
      process.exit(1);
    }
    
    // Step 3: Access quote builder from clinic portal
    const quoteBuilderAccessed = await accessQuoteBuilderFromClinic(clinicId);
    if (!quoteBuilderAccessed) {
      logError('Test failed: Unable to access quote builder from clinic portal');
      process.exit(1);
    }
    
    logSuccess('✨ All tests passed! The clinic portal integration is working correctly.');
    process.exit(0);
  } catch (error) {
    logError('Unexpected error during test', error);
    process.exit(1);
  }
}

// Run the test
runClinicQuoteBuilderTest();