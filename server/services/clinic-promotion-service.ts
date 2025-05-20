/**
 * Clinic Promotion Service
 * Handles clinic-initiated promotions lifecycle
 */
import { ExtendedPromoCode, PromoCodeStatus, PromoCodeAnalytics } from '../models/promo-code';

// Temporary in-memory storage for clinic promotions
// In production, this would be replaced with database operations
let extendedPromoCodes: ExtendedPromoCode[] = [];
let promoCodeAnalytics: Map<string, PromoCodeAnalytics> = new Map();

// Function to generate a unique ID (would be replaced with proper DB IDs in production)
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const clinicPromotionService = {
  // Get all promotions for a specific clinic
  async getClinicPromotions(clinicId: string): Promise<ExtendedPromoCode[]> {
    return extendedPromoCodes.filter(promo => promo.clinicId === clinicId);
  },

  // Get a specific promotion by ID
  async getPromotion(id: string): Promise<ExtendedPromoCode | null> {
    const promotion = extendedPromoCodes.find(promo => promo.id === id);
    return promotion || null;
  },

  // Create a new promotion draft
  async createPromotionDraft(data: Omit<ExtendedPromoCode, 'id' | 'status' | 'created_at' | 'version'>): Promise<ExtendedPromoCode> {
    const newPromo: ExtendedPromoCode = {
      ...data,
      id: generateId(),
      status: 'DRAFT',
      created_at: new Date().toISOString(),
      version: 1,
      isActive: false,
      display_on_homepage: false,
      homepage_priority: 5,
      admin_modified_dates: false
    };

    extendedPromoCodes.push(newPromo);
    return newPromo;
  },

  // Update a draft promotion
  async updatePromotionDraft(id: string, data: Partial<ExtendedPromoCode>): Promise<ExtendedPromoCode | null> {
    const index = extendedPromoCodes.findIndex(promo => promo.id === id);
    if (index === -1) {
      return null;
    }

    // Only allow updates to drafts or rejected promotions
    const promotion = extendedPromoCodes[index];
    if (promotion.status !== 'DRAFT' && promotion.status !== 'REJECTED') {
      throw new Error('Cannot update promotion that is not in draft or rejected status');
    }

    // Increment version if this is a rejected promotion being updated
    const newVersion = promotion.status === 'REJECTED' ? promotion.version + 1 : promotion.version;

    // Update the promotion
    const updatedPromo = {
      ...promotion,
      ...data,
      status: promotion.status, // Ensure status doesn't change
      version: newVersion,
      // If it was rejected and is being updated, clear rejection reason
      rejection_reason: promotion.status === 'REJECTED' ? undefined : promotion.rejection_reason
    };

    extendedPromoCodes[index] = updatedPromo;
    return updatedPromo;
  },

  // Submit a draft promotion for approval
  async submitForApproval(id: string): Promise<ExtendedPromoCode | null> {
    const index = extendedPromoCodes.findIndex(promo => promo.id === id);
    if (index === -1) {
      return null;
    }

    // Only allow submission of draft or rejected promotions
    const promotion = extendedPromoCodes[index];
    if (promotion.status !== 'DRAFT' && promotion.status !== 'REJECTED') {
      throw new Error('Can only submit promotions that are in draft or rejected status');
    }

    // Update status to pending approval
    const updatedPromo = {
      ...promotion,
      status: 'PENDING_APPROVAL' as PromoCodeStatus,
      submitted_at: new Date().toISOString()
    };

    extendedPromoCodes[index] = updatedPromo;
    return updatedPromo;
  },

  // Delete a draft promotion
  async deleteDraft(id: string): Promise<boolean> {
    const index = extendedPromoCodes.findIndex(promo => promo.id === id);
    if (index === -1) {
      return false;
    }

    // Only allow deletion of drafts
    const promotion = extendedPromoCodes[index];
    if (promotion.status !== 'DRAFT') {
      throw new Error('Can only delete promotions in draft status');
    }

    extendedPromoCodes.splice(index, 1);
    return true;
  },

  // Get promotions pending approval for admin
  async getPendingApprovals(): Promise<ExtendedPromoCode[]> {
    return extendedPromoCodes.filter(promo => promo.status === 'PENDING_APPROVAL');
  },

  // Admin approves a promotion
  async approvePromotion(
    id: string, 
    adminId: string, 
    notes?: string, 
    options?: {
      startDate?: string;
      endDate?: string;
      displayOnHomepage?: boolean;
      homepagePriority?: number;
      homepageImageUrl?: string;
      homepageShortDescription?: string;
    }
  ): Promise<ExtendedPromoCode | null> {
    const index = extendedPromoCodes.findIndex(promo => promo.id === id);
    if (index === -1) {
      return null;
    }

    // Only allow approval of pending promotions
    const promotion = extendedPromoCodes[index];
    if (promotion.status !== 'PENDING_APPROVAL') {
      throw new Error('Can only approve promotions that are pending approval');
    }

    // Check if admin is modifying dates
    const adminModifiedDates = !!(options?.startDate || options?.endDate);
    const originalStartDate = adminModifiedDates ? promotion.start_date : undefined;
    const originalEndDate = adminModifiedDates ? promotion.end_date : undefined;

    // Update promotion with approval details
    const updatedPromo = {
      ...promotion,
      status: 'APPROVED' as PromoCodeStatus,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      approval_notes: notes,
      
      // Update dates if provided
      start_date: options?.startDate || promotion.start_date,
      end_date: options?.endDate || promotion.end_date,
      admin_modified_dates: adminModifiedDates,
      original_start_date: originalStartDate,
      original_end_date: originalEndDate,
      
      // Update homepage display settings if provided
      display_on_homepage: options?.displayOnHomepage ?? promotion.display_on_homepage,
      homepage_priority: options?.homepagePriority ?? promotion.homepage_priority,
      homepage_image_url: options?.homepageImageUrl ?? promotion.homepage_image_url,
      homepage_short_description: options?.homepageShortDescription ?? promotion.homepage_short_description,
    };

    // Activate promotion if start date is in the past or today
    const startDate = new Date(updatedPromo.start_date);
    const now = new Date();
    if (startDate <= now) {
      updatedPromo.status = 'ACTIVE';
      updatedPromo.isActive = true;
    }

    extendedPromoCodes[index] = updatedPromo;
    return updatedPromo;
  },

  // Admin rejects a promotion
  async rejectPromotion(id: string, adminId: string, reason: string): Promise<ExtendedPromoCode | null> {
    const index = extendedPromoCodes.findIndex(promo => promo.id === id);
    if (index === -1) {
      return null;
    }

    // Only allow rejection of pending promotions
    const promotion = extendedPromoCodes[index];
    if (promotion.status !== 'PENDING_APPROVAL') {
      throw new Error('Can only reject promotions that are pending approval');
    }

    // Update promotion with rejection details
    const updatedPromo = {
      ...promotion,
      status: 'REJECTED' as PromoCodeStatus,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    };

    extendedPromoCodes[index] = updatedPromo;
    return updatedPromo;
  },

  // Get promotions for homepage display
  async getFeaturedPromotions(): Promise<ExtendedPromoCode[]> {
    const now = new Date();
    
    // Get active promotions that are configured for homepage display
    const featuredPromotions = extendedPromoCodes.filter(promo => 
      promo.status === 'ACTIVE' && 
      promo.isActive && 
      promo.display_on_homepage &&
      new Date(promo.start_date) <= now &&
      new Date(promo.end_date) >= now
    );
    
    // Sort by homepage priority (higher priority first)
    return featuredPromotions.sort((a, b) => b.homepage_priority - a.homepage_priority);
  },

  // Get promotion analytics
  async getPromotionAnalytics(promoId: string): Promise<PromoCodeAnalytics | null> {
    return promoCodeAnalytics.get(promoId) || null;
  },

  // Track promotion view
  async trackPromotionView(promoId: string): Promise<void> {
    const analytics = promoCodeAnalytics.get(promoId) || {
      promo_id: promoId,
      views: 0,
      applications: 0,
      completed_bookings: 0,
      revenue: 0,
      last_updated: new Date().toISOString()
    };

    analytics.views += 1;
    analytics.last_updated = new Date().toISOString();
    promoCodeAnalytics.set(promoId, analytics);
  },

  // Track promotion application
  async trackPromotionApplication(promoId: string): Promise<void> {
    const analytics = promoCodeAnalytics.get(promoId) || {
      promo_id: promoId,
      views: 0,
      applications: 0,
      completed_bookings: 0,
      revenue: 0,
      last_updated: new Date().toISOString()
    };

    analytics.applications += 1;
    analytics.last_updated = new Date().toISOString();
    promoCodeAnalytics.set(promoId, analytics);
  },

  // Track promotion conversion to booking
  async trackPromotionBooking(promoId: string, revenue: number): Promise<void> {
    const analytics = promoCodeAnalytics.get(promoId) || {
      promo_id: promoId,
      views: 0,
      applications: 0,
      completed_bookings: 0,
      revenue: 0,
      last_updated: new Date().toISOString()
    };

    analytics.completed_bookings += 1;
    analytics.revenue += revenue;
    analytics.last_updated = new Date().toISOString();
    promoCodeAnalytics.set(promoId, analytics);
  },

  // Check and update promotion status based on dates
  async updatePromotionStatuses(): Promise<void> {
    const now = new Date();
    
    extendedPromoCodes.forEach((promo, index) => {
      const startDate = new Date(promo.start_date);
      const endDate = new Date(promo.end_date);
      
      // If approved and start date has passed, activate
      if (promo.status === 'APPROVED' && startDate <= now) {
        extendedPromoCodes[index] = {
          ...promo,
          status: 'ACTIVE',
          isActive: true
        };
      }
      
      // If active but end date has passed, expire
      if (promo.status === 'ACTIVE' && endDate < now) {
        extendedPromoCodes[index] = {
          ...promo,
          status: 'EXPIRED',
          isActive: false
        };
      }
    });
  }
};

export default clinicPromotionService;