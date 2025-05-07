/**
 * Test script for the updated Free Consultation API endpoint
 * This script tests the dedicated free consultation endpoint with the optimized flow
 */

import axios from 'axios';

async function testUpdatedFreeConsultation() {
  console.log('Starting test of updated Free Consultation API...');
  
  try {
    // Try to create a free consultation treatment plan using the updated endpoint
    console.log('Creating a free consultation treatment plan...');
    
    const response = await axios.post('http://localhost:5000/api/v1/free-consultation', {
      offerId: 'ac36590b-b0dc-434e-ba74-d42ab2485e81',  // Free Consultation Package ID
      clinicId: '1'  // Clinic ID (using DentaKay Istanbul)
    });
    
    console.log('Free consultation created successfully!');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    // Now try to get the treatment lines associated with the quote
    if (response.data.quoteId) {
      console.log(`Fetching treatment lines for quote ID: ${response.data.quoteId}`);
      const treatmentLinesResponse = await axios.get(`http://localhost:5000/api/quotes/${response.data.quoteId}/treatment-lines`);
      
      console.log('Treatment Lines Response Status:', treatmentLinesResponse.status);
      console.log('Treatment Lines Data:', JSON.stringify(treatmentLinesResponse.data, null, 2));
    }
    
    return response.data;
  } catch (error) {
    console.error('Error in test:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    throw error;
  }
}

testUpdatedFreeConsultation()
  .then(data => {
    console.log('Test completed successfully!');
    console.log('Result:', data);
    process.exit(0);
  })
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });