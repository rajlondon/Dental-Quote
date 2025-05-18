/**
 * Promo Code API Routes
 * Handles validation and application of promo codes
 */
import express from 'express';
import { validatePromoCode, calculateDiscount } from '../services/promo-code-service';

const router = express.Router();

// Validate a promo code
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }
    
    const promoData = await validatePromoCode(code);
    
    return res.json({
      success: promoData.valid,
      ...promoData
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while validating the promo code'
    });
  }
});

// Calculate discount for a given promo code and price
router.post('/calculate-discount', async (req, res) => {
  try {
    const { code, originalPrice } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }
    
    if (originalPrice === undefined || isNaN(originalPrice)) {
      return res.status(400).json({
        success: false,
        message: 'Valid original price is required'
      });
    }
    
    const promoData = await validatePromoCode(code);
    const discountAmount = calculateDiscount(promoData, originalPrice);
    const finalPrice = Math.max(0, originalPrice - discountAmount);
    
    return res.json({
      success: promoData.valid,
      ...promoData,
      originalPrice,
      discountAmount,
      finalPrice
    });
  } catch (error) {
    console.error('Error calculating promo code discount:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while calculating the discount'
    });
  }
});

export default router;