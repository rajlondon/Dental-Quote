/**
 * Master test script for special offer functionality
 * This script runs all special offer tests in sequence
 */

const { testSpecialOffer } = require('./test-special-offer-click');
const { testSpecialOfferEndToEnd } = require('./test-special-offer-end-to-end');
const { testPatientPortalOfferDisplay } = require('./test-patient-portal-offer-display');

async function runAllTests() {
  console.log('🧪🧪🧪 STARTING COMPREHENSIVE SPECIAL OFFER TESTING 🧪🧪🧪');
  console.log('===================================================');
  
  const results = {
    click: null,
    endToEnd: null,
    patientPortal: null,
    summary: {
      totalTests: 3,
      passed: 0,
      failed: 0
    }
  };
  
  try {
    // Step 1: Test special offer click from homepage
    console.log('\n🔍 TEST 1: Special Offer Click');
    console.log('---------------------------');
    results.click = await testSpecialOffer();
    
    if (results.click.success) {
      results.summary.passed++;
      console.log('✅ TEST 1 PASSED: Special offer click tracking works correctly');
    } else {
      results.summary.failed++;
      console.log('❌ TEST 1 FAILED: Special offer click tracking failed');
    }
    
    // Step 2: Test end-to-end flow
    console.log('\n🔍 TEST 2: End-to-End Special Offer Flow');
    console.log('-------------------------------------');
    results.endToEnd = await testSpecialOfferEndToEnd();
    
    if (results.endToEnd.success) {
      results.summary.passed++;
      console.log('✅ TEST 2 PASSED: Special offer end-to-end flow works correctly');
    } else {
      results.summary.failed++;
      console.log('❌ TEST 2 FAILED: Special offer end-to-end flow failed');
    }
    
    // Step 3: Test patient portal display
    console.log('\n🔍 TEST 3: Patient Portal Special Offer Display');
    console.log('-------------------------------------------');
    results.patientPortal = await testPatientPortalOfferDisplay();
    
    if (results.patientPortal.success) {
      results.summary.passed++;
      console.log('✅ TEST 3 PASSED: Patient portal special offer display works correctly');
    } else {
      results.summary.failed++;
      console.log('❌ TEST 3 FAILED: Patient portal special offer display failed');
    }
    
    // Print summary
    console.log('\n===================================================');
    console.log('🧪 SPECIAL OFFER TESTING SUMMARY');
    console.log('===================================================');
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log('===================================================');
    
    if (results.summary.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Special offer tracking is working correctly.');
    } else {
      console.log(`⚠️ ${results.summary.failed} TESTS FAILED. Please review the log for details.`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Unhandled error in test suite:', error);
    return {
      ...results,
      error: error.message,
      summary: {
        ...results.summary,
        failed: results.summary.totalTests - results.summary.passed
      }
    };
  }
}

// Run the tests
if (require.main === module) {
  runAllTests()
    .then(results => {
      process.exit(results.summary.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
} else {
  module.exports = { runAllTests };
}