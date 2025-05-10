/**
 * API endpoint for applying promotional codes to quotes
 */
import { Request, Response } from 'express';
import { z } from 'zod';
import { findPromoByCode, canApplyPromoToQuote, applyPromoToQuote, removePromoFromQuote, findPromoById } from '../utils/promo-utils';
import log from '../utils/logger';
import { pool } from '../db';
import { trackPromoCodeApplication } from '../utils/analytics';

// Validation schema for apply code request
const applyCodeSchema = z.object({
  code: z.string().min(1).max(50),
  quoteId: z.string().uuid()
});

// Validation schema for remove code request
const removeCodeSchema = z.object({
  quoteId: z.string().uuid()
});

/**
 * Apply a promo code to a quote
 * @param req The request object
 * @param res The response object
 */
export async function applyCode(req: Request, res: Response) {
  try {
    const validation = applyCodeSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }
    
    const { code, quoteId } = validation.data;
    
    // Find the promo by code
    const promo = await findPromoByCode(code);
    
    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found or expired'
      });
    }
    
    // Check if the promo can be applied to this quote
    const canApply = await canApplyPromoToQuote(promo, quoteId);
    
    if (!canApply) {
      return res.status(403).json({
        success: false,
        message: 'This promo code cannot be applied to the selected quote'
      });
    }
    
    // Apply the promo to the quote
    const updatedQuote = await applyPromoToQuote(quoteId, promo);
    
    if (!updatedQuote) {
      return res.status(500).json({
        success: false,
        message: 'Failed to apply promo code'
      });
    }
    
    // Track the promo code application
    const userId = req.user?.id || 'anonymous';
    await trackPromoCodeApplication(
      userId,
      promo.id,
      quoteId,
      updatedQuote.discount || 0,
      true
    );
    
    // Return success response with updated quote and promo details
    return res.status(200).json({
      success: true,
      message: 'Promo code applied successfully',
      quote: updatedQuote,
      promo
    });
  } catch (err: any) {
    log.error('Error applying promo code:', err);
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred while applying the promo code'
    });
  }
}

/**
 * Remove a promo code from a quote
 * @param req The request object
 * @param res The response object
 */
export async function removeCode(req: Request, res: Response) {
  try {
    const validation = removeCodeSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }
    
    const { quoteId } = validation.data;
    
    // Get the current quote to find the promo ID before removal
    const quoteQuery = `
      SELECT q.*, p.* 
      FROM quotes q
      LEFT JOIN promos p ON q.promo_id = p.id
      WHERE q.id = $1
    `;
    
    const quoteResult = await pool.query(quoteQuery, [quoteId]);
    
    if (quoteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    const quote = quoteResult.rows[0];
    const promoId = quote.promo_id;
    
    // Remove the promo from the quote
    const updatedQuote = await removePromoFromQuote(quoteId);
    
    if (!updatedQuote) {
      return res.status(500).json({
        success: false,
        message: 'Failed to remove promo code'
      });
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Promo code removed successfully',
      quote: updatedQuote
    });
  } catch (err: any) {
    log.error('Error removing promo code:', err);
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred while removing the promo code'
    });
  }
}

export default {
  applyCode,
  removeCode
};