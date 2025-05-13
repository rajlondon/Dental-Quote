/**
 * Types for the Promotion system
 */

export interface Promotion {
  id: string;
  clinic_id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  applicable_treatments: string[];
  start_date: string;
  end_date: string;
  promo_code: string;
  terms_conditions: string;
  banner_image?: string;
  is_active: boolean;
  admin_approved: boolean;
  commission_percentage?: number;
  promotion_level?: 'standard' | 'featured' | 'premium';
  homepage_display?: boolean;
  created_at: string;
  updated_at: string;
  admin_reviewed_at?: string;
  treatment_price_gbp?: number;
  treatment_price_usd?: number;
}

export interface PromotionFormData {
  clinic_id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  applicable_treatments: string[];
  start_date: string;
  end_date: string;
  promo_code: string;
  terms_conditions: string;
  banner_image?: string;
  is_active: boolean;
  admin_approved: boolean;
  commission_percentage?: number;
  promotion_level?: 'standard' | 'featured' | 'premium';
  homepage_display?: boolean;
  treatment_price_gbp?: number;
  treatment_price_usd?: number;
}