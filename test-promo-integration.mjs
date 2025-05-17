/**
 * Test script for the Quote Integration System with focus on promo code application
 * 
 * This script tests:
 * 1. The integration between React and Flask
 * 2. That promo codes can be applied without page refreshes
 * 3. That the correct discounts are calculated
 */

import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = 'http://localhost:3000/api/quote/integration';
const PROMO_CODES = {
  SUMMER15: { type: 'percentage', value: 15 },
  DENTAL25: { type: 'percentage', value: 25 },
  NEWPATIENT: { type: 'percentage', value: 20 },
  TEST10: { type: 'percentage', value: 10 },
  FREECONSULT: { type: 'fixed_amount', value: 75 },
  LUXHOTEL20: { type: 'percentage', value: 20 },
  IMPLANTCROWN30: { type: 'percentage', value: 30 },
  FREEWHITE: { type: 'fixed_amount', value: 150 },
  LUXTRAVEL: { type: 'fixed_amount', value: 80 }
};

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

// Test applying a promo code
async function testPromoCodeApplication() {
  log('=== Testing Promo Code Application ===', 'info');
  
  try {
    // Initialize a new quote
    log('1. Initializing a new quote session...', 'info');
    const initResponse = await fetch(`${API_BASE_URL}/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!initResponse.ok) {
      throw new Error(`Failed to initialize quote: ${initResponse.statusText}`);
    }
    
    log('✓ Successfully initialized quote session', 'success');
    
    // Add a test treatment to the quote
    log('2. Adding a test treatment to the quote...', 'info');
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
    
    // Apply a promo code
    const promoCode = 'DENTAL25';
    log(`3. Applying promo code "${promoCode}"...`, 'info');
    const applyPromoResponse = await fetch(`${API_BASE_URL}/apply-promo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoCode })
    });
    
    if (!applyPromoResponse.ok) {
      throw new Error(`Failed to apply promo code: ${applyPromoResponse.statusText}`);
    }
    
    const promoData = await applyPromoResponse.json();
    
    // Verify the discount calculation
    const expectedDiscount = promoData.subtotal * (PROMO_CODES[promoCode].value / 100);
    const discountDiff = Math.abs(promoData.discountAmount - expectedDiscount);
    
    if (discountDiff < 0.01) {
      log(`✓ Successfully applied promo code "${promoCode}"`, 'success');
      log(`  Subtotal: ${promoData.subtotal}`, 'info');
      log(`  Discount: ${promoData.discountAmount} (${PROMO_CODES[promoCode].value}%)`, 'info');
      log(`  Total: ${promoData.total}`, 'info');
    } else {
      throw new Error(`Discount calculation incorrect. Expected ${expectedDiscount}, got ${promoData.discountAmount}`);
    }
    
    // Clear the promo code
    log('4. Clearing promo code...', 'info');
    const clearPromoResponse = await fetch(`${API_BASE_URL}/clear-promo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!clearPromoResponse.ok) {
      throw new Error(`Failed to clear promo code: ${clearPromoResponse.statusText}`);
    }
    
    const clearPromoData = await clearPromoResponse.json();
    
    if (clearPromoData.discountAmount === 0) {
      log('✓ Successfully cleared promo code', 'success');
    } else {
      throw new Error(`Promo code was not properly cleared. Discount amount is still ${clearPromoData.discountAmount}`);
    }
    
    return true;
  } catch (error) {
    log(`Error in testPromoCodeApplication: ${error.message}`, 'error');
    return false;
  }
}

// Test special offer promo codes
async function testSpecialOfferPromoCode() {
  log('=== Testing Special Offer Promo Code ===', 'info');
  
  try {
    // Initialize a new quote
    log('1. Initializing a new quote session...', 'info');
    const initResponse = await fetch(`${API_BASE_URL}/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!initResponse.ok) {
      throw new Error(`Failed to initialize quote: ${initResponse.statusText}`);
    }
    
    log('✓ Successfully initialized quote session', 'success');
    
    // Process a special offer by ID
    const offerId = '3e6a315d-9d9f-4b56-97da-4b3d4b4b5367'; // The Implant + Crown bundle
    log(`2. Processing special offer "${offerId}"...`, 'info');
    const processOfferResponse = await fetch(`${API_BASE_URL}/process-offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId })
    });
    
    if (!processOfferResponse.ok) {
      throw new Error(`Failed to process special offer: ${processOfferResponse.statusText}`);
    }
    
    const offerData = await processOfferResponse.json();
    
    // Verify treatments were added and promo code was applied
    if (offerData.treatments.length > 0 && offerData.promoCode === 'IMPLANTCROWN30') {
      log(`✓ Successfully processed special offer`, 'success');
      log(`  Treatments added: ${offerData.treatments.length}`, 'info');
      log(`  Promo code applied: ${offerData.promoCode}`, 'info');
      log(`  Subtotal: ${offerData.subtotal}`, 'info');
      log(`  Discount: ${offerData.discountAmount}`, 'info');
      log(`  Total: ${offerData.total}`, 'info');
    } else {
      throw new Error(`Special offer was not properly processed. Treatments: ${offerData.treatments.length}, PromoCode: ${offerData.promoCode}`);
    }
    
    return true;
  } catch (error) {
    log(`Error in testSpecialOfferPromoCode: ${error.message}`, 'error');
    return false;
  }
}

// Test applying an invalid promo code
async function testInvalidPromoCode() {
  log('=== Testing Invalid Promo Code ===', 'info');
  
  try {
    // Initialize a new quote
    log('1. Initializing a new quote session...', 'info');
    const initResponse = await fetch(`${API_BASE_URL}/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!initResponse.ok) {
      throw new Error(`Failed to initialize quote: ${initResponse.statusText}`);
    }
    
    // Add a test treatment to the quote
    log('2. Adding a test treatment to the quote...', 'info');
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
    
    // Apply an invalid promo code
    const invalidPromoCode = 'INVALID123';
    log(`3. Applying invalid promo code "${invalidPromoCode}"...`, 'info');
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

// Run all tests
async function runTests() {
  log('Starting Promo Code Integration Tests...', 'info');
  
  let failures = 0;
  
  // Test 1: Regular promo code application
  if (await testPromoCodeApplication()) {
    log('Test 1 PASSED: Promo code application', 'success');
  } else {
    log('Test 1 FAILED: Promo code application', 'error');
    failures++;
  }
  
  // Test 2: Special offer promo code
  if (await testSpecialOfferPromoCode()) {
    log('Test 2 PASSED: Special offer promo code', 'success');
  } else {
    log('Test 2 FAILED: Special offer promo code', 'error');
    failures++;
  }
  
  // Test 3: Invalid promo code
  if (await testInvalidPromoCode()) {
    log('Test 3 PASSED: Invalid promo code rejection', 'success');
  } else {
    log('Test 3 FAILED: Invalid promo code rejection', 'error');
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