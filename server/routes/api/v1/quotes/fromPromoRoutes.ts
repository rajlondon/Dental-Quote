import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../../db';
import { 
  promoTokens, 
  standardizedTreatments, 
  quoteLines, 
  quotes,
  treatmentPackages,
  specialOffers
} from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

// Schema for the promo token request
const fromPromoRequestSchema = z.object({
  token: z.string(),
  visitorEmail: z.string().email().optional(),
});

const router = Router();

/**
 * @route POST /api/v1/quotes/from-promo
 * @desc Create a new quote from a promo token
 * @access Public
 */
router.post('/from-promo', async (req, res) => {
  try {
    // Validate request body
    const validationResult = fromPromoRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters',
        errors: validationResult.error.format(),
      });
    }

    const { token, visitorEmail } = validationResult.data;

    // Find the promo token
    const promoTokenResult = await db.select().from(promoTokens).where(eq(promoTokens.token, token)).limit(1);
    
    if (promoTokenResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Promo token not found',
      });
    }

    const promoToken = promoTokenResult[0];
    
    // Check token expiry
    if (promoToken.validUntil && new Date(promoToken.validUntil) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Promo token has expired',
      });
    }
    
    // Get the payload which contains the packageId or offerId
    const payload = promoToken.payload as any;
    
    // Get user ID (or create a guest user)
    const userId = req.user?.id || 45; // Use default patient ID for testing/guest
    
    // Create a new quote
    const quoteId = uuidv4();
    await db.insert(quotes).values({
      id: quoteId,
      patientId: userId,
      clinicId: promoToken.clinicId,
      promoToken: promoToken.token,
      source: 'promo',
      offerId: promoToken.promoType === 'offer' ? payload.offerId : null,
      packageId: promoToken.promoType === 'package' ? payload.packageId : null,
    });
    
    // Process quote lines based on promo type (package or offer)
    if (promoToken.promoType === 'package' && payload.packageId) {
      // Get package details
      const packageDetails = await db.select().from(treatmentPackages)
        .where(eq(treatmentPackages.id, payload.packageId))
        .limit(1);
      
      if (packageDetails.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Package not found',
        });
      }
      
      const packageData = packageDetails[0];
      const items = packageData.items as string[];
      
      // Get treatment details for items
      const treatmentDetails = await db.select().from(standardizedTreatments)
        .where(
          items.length > 0 
            ? inArray(standardizedTreatments.code, items as string[]) 
            : undefined
        );
      
      // Create quote lines for each treatment in the package
      for (const treatment of treatmentDetails) {
        const discountedPrice = Math.round(
          treatment.basePriceGBP * (1 - Number(packageData.discountPct) / 100)
        );
        
        await db.insert(quoteLines).values({
          id: uuidv4(),
          quoteId,
          treatmentCode: treatment.code,
          name: treatment.description,
          quantity: 1,
          basePriceGBP: treatment.basePriceGBP,
          unitPriceGBP: discountedPrice,
          subtotalGBP: discountedPrice,
          basePriceUSD: treatment.basePriceUSD,
          unitPriceUSD: Math.round(treatment.basePriceUSD * (1 - Number(packageData.discountPct) / 100)),
          subtotalUSD: Math.round(treatment.basePriceUSD * (1 - Number(packageData.discountPct) / 100)),
          isLocked: true,
        });
      }
    } else if (promoToken.promoType === 'offer' && payload.offerId) {
      // Get offer details
      const offerDetails = await db.select().from(specialOffers)
        .where(eq(specialOffers.id, payload.offerId))
        .limit(1);
      
      if (offerDetails.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Offer not found',
        });
      }
      
      const offerData = offerDetails[0];
      
      // For offers, add a £0 bonus line
      const bonusData = offerData.bonus as any;
      
      await db.insert(quoteLines).values({
        id: uuidv4(),
        quoteId,
        name: bonusData?.description || `${offerData.title} - Bonus`,
        quantity: 1,
        basePriceGBP: 0,
        unitPriceGBP: 0,
        subtotalGBP: 0,
        basePriceUSD: 0,
        unitPriceUSD: 0,
        subtotalUSD: 0,
        isLocked: true,
        isBonus: true,
        notes: 'Special offer bonus item',
      });
    }
    
    // Store visitor email for potential follow-up (notification system to be implemented)
    if (visitorEmail) {
      console.log(`Promo quote ${quoteId} created for visitor email: ${visitorEmail}`);
      // Email notification will be implemented in a future update
    }
    
    // Return the created quote ID
    return res.status(201).json({
      success: true,
      quoteId,
    });
  } catch (error) {
    console.error('Error creating quote from promo:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;