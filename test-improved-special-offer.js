/**
 * Test script for the improved special offer flow
 * This script simulates clicking on a special offer and verifies the data is properly passed
 */

import axios from 'axios';
import { parse } from 'url';

// Configuration
const baseUrl = 'http://localhost:5000';

// Skip authentication - the free consultation endpoint doesn't require it
async function getAuthenticatedSession() {
  console.log('ℹ️ Skipping authentication for testing without session');
  return []; // Return empty cookies array
}

// Helper function to check if the URL path is for a quote page
function isQuotePage(urlPath) {
  return urlPath.includes('/quote') || urlPath.includes('/treatment-plan');
}

// Main test function
async function testImprovedSpecialOffer() {
  console.log('🔍 Testing improved special offer flow...');
  
  try {
    // Get authenticated session
    const cookies = await getAuthenticatedSession();
    
    // 1. Get the first available special offer
    console.log('1️⃣ Fetching special offers from the homepage...');
    const offersResponse = await axios.get(`${baseUrl}/api/special-offers/homepage`);
    const offers = offersResponse.data;
    
    if (!offers || offers.length === 0) {
      throw new Error('No special offers found on homepage');
    }
    
    const selectedOffer = offers[0]; // Use the first offer for testing
    console.log(`Selected offer: "${selectedOffer.title}" (ID: ${selectedOffer.id})`);
    
    // 2. Simulate clicking on the special offer
    console.log(`2️⃣ Simulating special offer click for offer ID: ${selectedOffer.id}`);
    
    // Try the free consultation endpoint first
    console.log('Attempting to use free-consultation endpoint...');
    let response;
    try {
      response = await axios.post(`${baseUrl}/api/v1/free-consultation`, {
        offerId: selectedOffer.id,
        clinicId: selectedOffer.clinicId || '1'
      }, {
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookies.join('; ')
        }
      });
      
      console.log('✅ Successfully used free-consultation endpoint');
      console.log('Response data:', response.data);
      
      if (response.data.treatmentPlanUrl) {
        const url = new URL(response.data.treatmentPlanUrl, baseUrl);
        console.log('Redirect URL:', url.toString());
        console.log('⭐ TEST PASSED: Special offer successfully processed with treatment plan URL');
        return;
      }
    } catch (error) {
      console.log('Free consultation endpoint failed, trying fallback endpoint...');
    }
    
    // Try the treatment plans from offer endpoint as fallback
    console.log('Attempting to use treatment-plans/from-offer endpoint...');
    try {
      response = await axios.post(`${baseUrl}/api/treatment-plans/from-offer`, {
        offerId: selectedOffer.id,
        clinicId: selectedOffer.clinicId || '1',
        notes: "Selected from special offers via test script",
        specialOffer: {
          id: selectedOffer.id,
          title: selectedOffer.title,
          discountType: selectedOffer.discountType || 'percentage',
          discountValue: selectedOffer.discountValue || 100,
          clinicId: selectedOffer.clinicId || '1'
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookies.join('; ')
        }
      });
      
      console.log('✅ Successfully used treatment-plans/from-offer endpoint');
      console.log('Response data:', response.data);
      
      if (response.data.redirectUrl) {
        const url = new URL(response.data.redirectUrl, baseUrl);
        console.log('Redirect URL:', url.toString());
        
        // Verify the URL contains the necessary parameters
        const params = new URLSearchParams(url.search);
        const hasSourceParam = params.has('source');
        const hasOfferIdParam = params.has('offerId') || params.has('specialOffer');
        const hasClinicIdParam = params.has('clinicId');
        
        if (hasSourceParam && hasOfferIdParam && hasClinicIdParam) {
          console.log('⭐ TEST PASSED: URL contains all required parameters for special offer flow');
        } else {
          console.log('⚠️ Warning: URL missing some parameters:');
          console.log('- source param:', hasSourceParam);
          console.log('- offerId param:', hasOfferIdParam);
          console.log('- clinicId param:', hasClinicIdParam);
        }
        
        if (isQuotePage(url.pathname)) {
          console.log('⭐ TEST PASSED: Redirecting to proper quote page');
        } else {
          console.log('⚠️ Warning: Not redirecting to a quote page. Path:', url.pathname);
        }
        
        return;
      }
    } catch (error) {
      console.error('❌ Error using treatment-plans/from-offer endpoint:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
    
    console.error('❌ TEST FAILED: Could not process special offer through any endpoint');
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testImprovedSpecialOffer()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test script error:', err));