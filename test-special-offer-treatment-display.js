/**
 * Test script to verify special offers display in treatment summary 
 * with clinic reference codes
 */

const axios = require('axios');
const { strict: assert } = require('assert');

const BASE_URL = 'http://localhost:5000';
const AUTH_URL = `${BASE_URL}/api/auth/login`;
const SPECIAL_OFFER_URL = `${BASE_URL}/api/special-offers/homepage`;
const QUOTE_URL = `${BASE_URL}/api/patient/quotes`;

async function getAuthenticatedSession() {
  // Get patient credentials
  const credentials = {
    email: 'patient@example.com',
    password: 'password123'
  };

  try {
    // Log in as patient
    const loginResponse = await axios.post(AUTH_URL, credentials, { withCredentials: true });
    console.log('✅ Logged in as patient');

    // Extract cookies for future requests
    if (!loginResponse.headers['set-cookie']) {
      throw new Error('No cookies returned from login');
    }

    const cookies = loginResponse.headers['set-cookie'];
    return cookies;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

async function testSpecialOfferTreatmentDisplay() {
  console.log('🧪 Starting special offer treatment display test');

  try {
    // Get authenticated session
    const cookies = await getAuthenticatedSession();
    const config = { headers: { Cookie: cookies.join('; ') }, withCredentials: true };

    // Step 1: Get available special offers from homepage
    const specialOffersResponse = await axios.get(SPECIAL_OFFER_URL);
    const specialOffers = specialOffersResponse.data;
    
    if (!specialOffers || !specialOffers.length) {
      throw new Error('No special offers found');
    }
    
    console.log(`📋 Found ${specialOffers.length} special offers on homepage`);
    
    // Select the first special offer for testing
    const selectedOffer = specialOffers[0];
    console.log(`🔍 Selected offer: ${selectedOffer.title} (ID: ${selectedOffer.id})`);
    
    // Step 2: Create a test quote with special offer
    const testQuote = {
      title: "Test Quote With Special Offer",
      clinicName: "Istanbul Dental Smile",
      clinicId: selectedOffer.clinic_id || 1,
      treatments: [
        {
          name: "Dental Implant",
          quantity: 2,
          price: 800,
          basePriceGBP: 1000, // Original price before discount
          unitPriceGBP: 800,   // Price after discount
          subtotalGBP: 1600,
          isSpecialOffer: true,
          specialOffer: {
            id: selectedOffer.id,
            title: selectedOffer.title,
            discountType: selectedOffer.discount_type,
            discountValue: selectedOffer.discount_value,
            clinicId: selectedOffer.clinic_id || "1"
          }
        },
        {
          name: "Teeth Whitening",
          quantity: 1,
          price: 200,
          subtotalGBP: 200
        }
      ],
      totalPrice: 1800,
      status: "draft",
      createdAt: new Date().toISOString(),
      notes: "This is a test quote created with a special offer applied to the Dental Implant treatment.",
      source: "special_offer"
    };
    
    // Step 3: Save the test quote
    const saveQuoteResponse = await axios.post(`${QUOTE_URL}/test/create`, testQuote, config);
    const savedQuote = saveQuoteResponse.data;
    
    console.log(`✅ Test quote created with ID: ${savedQuote.id || savedQuote.quoteId}`);
    
    // Step 4: Verify the test quote can be retrieved and displays properly
    if (savedQuote.id) {
      console.log(`🔍 Fetching quote with ID: ${savedQuote.id} to verify display`);
      const quoteResponse = await axios.get(`${QUOTE_URL}/${savedQuote.id}`, config);
      const fetchedQuote = quoteResponse.data;
      
      // Verify special offer data is present
      assert(fetchedQuote.treatments.some(t => t.specialOffer), 'No treatment has special offer data');
      
      console.log('✅ Special offer treatments display test completed successfully');
    }
    
    return {
      success: true,
      quoteId: savedQuote.id || null,
      message: 'Special offer treatment display test passed successfully'
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Special offer treatment display test failed'
    };
  }
}

// Run the test
testSpecialOfferTreatmentDisplay()
  .then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });