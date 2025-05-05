import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  SpecialOffer, 
  CommissionTier, 
  specialOfferSchema, 
  createSpecialOfferSchema 
} from '@shared/specialOffers';
import { User } from '@shared/schema';

const router = express.Router();

// In-memory storage for development (replace with DB in production)
export const specialOffers = new Map<string, SpecialOffer[]>();

// Sample offers for development - demonstrating premium special offers
const sampleOffers: SpecialOffer[] = [
  {
    id: "ac36590b-b0dc-434e-ba74-d42ab2485e81", // Use fixed ID for testing with refresh script
    clinic_id: "1",  // Clinic 1
    title: "Free Consultation Package",
    description: "Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.",
    discount_type: "percentage",
    discount_value: 100, // 100% off on consultation
    applicable_treatments: ["Dental Implants", "Veneers", "Full Mouth Reconstruction"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    promo_code: "FREECONSULT",
    terms_conditions: "Applicable for new patients only. One consultation per patient.",
    banner_image: "/images/clinics/dentgroup.jpg",
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
    clinic_id: "2", // Clinic 2
    title: "Premium Hotel Deal",
    description: "Save up to 20% on premium hotels with your dental treatment booking. Enjoy luxury accommodations while you receive top-quality dental care.",
    discount_type: "percentage",
    discount_value: 20,
    applicable_treatments: ["All Treatments"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    promo_code: "LUXHOTEL20",
    terms_conditions: "Minimum treatment value of $1000 required. Subject to hotel availability.",
    banner_image: "/images/offers/premium-hotel-new.png",
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
    id: "3e6a315d-9d9f-4b56-97da-4b3d4b4b5367", // Use fixed ID for testing with refresh script
    clinic_id: "3", // Clinic 3
    title: "Dental Implant + Crown Bundle",
    description: "Get a special bundle price when combining dental implant with a crown. Save up to 30% compared to individual procedures.",
    discount_type: "percentage",
    discount_value: 30,
    applicable_treatments: ["Dental Implants", "Crowns"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString(),
    promo_code: "IMPLANTCROWN30",
    terms_conditions: "Valid for single tooth implant and crown combinations only.",
    banner_image: "/images/treatments/illustrations/dental-implants1.png",
    is_active: true,
    admin_approved: true,
    commission_percentage: 18,
    promotion_level: "featured",
    homepage_display: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    admin_reviewed_at: new Date().toISOString()
  },
  {
    id: "72e65d76-4cd5-4fd2-9323-8c35f3a9b9f0", // Use fixed ID for testing with refresh script
    clinic_id: "4", // Clinic 4
    title: "Luxury Airport Transfer",
    description: "Complimentary luxury airport transfer with premium vehicles when you book any major dental treatment package.",
    discount_type: "fixed_amount",
    discount_value: 80,
    applicable_treatments: ["Full Mouth Reconstruction", "Hollywood Smile", "All-on-4 Implants"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
    promo_code: "LUXTRAVEL",
    terms_conditions: "Minimum treatment value of $2000 required. 48-hour advance booking required for transfers.",
    banner_image: "/images/accommodations/premium-hotel.jpg",
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
    id: "a9f87e54-3c21-4f89-bc6d-1c2a1dfb76e9", // Use fixed ID for testing with refresh script
    clinic_id: "5", // Clinic 5
    title: "Free Teeth Whitening",
    description: "Receive a complimentary professional teeth whitening session with any veneer or crown treatment package.",
    discount_type: "fixed_amount",
    discount_value: 150,
    applicable_treatments: ["Veneers", "Crowns", "Hollywood Smile"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    promo_code: "FREEWHITE",
    terms_conditions: "Minimum of 4 veneers or crowns required. Not combinable with other offers.",
    banner_image: "/images/treatments/illustrations/veneers-and-crowns.png",
    is_active: true,
    admin_approved: true,
    commission_percentage: 12,
    promotion_level: "standard",
    homepage_display: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    admin_reviewed_at: new Date().toISOString()
  }
];

// Add sample offers to the map
specialOffers.set("1", [sampleOffers[0]]);
specialOffers.set("2", [sampleOffers[1]]);
specialOffers.set("3", [sampleOffers[2]]);
specialOffers.set("4", [sampleOffers[3]]);
specialOffers.set("5", [sampleOffers[4]]);

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

// Sort helper for promotion levels
const sortByPromotionLevel = (a: SpecialOffer, b: SpecialOffer) => {
  const levelOrder = { premium: 3, featured: 2, standard: 1 };
  return levelOrder[b.promotion_level] - levelOrder[a.promotion_level];
};

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
  allOffers.sort(sortByPromotionLevel);
  
  res.json(allOffers);
});

// Get homepage featured offers (public endpoint)
router.get('/api/special-offers/homepage', (req, res) => {
  console.log('GET /api/special-offers/homepage called');
  const homepageOffers: SpecialOffer[] = [];
  
  // Log the size of specialOffers map for debugging
  console.log(`Special Offers map size: ${specialOffers.size}`);
  
  specialOffers.forEach((clinicOffers, clinicId) => {
    console.log(`Processing clinic ${clinicId} with ${clinicOffers.length} offers`);
    
    clinicOffers
      .filter(offer => 
        offer.is_active && 
        offer.admin_approved && 
        offer.homepage_display &&
        new Date(offer.end_date) >= new Date()
      )
      .forEach(offer => {
        console.log(`Adding offer to homepage: ${offer.title}`);
        homepageOffers.push(offer);
      });
  });
  
  console.log(`Total homepage offers after filtering: ${homepageOffers.length}`);
  
  // Sort by promotion level (premium first) 
  homepageOffers.sort(sortByPromotionLevel);
  
  // Limit to top offers for homepage
  const topOffers = homepageOffers.slice(0, 6);
  
  console.log(`Returning ${topOffers.length} top offers for homepage`);
  
  // If no offers are available, return sample offers directly for demonstration
  if (topOffers.length === 0) {
    console.log('No offers found in storage, returning sample offers directly');
    const sampleHomepageOffers = sampleOffers
      .filter(offer => offer.homepage_display)
      .sort(sortByPromotionLevel)
      .slice(0, 6);
    
    return res.json(sampleHomepageOffers);
  }
  
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
  
  const clinicId = req.user.clinicId?.toString() || '';
  const clinicOffers = specialOffers.get(clinicId) || [];
  
  res.json(clinicOffers);
});

// Clinic: Create new special offer
router.post('/api/portal/clinic/special-offers', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'clinic_staff') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const clinicId = req.user.clinicId?.toString() || '';
  
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
    const clinicOffers = specialOffers.get(clinicId) || [];
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
      clinic_id: clinicId,
      admin_approved: false,
      homepage_display: offerData.homepage_display && selectedTier.homepage_display_included,
      created_at: now,
      updated_at: now
    };
    
    // Get existing offers or initialize
    const offers = specialOffers.get(clinicId) || [];
    offers.push(newOffer);
    specialOffers.set(clinicId, offers);
    
    res.status(201).json(newOffer);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'errors' in error) {
      return res.status(400).json({ error: (error as any).errors });
    }
    res.status(400).json({ error: 'Invalid offer data' });
  }
});

// Clinic: Update a special offer
router.put('/api/portal/clinic/special-offers/:offerId', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'clinic_staff') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const clinicId = req.user.clinicId?.toString() || '';
  const { offerId } = req.params;
  
  try {
    // Validate the update data
    const updateData = createSpecialOfferSchema.partial().parse(req.body);
    
    // Get the clinic's offers
    const clinicOffers = specialOffers.get(clinicId) || [];
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
    specialOffers.set(clinicId, clinicOffers);
    
    res.json(clinicOffers[offerIndex]);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'errors' in error) {
      return res.status(400).json({ error: (error as any).errors });
    }
    res.status(400).json({ error: 'Invalid offer data' });
  }
});

// Clinic: Delete a special offer
router.delete('/api/portal/clinic/special-offers/:offerId', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'clinic_staff') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const clinicId = req.user.clinicId?.toString() || '';
  const { offerId } = req.params;
  
  // Get the clinic's offers
  const clinicOffers = specialOffers.get(clinicId) || [];
  const offerIndex = clinicOffers.findIndex(o => o.id === offerId);
  
  if (offerIndex === -1) {
    return res.status(404).json({ error: 'Offer not found' });
  }
  
  // Remove the offer
  clinicOffers.splice(offerIndex, 1);
  specialOffers.set(clinicId, clinicOffers);
  
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

// Endpoint to force refresh a special offer image (can be used by admins/clinics)
router.post('/api/special-offers/refresh-image/:offerId', async (req, res) => {
  try {
    // Ensure user is authenticated (can be admin or clinic staff)
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { offerId } = req.params;
    const { 
      cachedImageUrl,      // Optional cached URL if provided by client
      useOpenAI = false,   // Force using OpenAI instead of cached image
      customPrompt = ''    // Optional custom prompt for OpenAI image generation
    } = req.body;
    
    if (!offerId) {
      return res.status(400).json({
        success: false,
        message: 'Offer ID is required'
      });
    }
    
    console.log(`Request to refresh image for offer ID: ${offerId}`);
    
    // Flag to track if the offer was found
    let offerFound = false;
    let updatedImageUrl = '';
    let foundOffer = null;
    
    // If useOpenAI is true, we'll generate a new image with OpenAI
    if (useOpenAI) {
      console.log('Using OpenAI to generate a new image for this offer');
      
      // Search for the offer first to have the right context
      let targetOffer = null;
      let targetClinicId = null; 
      let targetOfferIndex = -1;
      
      specialOffers.forEach((clinicOffers, clinicId) => {
        const offerIndex = clinicOffers.findIndex(o => o.id === offerId);
        if (offerIndex >= 0) {
          targetOffer = clinicOffers[offerIndex];
          targetClinicId = clinicId;
          targetOfferIndex = offerIndex;
          foundOffer = targetOffer;
          offerFound = true;
        }
      });
      
      if (!targetOffer) {
        return res.status(404).json({
          success: false,
          message: 'Offer not found'
        });
      }
      
      try {
        // Dynamically import the OpenAI service to avoid circular dependencies
        const { generateSpecialOfferImage } = await import('../services/openai-service');
        
        console.log(`Generating special offer image for "${targetOffer.title}"`);
        
        // Use custom prompt if provided, otherwise use a default based on offer properties
        const useCustom = customPrompt ? true : false;
        const prompt = customPrompt || undefined;
        
        // Generate the image with OpenAI
        const imageResult = await generateSpecialOfferImage(
          targetOffer.title,
          targetOffer.offer_type || 'premium',
          prompt, 
          true // use natural style
        );
        
        if (!imageResult || !imageResult.url) {
          throw new Error('Failed to generate image with OpenAI');
        }
        
        console.log(`Successfully generated new image with OpenAI: ${imageResult.url}`);
        
        // Cache the new image before we update the offer
        const { ImageCacheService } = await import('../utils/image-cache-service');
        try {
          // Force refresh to make sure we always have the latest image
          const cachedImageUrl = await ImageCacheService.cacheImage(imageResult.url, true);
          console.log(`Successfully cached OpenAI image to: ${cachedImageUrl}`);
          
          // Update the offer with the new image
          const oldImageUrl = targetOffer.banner_image;
          targetOffer.banner_image = cachedImageUrl;
          targetOffer.updated_at = new Date().toISOString();
          
          // Update the offer in the specialOffers map
          const clinicOffers = specialOffers.get(targetClinicId) || [];
          clinicOffers[targetOfferIndex] = targetOffer;
          specialOffers.set(targetClinicId, clinicOffers);
          
          // Set the updated image URL for the response
          updatedImageUrl = cachedImageUrl;
          
          // Notify clients via WebSocket
          try {
            const { getWebSocketService } = await import('../services/websocketService');
            const wss = getWebSocketService();
            
            if (wss) {
              wss.broadcast(JSON.stringify({
                type: 'special_offer_image_refresh',
                payload: {
                  offerId,
                  imageUrl: cachedImageUrl,
                  timestamp: Date.now()
                }
              }));
              
              console.log('Sent WebSocket notification about new OpenAI image');
            }
          } catch (wsError) {
            console.error('WebSocket notification error:', wsError);
          }
        } catch (cacheError) {
          console.error('Error caching OpenAI image:', cacheError);
          
          // If caching fails, use the original URL
          targetOffer.banner_image = imageResult.url;
          targetOffer.updated_at = new Date().toISOString();
          
          const clinicOffers = specialOffers.get(targetClinicId) || [];
          clinicOffers[targetOfferIndex] = targetOffer;
          specialOffers.set(targetClinicId, clinicOffers);
          
          updatedImageUrl = imageResult.url;
        }
        
        return res.status(200).json({
          success: true,
          message: 'Special offer image refreshed successfully with OpenAI',
          offer: targetOffer,
          imageUrl: updatedImageUrl
        });
      } catch (error) {
        console.error('Error generating image with OpenAI:', error);
        return res.status(500).json({
          success: false,
          message: `Failed to generate image with OpenAI: ${error.message}`
        });
      }
    }
    
    // If not using OpenAI, process using the existing cache system
    // Search for the offer in all clinics
    specialOffers.forEach((clinicOffers, clinicId) => {
      const offerIndex = clinicOffers.findIndex(o => o.id === offerId);
      
      if (offerIndex >= 0) {
        const offer = clinicOffers[offerIndex];
        foundOffer = offer;
        
        if (offer.banner_image) {
          // Check if we have a cached URL provided by the client
          if (cachedImageUrl) {
            // Use the permanently cached URL from our image cache service
            updatedImageUrl = cachedImageUrl;
            console.log(`Using permanently cached image URL: ${cachedImageUrl}`);
          } else {
            // If no cached URL, try to use our image cache service
            try {
              // Import the image caching service dynamically to avoid circular dependencies
              import('../utils/image-cache-service').then(async ({ ImageCacheService }) => {
                // Check if the image is already cached
                if (ImageCacheService.isImageCached(offer.banner_image)) {
                  // Get the cached version
                  const cachedUrl = ImageCacheService.getCachedUrl(offer.banner_image);
                  
                  if (cachedUrl) {
                    // Update with the cached URL
                    clinicOffers[offerIndex].banner_image = cachedUrl;
                    specialOffers.set(clinicId, clinicOffers);
                    console.log(`Using existing cached image: ${cachedUrl}`);
                    
                    // Send WebSocket notification with the cached URL
                    try {
                      const { getWebSocketService } = await import('../services/websocketService');
                      const wss = getWebSocketService();
                      
                      if (wss) {
                        wss.broadcast(JSON.stringify({
                          type: 'special_offer_image_refresh',
                          payload: {
                            offerId,
                            imageUrl: cachedUrl,
                            timestamp: Date.now()
                          }
                        }));
                      }
                    } catch (wsError) {
                      console.error('WebSocket notification error:', wsError);
                    }
                  }
                } else {
                  // If not cached, try to cache it
                  try {
                    const newCachedUrl = await ImageCacheService.cacheImage(offer.banner_image);
                    
                    // Update with the newly cached URL
                    clinicOffers[offerIndex].banner_image = newCachedUrl;
                    specialOffers.set(clinicId, clinicOffers);
                    console.log(`Newly cached image URL: ${newCachedUrl}`);
                    
                    // Send WebSocket notification with the new cached URL
                    try {
                      const { getWebSocketService } = await import('../services/websocketService');
                      const wss = getWebSocketService();
                      
                      if (wss) {
                        wss.broadcast(JSON.stringify({
                          type: 'special_offer_image_refresh',
                          payload: {
                            offerId,
                            imageUrl: newCachedUrl,
                            timestamp: Date.now()
                          }
                        }));
                      }
                    } catch (wsError) {
                      console.error('WebSocket notification error:', wsError);
                    }
                  } catch (cacheError) {
                    console.error('Error caching image:', cacheError);
                  }
                }
              }).catch(err => {
                console.error('Error importing ImageCacheService:', err);
              });
            } catch (cacheError) {
              console.error('Failed to use image cache service:', cacheError);
            }
            
            // Generate a cache busting URL as a fallback
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 10);
            const originalUrl = offer.banner_image.split('?')[0]; // Get base URL without params
            
            // Create a new URL with robust cache busting parameters
            updatedImageUrl = `${originalUrl}?t=${timestamp}&r=${randomId}&nocache=true`;
          }
          
          // Update the offer in memory with either cached URL or fallback
          clinicOffers[offerIndex] = {
            ...offer,
            banner_image: updatedImageUrl || offer.banner_image,
            updated_at: new Date().toISOString()
          };
          
          // Update the map
          specialOffers.set(clinicId, clinicOffers);
          offerFound = true;
          
          console.log(`Successfully refreshed image URL for offer "${offer.title}"`);
          console.log(`Updated image URL: ${updatedImageUrl || offer.banner_image}`);
        }
      }
    });
    
    if (!offerFound) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found or has no image to refresh'
      });
    }
    
    // Send WebSocket notification of the update
    try {
      const { getWebSocketService } = await import('../services/websocketService');
      const wss = getWebSocketService();
      
      if (wss) {
        wss.broadcast(JSON.stringify({
          type: 'special_offer_image_refreshed',
          offerId,
          imageUrl: updatedImageUrl,
          timestamp: Date.now(),
          command: 'force_reload_image'
        }));
        
        console.log('Sent WebSocket notification to force image refresh');
      }
    } catch (wsError) {
      console.error('WebSocket notification error:', wsError);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Special offer image refreshed successfully',
      offer: foundOffer,
      imageUrl: updatedImageUrl
    });
  } catch (error) {
    console.error('Error refreshing special offer image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh special offer image'
    });
  }
});

// Map is now directly exported as a named export
// No need to set it in a helper as it's directly accessible

// For debugging
console.log(`Initialized special offers map with ${specialOffers.size} entries`);

// Add an endpoint to refresh all special offer images
router.post('/refresh-images', async (req, res) => {
  // Ensure user is authenticated (should be admin or clinic staff)
  if (!req.isAuthenticated()) {
    console.log('Authentication required for refresh-images endpoint');
    return res.status(401).json({ error: 'Unauthorized' });
  }
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
        
        // Cache the OpenAI-generated image URL to local storage
        const { ImageCacheService } = await import('../utils/image-cache-service');
        console.log(`Caching OpenAI-generated image URL: ${imageResult.url}`);
        
        try {
          // Force refresh to make sure we always have the latest image
          const cachedImageUrl = await ImageCacheService.cacheImage(imageResult.url, true);
          console.log(`Successfully cached OpenAI image to: ${cachedImageUrl}`);
          
          // Update the offer with the cached image URL (which is permanent and stable)
          offer.banner_image = cachedImageUrl;
        } catch (cacheError) {
          console.error('Error caching OpenAI image:', cacheError);
          // If caching fails, use the raw URL but log the issue
          offer.banner_image = imageResult.url;
          console.warn('Using temporary OpenAI URL due to caching failure - this URL may expire');
        }
        
        offer.updated_at = new Date().toISOString();
        
        // Make sure we update the specialOffers Map with the modified offer
        // This ensures the change is persisted in memory
        const updatedClinicOffers = specialOffers.get(clinicId) || [];
        const offerIndex = updatedClinicOffers.findIndex(o => o.id === offer.id);
        if (offerIndex >= 0) {
          updatedClinicOffers[offerIndex] = offer;
          specialOffers.set(clinicId, updatedClinicOffers);
          console.log(`Updated specialOffers Map with the new image URL for offer ID: ${offer.id}`);
        }
        
        // Update all clients via WebSocket
        try {
          // Use the cached URL in notifications to ensure client displays the permanent URL
          await updateHelper.notifyClientsOfImageUpdate(offer.id, offer.banner_image);
        } catch (wsError) {
          console.error('Error notifying WebSocket clients of image update:', wsError);
        }
        
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
});

export default router;