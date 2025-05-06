import express, { Router, Request, Response } from "express";
import { isAuthenticated } from "../middleware/auth";
import { storage } from "../storage";
import { v4 as uuidv4 } from "uuid";

const router: Router = express.Router();

/**
 * Create a new treatment plan from a special offer
 * POST /api/treatment-plans/from-offer
 * 
 * This endpoint creates a new treatment plan directly from a special offer
 * when a user clicks on a special offer card or banner.
 */
router.post("/from-offer", isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Extract the offer ID and clinic ID from the request body
    const { offerId, clinicId, notes = "Created from special offer" } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    if (!offerId) {
      return res.status(400).json({
        success: false,
        message: "Offer ID is required"
      });
    }
    
    console.log(`Creating treatment plan from offer ${offerId} for user ${userId} at clinic ${clinicId || 'unspecified'}`);
    
    // Get the offer details
    const offer = await storage.getOffer(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Special offer not found"
      });
    }
    
    // Create a new treatment plan with the offer details
    const treatmentPlan = await storage.createTreatmentPlan({
      patientId: userId.toString(),
      clinicId: (clinicId || offer.clinicId)?.toString(),
      title: `Special Offer: ${offer.title}`,
      description: offer.description || "Special offer treatment plan",
      status: "DRAFT",
      source: "offer", // Mark the source as an offer
      sourceId: offerId,
      notes: notes || `Created from special offer: ${offer.title}`,
      totalPrice: offer.discountedPrice || offer.originalPrice || 0
    });
    
    console.log(`Created treatment plan ${treatmentPlan.id} from offer ${offerId}`);
    
    // Add the special offer discount as a treatment line
    await storage.createTreatmentLine({
      quoteId: treatmentPlan.id,
      description: `${offer.title} - Special Offer`,
      price: offer.discountedPrice || offer.originalPrice || 0,
      quantity: 1,
      type: "special_offer",
      isBonus: true,
      notes: `Added from special offer: ${offer.title}`
    });
    
    // Add any bonus items from the offer
    if (offer.bonusItems && Array.isArray(offer.bonusItems) && offer.bonusItems.length > 0) {
      for (const bonusItem of offer.bonusItems) {
        await storage.createTreatmentLine({
          quoteId: treatmentPlan.id,
          description: bonusItem.description || `${offer.title} - Bonus Item`,
          price: bonusItem.price || 0,
          quantity: bonusItem.quantity || 1,
          type: "bonus",
          isBonus: true,
          notes: `Bonus item from special offer: ${offer.title}`
        });
      }
    }
    
    // Return the treatment plan and URL for redirection
    return res.status(201).json({
      success: true,
      message: "Treatment plan created from special offer",
      treatmentPlanId: treatmentPlan.id, 
      treatmentPlanUrl: `/patient/treatment-plans/${treatmentPlan.id}`
    });
    
  } catch (error) {
    console.error("Error creating treatment plan from offer:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create treatment plan from special offer"
    });
  }
});

/**
 * Create a new treatment plan from a treatment package
 * POST /api/treatment-plans/from-package
 * 
 * This endpoint creates a new treatment plan directly from a treatment package
 * when a user clicks on a package card or banner.
 */
router.post("/from-package", isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Extract the package ID and clinic ID from the request body
    const { packageId, clinicId, notes = "Created from treatment package" } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: "Package ID is required"
      });
    }
    
    console.log(`Creating treatment plan from package ${packageId} for user ${userId} at clinic ${clinicId || 'unspecified'}`);
    
    // Get the package details
    const packageData = await storage.getPackage(packageId);
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Treatment package not found"
      });
    }
    
    // Create a new treatment plan with the package details
    const treatmentPlan = await storage.createTreatmentPlan({
      patientId: userId.toString(),
      clinicId: (clinicId || packageData.clinicId)?.toString(),
      title: `Package: ${packageData.title}`,
      description: packageData.description || "Treatment package plan",
      status: "DRAFT",
      source: "package", // Mark the source as a package
      sourceId: packageId,
      notes: notes || `Created from treatment package: ${packageData.title}`,
      totalPrice: packageData.basePrice || 0
    });
    
    console.log(`Created treatment plan ${treatmentPlan.id} from package ${packageId}`);
    
    // Add the package as a treatment line
    await storage.createTreatmentLine({
      quoteId: treatmentPlan.id,
      description: `${packageData.title} - Package Base`,
      price: packageData.basePrice || 0,
      quantity: 1,
      type: "package",
      isPackage: true,
      notes: `Base package: ${packageData.title}`
    });
    
    // Add any included treatments from the package
    if (packageData.includedTreatments && Array.isArray(packageData.includedTreatments)) {
      for (const treatment of packageData.includedTreatments) {
        await storage.createTreatmentLine({
          quoteId: treatmentPlan.id,
          description: treatment.description || 'Included Treatment',
          price: treatment.price || 0,
          quantity: treatment.quantity || 1,
          type: "included",
          isPackage: true,
          notes: `Included in package: ${packageData.title}`
        });
      }
    }
    
    // Return the treatment plan and URL for redirection
    return res.status(201).json({
      success: true,
      message: "Treatment plan created from package",
      treatmentPlanId: treatmentPlan.id,
      treatmentPlanUrl: `/patient/treatment-plans/${treatmentPlan.id}`
    });
    
  } catch (error) {
    console.error("Error creating treatment plan from package:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create treatment plan from package"
    });
  }
});

/**
 * Legacy v1 endpoint for creating a treatment plan from a special offer
 * POST /offers/:offerId/start
 * 
 * Maintains compatibility with the old endpoint referenced in PortalLoginPage.tsx
 */
router.post("/offers/:offerId/start", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { offerId } = req.params;
    const { clinicId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    console.log(`Legacy endpoint: Creating treatment plan from offer ${offerId} for user ${userId} at clinic ${clinicId || 'unspecified'}`);
    
    // Get the offer details
    const offer = await storage.getOffer(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Special offer not found"
      });
    }
    
    // Create a new treatment plan with the offer details
    const treatmentPlan = await storage.createTreatmentPlan({
      patientId: userId.toString(),
      clinicId: (clinicId || offer.clinicId)?.toString(),
      title: `Special Offer: ${offer.title}`,
      description: offer.description || "Special offer treatment plan",
      status: "DRAFT",
      source: "offer", // Mark the source as an offer
      sourceId: offerId,
      notes: `Created from special offer: ${offer.title}`,
      totalPrice: offer.discountedPrice || offer.originalPrice || 0
    });
    
    console.log(`Legacy endpoint: Created treatment plan ${treatmentPlan.id} from offer ${offerId}`);
    
    // Return the treatment plan with a URL format that matches the legacy expectations
    return res.status(201).json({
      success: true,
      message: "Quote created from special offer",
      quoteId: treatmentPlan.id,
      treatmentPlanUrl: `/patient/treatment-plans/${treatmentPlan.id}`,
      quoteUrl: `/portal/quote/${treatmentPlan.id}/review` // Legacy URL format for backward compatibility
    });
    
  } catch (error) {
    console.error("Error creating quote from offer (legacy):", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create quote from special offer"
    });
  }
});

export default router;