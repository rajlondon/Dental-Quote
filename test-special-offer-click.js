/**
 * Test script to simulate clicking on a special offer
 */

import axios from 'axios';

async function testSpecialOffer() {
  try {
    console.log('===== Testing Special Offer Click Simulation =====');
    
    // Use a real offer ID from the database that's marked as a special offer
    const specialOfferId = '1'; // ID for "Free Consultation Package" 
    const clinicId = '1';      // Dentakay Istanbul
    
    console.log(`Testing special offer with: offerId=${specialOfferId}, clinicId=${clinicId}`);
    
    // First attempt the free consultation endpoint
    try {
      console.log('\n1. Trying free-consultation endpoint first:');
      const consultationResponse = await axios.post('http://localhost:5000/api/v1/free-consultation', {
        offerId: specialOfferId,
        clinicId: clinicId
      });
      
      console.log('Response status:', consultationResponse.status);
      console.log('Response data:', consultationResponse.data);
      
      if (consultationResponse.data.treatmentPlanUrl) {
        console.log(`✅ Free consultation endpoint success! Generated URL: ${consultationResponse.data.treatmentPlanUrl}`);
        return consultationResponse.data;
      }
    } catch (error) {
      console.log('❌ Free consultation endpoint failed, trying next endpoint...');
    }
    
    // Second attempt the quotes/from-token endpoint
    try {
      console.log('\n2. Trying quotes/from-token endpoint:');
      const tokenResponse = await axios.post('http://localhost:5000/api/v1/quotes/from-token', {
        token: `special_${specialOfferId}`,
        promoType: 'special_offer'
      });
      
      console.log('Response status:', tokenResponse.status);
      console.log('Response data:', tokenResponse.data);
      
      if (tokenResponse.data.quoteUrl || tokenResponse.data.treatmentPlanUrl) {
        console.log(`✅ Token endpoint success! Generated URL: ${tokenResponse.data.quoteUrl || tokenResponse.data.treatmentPlanUrl}`);
        return tokenResponse.data;
      }
    } catch (error) {
      console.log('❌ Token endpoint failed, trying next endpoint...');
    }
    
    // Third attempt the treatment-plans/from-offer endpoint
    try {
      console.log('\n3. Trying treatment-plans/from-offer endpoint:');
      const treatmentPlanResponse = await axios.post('http://localhost:5000/api/treatment-plans/from-offer', {
        offerId: specialOfferId,
        clinicId: clinicId,
        notes: "Test from API simulation",
        specialOffer: {
          id: specialOfferId,
          title: "Free Consultation Package",
          discountType: "percentage",
          discountValue: 100,
          clinicId: clinicId,
          applicableTreatment: "Consultation"
        }
      });
      
      console.log('Response status:', treatmentPlanResponse.status);
      console.log('Response data:', treatmentPlanResponse.data);
      
      if (treatmentPlanResponse.data.treatmentPlanUrl) {
        console.log(`✅ Treatment plan endpoint success! Generated URL: ${treatmentPlanResponse.data.treatmentPlanUrl}`);
        return treatmentPlanResponse.data;
      }
    } catch (error) {
      console.log('❌ Treatment plan endpoint failed, trying last fallback...');
    }
    
    // Last attempt the offers/:id/start endpoint
    try {
      console.log('\n4. Trying offers/:id/start endpoint (legacy fallback):');
      const legacyResponse = await axios.post(`http://localhost:5000/api/v1/offers/${specialOfferId}/start`, {
        clinicId: clinicId
      });
      
      console.log('Response status:', legacyResponse.status);
      console.log('Response data:', legacyResponse.data);
      
      if (legacyResponse.data.quoteUrl) {
        console.log(`✅ Legacy endpoint success! Generated URL: ${legacyResponse.data.quoteUrl}`);
        return legacyResponse.data;
      }
    } catch (error) {
      console.log('❌ All endpoints failed:');
      console.error(error.response?.data || error.message);
    }
    
    console.log('\n❌ All API endpoints failed!');
    return null;
  } catch (error) {
    console.error('Error in test:', error.message);
    throw error;
  }
}

// Run the test
testSpecialOffer()
  .then(result => {
    console.log('\n===== Test Results =====');
    console.log(result ? '✅ Test succeeded!' : '❌ Test failed!');
  })
  .catch(error => console.error('Test crashed:', error));