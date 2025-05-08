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
  const { promoCode, patientId } = req.body;
  
  if (!promoCode) {
    return res.status(400).json({
      success: false,
      message: 'Missing required promotional code'
    });
  }
  
  try {
    // 1. Check if the promo code refers to a token or a special offer code
    const promoToken = await db.query.promoTokens.findFirst({
      where: eq(promoTokens.token, promoCode)
    });
    
    // Get the user ID - either the authenticated user, provided patientId, or fallback to demo user
    const userId = req.user?.id || patientId || 2; // Fallback to user ID 2 for demo
    
    let clinicId: number | string;
    let offerId: string | undefined;
    let packageId: string | undefined;
    let source = 'promo_code';
    
    if (promoToken) {
      // This is a formal promo token
      const today = new Date().toISOString().split('T')[0];
      
      // Check if token is expired
      if (promoToken.validUntil < today) {
        return res.status(400).json({
          success: false,
          message: 'Promotional token has expired'
        });
      }
      
      // Extract details from token
      clinicId = promoToken.clinicId;
      const payload = promoToken.payload as Record<string, any>;
      
      if (promoToken.promoType === 'special_offer') {
        offerId = payload?.offerId;
      } else if (promoToken.promoType === 'treatment_package') {
        packageId = payload?.packageId;
      }
      
      // Mark this as coming from a token
      source = 'promo_token';
      
    } else {
      // Check if it's a special offer promo code directly
      const specialOffer = await db.query.specialOffers.findFirst({
        where: eq(specialOffers.promoCode, promoCode)
      });
      
      if (!specialOffer) {
        return res.status(404).json({
          success: false,
          message: 'Invalid promotion code'
        });
      }
      
      // Check if the offer is active
      if (!specialOffer.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This promotional offer is no longer active'
        });
      }
      
      // Check if the offer has reached max uses (if applicable)
      if (specialOffer.maxUses && specialOffer.usedCount >= specialOffer.maxUses) {
        return res.status(400).json({
          success: false,
          message: 'This promotional offer has reached its maximum number of uses'
        });
      }
      
      clinicId = specialOffer.clinicId;
      offerId = specialOffer.id;
    }
    
    // 2. Create a new quote
    console.log(`Creating quote for userId=${userId}, clinicId=${clinicId}, offerId=${offerId}, packageId=${packageId}`);
    
    const newQuote = await db.insert(quotes)
      .values({
        patientId: userId,
        clinicId,
        promoToken: promoCode,
        source,
        offerId,
        packageId
      })
      .returning();
    
    if (!newQuote || newQuote.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create quote from promotion'
      });
    }
    
    const quoteId = newQuote[0].id;
    
    // 3. If it's a special offer with a direct code, increment the usage count
    if (source === 'promo_code' && offerId) {
      await db.update(specialOffers)
        .set({
          usedCount: db.sql`${specialOffers.usedCount} + 1`
        })
        .where(eq(specialOffers.id, offerId));
    }
    
    // 4. Process treatment lines based on the promotion type
    if (offerId) {
      // For special offers - find the offer details
      const offer = await db.query.specialOffers.findFirst({
        where: eq(specialOffers.id, offerId)
      });
      
      if (offer && offer.bonus) {
        // Add bonus items to the quote if applicable
        const bonusItem = offer.bonus as { description: string, unitPrice: number };
        
        // Add the special offer bonus line
        await db.insert(treatmentLines)
          .values({
            clinicId,
            patientId: userId,
            quoteId,
            procedureCode: 'SPECIAL_OFFER_BONUS',
            description: bonusItem.description,
            quantity: 1,
            unitPrice: bonusItem.unitPrice,
            basePriceGBP: null, // Bonus lines can have null base price
            status: 'draft',
            isLocked: true // Lock bonus lines
          });
        
        console.log(`Added special offer bonus to quote: ${bonusItem.description}`);
      }
    } else if (packageId) {
      // For packages - find the package details
      const pkg = await db.query.treatmentPackages.findFirst({
        where: eq(treatmentPackages.id, packageId)
      });
      
      if (pkg) {
        // Add the treatments from the package
        const packageItems = pkg.items as string[];
        
        // For each treatment code in the package
        for (const treatmentCode of packageItems) {
          // Look up the standardized treatment (if implemented)
          const stdTreatment = await db.query.standardizedTreatments.findFirst({
            where: eq(standardizedTreatments.code, treatmentCode)
          });
          
          if (stdTreatment) {
            // Calculate discounted price
            const discountedPrice = stdTreatment.basePriceGBP * (1 - (pkg.discountPct / 100));
            
            // Add the treatment line
            await db.insert(treatmentLines)
              .values({
                clinicId,
                patientId: userId,
                quoteId,
                procedureCode: stdTreatment.code,
                description: stdTreatment.description,
                quantity: 1,
                unitPrice: discountedPrice,
                isPackage: true,
                packageId,
                status: 'draft'
              });
            
            console.log(`Added package treatment to quote: ${stdTreatment.description}`);
          }
        }
      }
    }
    
    // Generate a URL for the quote wizard
    const quoteUrl = `/quote/wizard?quoteId=${quoteId}`;
    
    // 5. Return the newly created quote ID and URL
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