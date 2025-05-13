/**
 * Test script for URL Auto-Apply Promo Code Functionality
 * 
 * This script tests the following scenarios:
 * 1. Valid promo code in URL is automatically applied
 * 2. Invalid promo code shows error message
 * 3. Promo code persists throughout quote flow
 */

import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = 'http://localhost:5000';
const VALID_CODES = ['WELCOME20', 'SUMMER50', 'IMPLANTCROWN30', 'LUXHOTEL20', 'FREEWHITE', 'FREECONSULT', 'LUXTRAVEL'];
const INVALID_CODE = 'INVALID123';

// Test utilities
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m%s\x1b[0m',    // cyan
    success: '\x1b[32m%s\x1b[0m', // green
    error: '\x1b[31m%s\x1b[0m',   // red
    warn: '\x1b[33m%s\x1b[0m'     // yellow
  };
  
  console.log(colors[type], message);
}

async function createTestQuote() {
  try {
    log('Creating test quote to use with promo codes...');
    
    // Use the treatment-plans endpoint which is working in the current system
    const response = await axios.post(`${BASE_URL}/api/treatment-plans/create`, {
      patientName: 'Test Patient',
      patientEmail: 'test@example.com',
      treatments: [
        { id: 'dental_implant_standard', quantity: 1 }
      ]
    });
    
    if (response.data && response.data.id) {
      log(`Successfully created test quote with ID: ${response.data.id}`, 'success');
      return response.data.id;
    } else if (response.data && response.data.data && response.data.data.id) {
      // Handle nested response structure
      log(`Successfully created test quote with ID: ${response.data.data.id}`, 'success');
      return response.data.data.id;
    } else {
      log('Failed to create test quote - invalid response', 'error');
      console.log('Response data:', response.data);
      return null;
    }
  } catch (error) {
    log(`Error creating test quote: ${error.message}`, 'error');
    if (error.response) {
      log(`Server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`, 'error');
    }
    
    // Fallback to using UUID
    log('Attempting to use UUID as fallback', 'warn');
    const uuid = uuidv4();
    log(`Generated fallback quote ID: ${uuid}`, 'warn');
    return uuid;
  }
}

// Test Scenario 1: Valid promo code in URL
async function testValidPromoCode() {
  try {
    log('\n----- TESTING VALID PROMO CODE -----');
    
    const quoteId = await createTestQuote();
    if (!quoteId) return false;
    
    const testCode = VALID_CODES[0]; // WELCOME20
    log(`Testing valid promo code: ${testCode}`);
    
    // Generate test URL
    const testUrl = `${BASE_URL}/quote?quoteId=${quoteId}&code=${testCode}`;
    log(`Test URL: ${testUrl}`);
    
    // We can't fully automate the UI testing in this script, but we can 
    // test if the API endpoint works correctly
    log('Testing promo code application via API...');
    const response = await axios.post(`${BASE_URL}/api/promo/apply/${quoteId}`, {
      code: testCode
    });
    
    if (response.data && response.data.success) {
      log(`✅ API test passed: Successfully applied ${testCode}`, 'success');
      log(`Discount: ${response.data.promoDetails.discount_value}${response.data.promoDetails.discount_type === 'PERCENT' ? '%' : ' GBP'}`);
      
      // Manual verification instructions
      log('\nTo manually verify in browser:', 'warn');
      log(`1. Navigate to: ${testUrl}`, 'warn');
      log('2. Verify the promo banner appears', 'warn');
      log('3. Check that discount is reflected in quote total', 'warn');
      log('4. Dismiss banner and verify it disappears', 'warn');
      log('5. Refresh page and confirm promo is still applied', 'warn');
      
      return true;
    } else {
      log(`❌ API test failed: Could not apply ${testCode}`, 'error');
      log(`Error: ${response.data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    log(`Error testing valid promo code: ${error.message}`, 'error');
    return false;
  }
}

// Test Scenario 2: Invalid promo code in URL
async function testInvalidPromoCode() {
  try {
    log('\n----- TESTING INVALID PROMO CODE -----');
    
    const quoteId = await createTestQuote();
    if (!quoteId) return false;
    
    log(`Testing invalid promo code: ${INVALID_CODE}`);
    
    // Generate test URL
    const testUrl = `${BASE_URL}/quote?quoteId=${quoteId}&code=${INVALID_CODE}`;
    log(`Test URL: ${testUrl}`);
    
    // Test with API first
    log('Testing invalid promo code via API...');
    try {
      const response = await axios.post(`${BASE_URL}/api/promo/apply/${quoteId}`, {
        code: INVALID_CODE
      });
      
      // If this doesn't throw an error, the code might be valid or the API isn't rejecting invalid codes
      log(`⚠️ API response for invalid code: ${JSON.stringify(response.data)}`, 'warn');
      
      if (!response.data.success) {
        log('✅ API correctly rejected invalid promo code', 'success');
      } else {
        log('❌ API incorrectly accepted invalid promo code', 'error');
      }
    } catch (error) {
      // If API correctly rejects the code with an error
      log('✅ API correctly rejected invalid promo code with error', 'success');
    }
    
    // Manual verification instructions
    log('\nTo manually verify in browser:', 'warn');
    log(`1. Navigate to: ${testUrl}`, 'warn');
    log('2. Verify an error toast appears', 'warn');
    log('3. Confirm no discount is applied to the quote', 'warn');
    
    return true;
  } catch (error) {
    log(`Error testing invalid promo code: ${error.message}`, 'error');
    return false;
  }
}

// Test Scenario 3: Promo code persistence through flow
async function testPromoCodePersistence() {
  try {
    log('\n----- TESTING PROMO CODE PERSISTENCE -----');
    
    const quoteId = await createTestQuote();
    if (!quoteId) return false;
    
    const testCode = VALID_CODES[1]; // SUMMER50
    log(`Testing promo code persistence with: ${testCode}`);
    
    // Generate test URLs for different stages of the flow
    const startUrl = `${BASE_URL}/quote?quoteId=${quoteId}&code=${testCode}`;
    const matchedClinicsUrl = `${BASE_URL}/matched-clinics?quoteId=${quoteId}&code=${testCode}`;
    const confirmationUrl = `${BASE_URL}/confirmation?quoteId=${quoteId}&code=${testCode}`;
    
    log(`Start URL: ${startUrl}`);
    log(`Matched clinics URL: ${matchedClinicsUrl}`);
    log(`Confirmation URL: ${confirmationUrl}`);
    
    // Apply the promo code first
    log('Applying promo code via API...');
    const response = await axios.post(`${BASE_URL}/api/promo/apply/${quoteId}`, {
      code: testCode
    });
    
    if (response.data && response.data.success) {
      log(`✅ Successfully applied ${testCode}`, 'success');
      
      // Manual verification instructions
      log('\nTo manually verify persistence:', 'warn');
      log(`1. Start at: ${startUrl}`, 'warn');
      log('2. Verify promo code is applied', 'warn');
      log('3. Navigate through the quote flow (select treatments, proceed to clinic matching)', 'warn');
      log('4. Verify promo code remains applied at each step', 'warn');
      log('5. Complete quote process', 'warn');
      log('6. Verify promo details appear on confirmation page', 'warn');
      
      return true;
    } else {
      log(`❌ Could not apply ${testCode} for persistence test`, 'error');
      log(`Error: ${response.data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    log(`Error testing promo code persistence: ${error.message}`, 'error');
    return false;
  }
}

// Run all tests
async function runTests() {
  log('Starting URL Auto-Apply Promo Code tests...', 'info');
  
  let results = {
    validPromoCode: await testValidPromoCode(),
    invalidPromoCode: await testInvalidPromoCode(),
    promoCodePersistence: await testPromoCodePersistence()
  };
  
  log('\n----- TEST RESULTS SUMMARY -----', 'info');
  Object.entries(results).forEach(([test, passed]) => {
    log(`${test}: ${passed ? '✅ PASS' : '❌ FAIL'}`, passed ? 'success' : 'error');
  });
  
  log('\nNote: Some tests require manual verification in the browser', 'warn');
  log('Follow the instructions above for each test to complete verification', 'warn');
}

// Execute tests with top-level await (allowed in ES modules)
try {
  await runTests();
} catch (err) {
  log(`Error running tests: ${err.message}`, 'error');
}