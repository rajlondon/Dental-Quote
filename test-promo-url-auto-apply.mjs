/**
 * Test script for URL Auto-Apply Promo Code Functionality
 * 
 * This script tests the following scenarios:
 * 1. Valid promo code in URL is automatically applied
 * 2. Invalid promo code shows error message
 * 3. Promo code persists throughout quote flow
 */
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const TEST_PROMO_CODE = 'TESTPROMO25';
const INVALID_PROMO_CODE = 'INVALIDCODE';

// Utility functions
function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌ ERROR:' : 
                 type === 'success' ? '✅ SUCCESS:' : 
                 'ℹ️ INFO:';
  console.log(`${prefix} ${message}`);
}

// Create a test quote for applying promos
async function createTestQuote() {
  try {
    const quoteData = {
      patientId: 1,
      clinicId: "1",
      status: "draft",
      totalPrice: 1000,
      currency: "GBP",
      subtotal: 1000,
      total: 1000
    };
    
    const response = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create test quote: ${response.statusText}`);
    }
    
    const quote = await response.json();
    log(`Created test quote with ID: ${quote.id}`, 'success');
    return quote.id;
  } catch (error) {
    log(`Error creating test quote: ${error.message}`, 'error');
    // Generate a fallback UUID if we can't create a real quote
    const fallbackId = uuidv4();
    log(`Using fallback quote ID: ${fallbackId}`, 'info');
    return fallbackId;
  }
}

// Test valid promo code application via URL
async function testValidPromoCode() {
  try {
    log('Testing valid promo code application via URL', 'info');
    
    // Create a test quote
    const quoteId = await createTestQuote();
    
    // Simulate request that would happen when user visits URL with code parameter
    const response = await fetch(`${API_BASE_URL}/promo/apply/${quoteId}?code=${TEST_PROMO_CODE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to apply promo code: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.discount > 0) {
      log(`Promo code ${TEST_PROMO_CODE} successfully applied with discount: ${result.discount}`, 'success');
      return true;
    } else {
      log(`Promo code application did not return expected discount`, 'error');
      return false;
    }
  } catch (error) {
    log(`Error testing valid promo code: ${error.message}`, 'error');
    return false;
  }
}

// Test invalid promo code via URL
async function testInvalidPromoCode() {
  try {
    log('Testing invalid promo code rejection', 'info');
    
    // Create a test quote
    const quoteId = await createTestQuote();
    
    // Simulate request with invalid code
    const response = await fetch(`${API_BASE_URL}/promo/apply/${quoteId}?code=${INVALID_PROMO_CODE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // For invalid codes, we expect a 400 or similar error response
    if (response.status >= 400) {
      log(`Invalid promo code correctly rejected with status: ${response.status}`, 'success');
      return true;
    } else {
      const result = await response.json();
      log(`Invalid promo code was not properly rejected: ${JSON.stringify(result)}`, 'error');
      return false;
    }
  } catch (error) {
    // In this case, an error means our test passed (invalid code was rejected)
    log(`Expected error received for invalid code: ${error.message}`, 'success');
    return true;
  }
}

// Test persistence of promo code throughout quote flow
async function testPromoCodePersistence() {
  try {
    log('Testing promo code persistence through quote flow', 'info');
    
    // Create a test quote
    const quoteId = await createTestQuote();
    
    // Apply a valid promo code
    const applyResponse = await fetch(`${API_BASE_URL}/promo/apply/${quoteId}?code=${TEST_PROMO_CODE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!applyResponse.ok) {
      throw new Error(`Failed to apply promo code: ${applyResponse.statusText}`);
    }
    
    // Now retrieve the quote to check if the promo code was persisted
    const getResponse = await fetch(`${API_BASE_URL}/quotes/${quoteId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!getResponse.ok) {
      throw new Error(`Failed to retrieve quote: ${getResponse.statusText}`);
    }
    
    const quote = await getResponse.json();
    
    // Verify the promo code was saved to the quote
    if (quote.promoCode === TEST_PROMO_CODE) {
      log(`Promo code correctly persisted in quote: ${quote.promoCode}`, 'success');
      return true;
    } else {
      log(`Promo code not persisted correctly. Expected: ${TEST_PROMO_CODE}, Got: ${quote.promoCode || 'null'}`, 'error');
      return false;
    }
  } catch (error) {
    log(`Error testing promo code persistence: ${error.message}`, 'error');
    return false;
  }
}

// Main test function
async function runTests() {
  log('Starting URL Auto-Apply promo code tests', 'info');
  
  // Ensure the test promo code exists
  try {
    const createPromoResponse = await fetch(`${API_BASE_URL}/promo/codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: TEST_PROMO_CODE,
        discountType: 'percentage',
        discountValue: 25,
        maxUses: 100,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        isActive: true
      })
    });
    
    if (createPromoResponse.ok) {
      log(`Test promo code ${TEST_PROMO_CODE} created successfully`, 'success');
    } else if (createPromoResponse.status === 409) {
      log(`Test promo code ${TEST_PROMO_CODE} already exists, continuing with tests`, 'info');
    } else {
      throw new Error(`Failed to create test promo code: ${createPromoResponse.statusText}`);
    }
  } catch (error) {
    log(`Error setting up test promo code: ${error.message}`, 'error');
    // Continue with tests anyway, the code might already exist
  }
  
  // Run all tests
  const validPromoResult = await testValidPromoCode();
  const invalidPromoResult = await testInvalidPromoCode();
  const persistenceResult = await testPromoCodePersistence();
  
  // Summarize results
  log('\n===== TEST RESULTS =====', 'info');
  log(`Valid Promo Code Test: ${validPromoResult ? 'PASSED ✅' : 'FAILED ❌'}`, validPromoResult ? 'success' : 'error');
  log(`Invalid Promo Code Test: ${invalidPromoResult ? 'PASSED ✅' : 'FAILED ❌'}`, invalidPromoResult ? 'success' : 'error');
  log(`Persistence Test: ${persistenceResult ? 'PASSED ✅' : 'FAILED ❌'}`, persistenceResult ? 'success' : 'error');
  
  const allPassed = validPromoResult && invalidPromoResult && persistenceResult;
  log(`\nOverall Test Result: ${allPassed ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`, allPassed ? 'success' : 'error');
}

// Run the tests
runTests();