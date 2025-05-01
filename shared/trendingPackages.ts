import { z } from 'zod';
import { PromotionLevel } from './specialOffers';

// Schema for the included treatment in a package
export const includedTreatmentSchema = z.object({
  treatment_id: z.string(),
  treatment_type: z.enum(['standard', 'custom']),
  quantity: z.number().int().positive(),
});

// Schema for trending packages
export const trendingPackageSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  included_treatments: z.array(includedTreatmentSchema),
  total_price: z.number().positive('Total price must be positive'),
  regular_price: z.number().positive('Regular price must be positive'),
  duration_days: z.number().int().positive(),
  includes_accommodation: z.boolean().default(false),
  accommodation_details: z.string().optional(),
  includes_transport: z.boolean().default(false),
  transport_details: z.string().optional(),
  banner_image: z.string().optional(),
  
  // Approval & visibility flags
  is_active: z.boolean().default(false),
  admin_approved: z.boolean().default(false),
  admin_rejection_reason: z.string().optional(),
  
  // Commission & promotion details
  commission_percentage: z.number().min(5).max(30),
  promotion_level: z.enum(['standard', 'featured', 'premium']),
  homepage_display: z.boolean().default(false),
  featured_order: z.number().int().optional(),
  
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  admin_reviewed_at: z.string().datetime().optional(),
});

// Schema for creating a trending package
export const createTrendingPackageSchema = trendingPackageSchema.omit({
  id: true,
  clinic_id: true, // Will be added from the authenticated user's session
  admin_approved: true,
  admin_rejection_reason: true,
  admin_reviewed_at: true,
  created_at: true,
  updated_at: true,
});

// Trending package type
export type TrendingPackage = z.infer<typeof trendingPackageSchema>;
export type CreateTrendingPackage = z.infer<typeof createTrendingPackageSchema>;
export type IncludedTreatment = z.infer<typeof includedTreatmentSchema>;