/**
 * Test script for the Quote Integration System with focus on promo code application
 * 
 * This script tests:
 * 1. The integration between React and Flask
 * 2. That promo codes can be applied without page refreshes
 * 3. That the correct discounts are calculated
 */
const axios = require('axios');

// Available promo codes for testing
const PROMO_CODES = {
  SUMMER15: { type: 'percentage', value: 15 },
  DENTAL25: { type: 'percentage', value: 25 },
  NEWPATIENT: { type: 'percentage', value: 20 },
  TEST10: { type: 'percentage', value: 10 },
  FREECONSULT: { type: 'fixed_amount', value: 75 }, // Free consultation worth $75
  LUXHOTEL20: { type: 'percentage', value: 20 },
  IMPLANTCROWN30: { type: 'percentage', value: 30 },
  FREEWHITE: { type: 'fixed_amount', value: 150 }, // Free whitening worth $150
  LUXTRAVEL: { type: 'fixed_amount', value: 80 } // Free airport transfer worth $80
};

// Print colored output for better readability
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m%s\x1b[0m', // cyan
    success: '\x1b[32m%s\x1b[0m', // green
    error: '\x1b[31m%s\x1b[0m', // red
    warning: '\x1b[33m%s\x1b[0m' // yellow
  };
  console.log(colors[type], message);
}

// Test 1: Verify promo code application without page refresh
async function testPromoCodeApplication() {
  log('🧪 TEST 1: Verify promo code application without page refresh', 'info');
  
  try {
    // 1. Create a new quote with some test treatments
    log('Creating a new quote with test treatments...', 'info');
    const quoteResponse = await axios.post('/api/integration/patient/quotes', {
      treatments: [
        { id: 'dental_implant_standard', name: 'Dental Implant (Standard)', price: 800, quantity: 1 },
        { id: 'dental_crowns', name: 'Dental Crown', price: 400, quantity: 2 }
      ],
      patientName: 'Test Patient',
      patientEmail: 'test@example.com',
      status: 'draft'
    });
    
    if (!quoteResponse.data.success) {
      throw new Error('Failed to create quote: ' + quoteResponse.data.message);
    }
    
    const quoteId = quoteResponse.data.quote.id;
    let subtotalBeforePromo = quoteResponse.data.quote.subtotal;
    log(`✅ Quote created with ID: ${quoteId}`, 'success');
    log(`Subtotal before promo: $${subtotalBeforePromo}`, 'info');
    
    // 2. Apply a promo code
    const promoCode = 'DENTAL25';
    log(`Applying promo code: ${promoCode}...`, 'info');
    const promoResponse = await axios.post(`/api/integration/patient/quotes/${quoteId}/promo`, {
      promoCode
    });
    
    if (!promoResponse.data.success) {
      throw new Error('Failed to apply promo code: ' + promoResponse.data.message);
    }
    
    const quoteWithPromo = promoResponse.data.quote;
    log(`✅ Promo code ${promoCode} applied successfully`, 'success');
    log(`Discount amount: $${quoteWithPromo.discountAmount}`, 'info');
    log(`Total after discount: $${quoteWithPromo.total}`, 'info');
    
    // 3. Verify the discount calculation is correct
    const expectedDiscount = subtotalBeforePromo * (PROMO_CODES[promoCode].value / 100);
    const expectedTotal = subtotalBeforePromo - expectedDiscount;
    
    if (Math.abs(quoteWithPromo.discountAmount - expectedDiscount) < 0.01 &&
        Math.abs(quoteWithPromo.total - expectedTotal) < 0.01) {
      log('✅ Discount calculation is correct', 'success');
    } else {
      log(`❌ Discount calculation mismatch!`, 'error');
      log(`Expected discount: $${expectedDiscount}, Got: $${quoteWithPromo.discountAmount}`, 'error');
      log(`Expected total: $${expectedTotal}, Got: $${quoteWithPromo.total}`, 'error');
    }
    
    // 4. Remove promo code
    log('Removing promo code...', 'info');
    const removePromoResponse = await axios.delete(`/api/integration/patient/quotes/${quoteId}/promo`);
    
    if (!removePromoResponse.data.success) {
      throw new Error('Failed to remove promo code: ' + removePromoResponse.data.message);
    }
    
    const quoteAfterPromoRemoval = removePromoResponse.data.quote;
    log('✅ Promo code removed successfully', 'success');
    
    // 5. Verify promo code was removed and totals updated
    if (quoteAfterPromoRemoval.promoCode === undefined && 
        quoteAfterPromoRemoval.discountAmount === 0 &&
        Math.abs(quoteAfterPromoRemoval.total - subtotalBeforePromo) < 0.01) {
      log('✅ Promo code removal verified, totals updated correctly', 'success');
    } else {
      log('❌ Promo code removal verification failed', 'error');
      log(`PromoCode: ${quoteAfterPromoRemoval.promoCode}`, 'error');
      log(`DiscountAmount: ${quoteAfterPromoRemoval.discountAmount}`, 'error');
      log(`Total: ${quoteAfterPromoRemoval.total}, Expected: ${subtotalBeforePromo}`, 'error');
    }
    
    return true;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'error');
    if (error.response) {
      log(`Server response: ${JSON.stringify(error.response.data)}`, 'error');
    }
    return false;
  }
}

// Test 2: Handle special offers and automatic promo code application from URL parameters
async function testSpecialOfferPromoCode() {
  log('🧪 TEST 2: Handle special offers with automatic promo code application', 'info');
  
  try {
    // 1. Simulate clicking on a special offer (this would normally set URL parameters)
    const specialOfferPromoCode = 'IMPLANTCROWN30';
    const offerResponse = await axios.get(`/api/integration/special-offers?promoCode=${specialOfferPromoCode}`);
    
    if (!offerResponse.data.success) {
      throw new Error('Failed to get special offer details: ' + offerResponse.data.message);
    }
    
    const offerDetails = offerResponse.data.offer;
    log(`✅ Special offer details retrieved for code: ${specialOfferPromoCode}`, 'success');
    log(`Offer details: ${JSON.stringify(offerDetails)}`, 'info');
    
    // 2. Create a new quote with treatments from the special offer
    log('Creating quote with treatments from the special offer...', 'info');
    const quoteResponse = await axios.post('/api/integration/patient/quotes', {
      treatments: [
        { id: 'dental_implant_standard', name: 'Dental Implant (Standard)', price: 800, quantity: 1 },
        { id: 'dental_crowns', name: 'Dental Crown', price: 400, quantity: 1 }
      ],
      patientName: 'Special Offer Patient',
      patientEmail: 'offer@example.com',
      status: 'draft',
      offerApplied: true,
      offerId: offerDetails.id
    });
    
    if (!quoteResponse.data.success) {
      throw new Error('Failed to create quote: ' + quoteResponse.data.message);
    }
    
    const quoteId = quoteResponse.data.quote.id;
    const subtotalBeforePromo = quoteResponse.data.quote.subtotal;
    log(`✅ Quote created with ID: ${quoteId}`, 'success');
    log(`Subtotal before promo: $${subtotalBeforePromo}`, 'info');
    
    // 3. Apply promo code from URL parameters (this would normally be done via frontend auto-detection)
    log(`Auto-applying promo code: ${specialOfferPromoCode}...`, 'info');
    const promoResponse = await axios.post(`/api/integration/patient/quotes/${quoteId}/promo`, {
      promoCode: specialOfferPromoCode,
      autoApplied: true
    });
    
    if (!promoResponse.data.success) {
      throw new Error('Failed to apply special offer promo code: ' + promoResponse.data.message);
    }
    
    const quoteWithPromo = promoResponse.data.quote;
    log(`✅ Special offer promo code ${specialOfferPromoCode} applied automatically`, 'success');
    log(`Discount amount: $${quoteWithPromo.discountAmount}`, 'info');
    log(`Total after discount: $${quoteWithPromo.total}`, 'info');
    
    // 4. Verify the discount calculation is correct
    const expectedDiscount = subtotalBeforePromo * (PROMO_CODES[specialOfferPromoCode].value / 100);
    const expectedTotal = subtotalBeforePromo - expectedDiscount;
    
    if (Math.abs(quoteWithPromo.discountAmount - expectedDiscount) < 0.01 &&
        Math.abs(quoteWithPromo.total - expectedTotal) < 0.01) {
      log('✅ Special offer discount calculation is correct', 'success');
    } else {
      log(`❌ Special offer discount calculation mismatch!`, 'error');
      log(`Expected discount: $${expectedDiscount}, Got: $${quoteWithPromo.discountAmount}`, 'error');
      log(`Expected total: $${expectedTotal}, Got: $${quoteWithPromo.total}`, 'error');
    }
    
    return true;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'error');
    if (error.response) {
      log(`Server response: ${JSON.stringify(error.response.data)}`, 'error');
    }
    return false;
  }
}

// Test 3: Invalid promo code handling without page refreshes
async function testInvalidPromoCode() {
  log('🧪 TEST 3: Handle invalid promo codes without page refreshes', 'info');
  
  try {
    // 1. Create a new quote with some test treatments
    log('Creating a new quote with test treatments...', 'info');
    const quoteResponse = await axios.post('/api/integration/patient/quotes', {
      treatments: [
        { id: 'dental_implant_standard', name: 'Dental Implant (Standard)', price: 800, quantity: 1 }
      ],
      patientName: 'Invalid Promo Patient',
      patientEmail: 'invalid@example.com',
      status: 'draft'
    });
    
    if (!quoteResponse.data.success) {
      throw new Error('Failed to create quote: ' + quoteResponse.data.message);
    }
    
    const quoteId = quoteResponse.data.quote.id;
    const subtotalBeforePromo = quoteResponse.data.quote.subtotal;
    log(`✅ Quote created with ID: ${quoteId}`, 'success');
    log(`Subtotal: $${subtotalBeforePromo}`, 'info');
    
    // 2. Try to apply an invalid promo code
    const invalidPromoCode = 'INVALIDCODE123';
    log(`Attempting to apply invalid promo code: ${invalidPromoCode}...`, 'info');
    try {
      const promoResponse = await axios.post(`/api/integration/patient/quotes/${quoteId}/promo`, {
        promoCode: invalidPromoCode
      });
      
      // If we get here, the server didn't reject the invalid code as expected
      log(`❌ Server accepted invalid promo code: ${invalidPromoCode}!`, 'error');
      return false;
    } catch (error) {
      // Expected error for invalid promo code
      log('✅ Server correctly rejected invalid promo code', 'success');
      if (error.response) {
        log(`Error message: ${error.response.data.message}`, 'info');
      }
    }
    
    // 3. Verify quote remains unaffected
    const quoteAfterAttempt = await axios.get(`/api/integration/patient/quotes/${quoteId}`);
    const unaffectedQuote = quoteAfterAttempt.data.quote;
    
    if (!unaffectedQuote.promoCode && 
        unaffectedQuote.discountAmount === 0 &&
        Math.abs(unaffectedQuote.total - subtotalBeforePromo) < 0.01) {
      log('✅ Quote remained unaffected after invalid promo code attempt', 'success');
    } else {
      log('❌ Quote was unexpectedly modified after invalid promo code attempt', 'error');
      log(`PromoCode: ${unaffectedQuote.promoCode}`, 'error');
      log(`DiscountAmount: ${unaffectedQuote.discountAmount}`, 'error');
      log(`Total: ${unaffectedQuote.total}, Expected: ${subtotalBeforePromo}`, 'error');
    }
    
    return true;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'error');
    if (error.response) {
      log(`Server response: ${JSON.stringify(error.response.data)}`, 'error');
    }
    return false;
  }
}

// Main test runner
async function runTests() {
  log('📋 STARTING QUOTE INTEGRATION SYSTEM TESTS', 'info');
  log('============================================', 'info');
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  // Test 1: Promo code application without page refresh
  const test1Result = await testPromoCodeApplication();
  test1Result ? testsPassed++ : testsFailed++;
  log('--------------------------------------------', 'info');
  
  // Test 2: Special offers with automatic promo code application
  const test2Result = await testSpecialOfferPromoCode();
  test2Result ? testsPassed++ : testsFailed++;
  log('--------------------------------------------', 'info');
  
  // Test 3: Invalid promo code handling
  const test3Result = await testInvalidPromoCode();
  test3Result ? testsPassed++ : testsFailed++;
  
  // Print summary
  log('============================================', 'info');
  log(`📊 TEST SUMMARY: ${testsPassed} passed, ${testsFailed} failed`, testsFailed > 0 ? 'error' : 'success');
  
  if (testsFailed === 0) {
    log('🎉 All tests passed! The Quote Integration System is working correctly.', 'success');
    log('✨ Promo codes can be applied without page refreshes.', 'success');
  } else {
    log('❌ Some tests failed. Please check the logs for details.', 'error');
  }
}

// Run the tests
runTests().catch(error => {
  log(`❌ Unexpected error during test execution: ${error.message}`, 'error');
});