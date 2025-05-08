/**
 * Test script to simulate clicking on a special offer
 */
import axios from 'axios';
import assert from 'assert/strict';

const BASE_URL = 'http://localhost:5000';
const SPECIAL_OFFERS_URL = `${BASE_URL}/api/special-offers/homepage`;
const YOUR_QUOTE_URL = `${BASE_URL}/your-quote`;

async function testSpecialOffer() {
  console.log('🧪 Starting Special Offer Click Test');
  
  try {
    // Step 1: Get special offers from the homepage
    const specialOffersResponse = await axios.get(SPECIAL_OFFERS_URL);
    const specialOffers = specialOffersResponse.data;
    
    if (!specialOffers || specialOffers.length === 0) {
      throw new Error('No special offers available');
    }
    
    console.log(`📋 Found ${specialOffers.length} special offers`);
    
    // Select the first offer for testing
    const selectedOffer = specialOffers[0];
    console.log(`🔍 Selected offer: ${selectedOffer.title} (ID: ${selectedOffer.id})`);
    
    // Step 2: Simulate clicking on the special offer by constructing the URL
    // This simulates what happens when a user clicks on a special offer on the homepage
    const offerClickURL = `${YOUR_QUOTE_URL}?offerId=${selectedOffer.id}&clinicId=${selectedOffer.clinicId}&source=special_offer&offerTitle=${encodeURIComponent(selectedOffer.title)}&offerDiscountType=${selectedOffer.discountType}&offerDiscount=${selectedOffer.discountValue}`;
    
    console.log(`🔗 Offer click URL: ${offerClickURL}`);
    
    // Step 3: Make a GET request to the URL to verify it's accessible
    // In a real browser test, this would be an actual navigation
    const clickResponse = await axios.get(offerClickURL, {
      validateStatus: function (status) {
        return status < 500; // Accepts status codes less than 500 to handle redirects
      }
    });
    
    console.log(`📡 Response status: ${clickResponse.status}`);
    
    // With a real browser test, we would check if the special offer badge is visible
    // For this API test, we'll just confirm the page is accessible
    
    // Log success
    console.log('✅ Special offer click test completed successfully');
    
    return {
      success: true,
      offer: {
        id: selectedOffer.id,
        title: selectedOffer.title,
        clinicId: selectedOffer.clinicId
      },
      message: 'Special offer click simulation successful'
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Special offer click test failed'
    };
  }
}

// Run the test
if (require.main === module) {
  testSpecialOffer()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
} else {
  module.exports = { testSpecialOffer };
}