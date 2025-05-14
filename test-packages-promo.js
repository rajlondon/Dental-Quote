/**
 * Test script to verify package bundles and promo code application
 * This script tests:
 * 1. Retrieving all test package bundles
 * 2. Applying a promo code to a specific package bundle
 * 3. Verifying discount calculations
 */
import axios from 'axios';

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const PACKAGES_ENDPOINT = '/test-packages';
const PROMO_APPLY_ENDPOINT = '/promo/apply';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function for logging
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  let color = colors.reset;
  
  switch (type) {
    case 'success':
      color = colors.green;
      console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${color}✓ ${message}${colors.reset}`);
      break;
    case 'warning':
      color = colors.yellow;
      console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${color}⚠ ${message}${colors.reset}`);
      break;
    case 'error':
      color = colors.red;
      console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${color}✗ ${message}${colors.reset}`);
      break;
    default:
      console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
  }
}

// Test function to get all packages
async function getAllPackages() {
  try {
    log('Fetching all test packages...');
    const response = await axios.get(`${API_BASE_URL}${PACKAGES_ENDPOINT}`);
    
    if (response.status === 200 && Array.isArray(response.data)) {
      log(`Successfully retrieved ${response.data.length} packages`, 'success');
      
      // Display package info
      response.data.forEach((pkg, index) => {
        log(`Package ${index + 1}: ${pkg.name} - £${pkg.price}`, 'info');
        if (pkg.treatments && Array.isArray(pkg.treatments)) {
          pkg.treatments.forEach(treatment => {
            log(`  - ${treatment.name}: £${treatment.price}`, 'info');
          });
        }
      });
      
      return response.data;
    } else {
      log('Unexpected response format', 'error');
      return null;
    }
  } catch (error) {
    log(`Error fetching packages: ${error.message}`, 'error');
    return null;
  }
}

// Test function to apply promo code to a specific package
async function applyPromoToPackage(packageId, promoCode) {
  try {
    log(`Applying promo code "${promoCode}" to package "${packageId}"...`);
    const response = await axios.get(`${API_BASE_URL}/test-promo-applied/${packageId}/${promoCode}`);
    
    if (response.status === 200 && response.data) {
      const { success, message, packageDetails, promoDetails, originalPrice, discountAmount, discountedPrice } = response.data;
      
      if (success) {
        log(`Promo code applied successfully: ${message}`, 'success');
        log(`Package: ${packageDetails.name}`, 'info');
        log(`Original Price: £${originalPrice}`, 'info');
        log(`Discount: £${discountAmount} (${promoDetails.discount_type === 'percentage' ? promoDetails.discount_value + '%' : '£' + promoDetails.discount_value})`, 'success');
        log(`Discounted Price: £${discountedPrice}`, 'success');
        return response.data;
      } else {
        log(`Failed to apply promo code: ${message}`, 'warning');
        return null;
      }
    } else {
      log('Unexpected response format', 'error');
      return null;
    }
  } catch (error) {
    log(`Error applying promo code: ${error.message}`, 'error');
    return null;
  }
}

// Test function to apply promo code to a quote with multiple items
async function applyPromoToQuote(promoCode, quoteItems) {
  try {
    log(`Applying promo code "${promoCode}" to quote...`);
    
    const quoteData = {
      selectedTreatments: quoteItems.treatments || [],
      selectedPackages: quoteItems.packages || [],
      selectedAddons: quoteItems.addons || []
    };
    
    const response = await axios.post(`${API_BASE_URL}${PROMO_APPLY_ENDPOINT}`, {
      code: promoCode,
      quoteData
    });
    
    if (response.status === 200 && response.data && response.data.success) {
      const { original_total, discount_amount, discounted_total, promo } = response.data.data;
      
      log(`Promo code applied successfully to quote`, 'success');
      log(`Original Total: £${original_total}`, 'info');
      log(`Discount: £${discount_amount} (${promo.discount_type === 'percentage' ? promo.discount_value + '%' : '£' + promo.discount_value})`, 'success');
      log(`Discounted Total: £${discounted_total}`, 'success');
      return response.data;
    } else {
      log(`Failed to apply promo code to quote: ${response.data?.message || 'Unknown error'}`, 'warning');
      return null;
    }
  } catch (error) {
    log(`Error applying promo code to quote: ${error.message}`, 'error');
    return null;
  }
}

// Main test function
async function runTests() {
  log('=== STARTING PACKAGE AND PROMO CODE TESTS ===', 'info');
  
  // Test 1: Get all packages
  const packages = await getAllPackages();
  if (!packages || packages.length === 0) {
    log('Failed to retrieve packages. Aborting tests.', 'error');
    return;
  }
  
  // Select specific packages for testing
  const implantPackage = packages.find(pkg => pkg.id === 'pkg-001'); // 6 Implants + 6 Crowns
  const allOn4Package = packages.find(pkg => pkg.id === 'pkg-003');  // All-on-4 Package
  
  // Test 2: Apply percentage discount to implant package (IMPLANT30)
  log('\n=== TESTING PERCENTAGE DISCOUNT (IMPLANT30) ===', 'info');
  await applyPromoToPackage('pkg-001', 'IMPLANT30');
  
  // Test 3: Apply fixed amount discount to implant package (SUMMER100)
  log('\n=== TESTING FIXED AMOUNT DISCOUNT (SUMMER100) ===', 'info');
  await applyPromoToPackage('pkg-001', 'SUMMER100');
  
  // Test 4: Apply promo code to a quote with multiple items
  log('\n=== TESTING PROMO CODE ON COMPLETE QUOTE ===', 'info');
  await applyPromoToQuote('IMPLANT30', {
    treatments: [],
    packages: [
      {
        ...implantPackage,
        quantity: 1
      }
    ],
    addons: []
  });
  
  log('\n=== PACKAGE AND PROMO CODE TESTS COMPLETED ===', 'success');
}

// Run the tests
runTests();