import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Offer, OfferToTreatmentPlanRequest, OfferToTreatmentPlanResponse } from '@shared/models/offers';
import { TreatmentPlan, TreatmentPlanStatus, PaymentStatus } from '@shared/models/treatment-plan';
import { storage } from '../storage';
import { isAuthenticated } from '../middleware/auth';

// Create a simple logger
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.log(`[DEBUG] ${message}`, ...args)
};
const router = Router();

// Get all active special offers for homepage display
router.get('/special-offers/homepage', async (req, res) => {
  try {
    const offers = await storage.getHomepageOffers();
    return res.json(offers);
  } catch (error) {
    logger.error('Error fetching homepage offers:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch offers' });
  }
});

// Get offers by clinic
router.get('/special-offers/clinic/:clinicId', async (req, res) => {
  try {
    const { clinicId } = req.params;
    const offers = await storage.getOffersByClinic(clinicId);
    return res.json(offers);
  } catch (error) {
    logger.error('Error fetching clinic offers:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch clinic offers' });
  }
});

// Get special offer by ID
router.get('/special-offers/:offerId', async (req, res) => {
  try {
    const { offerId } = req.params;
    const offer = await storage.getOffer(offerId);
    
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    
    return res.json(offer);
  } catch (error) {
    logger.error('Error fetching offer:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch offer' });
  }
});

// Start a treatment plan from a special offer
router.post('/offers/:offerId/start', async (req, res) => {
  try {
    const { offerId } = req.params;
    const { clinicId, patientId, patientEmail, additionalNotes, customQuantities } = req.body as OfferToTreatmentPlanRequest;
    
    // Get the offer details
    const offer = await storage.getOffer(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    
    // Check if offer is active
    if (offer.status !== 'ACTIVE') {
      return res.status(410).json({ success: false, message: 'This offer has expired or is no longer available' });
    }
    
    // Check if clinic matches
    if (offer.clinicId !== clinicId) {
      return res.status(400).json({ success: false, message: 'Offer does not belong to the specified clinic' });
    }
    
    // Create treatment plan from offer
    const treatmentPlanId = uuidv4();
    
    // Convert offer treatment lines to treatment items
    const treatments = offer.treatmentLines.map(line => {
      // Apply custom quantities if provided
      const quantity = customQuantities && customQuantities[line.id] 
        ? customQuantities[line.id] 
        : line.quantity;
      
      return {
        id: uuidv4(),
        name: line.treatmentName,
        description: line.description,
        price: line.discountedUnitPrice || line.unitPrice,
        originalPrice: line.unitPrice,
        quantity,
        isBonus: line.isBonus,
        isRequired: line.isRequired,
        canEdit: !line.isBonus,
        canRemove: !line.isBonus && !line.isRequired,
        educationalContent: line.educationalContent
      };
    });
    
    // Calculate total price
    const totalPrice = treatments.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create the treatment plan
    const treatmentPlan: TreatmentPlan = {
      id: treatmentPlanId,
      patientId: patientId || null,
      clinicId,
      title: `Treatment Plan: ${offer.title}`,
      description: offer.description,
      status: TreatmentPlanStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      treatments,
      totalPrice,
      finalPrice: totalPrice,
      paymentStatus: PaymentStatus.UNPAID,
      sourceType: 'SPECIAL_OFFER',
      sourceId: offerId,
      offerId,
      offerType: offer.offerType,
      offerTitle: offer.title,
      offerImageUrl: offer.imageUrl,
      offerValidUntil: offer.validUntil,
      clientNotes: additionalNotes || '',
      clinicName: offer.clinicName
    };
    
    // Convert treatment plan to the expected format
    const treatmentPlanData = {
      patientId: treatmentPlan.patientId ? Number(treatmentPlan.patientId) : 1, // Default to 1 if missing
      clinicId: treatmentPlan.clinicId ? Number(treatmentPlan.clinicId) : undefined,
      status: treatmentPlan.status || 'DRAFT',
      notes: treatmentPlan.clientNotes || '',
      treatmentDetails: {
        id: treatmentPlan.id,
        title: treatmentPlan.title,
        description: treatmentPlan.description,
        treatments: treatmentPlan.treatments,
        totalPrice: treatmentPlan.totalPrice,
        finalPrice: treatmentPlan.finalPrice,
        discountPercentage: treatmentPlan.discountPercentage,
        offerDetails: {
          offerId: treatmentPlan.offerId,
          offerType: treatmentPlan.offerType,
          offerTitle: treatmentPlan.offerTitle,
          offerImageUrl: treatmentPlan.offerImageUrl,
          offerValidUntil: treatmentPlan.offerValidUntil
        },
        sourceType: treatmentPlan.sourceType,
        sourceId: treatmentPlan.sourceId,
        createdAt: treatmentPlan.createdAt,
        updatedAt: treatmentPlan.updatedAt
      }
    };
    
    // Save the treatment plan
    await storage.createTreatmentPlan(treatmentPlanData);
    
    // Generate response URL for redirect
    const treatmentPlanUrl = `/portal/treatment-plan/${treatmentPlanId}`;
    
    const response: OfferToTreatmentPlanResponse = {
      treatmentPlanId,
      offerId,
      clinicId,
      clinicName: offer.clinicName,
      treatmentPlanUrl,
      message: 'Treatment plan created successfully'
    };
    
    return res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating treatment plan from offer:', error);
    return res.status(500).json({ success: false, message: 'Failed to create treatment plan from offer' });
  }
});

// Get the last treatment plan created from this offer for this user (for handling refresh cases)
router.get('/offers/:offerId/last', isAuthenticated, async (req, res) => {
  try {
    const { offerId } = req.params;
    // Only proceed if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const patientId = req.user.id.toString();
    
    const plan = await storage.getLastTreatmentPlanFromOffer(offerId, patientId);
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'No treatment plan found' });
    }
    
    const response: OfferToTreatmentPlanResponse = {
      treatmentPlanId: plan.id,
      offerId,
      clinicId: plan.clinicId || '',
      clinicName: plan.clinicName,
      treatmentPlanUrl: `/portal/treatment-plan/${plan.id}`,
      message: 'Retrieved existing treatment plan'
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Error fetching last treatment plan from offer:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch last treatment plan' });
  }
});

export default router;