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
const specialOffers = new Map<string, SpecialOffer[]>();

// Sample offers for development - demonstrating premium special offers
const sampleOffers: SpecialOffer[] = [
  {
    id: uuidv4(),
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
    id: uuidv4(),
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
    id: uuidv4(),
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
    id: uuidv4(),
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
    id: uuidv4(),
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
  homepageOffers.sort(sortByPromotionLevel);
  
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

export default router;