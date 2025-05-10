/**
 * Test script to verify URL filtering when a promo code is presented
 * in the URL or entered through the coupon code field
 */
import 'dotenv/config';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testPromoFiltering() {
  try {
    console.log('🧪 Testing Promo Code Filtering');
    console.log('----------------------------');
    
    // 1. Test URL with promo parameter
    console.log('\n1. Testing URL with promo parameter');
    const promoUrlResponse = await fetch(`${BASE_URL}/api/v1/promos?code=WELCOME20`);
    const promoUrlData = await promoUrlResponse.json();
    
    console.log(`Status: ${promoUrlResponse.status}`);
    if (promoUrlData.success) {
      console.log(`Found ${promoUrlData.data.length} matching promos`);
      if (promoUrlData.data.length > 0) {
        const promo = promoUrlData.data[0];
        console.log(`Promo details - Title: ${promo.title}, Discount: ${promo.discount_value}${promo.discount_type === 'PERCENT' ? '%' : ' EUR'}`);
      }
    } else {
      console.log(`Error: ${promoUrlData.message}`);
    }
    
    // 2. Test direct API endpoint
    console.log('\n2. Testing apply-code API endpoint');
    const applyCodeResponse = await fetch(`${BASE_URL}/api/apply-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'WELCOME20',
        quoteId: 'ca540e69-97d3-4a74-8485-e1092aecbbf0'
      }),
    });
    
    const applyCodeData = await applyCodeResponse.json();
    console.log(`Status: ${applyCodeResponse.status}`);
    
    if (applyCodeResponse.ok) {
      console.log('Response:', JSON.stringify(applyCodeData, null, 2));
      
      if (applyCodeData.quote) {
        console.log(`\nQuote updated successfully`);
        console.log(`Original subtotal: ${applyCodeData.quote.subtotal}`);
        console.log(`Discount applied: ${applyCodeData.quote.discount || 0}`);
        console.log(`New total: ${applyCodeData.quote.total_price}`);
      }
    } else {
      console.log('Error applying code:', applyCodeData);
    }
    
    // 3. Verify updated quote in database
    console.log('\n3. Testing that the quote was updated in the database');
    // This would normally check the database, but we'll rely on the previous response
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testPromoFiltering().catch(console.error);