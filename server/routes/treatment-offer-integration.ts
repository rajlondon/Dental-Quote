import { Router } from 'express';
import { storage } from '../storage';
import { TreatmentPlanStatus } from '@shared/models/treatment-plan';
import { treatmentPlans, quotes, quoteLines, promoTokens, treatmentPackages, specialOffers } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { insertQuoteSchema } from '@shared/schema';
import { z } from 'zod';

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

/**
 * Create a quote from a treatment package
 * This endpoint creates a new quote with treatments from a package
 */
router.post('/from-package', async (req, res) => {
  try {
    const { packageId, clinicId, notes } = req.body;
    
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
        message: 'Authentication required to create quote from package'
      });
    }
    
    const userId = req.user.id;
    
    // Get the package details
    const packageData = await db
      .select()
      .from(treatmentPackages)
      .where(eq(treatmentPackages.id, packageId))
      .limit(1);
    
    if (!packageData || packageData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    const pkg = packageData[0];
    
    // Create a new quote
    const quoteId = uuidv4();
    const now = new Date();
    
    await db.insert(quotes).values({
      id: quoteId,
      patientId: userId,
      clinicId: parseInt(clinicId || pkg.clinicId?.toString() || '1'),
      status: 'draft',
      totalGBP: parseFloat(pkg.priceGBP?.toString() || '0'),
      totalUSD: parseFloat(pkg.priceUSD?.toString() || '0'),
      savingsAmount: parseFloat(pkg.originalPriceGBP?.toString() || '0') - parseFloat(pkg.priceGBP?.toString() || '0'),
      savingsPercentage: parseFloat(pkg.discountPercentage?.toString() || '0'),
      createdAt: now,
      updatedAt: now,
      source: 'treatment_package',
      additionalNotes: notes || `Package: ${pkg.title}`,
      packageId: packageId
    });
    
    // Add package as a quote line
    const discountPct = parseFloat(pkg.discountPct?.toString() || '0') || 
                       parseFloat(pkg.discountPercentage?.toString() || '0') || 0;
                       
    const basePriceGBP = parseFloat(pkg.originalPriceGBP?.toString() || pkg.priceGBP?.toString() || '0');
    const unitPriceGBP = parseFloat(pkg.priceGBP?.toString() || '0');
    
    await db.insert(quoteLines).values({
      id: uuidv4(),
      quoteId,
      name: pkg.title,
      quantity: 1,
      basePriceGBP: Math.round(basePriceGBP),
      unitPriceGBP: Math.round(unitPriceGBP),
      subtotalGBP: Math.round(unitPriceGBP),
      basePriceUSD: Math.round(basePriceGBP * 1.3),
      unitPriceUSD: Math.round(unitPriceGBP * 1.3),
      subtotalUSD: Math.round(unitPriceGBP * 1.3),
      isLocked: true,
      isBonus: false,
      notes: `Treatment package: ${pkg.title}. Includes: ${pkg.description || 'Multiple treatments'}`,
      createdAt: now,
      updatedAt: now
    });
    
    // Return success with the quote ID
    return res.status(201).json({
      success: true,
      message: 'Quote created from package successfully',
      quoteId,
      quoteUrl: `/quote/wizard?quoteId=${quoteId}`
    });
  } catch (error) {
    console.error('Error creating quote from package:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Create a quote from a special offer
 * This endpoint creates a new quote with treatments from a special offer
 */
router.post('/from-offer', async (req, res) => {
  try {
    const { offerId, clinicId, notes } = req.body;
    
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
        message: 'Authentication required to create quote from offer'
      });
    }
    
    const userId = req.user.id;
    
    // Get the offer details
    const offerData = await db
      .select()
      .from(specialOffers)
      .where(eq(specialOffers.id, offerId))
      .limit(1);
    
    if (!offerData || offerData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }
    
    const offer = offerData[0];
    
    // Create a new quote
    const quoteId = uuidv4();
    const now = new Date();
    
    await db.insert(quotes).values({
      id: quoteId,
      patientId: userId,
      clinicId: parseInt(clinicId || offer.clinicId?.toString() || '1'),
      status: 'draft',
      totalGBP: parseFloat(offer.discountedPrice?.toString() || '0'),
      totalUSD: parseFloat(offer.discountedPrice?.toString() || '0') * 1.3,
      savingsAmount: parseFloat(offer.originalPrice?.toString() || '0') - parseFloat(offer.discountedPrice?.toString() || '0'),
      savingsPercentage: parseFloat(offer.discountPercentage?.toString() || '0'),
      createdAt: now,
      updatedAt: now,
      source: 'special_offer',
      additionalNotes: notes || `Special Offer: ${offer.title}`,
      specialOfferId: offerId
    });
    
    // Add special offer as a quote line
    await db.insert(quoteLines).values({
      id: uuidv4(),
      quoteId,
      name: offer.title,
      quantity: 1,
      basePriceGBP: Math.round(parseFloat(offer.originalPrice?.toString() || '0')),
      unitPriceGBP: Math.round(parseFloat(offer.discountedPrice?.toString() || '0')),
      subtotalGBP: Math.round(parseFloat(offer.discountedPrice?.toString() || '0')),
      basePriceUSD: Math.round(parseFloat(offer.originalPrice?.toString() || '0') * 1.3),
      unitPriceUSD: Math.round(parseFloat(offer.discountedPrice?.toString() || '0') * 1.3),
      subtotalUSD: Math.round(parseFloat(offer.discountedPrice?.toString() || '0') * 1.3),
      isLocked: true,
      isBonus: false,
      notes: offer.description || 'Special offer with discount',
      createdAt: now,
      updatedAt: now
    });
    
    // Return success with the quote ID
    return res.status(201).json({
      success: true,
      message: 'Quote created from special offer successfully',
      quoteId,
      quoteUrl: `/quote/wizard?quoteId=${quoteId}`
    });
  } catch (error) {
    console.error('Error creating quote from special offer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Unified endpoint to create a quote from either a promo token, package, or offer
 * This endpoint provides a consistent interface for all types of promotions
 */
router.post('/unified-quote', async (req, res) => {
  try {
    const { promoType, promoId, clinicId, notes } = req.body;
    
    if (!promoType || !promoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing promotion type or ID' 
      });
    }
    
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to create quote from promotion'
      });
    }
    
    // Route to the appropriate handler based on promo type
    switch (promoType) {
      case 'special_offer':
        // Forward to from-offer endpoint
        req.body = { offerId: promoId, clinicId, notes };
        return await new Promise(resolve => {
          router.handle(req, res, resolve);
        });
        
      case 'treatment_package':
        // Forward to from-package endpoint
        req.body = { packageId: promoId, clinicId, notes };
        return await new Promise(resolve => {
          router.handle(req, res, resolve);
        });
        
      case 'promo_token':
        // Handle promo token
        const token = promoId;
        
        // Get promo token details
        const tokenData = await db
          .select()
          .from(promoTokens)
          .where(eq(promoTokens.token, token))
          .limit(1);
        
        if (!tokenData || tokenData.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Promo token not found'
          });
        }
        
        const promoToken = tokenData[0];
        
        // Create a quote based on the promo token type
        if (promoToken.promoType === 'special_offer' && promoToken.specialOfferId) {
          req.body = { offerId: promoToken.specialOfferId, clinicId, notes };
          return await new Promise(resolve => {
            router.handle(req, res, resolve);
          });
        } else if (promoToken.promoType === 'treatment_package' && promoToken.packageId) {
          req.body = { packageId: promoToken.packageId, clinicId, notes };
          return await new Promise(resolve => {
            router.handle(req, res, resolve);
          });
        } else {
          return res.status(400).json({
            success: false,
            message: 'Invalid promo token type or missing reference ID'
          });
        }
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid promotion type. Must be special_offer, treatment_package, or promo_token.'
        });
    }
  } catch (error) {
    console.error('Error creating quote from promotion:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;