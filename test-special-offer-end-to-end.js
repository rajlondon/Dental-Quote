/**
 * Test script for end-to-end special offer tracking
 * This script verifies that special offers are correctly tracked from homepage click through to patient portal
 */

const axios = require('axios');
const { strict: assert } = require('assert');

const BASE_URL = 'http://localhost:5000';
const AUTH_URL = `${BASE_URL}/api/auth/login`;
const SPECIAL_OFFER_URL = `${BASE_URL}/api/special-offers/homepage`;
const TREATMENTS_URL = `${BASE_URL}/api/treatments`;
const QUOTE_URL = `${BASE_URL}/api/quotes`;
const SAVE_QUOTE_URL = `${BASE_URL}/api/quotes/save`;

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

async function testSpecialOfferEndToEnd() {
  console.log('🧪 Starting end-to-end special offer tracking test');

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
    
    // Step 2: Get available treatments
    const treatmentsResponse = await axios.get(TREATMENTS_URL);
    const treatments = treatmentsResponse.data;
    
    // Step 3: Simulate selecting a treatment that should receive the special offer
    // Find a treatment that matches the special offer's applicable treatment
    const applicableTreatment = treatments.find(t => 
      selectedOffer.applicableTreatment && 
      t.name.toLowerCase().includes(selectedOffer.applicableTreatment.toLowerCase())
    ) || treatments[0]; // Fallback to first treatment if no match
    
    // Create a treatment selection with quantity
    const selectedTreatments = [{
      id: applicableTreatment.id,
      name: applicableTreatment.name,
      priceGBP: applicableTreatment.priceGBP,
      quantity: 1,
      subtotalGBP: applicableTreatment.priceGBP,
      subtotalUSD: Math.round(applicableTreatment.priceGBP * 1.29)
    }];
    
    console.log(`💉 Selected treatment: ${applicableTreatment.name}`);
    
    // Step 4: Create a quote with the special offer applied
    const quoteData = {
      treatments: selectedTreatments,
      patientInfo: {
        name: 'Test Patient',
        email: 'test@example.com',
        phone: '+1234567890',
        country: 'United Kingdom'
      },
      specialOffer: {
        id: selectedOffer.id,
        title: selectedOffer.title,
        discountType: selectedOffer.discountType,
        discountValue: selectedOffer.discountValue,
        clinicId: selectedOffer.clinicId
      },
      source: 'special_offer',
      // Add other required fields
      appointmentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      additionalNotes: 'Created via special offer tracking test',
      totalGBP: applicableTreatment.priceGBP,
      totalUSD: Math.round(applicableTreatment.priceGBP * 1.29),
      savingsAmount: Math.round(applicableTreatment.priceGBP * 0.7), // Assuming ~70% savings
      savingsPercentage: 70
    };
    
    // Step 5: Save the quote
    const saveQuoteResponse = await axios.post(SAVE_QUOTE_URL, quoteData, config);
    const savedQuote = saveQuoteResponse.data;
    
    console.log(`✅ Quote saved with ID: ${savedQuote.id || savedQuote.quoteId}`);
    
    // Step 6: Verify the quote has the special offer applied
    const quoteId = savedQuote.id || savedQuote.quoteId;
    
    // Fetch the quote from the patient portal
    const fetchedQuoteResponse = await axios.get(`${BASE_URL}/api/patient/quotes/${quoteId}`, config);
    const fetchedQuote = fetchedQuoteResponse.data;
    
    // Assert that the special offer data is present in the fetched quote
    assert(fetchedQuote.specialOffer, 'Special offer data is missing from the quote');
    assert.equal(fetchedQuote.specialOffer.id, selectedOffer.id, 'Special offer ID does not match');
    
    console.log('✅ Special offer data is correctly attached to the quote');
    console.log('✅ Special offer tracking test completed successfully');
    
    return {
      success: true,
      quoteId: quoteId,
      message: 'Special offer was tracked from homepage to patient portal successfully'
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Special offer tracking test failed'
    };
  }
}

// Run the test
if (require.main === module) {
  testSpecialOfferEndToEnd()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
} else {
  module.exports = { testSpecialOfferEndToEnd };
}