/**
 * Test quote data API routes
 * Provides test treatments, packages, and add-ons for the quote system
 */
import express from 'express';
import { 
  TEST_TREATMENTS, 
  TEST_PACKAGES, 
  TEST_ADDONS, 
  TEST_PROMO_CODES,
  TEST_SPECIAL_OFFERS 
} from './mock-test-data';

const router = express.Router();

// Get all treatments for testing
router.get('/treatments', (req, res) => {
  res.json(TEST_TREATMENTS);
});

// Get all treatment packages for testing
router.get('/treatment-packages', (req, res) => {
  res.json(TEST_PACKAGES);
});

// Get all add-ons for testing
router.get('/addons', (req, res) => {
  res.json(TEST_ADDONS);
});

// Get all promo codes for testing
router.get('/promo-codes', (req, res) => {
  res.json(TEST_PROMO_CODES);
});

// Validate promo code for testing
router.get('/promo-codes/validate', (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({
      valid: false,
      message: 'Promo code is required'
    });
  }
  
  const promoCode = TEST_PROMO_CODES.find(
    promo => promo.code.toLowerCase() === code.toString().toLowerCase()
  );
  
  if (!promoCode) {
    return res.json({
      valid: false,
      message: 'Invalid promo code'
    });
  }
  
  // Check if promo code is active and not expired
  const now = new Date();
  const expiresAt = new Date(promoCode.expires_at);
  
  if (!promoCode.is_active || now > expiresAt) {
    return res.json({
      valid: false,
      message: 'This promo code has expired'
    });
  }
  
  return res.json({
    valid: true,
    message: 'Promo code applied successfully',
    promotion: {
      id: promoCode.id,
      title: promoCode.title,
      discount_type: promoCode.discount_type,
      discount_value: promoCode.discount_value
    }
  });
});

// Get all promo codes for testing (admin use)
router.get('/promo-codes', (req, res) => {
  res.json(TEST_PROMO_CODES);
});

// Get all special offers for testing
router.get('/special-offers', (req, res) => {
  res.json(TEST_SPECIAL_OFFERS);
});

// Apply promo code to quote (for testing the complete flow)
router.post('/promo/apply/:quoteId', (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Promo code is required'
    });
  }
  
  const promoCode = TEST_PROMO_CODES.find(
    promo => promo.code.toLowerCase() === code.toLowerCase()
  );
  
  if (!promoCode) {
    return res.json({
      success: false,
      message: 'Invalid promo code'
    });
  }
  
  // Return a successful response
  return res.json({
    success: true,
    message: 'Promo code applied successfully',
    promoDetails: {
      id: promoCode.id,
      title: promoCode.title,
      discount_type: promoCode.discount_type,
      discount_value: promoCode.discount_value
    }
  });
});

// Test endpoint to demonstrate promo code application to a package
router.get('/:packageId/:promoCode', (req, res) => {
  const { packageId, promoCode } = req.params;
  
  // Find the package
  const packageItem = TEST_PACKAGES.find(pkg => pkg.id === packageId);
  if (!packageItem) {
    return res.status(404).json({
      success: false,
      message: 'Package not found'
    });
  }
  
  // Find the promo code
  const promo = TEST_PROMO_CODES.find(
    p => p.code.toLowerCase() === promoCode.toLowerCase()
  );
  if (!promo) {
    return res.status(404).json({
      success: false,
      message: 'Promo code not found'
    });
  }
  
  // Check if promo code is applicable to this package
  const isApplicable = promo.applicable_treatments?.includes(packageId) || false;
  if (!isApplicable) {
    return res.json({
      success: false,
      message: 'Promo code is not applicable to this package',
      packageDetails: packageItem,
      promoDetails: promo
    });
  }
  
  // Calculate discounted price
  let discountedPrice = packageItem.price;
  let discountAmount = 0;
  
  if (promo.discount_type === 'percentage') {
    discountAmount = (packageItem.price * promo.discount_value) / 100;
    // Apply max discount if available
    if (promo.max_discount_amount && discountAmount > promo.max_discount_amount) {
      discountAmount = promo.max_discount_amount;
    }
  } else if (promo.discount_type === 'fixed_amount') {
    discountAmount = promo.discount_value;
  }
  
  discountedPrice = packageItem.price - discountAmount;
  
  // Ensure price is not negative
  if (discountedPrice < 0) {
    discountedPrice = 0;
  }
  
  return res.json({
    success: true,
    message: 'Promo code applied successfully',
    packageDetails: packageItem,
    promoDetails: promo,
    originalPrice: packageItem.price,
    discountAmount,
    discountedPrice,
    savings: discountAmount
  });
});

export default router;