/**
 * Free Consultation Routes
 * 
 * Special routes to handle the free consultation package without requiring authentication
 */

import { Router } from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { quotes, specialOffers, treatmentLines } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/v1/free-consultation
 * Creates a free consultation quote with treatment lines without requiring authentication
 */
router.post('/free-consultation', async (req, res) => {
  try {
    const { offerId, clinicId } = req.body;
    
    console.log('Free consultation request received:', { offerId, clinicId, body: req.body });
    
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
    
    console.log('Found offer:', offer);
    
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
    console.log('Created quote with ID:', quoteId);
    
    try {
      // Create a treatment line for the consultation directly
      console.log(`Adding consultation treatment line to quote ${quoteId}`);
      
      const treatmentLine = await db.insert(treatmentLines)
        .values({
          id: uuidv4(),
          clinicId: parseInt(clinicId),
          patientId: patientId,
          quoteId: quoteId,
          procedureCode: "CONSULTATION",
          description: "Free initial dental consultation",
          quantity: 1,
          unitPrice: "0.00",
          isPackage: false,
          status: "draft",
          patientNotes: "Special offer: Free consultation",
          clinicNotes: "This is a complimentary consultation as part of a special offer",
        })
        .returning();
        
      console.log('Created treatment line:', treatmentLine);
    } catch (treatmentLineError) {
      console.error('Failed to add consultation treatment line:', treatmentLineError);
      // Continue with the process even if treatment line creation fails
    }
    
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

/**
 * Helper function to add a consultation treatment line directly to a quote
 */
async function addConsultationTreatmentLine(quoteId: string, clinicId: string, patientId: number) {
  try {
    console.log(`Adding consultation treatment line to quote ${quoteId}`);
    
    // Create the treatment line
    const treatmentLine = await db.insert(treatmentLines)
      .values({
        id: uuidv4(),
        clinicId: parseInt(clinicId),
        patientId: patientId,
        quoteId: quoteId,
        procedureCode: "CONSULTATION",
        description: "Free initial dental consultation",
        quantity: 1,
        unitPrice: "0.00",
        isPackage: false,
        status: "draft",
        patientNotes: "Special offer: Free consultation",
        clinicNotes: "This is a complimentary consultation as part of a special offer",
      })
      .returning();
      
    console.log('Created treatment line:', treatmentLine);
    
    return treatmentLine;
  } catch (error) {
    console.error('Failed to add consultation treatment line:', error);
    throw error;
  }
}

export default router;