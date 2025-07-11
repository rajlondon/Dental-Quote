import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  SpecialOffer, 
  CommissionTier, 
  specialOfferSchema, 
  createSpecialOfferSchema 
} from '@shared/specialOffers';
import { User } from '@shared/schema';
import { getWebSocketService } from '../services/websocketService';
import { AppError } from '../utils/app-error';
import { catchAsync } from '../utils/catch-async';

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

// Initialize with sample data for development
const sampleOffers: SpecialOffer[] = [
  {
    id: "ac36590b-b0dc-434e-ba74-d42ab2485e81", // Use fixed ID for testing with refresh script
    clinic_id: "1",  // DentGroup Istanbul
    title: "Free Consultation Package",
    description: "Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.",
    discount_type: "percentage",
    discount_value: 100, // 100% off on consultation
    applicable_treatments: ["Dental Implants", "Veneers", "Full Mouth Reconstruction"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    promo_code: "FREECONSULT",
    terms_conditions: "Applicable for new patients only. One consultation per patient.",
    banner_image: "/images/offers/free-consultation-package.jpg",
    is_active: true,
    admin_approved: true,
    commission_percentage: 20,
    promotion_level: "premium",
    homepage_display: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    admin_reviewed_at: new Date().toISOString()
  },
  {
    id: "134cdb0f-e783-47f5-a502-70e3960f7246", // Use fixed ID for testing with refresh script
    clinic_id: "2", // Dent Istanbul
    title: "Premium Hotel Deal",
    description: "Save up to 20% on premium hotels with your dental treatment booking. Enjoy luxury accommodations while you receive top-quality dental care.",
    discount_type: "percentage",
    discount_value: 20,
    applicable_treatments: ["All Treatments"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString(),
    promo_code: "HOTEL20",
    terms_conditions: "Valid for bookings made through our platform. Cannot be combined with other offers.",
    banner_image: "/images/offers/premium-hotel-deal.jpg",
    is_active: true,
    admin_approved: true,
    commission_percentage: 15,
    promotion_level: "featured",
    homepage_display: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    admin_reviewed_at: new Date().toISOString()
  },
  {
    id: "3e6a315d-9d9f-4b56-97da-4b3d4b4b5367",
    clinic_id: "3", // Istanbul Aesthetic Center
    title: "Luxury Airport Transfer",
    description: "Free luxury airport transfer service with your dental treatment package. Travel in comfort and style.",
    discount_type: "fixed_amount",
    discount_value: 50,
    applicable_treatments: ["Dental Implants", "Hollywood Smile", "Full Mouth Reconstruction"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    promo_code: "TRANSFER50",
    terms_conditions: "Available for treatments valued over £2000. Must be booked in advance.",
    banner_image: "/images/offers/luxury-airport-transfer.jpg",
    is_active: true,
    admin_approved: true,
    commission_percentage: 12,
    promotion_level: "standard",
    homepage_display: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    admin_reviewed_at: new Date().toISOString()
  },
  {
    id: "72e65d76-4cd5-4fd2-9323-8c35f3a9b9f0",
    clinic_id: "4", // Dentalpark Turkey
    title: "Dental Implant + Crown Bundle",
    description: "Special package deal: Get dental implant with crown at a discounted rate. Premium quality materials included.",
    discount_type: "percentage",
    discount_value: 25,
    applicable_treatments: ["Dental Implants", "Zirconia Crowns"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
    promo_code: "IMPLANT25",
    terms_conditions: "Package includes premium zirconia crown. Limited time offer.",
    banner_image: "/images/offers/dental-implant-crown-bundle.jpg",
    is_active: true,
    admin_approved: true,
    commission_percentage: 18,
    promotion_level: "premium",
    homepage_display: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    admin_reviewed_at: new Date().toISOString()
  },
  {
    id: "5f8a9b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
    clinic_id: "5", // Esta Istanbul
    title: "Hollywood Smile Package",
    description: "Transform your smile with our complete Hollywood Smile package. Includes veneers, whitening, and aftercare.",
    discount_type: "percentage",
    discount_value: 30,
    applicable_treatments: ["Veneers", "Teeth Whitening", "Dental Consultation"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    promo_code: "HOLLYWOOD30",
    terms_conditions: "Complete package includes 16 veneers, professional whitening, and follow-up care.",
    banner_image: "/images/offers/free-consultation.jpg",
    is_active: true,
    admin_approved: true,
    commission_percentage: 22,
    promotion_level: "premium",
    homepage_display: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    admin_reviewed_at: new Date().toISOString()
  }
];

// Initialize sample data on server start with proper clinic assignments
specialOffers.set("1", [sampleOffers[0]]); // DentGroup Istanbul
specialOffers.set("2", [sampleOffers[1]]); // Dent Istanbul  
specialOffers.set("3", [sampleOffers[2]]); // Istanbul Aesthetic Center
specialOffers.set("4", [sampleOffers[3]]); // Dentalpark Turkey
specialOffers.set("5", [sampleOffers[4]]); // Esta Istanbul

console.log(`✅ Special offers initialized for ${specialOffers.size} clinics:`);
specialOffers.forEach((offers, clinicId) => {
  console.log(`   Clinic ${clinicId}: ${offers.length} offers`);
  offers.forEach(offer => {
    console.log(`     - ${offer.title} (${offer.promo_code})`);
  });
});

// Export both the router and specialOffers map for direct access
export { specialOffers };
export default router;