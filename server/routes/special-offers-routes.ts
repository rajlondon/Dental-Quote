import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  SpecialOffer, 
  CommissionTier, 
  specialOfferSchema, 
  createSpecialOfferSchema 
} from '@shared/specialOffers';
import { User, userSavedSpecialOffers } from '@shared/schema';
import { getWebSocketService } from '../services/websocketService';
import { AppError } from '../utils/app-error';
import { catchAsync } from '../utils/catch-async';
import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';

// Extend Express.User interface to include clinicId
declare global {
  namespace Express {
    interface User {
      clinicId?: number;
    }
  }
}

const router = express.Router();

// In-memory storage for development (replace with DB in production)
const specialOffers = new Map<string, SpecialOffer[]>();

// Map is directly exported, no need for helper functions

// For debugging, let's log the state of the map
console.log(`Special offers map initialized with ${specialOffers.size} entries`);

// Commission tier definitions
const commissionTiers: CommissionTier[] = [
  {
    id: 'standard',
    name: 'Standard',
    min_commission_percentage: 10,
    benefits: [
      'Basic listing', 
      'Standard visibility in search',
      'Standard placement in clinic page'
    ],
    homepage_display_included: false,
    max_active_offers: 3,
    priority_in_search: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'featured',
    name: 'Featured',
    min_commission_percentage: 15,
    benefits: [
      'Enhanced listing with highlighted border', 
      'Higher visibility in search results', 
      'Featured section inclusion',
      'Prominent placement on clinic page'
    ],
    homepage_display_included: true,
    max_active_offers: 5,
    priority_in_search: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'premium',
    name: 'Premium',
    min_commission_percentage: 20,
    benefits: [
      'Top listing with premium badge', 
      'Highest visibility in search results', 
      'Premium homepage showcase', 
      'Promotional banner',
      'Enhanced image gallery',
      'Top of clinic page placement'
    ],
    homepage_display_included: true,
    max_active_offers: 10,
    priority_in_search: 3,
    created_at: new Date().toISOString()
  }
];

// Get all approved & active special offers (public endpoint)
router.get('/api/special-offers', (req, res) => {
  const allOffers: SpecialOffer[] = [];
  
  specialOffers.forEach((clinicOffers) => {
    clinicOffers
      .filter(offer => 
        offer.is_active && 
        offer.admin_approved && 
        new Date(offer.end_date) >= new Date()
      )
      .forEach(offer => allOffers.push(offer));
  });
  
  // Sort by promotion level (premium first)
  allOffers.sort((a, b) => {
    const levelOrder = { premium: 3, featured: 2, standard: 1 };
    return levelOrder[b.promotion_level] - levelOrder[a.promotion_level];
  });
  
  res.json(allOffers);
});

// Get homepage featured offers (public endpoint)
router.get('/api/special-offers/homepage', (req, res) => {
  const homepageOffers: SpecialOffer[] = [];
  
  specialOffers.forEach((clinicOffers) => {
    clinicOffers
      .filter(offer => 
        offer.is_active && 
        offer.admin_approved && 
        offer.homepage_display &&
        new Date(offer.end_date) >= new Date()
      )
      .forEach(offer => homepageOffers.push(offer));
  });
  
  // Sort by promotion level (premium first) 
  homepageOffers.sort((a, b) => {
    const levelOrder = { premium: 3, featured: 2, standard: 1 };
    return levelOrder[b.promotion_level] - levelOrder[a.promotion_level];
  });
  
  // Limit to top offers for homepage
  const topOffers = homepageOffers.slice(0, 6);
  
  res.json(topOffers);
});

// Get special offers for a specific clinic (public endpoint)
router.get('/api/special-offers/clinic/:clinicId', (req, res) => {
  const { clinicId } = req.params;
  
  const clinicOffers = specialOffers.get(clinicId) || [];
  
  // Only return active and approved offers to the public
  const activeOffers = clinicOffers.filter(
    offer => offer.is_active && 
             offer.admin_approved && 
             new Date(offer.end_date) >= new Date()
  );
  
  res.json(activeOffers);
});

// Clinic: Get all their offers (including inactive/unapproved)
router.get('/api/portal/clinic/special-offers', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'clinic_staff') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const clinicId = req.user.clinicId;
  // Convert clinicId to string since Map keys are strings
  const clinicIdStr = String(clinicId);
  const clinicOffers = specialOffers.get(clinicIdStr) || [];
  
  res.json(clinicOffers);
});

// Clinic: Create new special offer
router.post('/api/portal/clinic/special-offers', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'clinic_staff') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const clinicId = req.user.clinicId;
  // Convert clinicId to string since Map keys are strings
  const clinicIdStr = String(clinicId);
  
  try {
    // Validate the request body
    const offerData = createSpecialOfferSchema.parse(req.body);
    
    // Validate commission percentage against selected tier
    const selectedTier = commissionTiers.find(
      tier => tier.id === offerData.promotion_level
    );
    
    if (!selectedTier) {
      return res.status(400).json({ 
        error: 'Invalid promotion level selected' 
      });
    }
    
    if (offerData.commission_percentage < selectedTier.min_commission_percentage) {
      return res.status(400).json({ 
        error: `Commission percentage must be at least ${selectedTier.min_commission_percentage}% for ${selectedTier.name} promotion level` 
      });
    }
    
    // Check if homepage display is allowed for this tier
    if (offerData.homepage_display && !selectedTier.homepage_display_included) {
      return res.status(400).json({ 
        error: `Homepage display is only available for ${selectedTier.name} tier and above` 
      });
    }
    
    // Check if clinic has reached max active offers for their tier
    const clinicOffers = specialOffers.get(clinicIdStr) || [];
    const activeOffersCount = clinicOffers.filter(o => o.is_active).length;
    
    if (offerData.is_active && activeOffersCount >= selectedTier.max_active_offers) {
      return res.status(400).json({ 
        error: `You have reached the maximum number of active offers (${selectedTier.max_active_offers}) for your ${selectedTier.name} tier` 
      });
    }
    
    const now = new Date().toISOString();
    
    const newOffer: SpecialOffer = {
      ...offerData,
      id: uuidv4(),
      clinic_id: clinicIdStr,
      admin_approved: false,
      homepage_display: offerData.homepage_display && selectedTier.homepage_display_included,
      created_at: now,
      updated_at: now
    };
    
    // Get existing offers or initialize
    const offers = specialOffers.get(clinicIdStr) || [];
    offers.push(newOffer);
    specialOffers.set(clinicIdStr, offers);
    
    res.status(201).json(newOffer);
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: 'Invalid offer data' });
  }
});

// Clinic: Update a special offer
router.put('/api/portal/clinic/special-offers/:offerId', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'clinic_staff') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const clinicId = req.user.clinicId;
  const { offerId } = req.params;
  
  try {
    // Validate the update data
    const updateData = createSpecialOfferSchema.partial().parse(req.body);
    
    // Get the clinic's offers
    const clinicIdStr = String(req.user.clinicId);
    const clinicOffers = specialOffers.get(clinicIdStr) || [];
    const offerIndex = clinicOffers.findIndex(o => o.id === offerId);
    
    if (offerIndex === -1) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    // Get the existing offer
    const existingOffer = clinicOffers[offerIndex];
    
    // If promotion level is being updated, validate commission percentage
    if (updateData.promotion_level || updateData.commission_percentage) {
      const newLevel = updateData.promotion_level || existingOffer.promotion_level;
      const newCommission = updateData.commission_percentage || existingOffer.commission_percentage;
      
      const selectedTier = commissionTiers.find(tier => tier.id === newLevel);
      
      if (!selectedTier) {
        return res.status(400).json({ 
          error: 'Invalid promotion level selected' 
        });
      }
      
      if (newCommission < selectedTier.min_commission_percentage) {
        return res.status(400).json({ 
          error: `Commission percentage must be at least ${selectedTier.min_commission_percentage}% for ${selectedTier.name} promotion level` 
        });
      }
      
      // If homepage display is being enabled, check if it's allowed
      if (updateData.homepage_display && !selectedTier.homepage_display_included) {
        return res.status(400).json({ 
          error: `Homepage display is only available for ${selectedTier.name} tier and above` 
        });
      }
    }
    
    // Check max active offers if activating an inactive offer
    if (updateData.is_active === true && !existingOffer.is_active) {
      const activeOffersCount = clinicOffers.filter(o => o.is_active && o.id !== offerId).length;
      const tier = commissionTiers.find(t => t.id === existingOffer.promotion_level);
      
      if (tier && activeOffersCount >= tier.max_active_offers) {
        return res.status(400).json({ 
          error: `You have reached the maximum number of active offers (${tier.max_active_offers}) for your ${tier.name} tier` 
        });
      }
    }
    
    // If making substantial changes, reset approval status
    const resetApproval = updateData.title || 
                          updateData.description || 
                          updateData.discount_type ||
                          updateData.discount_value || 
                          updateData.promotion_level;
    
    // Update the offer
    clinicOffers[offerIndex] = {
      ...existingOffer,
      ...updateData,
      admin_approved: resetApproval ? false : existingOffer.admin_approved,
      admin_rejection_reason: resetApproval ? undefined : existingOffer.admin_rejection_reason,
      updated_at: new Date().toISOString(),
    };
    
    // Save back to storage
    specialOffers.set(clinicIdStr, clinicOffers);
    
    res.json(clinicOffers[offerIndex]);
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: 'Invalid offer data' });
  }
});

// Clinic: Delete a special offer
router.delete('/api/portal/clinic/special-offers/:offerId', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'clinic_staff') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const clinicId = req.user.clinicId;
  const clinicIdStr = String(clinicId);
  const { offerId } = req.params;
  
  // Get the clinic's offers
  const clinicOffers = specialOffers.get(clinicIdStr) || [];
  const offerIndex = clinicOffers.findIndex(o => o.id === offerId);
  
  if (offerIndex === -1) {
    return res.status(404).json({ error: 'Offer not found' });
  }
  
  // Remove the offer
  clinicOffers.splice(offerIndex, 1);
  specialOffers.set(clinicIdStr, clinicOffers);
  
  res.json({ success: true });
});

// Admin: Get all pending offers that need approval
router.get('/api/portal/admin/special-offers/pending', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const pendingOffers: SpecialOffer[] = [];
  
  specialOffers.forEach((clinicOffers) => {
    clinicOffers
      .filter(offer => 
        offer.is_active && 
        !offer.admin_approved && 
        !offer.admin_rejection_reason
      )
      .forEach(offer => pendingOffers.push(offer));
  });
  
  res.json(pendingOffers);
});

// Admin: Get all special offers (for management)
router.get('/api/portal/admin/special-offers', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const allOffers: SpecialOffer[] = [];
  
  specialOffers.forEach((clinicOffers) => {
    clinicOffers.forEach(offer => allOffers.push(offer));
  });
  
  res.json(allOffers);
});

// Admin: Approve or reject an offer
router.post('/api/portal/admin/special-offers/:offerId/review', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { offerId } = req.params;
  const { approved, rejection_reason } = req.body;
  
  let foundOffer: SpecialOffer | null = null;
  let foundClinicId: string | null = null;
  
  // Find the offer
  specialOffers.forEach((clinicOffers, clinicId) => {
    const offerIndex = clinicOffers.findIndex(o => o.id === offerId);
    if (offerIndex >= 0) {
      foundOffer = clinicOffers[offerIndex];
      foundClinicId = clinicId;
    }
  });
  
  if (!foundOffer || !foundClinicId) {
    return res.status(404).json({ error: 'Offer not found' });
  }
  
  // Update approval status
  const clinicOffers = specialOffers.get(foundClinicId)!;
  const offerIndex = clinicOffers.findIndex(o => o.id === offerId);
  
  clinicOffers[offerIndex] = {
    ...clinicOffers[offerIndex],
    admin_approved: approved,
    admin_rejection_reason: approved ? undefined : rejection_reason,
    admin_reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  specialOffers.set(foundClinicId, clinicOffers);
  
  res.json({ success: true, offer: clinicOffers[offerIndex] });
});

// Get commission tier information (public)
router.get('/api/commission-tiers', (req, res) => {
  res.json(commissionTiers);
});

// Special endpoint for image refresh with WebSocket notification
// No authentication required for easier testing
router.post('/api/special-offers/refresh-image/:offerId', catchAsync(async (req: Request, res: Response) => {
  const { offerId } = req.params;
  
  if (!offerId) {
    throw new AppError('Offer ID is required', 400);
  }
  
  console.log(`🔄 Image refresh requested for offer: ${offerId}`);
  
  // Find the offer in the in-memory store
  let found = false;
  let offerImageUrl = '';
  
  // Search for the offer in all clinics
  specialOffers.forEach((clinicOffers, clinicId) => {
    const offer = clinicOffers.find(o => o.id === offerId);
    if (offer) {
      console.log(`Found offer ${offerId} in clinic ${clinicId}`);
      found = true;
      offerImageUrl = offer.banner_image || '';
      
      // Add cache-busting parameters
      if (offerImageUrl) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        
        // Check if the URL already has query parameters
        const separator = offerImageUrl.includes('?') ? '&' : '?';
        offerImageUrl = `${offerImageUrl}${separator}t=${timestamp}&r=${randomString}&cb=true`;
      }
    }
  });
  
  if (!found) {
    throw new AppError(`Special offer with ID ${offerId} not found`, 404);
  }
  
  if (!offerImageUrl) {
    throw new AppError(`No image URL found for offer ${offerId}`, 404);
  }
  
  // Update the offer image in memory with the cache-busting URL
  let updateSuccess = false;
  
  // Find and update the special offer directly in our in-memory map
  for (const [clinicId, clinicOffers] of specialOffers.entries()) {
    const offerIndex = clinicOffers.findIndex(o => o.id === offerId);
    if (offerIndex !== -1) {
      clinicOffers[offerIndex].banner_image = offerImageUrl;
      clinicOffers[offerIndex].updated_at = new Date().toISOString();
      specialOffers.set(clinicId, clinicOffers);
      updateSuccess = true;
      break;
    }
  }
  
  if (!updateSuccess) {
    throw new AppError('Failed to update offer image in memory', 500);
  }
  
  // Broadcast to all connected clients via WebSocket
  const wsService = getWebSocketService();
  let wsClientCount = 0;
  
  if (wsService) {
    wsClientCount = wsService.broadcastSpecialOfferImageRefresh(offerId, offerImageUrl);
    console.log(`📡 WebSocket notification sent to ${wsClientCount} clients`);
  } else {
    console.warn('⚠️ WebSocket service not available for notification');
  }
  
  // Return success response with metadata
  res.json({
    success: true,
    message: 'Image refresh initiated',
    offerId, 
    imageUrl: offerImageUrl,
    wsNotification: wsClientCount > 0,
    clientCount: wsClientCount,
    timestamp: Date.now()
  });
}));

// Test endpoint for simulating an offer image update (development only)
if (process.env.NODE_ENV !== 'production') {
  router.get('/api/special-offers/test-refresh/:offerId', (req, res) => {
    const { offerId } = req.params;
    
    if (!offerId) {
      return res.status(400).json({ error: 'Offer ID is required' });
    }
    
    // Find the offer
    let found = false;
    let offerImageUrl = '';
    
    // Search for the offer in all clinics
    specialOffers.forEach((clinicOffers, clinicId) => {
      const offer = clinicOffers.find(o => o.id === offerId);
      if (offer) {
        found = true;
        offerImageUrl = offer.banner_image || '';
      }
    });
    
    if (!found) {
      return res.status(404).json({ error: `Special offer with ID ${offerId} not found` });
    }
    
    // Construct the POST URL for easy testing
    const refreshUrl = `/api/special-offers/refresh-image/${offerId}`;
    
    res.json({
      success: true,
      offerId,
      currentImageUrl: offerImageUrl,
      refreshUrl,
      testHtml: `
        <html>
          <body>
            <h3>Test Image Refresh</h3>
            <img src="${offerImageUrl}" style="max-width: 300px" />
            <br /><br />
            <button onclick="fetch('${refreshUrl}', {method: 'POST'}).then(r => r.json()).then(console.log)">
              Refresh Image
            </button>
            <br /><br />
            <small>Check console for response</small>
          </body>
        </html>
      `
    });
  });
}

// Add an endpoint to refresh all special offer images
router.post('/refresh-images', catchAsync(async (req, res) => {
  const { forceRegenerate = false, naturalStyle = true } = req.body;
  
  console.log(`Starting to refresh all special offer images...`);
  console.log(`Force regenerate: ${forceRegenerate}, Natural style: ${naturalStyle}`);
  
  const refreshedOffers: { id: string, title: string, image_url: string }[] = [];
  
  // Import modules dynamically to avoid circular dependencies
  const { generateSpecialOfferImage } = await import('../services/openai-service');
  const { default: updateHelper } = await import('./special-offers-update-helper');
  
  // Get all offers from all clinics
  let totalOffers = 0;
  
  // Process each clinic's offers
  for (const [clinicId, offers] of specialOffers.entries()) {
    console.log(`Processing clinic ${clinicId} with ${offers.length} offers`);
    totalOffers += offers.length;
    
    // Process each offer for this clinic
    for (const offer of offers) {
      try {
        console.log(`Refreshing image for offer: ${offer.title} (${offer.id})`);
        
        // Generate a new image using our improved prompts
        const imageResult = await generateSpecialOfferImage(
          offer.title,
          offer.offer_type || 'premium',
          undefined, // no custom prompt
          naturalStyle
        );
        
        if (!imageResult || !imageResult.url) {
          console.error(`Failed to generate image for offer ${offer.id}`);
          continue;
        }
        
        // Update the offer with the new image
        const oldImageUrl = offer.banner_image;
        offer.banner_image = imageResult.url;
        offer.updated_at = new Date().toISOString();
        
        // Update all clients via WebSocket
        await updateHelper.notifyClientsOfImageUpdate(offer.id, imageResult.url);
        
        // Add to the list of refreshed offers
        refreshedOffers.push({
          id: offer.id,
          title: offer.title,
          image_url: imageResult.url
        });
        
        console.log(`✅ Successfully refreshed image for offer ${offer.id}`);
        console.log(`Old URL: ${oldImageUrl}`);
        console.log(`New URL: ${imageResult.url}`);
      } catch (error) {
        console.error(`Error refreshing image for offer ${offer.id}:`, error);
      }
    }
  }
  
  // Return success response
  res.json({
    success: true,
    message: `Refreshed ${refreshedOffers.length} of ${totalOffers} offer images`,
    totalOffers,
    refreshedCount: refreshedOffers.length,
    refreshedOffers
  });
}));

// API endpoint to save special offer to user account
router.post('/save-to-account', catchAsync(async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'You must be logged in to save special offers'
    });
  }

  const { specialOfferId, clinicId, offerDetails } = req.body;

  if (!specialOfferId || !offerDetails) {
    return res.status(400).json({
      success: false,
      message: 'Special offer ID and details are required'
    });
  }

  try {
    // Use the drizzle db client to insert into the user_saved_special_offers table
    const savedOffer = await db.insert(userSavedSpecialOffers).values({
      userId: req.user.id,
      specialOfferId,
      clinicId: clinicId || null,
      offerDetails: offerDetails,
      status: 'active',
    }).returning();

    // Clear any pending special offer from session
    if (req.session.pendingSpecialOffer) {
      delete req.session.pendingSpecialOffer;
    }

    return res.status(201).json({
      success: true,
      message: 'Special offer saved to your account',
      data: savedOffer[0]
    });
  } catch (error) {
    console.error('Error saving special offer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save special offer to your account',
      error: error.message
    });
  }
}));

// API endpoint to get user's saved special offers
router.get('/saved', catchAsync(async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'You must be logged in to view saved special offers'
    });
  }

  try {
    const savedOffers = await db.select()
      .from(userSavedSpecialOffers)
      .where(eq(userSavedSpecialOffers.userId, req.user.id))
      .orderBy(desc(userSavedSpecialOffers.savedAt));

    return res.status(200).json({
      success: true,
      count: savedOffers.length,
      data: savedOffers
    });
  } catch (error) {
    console.error('Error fetching saved special offers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch saved special offers',
      error: error.message
    });
  }
}));

// API endpoint to update a saved special offer (mark as viewed/redeemed)
router.patch('/saved/:id', catchAsync(async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'You must be logged in to update saved special offers'
    });
  }

  const { id } = req.params;
  const { viewed, status, notes, redemptionDate } = req.body;
  
  try {
    // First check if the offer exists and belongs to the user
    const existingOffer = await db.select()
      .from(userSavedSpecialOffers)
      .where(and(
        eq(userSavedSpecialOffers.id, parseInt(id)),
        eq(userSavedSpecialOffers.userId, req.user.id)
      ));

    if (!existingOffer.length) {
      return res.status(404).json({
        success: false,
        message: 'Saved offer not found or does not belong to you'
      });
    }

    // Update the offer
    const updateData: Partial<typeof userSavedSpecialOffers.$inferInsert> = {};
    
    if (viewed !== undefined) updateData.viewed = viewed;
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    if (redemptionDate) updateData.redemptionDate = new Date(redemptionDate);

    const updatedOffer = await db.update(userSavedSpecialOffers)
      .set(updateData)
      .where(eq(userSavedSpecialOffers.id, parseInt(id)))
      .returning();

    return res.status(200).json({
      success: true,
      message: 'Saved offer updated successfully',
      data: updatedOffer[0]
    });
  } catch (error) {
    console.error('Error updating saved special offer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update saved special offer',
      error: error.message
    });
  }
}));

// API endpoint to delete a saved special offer
router.delete('/saved/:id', catchAsync(async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'You must be logged in to delete saved special offers'
    });
  }

  const { id } = req.params;
  
  try {
    // First check if the offer exists and belongs to the user
    const existingOffer = await db.select()
      .from(userSavedSpecialOffers)
      .where(and(
        eq(userSavedSpecialOffers.id, parseInt(id)),
        eq(userSavedSpecialOffers.userId, req.user.id)
      ));

    if (!existingOffer.length) {
      return res.status(404).json({
        success: false,
        message: 'Saved offer not found or does not belong to you'
      });
    }

    // Delete the offer
    await db.delete(userSavedSpecialOffers)
      .where(eq(userSavedSpecialOffers.id, parseInt(id)));

    return res.status(200).json({
      success: true,
      message: 'Saved offer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting saved special offer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete saved special offer',
      error: error.message
    });
  }
}));

// Export both the router and specialOffers map for direct access

// Endpoints for User Saved Special Offers
// Save a special offer to user's account
router.post('/api/special-offers/save-to-account', catchAsync(async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const { specialOfferId, clinicId, offerDetails } = req.body;
    
    if (!specialOfferId) {
      return res.status(400).json({ success: false, message: "Special offer ID is required" });
    }

    // Check if this offer is already saved by the user
    const existingSavedOffer = await db.select().from(userSavedSpecialOffers).where(
      and(
        eq(userSavedSpecialOffers.userId, req.user.id),
        eq(userSavedSpecialOffers.specialOfferId, specialOfferId)
      )
    );

    if (existingSavedOffer.length > 0) {
      return res.status(200).json({ 
        success: true, 
        message: "Offer already saved to your account",
        data: existingSavedOffer[0]
      });
    }

    // Save the offer to the user's account
    const [savedOffer] = await db.insert(userSavedSpecialOffers).values({
      userId: req.user.id,
      specialOfferId,
      clinicId: clinicId || null,
      offerDetails,
      savedAt: new Date(),
      viewed: false,
      status: 'active'
    }).returning();

    return res.status(201).json({
      success: true,
      message: "Special offer saved to your account",
      data: savedOffer
    });
  } catch (error) {
    console.error("Error saving special offer to account:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save special offer"
    });
  }
}));

// Get user's saved special offers
router.get('/api/special-offers/saved', catchAsync(async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    // Get all saved offers for the user
    const savedOffers = await db.select().from(userSavedSpecialOffers)
      .where(eq(userSavedSpecialOffers.userId, req.user.id))
      .orderBy(desc(userSavedSpecialOffers.savedAt));

    return res.status(200).json({
      success: true,
      count: savedOffers.length,
      data: savedOffers
    });
  } catch (error) {
    console.error("Error fetching saved special offers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve saved special offers"
    });
  }
}));

// Update a saved special offer (e.g., mark as viewed, update status)
router.patch('/api/special-offers/saved/:id', catchAsync(async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const offerId = parseInt(req.params.id);
    if (isNaN(offerId)) {
      return res.status(400).json({ success: false, message: "Invalid offer ID" });
    }

    // Make sure this offer belongs to the authenticated user
    const [existingSavedOffer] = await db.select().from(userSavedSpecialOffers).where(
      and(
        eq(userSavedSpecialOffers.id, offerId),
        eq(userSavedSpecialOffers.userId, req.user.id)
      )
    );

    if (!existingSavedOffer) {
      return res.status(404).json({ success: false, message: "Saved offer not found" });
    }

    // Update the offer with the provided fields
    const [updatedOffer] = await db.update(userSavedSpecialOffers)
      .set({
        ...req.body,
        // If status is being set to 'redeemed', add redemption date
        ...(req.body.status === 'redeemed' && { redemptionDate: new Date() })
      })
      .where(eq(userSavedSpecialOffers.id, offerId))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Saved offer updated",
      data: updatedOffer
    });
  } catch (error) {
    console.error("Error updating saved special offer:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update saved special offer"
    });
  }
}));

// Delete a saved special offer
router.delete('/api/special-offers/saved/:id', catchAsync(async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const offerId = parseInt(req.params.id);
    if (isNaN(offerId)) {
      return res.status(400).json({ success: false, message: "Invalid offer ID" });
    }

    // Make sure this offer belongs to the authenticated user
    const [existingSavedOffer] = await db.select().from(userSavedSpecialOffers).where(
      and(
        eq(userSavedSpecialOffers.id, offerId),
        eq(userSavedSpecialOffers.userId, req.user.id)
      )
    );

    if (!existingSavedOffer) {
      return res.status(404).json({ success: false, message: "Saved offer not found" });
    }

    // Delete the offer
    await db.delete(userSavedSpecialOffers)
      .where(eq(userSavedSpecialOffers.id, offerId));

    return res.status(200).json({
      success: true,
      message: "Saved offer deleted"
    });
  } catch (error) {
    console.error("Error deleting saved special offer:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete saved special offer"
    });
  }
}));

export { specialOffers };
export default router;