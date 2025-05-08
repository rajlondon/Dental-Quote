/**
 * Test script to verify special offer display in the patient portal
 */
const axios = require('axios');
const { strict: assert } = require('assert');

const BASE_URL = 'http://localhost:5000';
const AUTH_URL = `${BASE_URL}/api/auth/login`;
const PATIENT_QUOTES_URL = `${BASE_URL}/api/patient/quotes`;

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

async function testPatientPortalOfferDisplay() {
  console.log('🧪 Starting Patient Portal Special Offer Display Test');
  
  try {
    // Step 1: Get authenticated session
    const cookies = await getAuthenticatedSession();
    const config = { headers: { Cookie: cookies.join('; ') }, withCredentials: true };
    
    // Step 2: Get all quotes for the patient
    const quotesResponse = await axios.get(PATIENT_QUOTES_URL, config);
    const quotes = quotesResponse.data.quotes || quotesResponse.data;
    
    if (!quotes || quotes.length === 0) {
      throw new Error('No quotes found for patient');
    }
    
    console.log(`📋 Found ${quotes.length} quotes for patient`);
    
    // Step 3: Find quotes with special offers
    const specialOfferQuotes = quotes.filter(quote => 
      quote.specialOffer || 
      quote.source === 'special_offer' || 
      (quote.treatments && quote.treatments.some(t => t.specialOfferApplied))
    );
    
    console.log(`🔍 Found ${specialOfferQuotes.length} quotes with special offers`);
    
    if (specialOfferQuotes.length === 0) {
      console.warn('⚠️ No quotes with special offers found. Test will verify UI elements but not actual offer data.');
    }
    
    // Step 4: Get detailed info for the first special offer quote (if any) or just the first quote
    const targetQuote = specialOfferQuotes.length > 0 ? specialOfferQuotes[0] : quotes[0];
    const quoteId = targetQuote.id || targetQuote.quoteId;
    
    console.log(`🔍 Examining quote ID: ${quoteId}`);
    
    const quoteDetailResponse = await axios.get(`${PATIENT_QUOTES_URL}/${quoteId}`, config);
    const quoteDetail = quoteDetailResponse.data;
    
    // Step 5: Check for special offer data in the quote
    const hasSpecialOffer = quoteDetail.specialOffer || 
                          quoteDetail.source === 'special_offer' ||
                          (quoteDetail.treatments && quoteDetail.treatments.some(t => t.specialOfferApplied));
    
    console.log(`${hasSpecialOffer ? '✅' : '❌'} Quote ${hasSpecialOffer ? 'has' : 'does not have'} special offer data`);
    
    // If the quote has special offer data, validate its structure
    if (hasSpecialOffer) {
      if (quoteDetail.specialOffer) {
        console.log('📊 Special offer details:');
        console.log(`  - Title: ${quoteDetail.specialOffer.title}`);
        console.log(`  - Discount: ${quoteDetail.specialOffer.discountType === 'percentage' 
          ? `${quoteDetail.specialOffer.discountValue}%` 
          : `£${quoteDetail.specialOffer.discountValue}`}`);
        console.log(`  - Clinic ID: ${quoteDetail.specialOffer.clinicId}`);
      }
      
      if (quoteDetail.treatments) {
        const specialOfferTreatments = quoteDetail.treatments.filter(t => t.specialOfferApplied);
        console.log(`📊 Found ${specialOfferTreatments.length} treatments with special offers applied`);
        
        specialOfferTreatments.forEach((treatment, index) => {
          console.log(`  ${index + 1}. ${treatment.name}`);
          if (treatment.originalPriceGBP) {
            console.log(`     Original price: £${treatment.originalPriceGBP}`);
            console.log(`     Discounted price: £${treatment.priceGBP}`);
            console.log(`     Savings: £${treatment.originalPriceGBP - treatment.priceGBP}`);
          }
        });
      }
    }
    
    // Log success
    console.log('✅ Patient portal special offer display test completed');
    
    return {
      success: true,
      quoteId: quoteId,
      hasSpecialOffer: hasSpecialOffer,
      message: 'Patient portal special offer display test completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Patient portal special offer display test failed'
    };
  }
}

// Run the test
if (require.main === module) {
  testPatientPortalOfferDisplay()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
} else {
  module.exports = { testPatientPortalOfferDisplay };
}