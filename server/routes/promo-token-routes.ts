/**
 * Promotional Token Routes
 * 
 * This module handles the creation of quotes from promotional tokens.
 * These routes support special offer and package promotions through a token system.
 */

import { Router } from 'express';
import { db } from '../db';
import { eq, sql } from 'drizzle-orm';
import { 
  promoTokens, 
  quotes, 
  specialOffers, 
  treatmentLines, 
  treatmentPackages,
  standardizedTreatments
} from '@shared/schema';
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
router.post('/promo-tokens', async (req, res) => {
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
router.post('/quotes/from-token', async (req, res) => {
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
    // Since we're not requiring auth here, we'll use a dummy ID for development purposes
    // In production, this would need to be authenticated
    const userId = req.user?.id || 2; // Use user ID 2 as fallback (patient demo user)
    
    // Parse the payload to ensure we have proper type safety
    const payload = validToken.payload as Record<string, any>;
    const offerId = validToken.promoType === 'special_offer' ? payload?.offerId : undefined;
    const packageId = validToken.promoType === 'treatment_package' ? payload?.packageId : undefined;
    
    console.log(`Creating quote for userId=${userId}, clinicId=${validToken.clinicId}, offerId=${offerId}`);
    
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

/**
 * POST /api/v1/quotes/from-promo
 * Creates a new quote directly from a promotional code or token
 * This endpoint aligns with the new spec document requirements
 */
router.post('/quotes/from-promo', async (req, res) => {
  const { promoCode } = req.body;
  
  try {
    // 1. Validate the promo code
    if (!promoCode) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }
    
    // 2. Hardcoded demo values for testing purposes
    let clinicId, packageId, offerId, descriptions, prices;
    if (promoCode === 'IMPLANTPKG20') {
      // This is a package promo code
      packageId = 'pkg-001';
      clinicId = 1;
      descriptions = ['Dental Implant', 'Crown', 'X-Ray Scan'];
      prices = [800, 300, 50]; // Already discounted prices
    } else if (promoCode === 'FREECONSULT') {
      // This is a special offer promo code
      offerId = 'offer-001';
      clinicId = 2;
      descriptions = ['Free Dental Consultation'];
      prices = [0]; // Free
    } else {
      return res.status(404).json({
        success: false,
        message: 'Invalid promotional code'
      });
    }
    
    // Patient ID - use default for testing purposes
    const userId = 45;
    
    // 3. Create a new quote
    // Use snake_case for all database columns to match the actual schema
    const [newQuote] = await db.insert(quotes)
      .values({
        patient_id: userId,
        clinic_id: clinicId,
        status: 'draft',
        source: 'promo_code'
      })
      .returning();
      
    if (!newQuote) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create quote from promotion'
      });
    }
    
    const quoteId = newQuote.id;
    console.log(`Created quote ID ${quoteId} from promo code ${promoCode}`);
    
    // 4. Add treatment lines to the quote
    for (let i = 0; i < descriptions.length; i++) {
      const treatmentLine = {
        clinic_id: clinicId,
        patient_id: userId,
        quote_id: quoteId,
        procedure_code: (packageId ? 'PKG' : 'PROMO') + i,  // Generate a procedure code
        description: descriptions[i],
        quantity: 1,
        unit_price: prices[i],
        base_price_gbp: packageId ? prices[i] * 1.25 : prices[i], // 25% more for original price if package
        is_package: packageId ? true : false,
        status: 'draft',
        is_locked: true,
        package_id: packageId || null
      };
      
      await db.insert(treatmentLines).values(treatmentLine);
      console.log(`Added treatment line: ${descriptions[i]} to quote ${quoteId}`);
    }
    
    // 5. Generate a URL for the quote wizard
    const quoteUrl = `/quote/wizard?quoteId=${quoteId}`;
    
    // 6. Return the newly created quote ID and URL
    return res.status(201).json({
      success: true,
      message: 'Quote created successfully from promotion',
      quoteId,
      quoteUrl
    });
    
  } catch (error: any) {
    console.error('Error processing promotion code:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process promotional code',
      error: error.message
    });
  }
});

export default router;