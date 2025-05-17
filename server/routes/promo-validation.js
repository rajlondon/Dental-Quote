/**
 * Promo Code Validation Routes
 * Handles validating promo codes and applying discounts
 */
const express = require('express');
const router = express.Router();
const { validatePromoCode } = require('../utils/promo-utils');

// Default test promo codes for demonstration
const TEST_PROMO_CODES = [
  { 
    code: 'SUMMER15', 
    discountType: 'percentage', 
    discountValue: 15,
    isValid: true,
    message: 'Summer discount applied - 15% off your treatment'
  },
  { 
    code: 'DENTAL25', 
    discountType: 'percentage', 
    discountValue: 25,
    isValid: true,
    message: 'Dental discount applied - 25% off your treatment'
  },
  { 
    code: 'NEWPATIENT', 
    discountType: 'percentage', 
    discountValue: 20,
    isValid: true,
    message: 'New patient discount applied - 20% off your treatment'
  },
  { 
    code: 'TEST10', 
    discountType: 'percentage', 
    discountValue: 10,
    isValid: true,
    message: 'Test discount applied - 10% off your treatment'
  },
  { 
    code: 'FREECONSULT', 
    discountType: 'fixed_amount', 
    discountValue: 75,
    isValid: true,
    message: 'Free consultation voucher applied - £75 off your treatment'
  },
  { 
    code: 'LUXHOTEL20', 
    discountType: 'percentage', 
    discountValue: 20,
    isValid: true,
    message: 'Luxury hotel partner discount - 20% off your treatment'
  },
  { 
    code: 'IMPLANTCROWN30', 
    discountType: 'percentage', 
    discountValue: 30,
    isValid: true,
    message: 'Implant & crown package discount - 30% off your treatment'
  },
  { 
    code: 'FREEWHITE', 
    discountType: 'fixed_amount', 
    discountValue: 150,
    isValid: true,
    message: 'Free teeth whitening voucher applied - £150 off your treatment'
  }
];

/**
 * Validate a promo code
 * POST /api/promo-codes/validate or /api/promo/validate
 */
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        isValid: false,
        message: 'No promo code provided'
      });
    }
    
    // First check our test promo codes
    const testPromoCode = TEST_PROMO_CODES.find(
      promo => promo.code.toLowerCase() === code.toLowerCase()
    );
    
    if (testPromoCode) {
      return res.status(200).json({
        success: true,
        isValid: true,
        code: testPromoCode.code,
        discountType: testPromoCode.discountType,
        discountValue: testPromoCode.discountValue,
        message: testPromoCode.message
      });
    }
    
    // If not a test code, return invalid
    return res.status(200).json({
      success: true,
      isValid: false,
      code,
      message: 'Invalid promo code'
    });
    
  } catch (error) {
    console.error('Error validating promo code:', error);
    return res.status(500).json({
      success: false,
      status: 'fail',
      message: 'An error occurred while validating the promo code.'
    });
  }
});

// Get all available test promo codes (for testing)
router.get('/test-codes', (req, res) => {
  res.status(200).json(TEST_PROMO_CODES);
});

module.exports = router;