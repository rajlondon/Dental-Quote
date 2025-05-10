/**
 * Test script to create a promo code for testing
 */
require('dotenv').config();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function setupTestPromoCode() {
  try {
    console.log('Starting promo code test...');
    
    // 1. Create a new quote
    const quoteId = uuidv4();
    console.log(`Created test quote with ID: ${quoteId}`);
    
    // 2. Apply promo code to the quote
    const promoCode = 'WELCOME20';
    console.log(`Attempting to apply promo code: ${promoCode} to quote: ${quoteId}`);
    
    const applyResponse = await axios.post('http://localhost:5000/api/promocodes/apply', {
      code: promoCode,
      quoteId
    });
    
    console.log('Apply Promo Response:', applyResponse.data);
    
    // 3. Remove promo code from quote
    console.log(`Attempting to remove promo code from quote: ${quoteId}`);
    
    const removeResponse = await axios.post('http://localhost:5000/api/promocodes/remove', {
      quoteId
    });
    
    console.log('Remove Promo Response:', removeResponse.data);
    
    // 4. Test URL auto-apply
    console.log('\nTesting URL auto-apply:');
    console.log(`To test, visit: http://localhost:5000/quote?code=${promoCode}`);
    console.log('The code should be automatically applied when the page loads.');
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing promo code:', error.response?.data || error.message);
  }
}

setupTestPromoCode();