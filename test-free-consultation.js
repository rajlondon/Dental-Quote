/**
 * Test script for the Free Consultation API endpoint
 * This script tests the dedicated free consultation endpoint
 */

import fetch from 'node-fetch';

async function testFreeConsultation() {
  try {
    console.log('Testing free consultation API endpoint...');
    
    // Get a sample offer ID from the special offers API
    const offersResponse = await fetch('http://localhost:5000/api/special-offers/homepage');
    const offers = await offersResponse.json();
    
    if (!offers || !offers.length) {
      console.error('No special offers found. Cannot test endpoint.');
      return;
    }
    
    // Find free consultation offer
    const freeConsultOffer = offers.find(offer => 
      offer.title.toLowerCase().includes('consultation') || 
      offer.description?.toLowerCase().includes('consultation')
    );
    
    if (!freeConsultOffer) {
      console.log('No free consultation offer found. Using first available offer.');
    }
    
    const testOffer = freeConsultOffer || offers[0];
    console.log(`Using offer: ${testOffer.title} (ID: ${testOffer.id})`);
    
    console.log('Request data:', {
      offerId: testOffer.id,
      clinicId: testOffer.clinicId
    });
    
    // Test the endpoint
    const response = await fetch('http://localhost:5000/api/v1/free-consultation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        offerId: testOffer.id,
        clinicId: "1" // Use a valid clinic ID
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Free consultation endpoint responded successfully!');
      console.log('Response:', data);
      
      if (data.treatmentPlanId) {
        console.log(`Generated treatment plan ID: ${data.treatmentPlanId}`);
        console.log(`Treatment plan URL: ${data.treatmentPlanUrl}`);
      }
      
      if (data.quoteId) {
        console.log(`Generated quote ID: ${data.quoteId}`);
      }
    } else {
      console.error('❌ Free consultation endpoint failed:', data);
    }
  } catch (error) {
    console.error('Error testing free consultation endpoint:', error);
  }
}

// Run the test
testFreeConsultation();