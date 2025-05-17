/**
 * Test script for verifying the clinic portal integration with the enhanced quote builder
 * 
 * This script tests the complete flow of:
 * 1. Logging in as a clinic user
 * 2. Accessing the quote builder from the clinic portal
 * 3. Verifying that the clinic ID is properly passed and displayed
 */

const axios = require('axios');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
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

// Store cookies between requests
const cookieJar = {};

client.interceptors.response.use(response => {
  const setCookieHeader = response.headers['set-cookie'];
  if (setCookieHeader) {
    setCookieHeader.forEach(cookie => {
      const cookiePart = cookie.split(';')[0];
      const [name, value] = cookiePart.split('=');
      cookieJar[name] = value;
    });
  }
  return response;
});

client.interceptors.request.use(config => {
  const cookieString = Object.entries(cookieJar)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  
  if (cookieString) {
    config.headers.Cookie = cookieString;
  }
  return config;
});

// Test functions
async function loginAsClinic() {
  logInfo('Attempting to log in as clinic user...');
  
  try {
    const response = await client.post(`${API_BASE_URL}/clinic/login`, CLINIC_CREDENTIALS);
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Successfully logged in as clinic user');
      return response.data.user;
    } else {
      logError('Failed to log in as clinic user', { response });
      return null;
    }
  } catch (error) {
    logError('Error during clinic login', error);
    return null;
  }
}

async function verifyClinicSession() {
  logInfo('Verifying clinic session...');
  
  try {
    const response = await client.get(`${API_BASE_URL}/clinic/session`);
    
    if (response.status === 200 && response.data.authenticated) {
      logSuccess('Clinic session is active');
      return true;
    } else {
      logError('Clinic session is not active', { response });
      return false;
    }
  } catch (error) {
    logError('Error verifying clinic session', error);
    return false;
  }
}

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
    const quoteBuilderUrl = `/quote-builder?clinic=${clinicId}`;
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

async function runClinicQuoteBuilderTest() {
  logInfo('Starting clinic quote builder integration test...');
  
  try {
    // Step 1: Login as clinic user
    const clinicUser = await loginAsClinic();
    if (!clinicUser) {
      logError('Test failed: Cannot proceed without clinic login');
      return false;
    }
    
    // Step 2: Verify clinic session
    const sessionActive = await verifyClinicSession();
    if (!sessionActive) {
      logError('Test failed: Clinic session is not active');
      return false;
    }
    
    // Step 3: Access quote builder from clinic portal
    const clinicId = clinicUser.id;
    const quoteBuilderAccessed = await accessQuoteBuilderFromClinic(clinicId);
    
    if (quoteBuilderAccessed) {
      logSuccess('Test passed: Successfully verified clinic portal integration with quote builder');
      return true;
    } else {
      logError('Test failed: Could not verify clinic portal integration with quote builder');
      return false;
    }
  } catch (error) {
    logError('Unexpected error during test execution', error);
    return false;
  }
}

// Run the tests
runClinicQuoteBuilderTest()
  .then(success => {
    if (success) {
      logSuccess('All tests completed successfully');
      process.exit(0);
    } else {
      logError('Tests failed');
      process.exit(1);
    }
  })
  .catch(error => {
    logError('Critical error during test execution', error);
    process.exit(1);
  });