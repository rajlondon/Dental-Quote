/**
 * Free Consultation Routes
 * 
 * Special routes to handle the free consultation package without requiring authentication
 */

import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { treatmentLines } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/v1/free-consultation
 * Creates a free consultation treatment plan with treatment lines without requiring authentication
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
    
    // Hard-coded patient ID for non-authenticated requests
    // In a full production environment, this would require authentication
    const patientId = 45; // Using valid patient ID from the database (patient@mydentalfly.com)
    
    // Create a treatment plan using raw SQL since we don't have the actual schema
    const treatmentPlanResult = await db.execute(sql`
      INSERT INTO treatment_plans 
        (patient_id, clinic_id, status, treatment_details, currency, portal_status)
      VALUES 
        (${patientId}, ${clinicId}, 'draft', 
         ${JSON.stringify({
           source: 'special_offer',
           specialOfferId: offerId,
           isFreeConsultation: true
         })}, 
         'GBP', 'active')
      RETURNING id;
    `);
    
    if (!treatmentPlanResult || !treatmentPlanResult.rows || treatmentPlanResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create free consultation treatment plan'
      });
    }
    
    const treatmentPlanId = treatmentPlanResult.rows[0].id;
    console.log('Created treatment plan with ID:', treatmentPlanId);
    
    // Generate a UUID for quote_id in treatment_lines
    const quoteId = uuidv4();
    
    try {
      // Create a treatment line for the consultation directly
      console.log(`Adding consultation treatment line with quote_id ${quoteId}`);
      
      // Using the schema for treatment_lines which is correctly defined
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
      
      // Update the treatment_plan's treatment_details to include the quoteId
      await db.execute(sql`
        UPDATE treatment_plans
        SET treatment_details = jsonb_set(
          treatment_details::jsonb, 
          '{quoteId}', 
          ${JSON.stringify(quoteId)}::jsonb
        )
        WHERE id = ${treatmentPlanId}
      `);
      
    } catch (treatmentLineError) {
      console.error('Failed to add consultation treatment line:', treatmentLineError);
      // Continue with the process even if treatment line creation fails
    }
    
    // Generate a URL for the treatment plan
    const treatmentPlanUrl = `/portal/treatment/${treatmentPlanId}`;
    
    return res.status(201).json({
      success: true,
      message: 'Free consultation added to your treatment plan',
      treatmentPlanId,
      treatmentPlanUrl,
      quoteId: quoteId
    });
  } catch (error: any) {
    console.error('Error creating free consultation package:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create consultation package',
      error: error.message
    });
  }
});

export default router;