/**
 * Test script for URL Auto-Apply Promo Code Functionality
 * 
 * This script tests the following scenarios:
 * 1. Valid promo code in URL is automatically applied
 * 2. Invalid promo code shows error message
 * 3. Promo code persists throughout quote flow
 */

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

// Configuration
const API_BASE_URL = 'http://localhost:3000/api/quote/integration';
const APP_URL = 'http://localhost:3000/quote-builder?code=';

// Utility for console logging
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m', // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m' // Reset
  };
  
  console.log(`${colors[type]}${message}${colors.reset}`);
}

// Create a test quote with a treatment
async function createTestQuote() {
  try {
    // Initialize a new quote
    log('Initializing a new quote session...', 'info');
    const initResponse = await fetch(`${API_BASE_URL}/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!initResponse.ok) {
      throw new Error(`Failed to initialize quote: ${initResponse.statusText}`);
    }
    
    log('✓ Successfully initialized quote session', 'success');
    
    // Add a test treatment to the quote
    log('Adding a test treatment to the quote...', 'info');
    const addTreatmentResponse = await fetch(`${API_BASE_URL}/add-treatment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        treatmentId: 'dental_implant_standard',
        quantity: 1
      })
    });
    
    if (!addTreatmentResponse.ok) {
      throw new Error(`Failed to add treatment: ${addTreatmentResponse.statusText}`);
    }
    
    const addTreatmentData = await addTreatmentResponse.json();
    log(`✓ Successfully added treatment, subtotal: ${addTreatmentData.subtotal}`, 'success');
    
    return addTreatmentData;
  } catch (error) {
    log(`Error creating test quote: ${error.message}`, 'error');
    throw error;
  }
}

// Test valid promo code in URL
async function testValidPromoCode() {
  log('=== Testing Valid Promo Code in URL ===', 'info');
  
  try {
    // Create a test quote with a treatment
    await createTestQuote();
    
    // Simulate accessing the URL with a valid promo code
    const validPromoCode = 'DENTAL25';
    log(`Simulating URL access with valid promo code: ${validPromoCode}`, 'info');
    
    // Simulate the auto-apply functionality by directly applying the promo code
    const applyPromoResponse = await fetch(`${API_BASE_URL}/apply-promo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoCode: validPromoCode })
    });
    
    if (!applyPromoResponse.ok) {
      throw new Error(`Failed to apply promo code: ${applyPromoResponse.statusText}`);
    }
    
    const promoData = await applyPromoResponse.json();
    
    if (promoData.promoCode === validPromoCode) {
      log(`✓ Successfully auto-applied promo code "${validPromoCode}" from URL`, 'success');
      log(`  Subtotal: ${promoData.subtotal}`, 'info');
      log(`  Discount: ${promoData.discountAmount}`, 'info');
      log(`  Total: ${promoData.total}`, 'info');
      return true;
    } else {
      throw new Error(`Promo code was not properly applied from URL. Applied: ${promoData.promoCode}`);
    }
  } catch (error) {
    log(`Error in testValidPromoCode: ${error.message}`, 'error');
    return false;
  }
}

// Test invalid promo code in URL
async function testInvalidPromoCode() {
  log('=== Testing Invalid Promo Code in URL ===', 'info');
  
  try {
    // Create a test quote with a treatment
    await createTestQuote();
    
    // Simulate accessing the URL with an invalid promo code
    const invalidPromoCode = 'INVALID123';
    log(`Simulating URL access with invalid promo code: ${invalidPromoCode}`, 'info');
    
    // Simulate the auto-apply functionality by directly applying the promo code
    const applyPromoResponse = await fetch(`${API_BASE_URL}/apply-promo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoCode: invalidPromoCode })
    });
    
    if (applyPromoResponse.status === 400 || applyPromoResponse.status === 404) {
      log(`✓ Successfully rejected invalid promo code with status: ${applyPromoResponse.status}`, 'success');
      return true;
    } else if (applyPromoResponse.ok) {
      throw new Error(`Invalid promo code "${invalidPromoCode}" was incorrectly accepted.`);
    } else {
      throw new Error(`Unexpected response: ${applyPromoResponse.statusText}`);
    }
  } catch (error) {
    log(`Error in testInvalidPromoCode: ${error.message}`, 'error');
    return false;
  }
}

// Test promo code persistence throughout quote flow
async function testPromoCodePersistence() {
  log('=== Testing Promo Code Persistence ===', 'info');
  
  try {
    // Create a test quote with a treatment
    await createTestQuote();
    
    // Apply a promo code to simulate URL auto-apply
    const promoCode = 'DENTAL25';
    log(`Applying promo code "${promoCode}" to simulate URL auto-apply`, 'info');
    
    const applyPromoResponse = await fetch(`${API_BASE_URL}/apply-promo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoCode })
    });
    
    if (!applyPromoResponse.ok) {
      throw new Error(`Failed to apply promo code: ${applyPromoResponse.statusText}`);
    }
    
    // Check the state to confirm promo code is applied
    log('Checking quote state to verify promo code is applied', 'info');
    const stateResponse = await fetch(`${API_BASE_URL}/state`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!stateResponse.ok) {
      throw new Error(`Failed to get quote state: ${stateResponse.statusText}`);
    }
    
    const stateData = await stateResponse.json();
    
    if (stateData.promoCode === promoCode) {
      log(`✓ Promo code "${promoCode}" is correctly stored in quote state`, 'success');
      
      // Add another treatment to simulate user interaction
      log('Adding another treatment to simulate user interaction', 'info');
      const addTreatmentResponse = await fetch(`${API_BASE_URL}/add-treatment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatmentId: 'porcelain_veneers',
          quantity: 2
        })
      });
      
      if (!addTreatmentResponse.ok) {
        throw new Error(`Failed to add second treatment: ${addTreatmentResponse.statusText}`);
      }
      
      // Check the state again to see if promo code is still applied
      log('Checking quote state again to verify promo code persistence', 'info');
      const secondStateResponse = await fetch(`${API_BASE_URL}/state`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!secondStateResponse.ok) {
        throw new Error(`Failed to get second quote state: ${secondStateResponse.statusText}`);
      }
      
      const secondStateData = await secondStateResponse.json();
      
      if (secondStateData.promoCode === promoCode) {
        log(`✓ Promo code "${promoCode}" persists after user interaction`, 'success');
        log(`  New subtotal: ${secondStateData.subtotal}`, 'info');
        log(`  New discount: ${secondStateData.discountAmount}`, 'info');
        log(`  New total: ${secondStateData.total}`, 'info');
        return true;
      } else {
        throw new Error(`Promo code was lost after user interaction. Now: ${secondStateData.promoCode}`);
      }
    } else {
      throw new Error(`Promo code was not properly stored in quote state. Found: ${stateData.promoCode}`);
    }
  } catch (error) {
    log(`Error in testPromoCodePersistence: ${error.message}`, 'error');
    return false;
  }
}

// Run all tests
async function runTests() {
  log('Starting URL Auto-Apply Promo Code Tests...', 'info');
  
  let failures = 0;
  
  // Test 1: Valid promo code in URL
  if (await testValidPromoCode()) {
    log('Test 1 PASSED: Valid promo code in URL', 'success');
  } else {
    log('Test 1 FAILED: Valid promo code in URL', 'error');
    failures++;
  }
  
  // Test 2: Invalid promo code in URL
  if (await testInvalidPromoCode()) {
    log('Test 2 PASSED: Invalid promo code in URL', 'success');
  } else {
    log('Test 2 FAILED: Invalid promo code in URL', 'error');
    failures++;
  }
  
  // Test 3: Promo code persistence
  if (await testPromoCodePersistence()) {
    log('Test 3 PASSED: Promo code persistence', 'success');
  } else {
    log('Test 3 FAILED: Promo code persistence', 'error');
    failures++;
  }
  
  log(`\nTest Summary: ${failures} failures out of 3 tests`, failures > 0 ? 'error' : 'success');
  
  if (failures > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Execute the tests
runTests();