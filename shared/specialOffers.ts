import { z } from 'zod';

// Type for promotion levels
export type PromotionLevel = 'standard' | 'featured' | 'premium';

// Schema for special offers
export const specialOfferSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.number().positive('Discount value must be positive'),
  applicable_treatments: z.array(z.string()).default([]),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  promo_code: z.string().optional(),
  terms_conditions: z.string().optional(),
  banner_image: z.string().optional(),
  
  // Approval & visibility flags
  is_active: z.boolean().default(false),
  admin_approved: z.boolean().default(false),
  admin_rejection_reason: z.string().optional(),
  
  // Commission & promotion details
  commission_percentage: z.number().min(5).max(30),
  promotion_level: z.enum(['standard', 'featured', 'premium']),
  homepage_display: z.boolean().default(false),
  
  // Price data for related treatment
  treatment_price_gbp: z.number().positive().optional(),
  treatment_price_usd: z.number().positive().optional(),
  
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  admin_reviewed_at: z.string().datetime().optional(),
});

// Schema for creating a special offer
export const createSpecialOfferSchema = specialOfferSchema.omit({
  id: true,
  clinic_id: true, // Will be added from the authenticated user's session
  admin_approved: true,
  admin_rejection_reason: true,
  admin_reviewed_at: true,
  created_at: true,
  updated_at: true,
});

// Special offer type 
export type SpecialOffer = z.infer<typeof specialOfferSchema>;
export type CreateSpecialOffer = z.infer<typeof createSpecialOfferSchema>;

// Commission tier structure
export const commissionTierSchema = z.object({
  id: z.string(),
  name: z.string(),
  min_commission_percentage: z.number().positive(),
  benefits: z.array(z.string()),
  homepage_display_included: z.boolean(),
  max_active_offers: z.number().int().positive(),
  priority_in_search: z.number().int().positive(),
  created_at: z.string().datetime(),
});

export type CommissionTier = z.infer<typeof commissionTierSchema>;