import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

/**
 * Validate a promo code
 * GET /api/promo-codes/validate?code=XYZ
 */
router.get('/validate', async (req, res) => {
  try {
    const code = req.query.code as string;
    
    if (!code) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Promo code is required' 
      });
    }
    
    // Find the promo code in the database
    const promotion = await storage.getPromotionByCode(code);
    
    if (!promotion) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Invalid promo code. Please check and try again.' 
      });
    }
    
    // Check if the promo code is active
    if (!promotion.is_active) {
      return res.status(400).json({ 
        valid: false, 
        message: 'This promo code is no longer active.' 
      });
    }
    
    // Check if the promo code is expired
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    
    if (now < startDate) {
      return res.status(400).json({ 
        valid: false, 
        message: 'This promo code is not yet active.' 
      });
    }
    
    if (now > endDate) {
      return res.status(400).json({ 
        valid: false, 
        message: 'This promo code has expired.' 
      });
    }
    
    // If all checks pass, return the promotion details
    return res.status(200).json({
      valid: true,
      promotion
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return res.status(500).json({ 
      valid: false, 
      message: 'An error occurred while validating the promo code.' 
    });
  }
});

/**
 * Get a list of all active promotions
 * GET /api/promo-codes
 */
router.get('/', async (req, res) => {
  try {
    const promotions = await storage.getActivePromotions();
    return res.status(200).json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return res.status(500).json({ 
      message: 'An error occurred while fetching promotions.' 
    });
  }
});

export default router;