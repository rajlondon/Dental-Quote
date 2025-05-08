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
    
    // Implementation to be added later
    return res.status(501).json({
      success: false,
      message: 'This endpoint is not fully implemented yet'
    });
    
  } catch (error: any) {
    console.error('Error processing token:', error);
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
// Support both POST for client-side submission and GET for direct testing
router.post('/quotes/from-promo', async (req, res) => {
  // POST method implementation (body parameters)
  await handlePromoQuote(req.body, res);
});

// Add GET handler for direct URL testing
router.get('/quotes/from-promo', async (req, res) => {
  // GET method implementation (query parameters)
  await handlePromoQuote(req.query, res);
});

// Shared implementation function for both GET and POST handlers
async function handlePromoQuote(params: any, res: any) {
  const { promoToken, clinicId: requestedClinicId, treatmentItems: rawTreatmentItems } = params;
  
  try {
    // 1. Validate the input parameters
    if (!promoToken) {
      return res.status(400).json({
        success: false,
        message: 'Promotional token is required'
      });
    }
    
    // Check if we have a valid clinic ID
    if (!requestedClinicId) {
      return res.status(400).json({
        success: false,
        message: 'Clinic ID is required'
      });
    }
    
    // Handle the case where treatmentItems might be a JSON string (from GET query)
    let treatmentItems;
    if (typeof rawTreatmentItems === 'string') {
      try {
        treatmentItems = JSON.parse(rawTreatmentItems);
      } catch (e) {
        console.error('Error parsing treatment items:', e);
        treatmentItems = [];
      }
    } else {
      treatmentItems = rawTreatmentItems || [];
    }
    
    // If treatmentItems is still empty, use default treatments
    if (!treatmentItems || !Array.isArray(treatmentItems) || treatmentItems.length === 0) {
      // Use default treatment items for testing
      treatmentItems = [
        {
          id: "dental_implant_standard",
          name: "Dental Implant",
          quantity: 2,
          priceGBP: 2500,
          subtotalGBP: 5000,
          category: "Implants"
        },
        {
          id: "dental_crown",
          name: "Dental Crown",
          quantity: 2,
          priceGBP: 450,
          subtotalGBP: 900,
          category: "Cosmetic"
        },
        {
          id: "teeth_whitening",
          name: "Teeth Whitening",
          quantity: 1,
          priceGBP: 350,
          subtotalGBP: 350,
          category: "Cosmetic"
        }
      ];
    }
    
    console.log(`Creating quote from promo token ${promoToken} for clinic ${requestedClinicId}`);
    console.log("Treatment items:", JSON.stringify(treatmentItems));
    
    // 2. Determine discount type and amount based on promoToken
    let discountType = 'fixed_amount';
    let discountAmount = 0;
    let packageId, offerId;
    
    // Apply discounts based on specific promo tokens
    if (promoToken === 'BEYAZ250') {
      discountType = 'fixed_amount';
      discountAmount = 250;
      // This is associated with the Beyaz Ada clinic
    } else if (promoToken === 'DENTSPA20') {
      discountType = 'percentage';
      discountAmount = 20;
      // This is associated with the DentSpa clinic
    } else if (promoToken.startsWith('PKG')) {
      // This is a package promo code
      packageId = promoToken.slice(3); // Extract package ID from token format: PKG[ID]
    } else if (promoToken.startsWith('PROMO')) {
      // This is a special offer promo code
      offerId = promoToken.slice(5); // Extract offer ID from token format: PROMO[ID]
    } else {
      return res.status(404).json({
        success: false,
        message: 'Invalid promotional token'
      });
    }
    
    // Patient ID - use default for testing purposes
    const patientId = 45; 
    
    // 3. Create a new quote using direct SQL
    console.log("Inserting quote with patient_id:", patientId);
    
    // Use the raw pool connection for direct SQL
    const pool = db.$client;
    const insertQuoteQuery = `
      INSERT INTO quotes (patient_id, clinic_id, status, source, promo_token, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const now = new Date();
    // Map clinic ID string to numeric ID for database
    let clinicIdNumber = 1;  // Default to 1
    
    // Map clinic ID string to the proper numeric ID
    if (requestedClinicId === 'dentspa') {
      clinicIdNumber = 1;
    } else if (requestedClinicId === 'beyazada') {
      clinicIdNumber = 2;
    } else if (requestedClinicId === 'maltepe') {
      clinicIdNumber = 3;
    } else if (requestedClinicId === 'dentalharmony') {
      clinicIdNumber = 4;
    } else if (requestedClinicId === 'smiledesigners') {
      clinicIdNumber = 5;
    } else if (typeof requestedClinicId === 'number') {
      clinicIdNumber = requestedClinicId;
    } else if (typeof requestedClinicId === 'string' && !isNaN(parseInt(requestedClinicId))) {
      clinicIdNumber = parseInt(requestedClinicId);
    }
    
    console.log(`Mapping clinic ID ${requestedClinicId} to numeric ID ${clinicIdNumber}`);
    
    const queryParams = [
      patientId, 
      clinicIdNumber, 
      'draft', 
      'promo_token', 
      promoToken,
      now, 
      now
    ];
    console.log("SQL query parameters:", queryParams);
    
    const quoteResult = await pool.query(insertQuoteQuery, queryParams);
    console.log("Quote insert result:", JSON.stringify(quoteResult.rows));
    
    if (!quoteResult.rows || quoteResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create quote from promotion'
      });
    }
    
    const newQuote = quoteResult.rows[0];
    const quoteId = newQuote.id;
    console.log(`Created quote ID ${quoteId} from promo token ${promoToken}`);
    
    // 4. Add treatment lines to the quote using the provided treatment items
    const discountFactor = discountType === 'percentage' 
      ? (1 - (discountAmount / 100)) 
      : null;
    
    let totalDiscount = 0;
    const totalBeforeDiscount = treatmentItems.reduce((sum, item) => sum + item.subtotalGBP, 0);
    
    // First, calculate a price factor based on the clinic ID (typically lower than UK prices)
    // This simulates how clinics in Turkey offer lower prices than the UK
    const priceFactor = requestedClinicId === 'beyazada' ? 0.35 : 0.4; // 35-40% of UK price
    
    for (let i = 0; i < treatmentItems.length; i++) {
      try {
        const item = treatmentItems[i];
        const isItemDiscounted = true; // All items in promo flow get a discount
        
        // Calculate unit price based on clinic's price factor and any additional discounts
        let unitPrice = item.priceGBP * priceFactor;
        const basePriceGBP = item.priceGBP * priceFactor; // Store original price before promo discount
        
        // Apply the promotional discount if applicable
        if (discountType === 'percentage' && discountFactor !== null) {
          unitPrice = unitPrice * discountFactor;
        }
        
        // For fixed amount discounts, we'll apply it proportionally across all items
        if (discountType === 'fixed_amount') {
          // Calculate what portion of the total this item represents
          const itemPortion = item.subtotalGBP / totalBeforeDiscount;
          // Apply that portion of the discount
          const itemDiscount = discountAmount * itemPortion;
          // Don't let the discount make the price negative
          const maxDiscount = basePriceGBP * 0.9; // Max 90% discount
          const actualDiscount = Math.min(itemDiscount, maxDiscount);
          
          unitPrice = basePriceGBP - actualDiscount / item.quantity;
          totalDiscount += actualDiscount;
        }
        
        const procedureCode = item.id || `PROMO${i}`;
        const description = item.name;
        const quantity = item.quantity || 1;
        
        // Use direct SQL insert with the pool
        const insertLineQuery = `
          INSERT INTO treatment_lines (
            clinic_id, patient_id, quote_id, procedure_code, description, 
            quantity, unit_price, base_price_gbp, is_package, status, 
            is_locked, package_id, is_discounted, created_at, updated_at
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id
        `;
        
        const lineParams = [
          clinicIdNumber, 
          patientId, 
          quoteId, 
          procedureCode, 
          description,
          quantity, 
          unitPrice, 
          basePriceGBP, 
          false, // Not a package line
          'draft',
          true, // Locked because it's part of a promotion
          packageId || null, 
          isItemDiscounted,
          now, 
          now
        ];
        
        console.log(`Adding treatment line "${description}" with params:`, lineParams);
        
        const lineResult = await pool.query(insertLineQuery, lineParams);
        
        if (lineResult.rows && lineResult.rows.length > 0) {
          console.log(`Added treatment line: ${description} to quote ${quoteId} with ID ${lineResult.rows[0].id}`);
        } else {
          console.log(`Failed to add treatment line: ${description}`);
        }
      } catch (lineError) {
        console.error(`Error adding treatment line ${i}:`, lineError);
      }
    }
    
    // If there was a fixed discount and not all of it was used, add a bonus line item
    if (discountType === 'fixed_amount' && totalDiscount < discountAmount) {
      try {
        const remainingDiscount = discountAmount - totalDiscount;
        
        // Add a bonus line for the remaining discount
        const insertBonusLineQuery = `
          INSERT INTO treatment_lines (
            clinic_id, patient_id, quote_id, procedure_code, description, 
            quantity, unit_price, base_price_gbp, is_package, status, 
            is_locked, is_bonus, is_discounted, created_at, updated_at
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id
        `;
        
        const bonusParams = [
          clinicIdNumber, 
          patientId, 
          quoteId, 
          'BONUS', 
          `Promotional Bonus: ${promoToken}`,
          1, 
          -remainingDiscount, // Negative price means it's a discount
          0, // Zero base price since it's a pure bonus
          false, 
          'draft',
          true, 
          true, // This is a bonus line
          true, // It is discounted (it's a pure discount)
          now, 
          now
        ];
        
        console.log(`Adding bonus line with params:`, bonusParams);
        
        const bonusResult = await pool.query(insertBonusLineQuery, bonusParams);
        
        if (bonusResult.rows && bonusResult.rows.length > 0) {
          console.log(`Added bonus line to quote ${quoteId} with ID ${bonusResult.rows[0].id}`);
        } else {
          console.log(`Failed to add bonus line`);
        }
      } catch (bonusError) {
        console.error(`Error adding bonus line:`, bonusError);
      }
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
}

export default router;