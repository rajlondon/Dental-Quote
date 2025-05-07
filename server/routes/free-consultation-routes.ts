/**
 * Free Consultation Routes
 * 
 * Special routes to handle the free consultation package without requiring authentication
 */

import { Router } from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { quotes, specialOffers } from '@shared/schema';

const router = Router();

/**
 * POST /api/v1/free-consultation
 * Creates a free consultation quote without requiring authentication
 */
router.post('/free-consultation', async (req, res) => {
  try {
    const { offerId, clinicId } = req.body;
    
    if (!offerId || !clinicId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: offerId and clinicId'
      });
    }
    
    console.log(`Creating free consultation for offerId=${offerId}, clinicId=${clinicId}`);
    
    // Verify this is a free consultation special offer
    const offer = await db.query.specialOffers.findFirst({
      where: eq(specialOffers.id, offerId)
    });
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Special offer not found'
      });
    }
    
    // Hard-coded patient ID for non-authenticated requests
    // In a full production environment, this would require authentication
    const patientId = 2; // Default patient user
    
    // Create the quote
    const newQuote = await db.insert(quotes)
      .values({
        patientId: patientId,
        clinicId: clinicId,
        source: 'special_offer',
        offerId: offerId,
        status: 'draft',
        totalPrice: "0.00",
        currency: "GBP",
      })
      .returning();
    
    if (!newQuote || newQuote.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create free consultation quote'
      });
    }
    
    const quoteId = newQuote[0].id;
    
    // Generate a URL for the quote
    const quoteUrl = `/quote/wizard?quoteId=${quoteId}`;
    
    return res.status(201).json({
      success: true,
      message: 'Free consultation added to your quote',
      quoteId,
      quoteUrl
    });
  } catch (error: any) {
    console.error('Error creating free consultation quote:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create consultation package',
      error: error.message
    });
  }
});

export default router;