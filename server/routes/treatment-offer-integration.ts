import { Router } from 'express';
import { storage } from '../storage';
import { TreatmentPlanStatus } from '@shared/models/treatment-plan';
import { treatmentPlans } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from '../db';

const router = Router();

/**
 * Associate a special offer with a user's treatment plan
 * This endpoint creates a new treatment plan or updates an existing one
 * with the selected offer ID and clinic ID
 */
router.post('/treatment-plans/associate-offer', async (req, res) => {
  try {
    const { offerId, clinicId } = req.body;
    
    if (!offerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing offer ID' 
      });
    }
    
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to associate offer with treatment plan'
      });
    }
    
    const userId = req.user.id.toString();
    
    // Try to find an existing DRAFT treatment plan for the user
    const existingPlan = await storage.getTreatmentPlanByUserIdAndStatus(userId, TreatmentPlanStatus.DRAFT);
    
    if (existingPlan) {
      // Update the existing plan with the offer ID
      const updatedPlan = await db
        .update(treatmentPlans)
        .set({
          selectedOfferId: offerId,
          clinicId: clinicId || existingPlan.clinicId,
          updatedAt: new Date()
        })
        .where(eq(treatmentPlans.id, existingPlan.id))
        .returning();
      
      return res.status(200).json({
        success: true,
        message: 'Special offer associated with existing treatment plan',
        data: updatedPlan[0]
      });
    } else {
      // Create a new treatment plan with the offer ID
      const newPlan = await storage.createTreatmentPlan({
        patientId: userId,
        createdBy: userId,
        title: 'Special Offer Treatment Plan',
        status: TreatmentPlanStatus.DRAFT,
        selectedOfferId: offerId,
        clinicId: clinicId || null,
        totalCostGBP: 0, // Will be calculated later
        totalCostUSD: 0, // Will be calculated later
        treatmentItems: []
      });
      
      return res.status(201).json({
        success: true,
        message: 'Special offer associated with new treatment plan',
        data: newPlan
      });
    }
  } catch (error) {
    console.error('Error associating offer with treatment plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Associate a treatment package with a user's treatment plan
 * This endpoint creates a new treatment plan or updates an existing one
 * with the selected package ID and clinic ID
 */
router.post('/treatment-plans/associate-package', async (req, res) => {
  try {
    const { packageId, clinicId } = req.body;
    
    if (!packageId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing package ID' 
      });
    }
    
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to associate package with treatment plan'
      });
    }
    
    const userId = req.user.id.toString();
    
    // Try to find an existing DRAFT treatment plan for the user
    const existingPlan = await storage.getTreatmentPlanByUserIdAndStatus(userId, TreatmentPlanStatus.DRAFT);
    
    if (existingPlan) {
      // Update the existing plan with the package ID
      const updatedPlan = await db
        .update(treatmentPlans)
        .set({
          selectedPackageId: packageId,
          clinicId: clinicId || existingPlan.clinicId,
          updatedAt: new Date()
        })
        .where(eq(treatmentPlans.id, existingPlan.id))
        .returning();
      
      return res.status(200).json({
        success: true,
        message: 'Treatment package associated with existing treatment plan',
        data: updatedPlan[0]
      });
    } else {
      // Create a new treatment plan with the package ID
      const newPlan = await storage.createTreatmentPlan({
        patientId: userId,
        createdBy: userId,
        title: 'Treatment Package Plan',
        status: TreatmentPlanStatus.DRAFT,
        selectedPackageId: packageId,
        clinicId: clinicId || null,
        totalCostGBP: 0, // Will be calculated later
        totalCostUSD: 0, // Will be calculated later
        treatmentItems: []
      });
      
      return res.status(201).json({
        success: true,
        message: 'Treatment package associated with new treatment plan',
        data: newPlan
      });
    }
  } catch (error) {
    console.error('Error associating package with treatment plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Get treatment plan with special offer or package details
 * This endpoint retrieves a treatment plan with its associated offer/package details
 */
router.get('/treatment-plans/:id/with-offer-details', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing treatment plan ID' 
      });
    }
    
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view treatment plan details'
      });
    }
    
    // Get the basic treatment plan
    const plan = await storage.getTreatmentPlanById(id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Treatment plan not found'
      });
    }
    
    // Check if this plan belongs to the authenticated user or they are admin/clinic
    const isAuthorized = 
      plan.patientId === req.user.id.toString() || 
      req.user.role === 'admin' || 
      (req.user.role === 'clinic' && plan.clinicId === req.user.clinicId);
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this treatment plan'
      });
    }
    
    // Enrich the plan with offer details if it has a selectedOfferId
    let offerDetails = null;
    if (plan.selectedOfferId) {
      offerDetails = await storage.getSpecialOfferById(plan.selectedOfferId);
    }
    
    // Enrich the plan with package details if it has a selectedPackageId
    let packageDetails = null;
    if (plan.selectedPackageId) {
      packageDetails = await storage.getTreatmentPackageById(plan.selectedPackageId);
    }
    
    // Return the plan with the enriched details
    return res.status(200).json({
      success: true,
      data: {
        ...plan,
        offerDetails,
        packageDetails
      }
    });
  } catch (error) {
    console.error('Error retrieving treatment plan with offer details:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;