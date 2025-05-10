/**
 * API route for applying coupon codes to quotes
 */
import { Router } from 'express';
import { db } from '../db';
import { applyPromoToQuote } from '../utils/promo-utils';
import { eq } from 'drizzle-orm';
import { promos, quotes } from '@shared/schema';
import { logger } from '../utils/logger';
import { mixpanelTrack } from '../utils/analytics';

const router = Router();

/**
 * Apply a coupon code to a quote
 * POST /quotes/apply-code
 * 
 * Body:
 * - quoteId: string - The ID of the quote to apply the code to
 * - clinicId: string - The ID of the clinic (for validation)
 * - code: string - The coupon code to apply
 * 
 * Returns:
 * - Updated quote with applied discount
 */
router.post('/quotes/apply-code', async (req, res) => {
  try {
    const { quoteId, clinicId, code } = req.body;
    
    if (!quoteId || !clinicId || !code) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: quoteId, clinicId, and code are required' 
      });
    }

    // Find the promo by code (must be active)
    const foundPromo = await db.select().from(promos)
      .where(
        eq(promos.code, code.toUpperCase())
      ).limit(1);
    
    if (!foundPromo || foundPromo.length === 0) {
      logger.info(`Invalid promo code attempted: ${code}`);
      mixpanelTrack('CodeApplyFailed', { 
        code, 
        quoteId, 
        clinicId,
        reason: 'INVALID_CODE' 
      });
      
      return res.status(400).json({
        success: false,
        message: 'INVALID_CODE'
      });
    }

    const promoRecord = foundPromo[0];
    
    // Validate the promo is active
    if (!promoRecord.isActive) {
      mixpanelTrack('CodeApplyFailed', { 
        code, 
        quoteId, 
        clinicId,
        reason: 'INACTIVE_CODE' 
      });
      
      return res.status(400).json({
        success: false,
        message: 'INACTIVE_CODE'
      });
    }
    
    // Validate the clinic is valid for this promo
    const validForClinic = await db.query.promoClinics.findFirst({
      where: (promoClinic, { and, eq }) => and(
        eq(promoClinic.promoId, promoRecord.id),
        eq(promoClinic.clinicId, clinicId)
      )
    });
    
    if (!validForClinic) {
      mixpanelTrack('CodeApplyFailed', { 
        code, 
        quoteId, 
        clinicId,
        reason: 'INVALID_CLINIC' 
      });
      
      return res.status(400).json({
        success: false,
        message: 'INVALID_CLINIC'
      });
    }

    // Get the quote
    const foundQuote = await db.select().from(quotes)
      .where(
        eq(quotes.id, quoteId)
      ).limit(1);
    
    if (!foundQuote || foundQuote.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    const quoteRecord = foundQuote[0];
    
    // Apply the promo to the quote
    const updatedQuote = await applyPromoToQuote(quoteRecord, promoRecord);
    
    // Track successful application
    mixpanelTrack('CodeApplied', { 
      code, 
      quoteId, 
      clinicId,
      city: updatedQuote.cityCode || 'unknown' 
    });
    
    return res.json({
      success: true,
      data: {
        quoteId: updatedQuote.id,
        subtotal: updatedQuote.subtotal,
        discount: updatedQuote.discount,
        total: updatedQuote.total,
        promoLabel: `${code.toUpperCase()} applied`
      }
    });
  } catch (error) {
    logger.error('Error applying promo code:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while applying the promo code'
    });
  }
});

export default router;