/**
 * Promotional Token Routes
 * 
 * This module handles the creation of quotes from promotional tokens.
 * These routes support special offer and package promotions through a token system.
 */

import { Router } from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { promoTokens, quotes } from '@shared/schema';
import { ensureAuthenticated } from '../middleware/auth';

const router = Router();

/**
 * GET /api/v1/promo-tokens/check/:offerId
 * Checks if a promotional token exists for a given offer ID
 */
router.get('/promo-tokens/check/:offerId', async (req, res) => {
  const { offerId } = req.params;
  const tokenId = `special_${offerId}`;
  
  try {
    const tokenExists = await db.query.promoTokens.findFirst({
      where: eq(promoTokens.token, tokenId)
    });
    
    if (tokenExists) {
      return res.status(200).json({
        success: true,
        message: 'Token exists',
        token: tokenExists
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }
  } catch (error: any) {
    console.error('Error checking promo token:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check token',
      error: error.message
    });
  }
});

/**
 * POST /api/v1/promo-tokens
 * Creates a new promotional token for special offers or packages
 */
router.post('/promo-tokens', ensureAuthenticated, async (req, res) => {
  const { clinicId, promoType, token, payload, displayOnHome, validUntil } = req.body;
  
  if (!clinicId || !promoType || !token || !payload || !validUntil) {
    return res.status(400).json({
      success: false,
      message: 'Missing required token parameters'
    });
  }
  
  try {
    // Check if token already exists
    const existingToken = await db.query.promoTokens.findFirst({
      where: eq(promoTokens.token, token)
    });
    
    if (existingToken) {
      return res.status(200).json({
        success: true,
        message: 'Token already exists',
        token: existingToken
      });
    }
    
    // Create the token
    const newToken = await db.insert(promoTokens)
      .values({
        token,
        clinicId,
        promoType,
        payload,
        validUntil,
        displayOnHome: displayOnHome || false
      })
      .returning();
    
    if (!newToken || newToken.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create token'
      });
    }
    
    return res.status(201).json({
      success: true,
      message: 'Token created successfully',
      token: newToken[0]
    });
  } catch (error: any) {
    console.error('Error creating promo token:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create promotional token',
      error: error.message
    });
  }
});

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
    
    // Parse the payload to ensure we have proper type safety
    const payload = validToken.payload as Record<string, any>;
    const offerId = validToken.promoType === 'special_offer' ? payload?.offerId : undefined;
    const packageId = validToken.promoType === 'treatment_package' ? payload?.packageId : undefined;
    
    const newQuote = await db.insert(quotes)
      .values({
        patientId: userId,
        clinicId: validToken.clinicId,
        promoToken: validToken.token,
        source: 'promo',
        offerId: offerId,
        packageId: packageId
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
      console.log(`Created quote with special offer: ${offerId}`);
    } else if (validToken.promoType === 'treatment_package') {
      // Add the package and remove any duplicate base treatments
      // In a full implementation, you'd add the package line items here
      console.log(`Created quote with package: ${packageId}`);
    }
    
    // Generate a URL for the quote
    const quoteUrl = `/quote/wizard?quoteId=${quoteId}`;
    
    // 4. Return the newly created quote ID and URL
    return res.status(201).json({
      success: true,
      message: 'Quote created successfully from promo token',
      quoteId,
      quoteUrl
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