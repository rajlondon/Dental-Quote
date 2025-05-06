import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import { storage } from '../storage';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

/**
 * Start a new quote from a special offer
 * POST /api/v1/offers/:offerId/start
 * 
 * Creates a new quote with the special offer attached
 * and inserts any bonus lines associated with the offer
 */
router.post('/offers/:offerId/start', isAuthenticated, async (req, res) => {
  try {
    const { offerId } = req.params;
    const { clinicId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Get the offer details
    const offer = await storage.getOffer(offerId);
    if (!offer) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Special offer not found'
      });
    }
    
    // Create a new quote request linked to the special offer
    const quoteRequest = await storage.createQuoteRequest({
      userId,
      name: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : '',
      email: req.user?.email || '',
      phone: req.user?.phone || '',
      treatment: offer.applicableTreatment || 'Dental Implants',
      selectedClinicId: clinicId || offer.clinicId,
      status: 'draft',
      specialOffer: offerId, // Link the offer ID
      consent: true, // User is authenticated so we assume consent
      notes: `Created from special offer: ${offer.title}`
    });
    
    // Add any bonus lines from the offer
    if (offer.bonusItems && Array.isArray(offer.bonusItems) && offer.bonusItems.length > 0) {
      for (const bonusItem of offer.bonusItems) {
        await storage.createTreatmentLine({
          quoteId: quoteRequest.id,
          description: bonusItem.description || `${offer.title} - Bonus Item`,
          price: bonusItem.price || 0,
          quantity: bonusItem.quantity || 1,
          type: 'bonus',
          isBonus: true, // Mark as bonus so it can't be deleted
          notes: `Added from special offer: ${offer.title}`
        });
      }
    } else {
      // If no specific bonus items, add a generic discount line
      await storage.createTreatmentLine({
        quoteId: quoteRequest.id,
        description: `${offer.title} - Special Discount`,
        price: -(offer.discountValue || 0), // Negative price for discount
        quantity: 1,
        type: 'discount',
        isBonus: true, // Mark as bonus so it can't be deleted
        notes: `Discount from special offer: ${offer.title}`
      });
    }
    
    // Return the quote ID and a direct URL to the review page
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Quote created from special offer',
      quoteId: quoteRequest.id,
      quoteUrl: `/portal/quote/${quoteRequest.id}/review`
    });
    
  } catch (error) {
    console.error('Error creating quote from offer:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create quote from special offer'
    });
  }
});

/**
 * Start a new quote from a treatment package
 * POST /api/v1/packages/:packageId/start
 * 
 * Creates a new quote with the package attached
 * and inserts the package base treatment lines
 */
router.post('/packages/:packageId/start', isAuthenticated, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { clinicId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Get the package details
    const packageData = await storage.getPackage(packageId);
    if (!packageData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Treatment package not found'
      });
    }
    
    // Create a new quote request linked to the package
    const quoteRequest = await storage.createQuoteRequest({
      userId,
      name: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : '',
      email: req.user?.email || '',
      phone: req.user?.phone || '',
      treatment: packageData.treatmentCategory || 'Dental Implants',
      selectedClinicId: clinicId || packageData.clinicId,
      status: 'draft',
      packageId: packageId, // Link the package ID
      consent: true, // User is authenticated so we assume consent
      notes: `Created from treatment package: ${packageData.title}`
    });
    
    // Add the package as a non-removable line
    await storage.createTreatmentLine({
      quoteId: quoteRequest.id,
      description: `${packageData.title} - Package Base`,
      price: packageData.basePrice || 0,
      quantity: 1,
      type: 'package',
      isPackage: true, // Mark as package so it can't be deleted
      notes: `Base package from: ${packageData.title}`
    });
    
    // Add any included treatments from the package
    if (packageData.includedTreatments && Array.isArray(packageData.includedTreatments)) {
      for (const treatment of packageData.includedTreatments) {
        await storage.createTreatmentLine({
          quoteId: quoteRequest.id,
          description: treatment.description || 'Included Treatment',
          price: treatment.price || 0,
          quantity: treatment.quantity || 1,
          type: 'included',
          isPackage: true, // Mark as part of package so it can't be deleted
          notes: `Included in package: ${packageData.title}`
        });
      }
    }
    
    // Return the quote ID and a direct URL to the review page
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Quote created from treatment package',
      quoteId: quoteRequest.id,
      quoteUrl: `/portal/quote/${quoteRequest.id}/review`
    });
    
  } catch (error) {
    console.error('Error creating quote from package:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create quote from treatment package'
    });
  }
});

export default router;