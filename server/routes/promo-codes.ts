import { Router } from 'express';
import { storage } from '../storage';
import { ZodError } from 'zod';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

/**
 * Validate a promo code
 * GET /api/promo-codes/:code/validate
 */
router.get('/:code/validate', async (req, res) => {
  try {
    const code = req.params.code;
    
    // Validate code format
    if (!code || code.length < 3 || code.length > 20) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid promo code format'
      });
    }
    
    // Get promotion by code
    const promotion = await storage.getPromotionByCode(code);
    
    if (!promotion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Promo code not found'
      });
    }
    
    // Check if promotion is active
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    
    if (!promotion.is_active || now < startDate || now > endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Promo code is not active or has expired'
      });
    }
    
    // Return promotion data
    return res.status(200).json({
      success: true,
      data: {
        id: promotion.id,
        code: promotion.promo_code,
        title: promotion.title,
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        applicable_treatments: promotion.applicable_treatments,
        terms_conditions: promotion.terms_conditions,
      }
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while validating the promo code.'
    });
  }
});

/**
 * Get all active promotions
 * GET /api/promo-codes/active
 */
router.get('/active', isAuthenticated, async (req, res) => {
  try {
    const promotions = await storage.getActivePromotions();
    
    // Format response
    const formattedPromotions = promotions.map(promo => ({
      id: promo.id,
      code: promo.promo_code,
      title: promo.title,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      applicable_treatments: promo.applicable_treatments,
      terms_conditions: promo.terms_conditions,
      start_date: promo.start_date,
      end_date: promo.end_date,
    }));
    
    return res.status(200).json({
      success: true,
      data: formattedPromotions
    });
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching active promotions.'
    });
  }
});

/**
 * Apply a promo code to a quote
 * POST /api/promo-codes/:code/apply
 */
router.post('/:code/apply', isAuthenticated, async (req, res) => {
  try {
    const code = req.params.code;
    const { quoteId } = req.body;
    
    if (!quoteId) {
      return res.status(400).json({
        success: false,
        message: 'Quote ID is required'
      });
    }
    
    // Validate code
    const promotion = await storage.getPromotionByCode(code);
    
    if (!promotion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Promo code not found'
      });
    }
    
    // Check if promotion is active
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    
    if (!promotion.is_active || now < startDate || now > endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Promo code is not active or has expired'
      });
    }
    
    // Get the quote
    const quote = await storage.getQuote(quoteId);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    // Apply the promotion to the quote
    const updatedQuote = await storage.updateQuote(quoteId, {
      promoCodeId: promotion.id,
      promoCodeApplied: true,
      discountType: promotion.discount_type,
      discountValue: promotion.discount_value,
      // Calculate the new total price based on the discount
      // This is a simplified calculation, actual implementation may vary
      totalPrice: quote.totalPrice * (1 - (promotion.discount_type === 'percentage' 
        ? promotion.discount_value / 100 
        : promotion.discount_value / quote.totalPrice))
    });
    
    return res.status(200).json({
      success: true,
      data: updatedQuote
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data.',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred while applying the promo code.'
    });
  }
});

export default router;