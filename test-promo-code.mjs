/**
 * Test script to create a promo code for testing
 */
import 'dotenv/config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

async function setupTestPromoCode() {
  try {
    console.log('Starting promo code test...');
    
    // 1. Create a new quote
    const quoteId = await createTestQuote();
    console.log(`Created test quote with ID: ${quoteId}`);
    
    // 2. Apply promo code to the quote
    const promoCode = 'WELCOME20';
    console.log(`Attempting to apply promo code: ${promoCode} to quote: ${quoteId}`);
    
    const applyResponse = await axios.post(`http://localhost:5000/api/promo/apply/${quoteId}`, {
      code: promoCode
    });
    
    console.log('Apply Promo Response:', applyResponse.data);
    
    // 3. Remove promo code from quote
    console.log(`Attempting to remove promo code from quote: ${quoteId}`);
    
    const removeResponse = await axios.post(`http://localhost:5000/api/promo/remove/${quoteId}`, {});
    
    console.log('Remove Promo Response:', removeResponse.data);
    
    // 4. Test URL auto-apply
    console.log('\nTesting URL auto-apply:');
    console.log(`To test, visit: http://localhost:5000/your-quote?code=${promoCode}`);
    console.log('The code should be automatically applied when the page loads.');
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing promo code:', error.response?.data || error.message);
  }
}

// Helper function to create a test quote
async function createTestQuote() {
  try {
    const response = await axios.post('http://localhost:5000/api/quotes/create', {
      patientName: 'Test Patient',
      treatments: [
        { id: 'dental_implant_standard', quantity: 1 }
      ]
    });
    
    if (response.data && response.data.id) {
      return response.data.id;
    } else {
      throw new Error('Failed to create test quote - invalid response');
    }
  } catch (error) {
    throw new Error(`Error creating test quote: ${error.message}`);
  }
}

setupTestPromoCode();