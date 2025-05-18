/**
 * Promo Code API Routes
 * Handles validation and application of promo codes
 */
import { Router, Request, Response } from 'express';
import { validatePromoCode, calculateDiscount, applyDiscount, PromoCodeData } from '../services/promo-code-service';

export const promoCodeRouter = Router();

// Validate a promo code
promoCodeRouter.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Invalid promo code format'
      });
    }

    const promoData = await validatePromoCode(code);
    
    return res.status(200).json({
      success: true,
      ...promoData
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error validating promo code'
    });
  }
});

// Calculate discount amount for a promo code and price
promoCodeRouter.post('/calculate-discount', async (req: Request, res: Response) => {
  try {
    const { code, price } = req.body;
    
    if (!code || typeof code !== 'string' || !price || isNaN(Number(price))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters'
      });
    }

    const promoData = await validatePromoCode(code);
    const discountAmount = calculateDiscount(promoData, Number(price));
    const finalPrice = applyDiscount(promoData, Number(price));
    
    return res.status(200).json({
      success: true,
      valid: promoData.valid,
      message: promoData.message,
      originalPrice: Number(price),
      discountAmount,
      finalPrice
    });
  } catch (error) {
    console.error('Error calculating promo code discount:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error calculating discount'
    });
  }
});

export default promoCodeRouter;