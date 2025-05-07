/**
 * Test script for the updated Free Consultation endpoint and URL redirection
 */

import axios from 'axios';

async function testFreeconsultations() {
  try {
    console.log('===== Testing Free Consultation Endpoint =====');
    
    // Parameters for the free consultation
    const testData = {
      offerId: '2',  // Using a valid offer ID from the database
      clinicId: '1'  // Using a valid clinic ID from the database
    };
    
    console.log(`Testing free consultation with: offerId=${testData.offerId}, clinicId=${testData.clinicId}`);
    
    // Call the API endpoint
    const response = await axios.post('http://localhost:5000/api/v1/free-consultation', testData);
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.data.treatmentPlanUrl) {
      console.log(`\nTreatment plan URL format check:`);
      console.log(`- Original URL: ${response.data.treatmentPlanUrl}`);
      
      // Verify the URL format
      if (response.data.treatmentPlanUrl.includes('/portal/treatment-plan/')) {
        console.log('✅ URL format is correct (/portal/treatment-plan/)');
      } else if (response.data.treatmentPlanUrl.includes('/portal/treatment/')) {
        console.log('❌ URL format is incorrect (/portal/treatment/) - should be /portal/treatment-plan/');
      } else {
        console.log('❌ Unexpected URL format');
      }
    }
    
    console.log('\nTest completed successfully!');
    return response.data;
  } catch (error) {
    console.error('Error testing free consultation:', error.response?.data || error.message);
    throw error;
  }
}

// Run the test
testFreeconsultations()
  .then(() => console.log('Test script completed.'))
  .catch((err) => console.error('Test script failed:', err));