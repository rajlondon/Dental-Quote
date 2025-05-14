/**
 * Test script to verify promo code endpoints are accessible
 * This script tests both the main API and test endpoints for promo codes
 */
import axios from 'axios';

async function testPromoCodeEndpoints() {
  const BASE_URL = 'http://localhost:5000/api';
  
  console.log('Testing promo code endpoints...');
  console.log('====================================');
  
  try {
    // Test the new test-promo-codes endpoint
    console.log('1. Testing /api/test-promo-codes endpoint:');
    const testResponse = await axios.get(`${BASE_URL}/test-promo-codes`);
    console.log(`✅ Status: ${testResponse.status}`);
    console.log(`✅ Found ${testResponse.data.length} test promo codes`);
    console.log('Sample code:', testResponse.data[0]?.code);
    console.log('====================================');
    
    // Test the promo-codes validation endpoint
    console.log('2. Testing validation endpoint with test code:');
    const testCode = testResponse.data[0]?.code;
    if (testCode) {
      try {
        const validateResponse = await axios.get(`${BASE_URL}/promo-codes/${testCode}/validate`);
        console.log(`✅ Status: ${validateResponse.status}`);
        console.log('Validation response:', validateResponse.data);
      } catch (validationError) {
        console.log(`⚠️ Validation endpoint returned error: ${validationError.message}`);
        console.log('This is expected if the code does not exist in the database');
      }
    } else {
      console.log('⚠️ No test codes found to validate');
    }
    console.log('====================================');
    
    // Test applying a promo code
    console.log('3. Testing promo code application with test code:');
    const applyTestCode = testResponse.data[0]?.code;
    if (applyTestCode) {
      try {
        const applyResponse = await axios.post(`${BASE_URL}/promo/apply`, { 
          code: applyTestCode,
          quoteData: {
            selectedTreatments: [
              { 
                id: "basic-cleaning",
                name: "Basic Cleaning", 
                price: 100,
                quantity: 1 
              }
            ],
            selectedPackages: [],
            selectedAddons: []
          }
        });
        console.log(`✅ Status: ${applyResponse.status}`);
        console.log('Promo application response:', applyResponse.data);
      } catch (applyError) {
        console.log(`⚠️ Apply endpoint returned error: ${applyError.message}`);
        if (applyError.response) {
          console.log('Error details:', applyError.response.data);
        }
      }
    } else {
      console.log('⚠️ No test codes found to apply');
    }
    
    console.log('====================================');
    console.log('Promo code endpoint tests completed');
    
  } catch (error) {
    console.error('❌ Error testing promo code endpoints:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
  }
}

testPromoCodeEndpoints()
  .catch(error => {
    console.error('Unhandled error:', error.message);
  });