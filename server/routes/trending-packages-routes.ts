import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  TrendingPackage, 
  trendingPackageSchema, 
  createTrendingPackageSchema 
} from '@shared/trendingPackages';
import { CommissionTier } from '@shared/specialOffers';

const router = express.Router();

// In-memory storage for development (replace with DB in production)
const trendingPackages = new Map<string, TrendingPackage[]>();

// Commission tier definitions - same as in special-offers-routes.ts
// This should be moved to a shared service in production
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

// Get all featured packages (public endpoint)
router.get('/api/trending-packages', (req, res) => {
  // Collect all active and featured packages from all clinics
  const allPackages: TrendingPackage[] = [];
  
  trendingPackages.forEach((clinicPackages) => {
    clinicPackages
      .filter(pkg => pkg.is_active && pkg.admin_approved)
      .forEach(pkg => allPackages.push(pkg));
  });
  
  // Sort by promotion level and featured_order
  allPackages.sort((a, b) => {
    const levelOrder = { premium: 3, featured: 2, standard: 1 };
    const levelDiff = levelOrder[b.promotion_level] - levelOrder[a.promotion_level];
    
    if (levelDiff !== 0) return levelDiff;
    
    // If same level, sort by featured_order if available
    if (a.featured_order !== undefined && b.featured_order !== undefined) {
      return a.featured_order - b.featured_order;
    }
    
    // Otherwise sort by creation date (newer first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  res.json(allPackages);
});

// Get homepage trending packages (public endpoint)
router.get('/api/trending-packages/homepage', (req, res) => {
  const homepagePackages: TrendingPackage[] = [];
  
  trendingPackages.forEach((clinicPackages) => {
    clinicPackages
      .filter(pkg => 
        pkg.is_active && 
        pkg.admin_approved && 
        pkg.homepage_display
      )
      .forEach(pkg => homepagePackages.push(pkg));
  });
  
  // Sort by promotion level (premium first) and then featured_order
  homepagePackages.sort((a, b) => {
    const levelOrder = { premium: 3, featured: 2, standard: 1 };
    const levelDiff = levelOrder[b.promotion_level] - levelOrder[a.promotion_level];
    
    if (levelDiff !== 0) return levelDiff;
    
    // If same level, sort by featured_order if available
    if (a.featured_order !== undefined && b.featured_order !== undefined) {
      return a.featured_order - b.featured_order;
    }
    
    // Otherwise sort by creation date (newer first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  // Limit to top packages for homepage
  const topPackages = homepagePackages.slice(0, 6);
  
  res.json(topPackages);
});

// Get packages for a specific clinic (public endpoint)
router.get('/api/trending-packages/clinic/:clinicId', (req, res) => {
  const { clinicId } = req.params;
  
  const clinicPackages = trendingPackages.get(clinicId) || [];
  
  // Only return active and approved packages to the public
  const activePackages = clinicPackages.filter(
    pkg => pkg.is_active && pkg.admin_approved
  );
  
  res.json(activePackages);
});

// Clinic: Get all their packages (including inactive/unapproved)
router.get('/api/portal/clinic/packages', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'clinic_staff') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const clinicId = req.user.clinicId;
  const clinicIdStr = String(clinicId);
  const clinicPackages = trendingPackages.get(clinicIdStr) || [];
  
  res.json(clinicPackages);
});

// Clinic: Create new package
router.post('/api/portal/clinic/packages', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'clinic_staff') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const clinicId = req.user.clinicId;
  const clinicIdStr = String(clinicId);
  
  try {
    // Validate the request body
    const packageData = createTrendingPackageSchema.parse(req.body);
    
    // Validate commission percentage against selected tier
    const selectedTier = commissionTiers.find(
      tier => tier.id === packageData.promotion_level
    );
    
    if (!selectedTier) {
      return res.status(400).json({ 
        error: 'Invalid promotion level selected' 
      });
    }
    
    if (packageData.commission_percentage < selectedTier.min_commission_percentage) {
      return res.status(400).json({ 
        error: `Commission percentage must be at least ${selectedTier.min_commission_percentage}% for ${selectedTier.name} promotion level` 
      });
    }
    
    // Check if homepage display is allowed for this tier
    if (packageData.homepage_display && !selectedTier.homepage_display_included) {
      return res.status(400).json({ 
        error: `Homepage display is only available for ${selectedTier.name} tier and above` 
      });
    }
    
    // Check if clinic has reached max active packages for their tier
    const clinicPackages = trendingPackages.get(clinicIdStr) || [];
    const activePackagesCount = clinicPackages.filter(p => p.is_active).length;
    
    if (packageData.is_active && activePackagesCount >= selectedTier.max_active_offers) {
      return res.status(400).json({ 
        error: `You have reached the maximum number of active packages (${selectedTier.max_active_offers}) for your ${selectedTier.name} tier` 
      });
    }
    
    const now = new Date().toISOString();
    
    const newPackage: TrendingPackage = {
      ...packageData,
      id: uuidv4(),
      clinic_id: clinicIdStr,
      admin_approved: false,
      homepage_display: packageData.homepage_display && selectedTier.homepage_display_included,
      created_at: now,
      updated_at: now
    };
    
    // Get existing packages or initialize
    const packages = trendingPackages.get(clinicIdStr) || [];
    packages.push(newPackage);
    trendingPackages.set(clinicIdStr, packages);
    
    res.status(201).json(newPackage);
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: 'Invalid package data' });
  }
});

// Clinic: Update a package
router.put('/api/portal/clinic/packages/:packageId', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'clinic_staff') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const clinicId = req.user.clinic_id;
  const { packageId } = req.params;
  
  try {
    // Validate the update data
    const updateData = createTrendingPackageSchema.partial().parse(req.body);
    
    // Get the clinic's packages
    const clinicPackages = trendingPackages.get(clinicId) || [];
    const packageIndex = clinicPackages.findIndex(p => p.id === packageId);
    
    if (packageIndex === -1) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    // Get the existing package
    const existingPackage = clinicPackages[packageIndex];
    
    // If promotion level is being updated, validate commission percentage
    if (updateData.promotion_level || updateData.commission_percentage) {
      const newLevel = updateData.promotion_level || existingPackage.promotion_level;
      const newCommission = updateData.commission_percentage || existingPackage.commission_percentage;
      
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
    
    // Check max active packages if activating an inactive package
    if (updateData.is_active === true && !existingPackage.is_active) {
      const activePackagesCount = clinicPackages.filter(p => p.is_active && p.id !== packageId).length;
      const tier = commissionTiers.find(t => t.id === existingPackage.promotion_level);
      
      if (tier && activePackagesCount >= tier.max_active_offers) {
        return res.status(400).json({ 
          error: `You have reached the maximum number of active packages (${tier.max_active_offers}) for your ${tier.name} tier` 
        });
      }
    }
    
    // If making substantial changes, reset approval status
    const resetApproval = updateData.title || 
                          updateData.description || 
                          updateData.included_treatments ||
                          updateData.total_price || 
                          updateData.promotion_level;
    
    // Update the package
    clinicPackages[packageIndex] = {
      ...existingPackage,
      ...updateData,
      admin_approved: resetApproval ? false : existingPackage.admin_approved,
      admin_rejection_reason: resetApproval ? undefined : existingPackage.admin_rejection_reason,
      updated_at: new Date().toISOString(),
    };
    
    // Save back to storage
    trendingPackages.set(clinicId, clinicPackages);
    
    res.json(clinicPackages[packageIndex]);
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: 'Invalid package data' });
  }
});

// Clinic: Delete a package
router.delete('/api/portal/clinic/packages/:packageId', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'clinic_staff') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const clinicId = req.user.clinic_id;
  const { packageId } = req.params;
  
  // Get the clinic's packages
  const clinicPackages = trendingPackages.get(clinicId) || [];
  const packageIndex = clinicPackages.findIndex(p => p.id === packageId);
  
  if (packageIndex === -1) {
    return res.status(404).json({ error: 'Package not found' });
  }
  
  // Remove the package
  clinicPackages.splice(packageIndex, 1);
  trendingPackages.set(clinicId, clinicPackages);
  
  res.json({ success: true });
});

// Admin: Get all pending packages that need approval
router.get('/api/portal/admin/packages/pending', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const pendingPackages: TrendingPackage[] = [];
  
  trendingPackages.forEach((clinicPackages) => {
    clinicPackages
      .filter(pkg => 
        pkg.is_active && 
        !pkg.admin_approved && 
        !pkg.admin_rejection_reason
      )
      .forEach(pkg => pendingPackages.push(pkg));
  });
  
  res.json(pendingPackages);
});

// Admin: Get all packages (for management)
router.get('/api/portal/admin/packages', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const allPackages: TrendingPackage[] = [];
  
  trendingPackages.forEach((clinicPackages) => {
    clinicPackages.forEach(pkg => allPackages.push(pkg));
  });
  
  res.json(allPackages);
});

// Admin: Approve or reject a package
router.post('/api/portal/admin/packages/:packageId/review', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { packageId } = req.params;
  const { approved, rejection_reason } = req.body;
  
  let foundPackage: TrendingPackage | null = null;
  let foundClinicId: string | null = null;
  
  // Find the package
  trendingPackages.forEach((clinicPackages, clinicId) => {
    const packageIndex = clinicPackages.findIndex(p => p.id === packageId);
    if (packageIndex >= 0) {
      foundPackage = clinicPackages[packageIndex];
      foundClinicId = clinicId;
    }
  });
  
  if (!foundPackage || !foundClinicId) {
    return res.status(404).json({ error: 'Package not found' });
  }
  
  // Update approval status
  const clinicPackages = trendingPackages.get(foundClinicId)!;
  const packageIndex = clinicPackages.findIndex(p => p.id === packageId);
  
  clinicPackages[packageIndex] = {
    ...clinicPackages[packageIndex],
    admin_approved: approved,
    admin_rejection_reason: approved ? undefined : rejection_reason,
    admin_reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  trendingPackages.set(foundClinicId, clinicPackages);
  
  res.json({ success: true, package: clinicPackages[packageIndex] });
});

export default router;