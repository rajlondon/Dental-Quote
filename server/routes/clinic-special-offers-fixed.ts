import express from 'express';
import { db } from '../db';
import { specialOffers, clinics } from '@shared/schema';
import { eq, and, inArray, gte } from 'drizzle-orm';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

const router = express.Router();

/**
 * Get special offers for a specific clinic
 * GET /api/special-offers/clinic/:clinicId
 */
router.get('/clinic/:clinicId', async (req, res) => {
  try {
    const clinicId = parseInt(req.params.clinicId);
    
    if (isNaN(clinicId)) {
      return res.status(400).json({ success: false, message: 'Invalid clinic ID' });
    }
    
    // Get active special offers for the clinic
    const offers = await db
      .select()
      .from(specialOffers)
      .where(
        and(
          eq(specialOffers.clinicId, clinicId),
          eq(specialOffers.isActive, true)
        )
      );
      
    // Filter out expired offers in application code
    const now = new Date();
    const validOffers = offers.filter(offer => {
      // If validUntil is null, offer doesn't expire
      if (!offer.validUntil) return true;
      
      // Otherwise check if offer is still valid
      const offerDate = new Date(offer.validUntil);
      return offerDate >= now;
    });
      
    return res.json({ success: true, data: validOffers });
  } catch (error) {
    console.error('Error fetching clinic special offers:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Match treatments to special offers
 * POST /api/special-offers/match-treatments
 * Body: { clinicId: number, treatments: Array<{ name: string, category: string, quantity: number }> }
 */
const matchTreatmentsSchema = z.object({
  clinicId: z.number().int().positive(),
  treatments: z.array(
    z.object({
      name: z.string(),
      category: z.string().optional(),
      quantity: z.number().int().positive().optional(),
      id: z.string().optional()
    })
  )
});

router.post('/match-treatments', async (req, res) => {
  try {
    // Validate the request body
    const validatedData = matchTreatmentsSchema.parse(req.body);
    const { clinicId, treatments } = validatedData;
    
    // Get all active special offers for the clinic
    const offers = await db
      .select()
      .from(specialOffers)
      .where(
        and(
          eq(specialOffers.clinicId, clinicId),
          eq(specialOffers.isActive, true)
        )
      );
    
    // Filter out expired offers in application code
    const now = new Date();
    const validOffers = offers.filter(offer => {
      // If validUntil is null, offer doesn't expire
      if (!offer.validUntil) return true;
      
      // Otherwise check if offer is still valid
      const offerDate = new Date(offer.validUntil);
      return offerDate >= now;
    });
    
    if (!validOffers || validOffers.length === 0) {
      return res.json({ 
        success: true, 
        data: { 
          matchedOffers: [],
          message: 'No active special offers available for this clinic'
        }
      });
    }
    
    // Get the clinic details
    const [clinic] = await db
      .select()
      .from(clinics)
      .where(eq(clinics.id, clinicId));
      
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }
    
    // Match offers with treatments
    // This is a simplified implementation - in production you might need more sophisticated matching
    const treatmentNames = treatments.map(t => t.name.toLowerCase());
    const treatmentCategories = treatments
      .filter(t => t.category)
      .map(t => t.category!.toLowerCase());
    
    // Check each offer to see if it's applicable to the patient's treatments
    const matchedOffers = validOffers.map(offer => {
      // Simplified matching logic - replace with your actual business logic
      // Here we're just checking if any treatment name contains any words from the offer title
      const offerKeywords = offer.title.toLowerCase().split(' ');
      
      const isMatch = offerKeywords.some(keyword => 
        treatmentNames.some(name => name.includes(keyword)) || 
        treatmentCategories.some(category => category.includes(keyword))
      );
      
      return {
        ...offer,
        isMatched: isMatch,
        displayText: isMatch ? 
          `Eligible for ${offer.title} (${offer.discountType === 'percentage' ? offer.discountValue + '%' : '£' + offer.discountValue} off)` : 
          `Add ${offer.title} to your plan to qualify`
      };
    });
    
    return res.json({ 
      success: true, 
      data: { 
        matchedOffers,
        clinic,
        message: matchedOffers.some(o => o.isMatched) ? 
          'You qualify for special offers! Apply them to save on your treatment.' : 
          'Add more treatments to qualify for special offers.'
      }
    });
  } catch (error) {
    console.error('Error matching treatments to offers:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Apply a special offer to a treatment plan
 * POST /api/special-offers/apply
 */
const applyOfferSchema = z.object({
  specialOfferId: z.string().uuid(),
  treatmentPlanId: z.string().uuid().optional(),
  treatments: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      quantity: z.number().int().positive().optional(),
      priceGBP: z.number().positive()
    })
  ),
  patientId: z.number().int().positive().optional()
});

router.post('/apply', async (req, res) => {
  try {
    // Validate the request body
    const validatedData = applyOfferSchema.parse(req.body);
    const { specialOfferId, treatments, patientId, treatmentPlanId } = validatedData;
    
    // Get the offer
    const [offer] = await db
      .select()
      .from(specialOffers)
      .where(eq(specialOffers.id, specialOfferId));
      
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Special offer not found' });
    }
    
    if (!offer.isActive) {
      return res.status(400).json({ success: false, message: 'This special offer is no longer active' });
    }
    
    // Check if offer is expired
    if (offer.validUntil) {
      const now = new Date();
      const offerDate = new Date(offer.validUntil);
      if (offerDate < now) {
        return res.status(400).json({ success: false, message: 'This special offer has expired' });
      }
    }
    
    // Apply the discount to the treatments
    const discountedTreatments = treatments.map(treatment => {
      // Apply discount based on the offer type
      let discountedPrice = treatment.priceGBP;
      
      if (offer.discountType === 'percentage') {
        discountedPrice = treatment.priceGBP * (1 - (Number(offer.discountValue) / 100));
      } else {
        discountedPrice = treatment.priceGBP - Number(offer.discountValue);
      }
      
      // Ensure the price doesn't go below zero
      discountedPrice = Math.max(0, discountedPrice);
      
      return {
        ...treatment,
        originalPriceGBP: treatment.priceGBP,
        priceGBP: discountedPrice,
        specialOfferApplied: true,
        specialOfferId: offer.id,
        specialOfferTitle: offer.title,
        discountAmount: treatment.priceGBP - discountedPrice
      };
    });
    
    // Calculate the total savings
    const totalSavings = discountedTreatments.reduce(
      (sum, t) => sum + (t.originalPriceGBP - t.priceGBP), 
      0
    );
    
    // If treatmentPlanId is provided, update the treatment plan in the database
    if (treatmentPlanId) {
      // This would be the code to update the treatment plan
      // For now, we'll just return the discounted treatments
    }
    
    return res.json({
      success: true,
      data: {
        discountedTreatments,
        totalSavings,
        message: `${offer.title} has been applied. You saved ${offer.discountType === 'percentage' ? 
          offer.discountValue + '%' : 
          '£' + totalSavings.toFixed(2)}`
      }
    });
  } catch (error) {
    console.error('Error applying special offer:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;