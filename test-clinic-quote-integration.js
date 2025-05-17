/**
 * Test script for the clinic portal integration with the enhanced quote builder
 * 
 * This script tests the following scenarios:
 * 1. Clinic staff can create new quotes via the enhanced quote builder
 * 2. Clinic ID is correctly passed from clinic portal to quote builder
 * 3. Promo codes can be applied through both clinic portal and URL parameters
 */

import axios from 'axios';
import { JSDOM } from 'jsdom';

// Configuration
const API_BASE_URL = 'http://localhost:5000';
const CLINIC_LOGIN_URL = `${API_BASE_URL}/clinic-login`;
const CLINIC_QUOTES_URL = `${API_BASE_URL}/clinic/quotes`;
const ENHANCED_QUOTE_URL = `${API_BASE_URL}/enhanced-quote`;

// Test credentials
const CLINIC_EMAIL = 'test.clinic@example.com';
const CLINIC_PASSWORD = 'clinicTest123!';

// Utility functions
function logInfo(message) {
  console.log(`\x1b[36m[INFO]\x1b[0m ${message}`);
}

function logSuccess(message) {
  console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`);
}

function logError(message, error) {
  console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`);
  if (error) {
    console.error(error);
  }
}

// Test functions
async function loginAsClinic() {
  logInfo('Logging in as clinic user...');
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/clinic/login`,
      { email: CLINIC_EMAIL, password: CLINIC_PASSWORD },
      { withCredentials: true }
    );
    
    if (response.data.success) {
      logSuccess(`Successfully logged in as clinic user with ID ${response.data.clinic.id}`);
      return response.data.clinic;
    } else {
      logError('Login failed', response.data);
      return null;
    }
  } catch (error) {
    logError('Error during login', error);
    return null;
  }
}

async function testCreateQuoteLink(clinicId) {
  logInfo(`Testing "Create New Quote" button for clinic ID: ${clinicId}`);
  
  try {
    // Get the clinic quotes page to check if our button is there
    const response = await axios.get(CLINIC_QUOTES_URL, { withCredentials: true });
    const dom = new JSDOM(response.data);
    
    // Find the Create New Quote button
    const createQuoteButton = Array.from(dom.window.document.querySelectorAll('button'))
      .find(btn => btn.textContent.includes('Create New Quote'));
    
    if (createQuoteButton) {
      // Extract the URL from the onClick handler
      const onClickText = createQuoteButton.getAttribute('onclick');
      const urlMatch = onClickText.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
      
      if (urlMatch && urlMatch[1].includes(`clinicId=${clinicId}`)) {
        logSuccess(`Found Create New Quote button with correct clinicId parameter: ${urlMatch[1]}`);
        return true;
      } else {
        logError(`Create New Quote button exists but with incorrect URL: ${urlMatch ? urlMatch[1] : 'No URL found'}`);
        return false;
      }
    } else {
      logError('Create New Quote button not found on clinic quotes page');
      return false;
    }
  } catch (error) {
    logError('Error testing Create Quote link', error);
    return false;
  }
}

async function testEnhancedQuoteBuilderWithClinicId(clinicId) {
  logInfo(`Testing enhanced quote builder with clinic ID: ${clinicId}`);
  
  try {
    // Visit the enhanced quote page with clinicId parameter
    const enhancedQuoteUrl = `${ENHANCED_QUOTE_URL}?clinicId=${clinicId}`;
    const response = await axios.get(enhancedQuoteUrl, { withCredentials: true });
    
    // Check if the page contains clinic mode indicators
    if (response.data.includes('Clinic Mode Active') || 
        response.data.includes(`clinicPreference: "${clinicId}"`) ||
        response.data.includes(`clinicPreference=${clinicId}`)) {
      logSuccess(`Enhanced quote builder correctly detects clinic ID: ${clinicId}`);
      return true;
    } else {
      logError('Enhanced quote builder does not properly detect clinic ID');
      return false;
    }
  } catch (error) {
    logError('Error testing enhanced quote builder with clinic ID', error);
    return false;
  }
}

async function testPromoCodeWithClinicId(clinicId, promoCode = 'WELCOME10') {
  logInfo(`Testing promo code "${promoCode}" with clinic ID: ${clinicId}`);
  
  try {
    // Visit the enhanced quote page with both clinicId and promo parameters
    const url = `${ENHANCED_QUOTE_URL}?clinicId=${clinicId}&promo=${promoCode}`;
    const response = await axios.get(url, { withCredentials: true });
    
    // Check if both clinic ID and promo code are detected
    if ((response.data.includes('Clinic Mode Active') || 
         response.data.includes(`clinicPreference: "${clinicId}"`)) && 
        (response.data.includes('Promo code applied') || 
         response.data.includes(`promoCode: "${promoCode}"`))) {
      logSuccess(`Both clinic ID: ${clinicId} and promo code: ${promoCode} correctly detected`);
      return true;
    } else {
      logError('Failed to detect both clinic ID and promo code');
      return false;
    }
  } catch (error) {
    logError('Error testing promo code with clinic ID', error);
    return false;
  }
}

// Main test runner
async function runTests() {
  logInfo('Starting clinic portal integration tests...');
  
  // Login as clinic user
  const clinic = await loginAsClinic();
  if (!clinic) {
    logError('Cannot continue tests without clinic login');
    return;
  }
  
  const clinicId = clinic.id.toString();
  
  // Run tests
  const tests = [
    { name: 'Create Quote Button', test: () => testCreateQuoteLink(clinicId) },
    { name: 'Enhanced Quote Builder with Clinic ID', test: () => testEnhancedQuoteBuilderWithClinicId(clinicId) },
    { name: 'Promo Code with Clinic ID', test: () => testPromoCodeWithClinicId(clinicId) }
  ];
  
  let passed = 0;
  for (const test of tests) {
    logInfo(`Running test: ${test.name}`);
    try {
      const result = await test.test();
      if (result) {
        logSuccess(`Test passed: ${test.name}`);
        passed++;
      } else {
        logError(`Test failed: ${test.name}`);
      }
    } catch (error) {
      logError(`Test error: ${test.name}`, error);
    }
  }
  
  // Print summary
  console.log('\n---------- TEST SUMMARY ----------');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${tests.length - passed}`);
  console.log('----------------------------------\n');
}

// Run the tests
runTests().catch(error => {
  logError('Unhandled error in test script', error);
});

// Export for module compatibility
export { runTests };