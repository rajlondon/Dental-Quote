/**
 * Promotional Token Routes
 * 
 * This module handles the creation of quotes from promotional tokens.
 * These routes support special offer and package promotions through a token system.
 */

import { Router } from 'express';
import { db } from '../db';
import { eq, and, gte } from 'drizzle-orm';
import { promoTokens, quotes } from '@shared/schema';
import { ensureAuthenticated } from '../middleware/auth';

const router = Router();

/**
 * POST /api/v1/quotes/from-token
 * Creates a new quote from a promotional token, linking it to appropriate special offer or package
 */
router.post('/quotes/from-token', ensureAuthenticated, async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Missing required token parameter'
    });
  }
  
  try {
    // 1. Validate the token exists and is valid
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const validToken = await db.query.promoTokens.findFirst({
      where: eq(promoTokens.token, token)
    });
    
    // Check if token exists and is not expired
    if (!validToken || validToken.validUntil < today) {
      return res.status(404).json({
        success: false,
        message: 'Promotional token is invalid or expired'
      });
    }
    
    // 2. Create a new quote using the token data
    const userId = req.user!.id;
    const newQuote = await db.insert(quotes)
      .values({
        patientId: userId,
        clinicId: validToken.clinicId,
        promoToken: validToken.token,
        source: 'promo',
        // Set specific fields based on promo type
        ...(validToken.promoType === 'special_offer' && validToken.payload?.offerId 
          ? { offerId: validToken.payload.offerId }
          : {}),
        ...(validToken.promoType === 'treatment_package' && validToken.payload?.packageId 
          ? { packageId: validToken.payload.packageId }
          : {})
      })
      .returning();
    
    if (!newQuote || newQuote.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create quote from token'
      });
    }
    
    const quoteId = newQuote[0].id;
    
    // 3. Process the specific promo type to add bonus items or packages
    if (validToken.promoType === 'special_offer') {
      // Add the special offer bonus line if applicable
      // In a full implementation, you'd add the special offer line item to the quote here
      console.log(`Created quote with special offer: ${validToken.payload?.offerId}`);
    } else if (validToken.promoType === 'treatment_package') {
      // Add the package and remove any duplicate base treatments
      // In a full implementation, you'd add the package line items here
      console.log(`Created quote with package: ${validToken.payload?.packageId}`);
    }
    
    // 4. Return the newly created quote ID
    return res.status(201).json({
      success: true,
      message: 'Quote created successfully from promo token',
      quoteId
    });
    
  } catch (error: any) {
    console.error('Error processing promo token:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process promotional token',
      error: error.message
    });
  }
});

export default router;