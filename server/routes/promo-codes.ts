import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

/**
 * Validate a promo code
 * POST /api/promo-codes/validate
 */
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required.'
      });
    }
    
    // Get promotion by code
    const promotion = await storage.getPromotionByCode(code);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code.'
      });
    }
    
    // Check if promotion is active
    if (!promotion.is_active) {
      return res.status(400).json({
        success: false,
        message: 'This promotion is no longer active.'
      });
    }
    
    // Check if promotion is approved
    if (!promotion.admin_approved) {
      return res.status(400).json({
        success: false,
        message: 'This promotion has not been approved yet.'
      });
    }
    
    // Check if promotion is within date range
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    
    if (now < startDate) {
      return res.status(400).json({
        success: false,
        message: 'This promotion is not yet active.'
      });
    }
    
    if (now > endDate) {
      return res.status(400).json({
        success: false,
        message: 'This promotion has expired.'
      });
    }
    
    // Format the promotion data for the client
    const formattedPromotion = {
      id: promotion.id,
      title: promotion.title,
      description: promotion.description,
      promo_code: promotion.promo_code,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      applicable_treatments: promotion.applicable_treatments,
      terms_conditions: promotion.terms_conditions
    };
    
    return res.status(200).json({
      success: true,
      message: 'Valid promotion code.',
      promotion: formattedPromotion
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
 * Get all promotions that are active
 * GET /api/promo-codes
 */
router.get('/', async (req, res) => {
  try {
    // Get all active promotions
    const promotions = await storage.getActivePromotions();
    
    // Format promotions for client
    const formattedPromotions = promotions.map(promotion => ({
      id: promotion.id,
      title: promotion.title,
      description: promotion.description,
      promo_code: promotion.promo_code,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      applicable_treatments: promotion.applicable_treatments,
      terms_conditions: promotion.terms_conditions
    }));
    
    return res.status(200).json({
      success: true,
      data: formattedPromotions
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching promotions.'
    });
  }
});

export default router;