/**
 * Utility functions for handling promotions data conversion between API and UI formats
 */
import { Promotion } from '@/types/promotion';

/**
 * Converts API promotion data format to UI format
 * @param apiPromo - The promotion data from the API
 * @returns Promotion object in UI format
 */
export function apiToUiPromotion(apiPromo: any): Promotion {
  return {
    id: apiPromo.id,
    clinic_id: apiPromo.clinic_id || '',
    title: apiPromo.title || 'Unnamed Promotion',
    description: apiPromo.description || '',
    discount_type: apiPromo.discount_type === 'PERCENT' ? 'percentage' : 'fixed_amount',
    discount_value: Number(apiPromo.discount_value),
    applicable_treatments: Array.isArray(apiPromo.applicable_treatments) 
      ? apiPromo.applicable_treatments 
      : (apiPromo.applicable_treatments ? [apiPromo.applicable_treatments] : []),
    start_date: apiPromo.start_date,
    end_date: apiPromo.end_date,
    promo_code: apiPromo.code || '',
    terms_conditions: apiPromo.terms_conditions || '',
    banner_image: apiPromo.banner_image || '',
    is_active: Boolean(apiPromo.is_active),
    admin_approved: Boolean(apiPromo.admin_approved !== false),
    commission_percentage: apiPromo.commission_percentage 
      ? Number(apiPromo.commission_percentage) 
      : undefined,
    promotion_level: apiPromo.promotion_level || 'standard',
    homepage_display: Boolean(apiPromo.homepage_display),
    created_at: apiPromo.created_at || new Date().toISOString(),
    updated_at: apiPromo.updated_at || new Date().toISOString(),
    admin_reviewed_at: apiPromo.admin_reviewed_at,
    treatment_price_gbp: apiPromo.treatment_price_gbp 
      ? Number(apiPromo.treatment_price_gbp) 
      : undefined,
    treatment_price_usd: apiPromo.treatment_price_usd 
      ? Number(apiPromo.treatment_price_usd) 
      : undefined
  };
}

/**
 * Converts UI promotion format to API format
 * @param uiPromo - The promotion data in UI format
 * @returns Promotion data in API format
 */
export function uiToApiPromotion(uiPromo: Promotion): any {
  return {
    id: uiPromo.id,
    clinic_id: uiPromo.clinic_id,
    title: uiPromo.title,
    description: uiPromo.description,
    discount_type: uiPromo.discount_type === 'percentage' ? 'PERCENT' : 'FIXED',
    discount_value: uiPromo.discount_value,
    applicable_treatments: uiPromo.applicable_treatments,
    start_date: uiPromo.start_date,
    end_date: uiPromo.end_date,
    code: uiPromo.promo_code,
    terms_conditions: uiPromo.terms_conditions,
    banner_image: uiPromo.banner_image,
    is_active: uiPromo.is_active,
    admin_approved: uiPromo.admin_approved,
    commission_percentage: uiPromo.commission_percentage,
    promotion_level: uiPromo.promotion_level,
    homepage_display: uiPromo.homepage_display,
    treatment_price_gbp: uiPromo.treatment_price_gbp,
    treatment_price_usd: uiPromo.treatment_price_usd
  };
}

/**
 * Gets formatted applicable treatments as a string
 * @param promotion - The promotion object
 * @returns Formatted string of treatments
 */
export function getFormattedTreatments(promotion: Promotion): string {
  if (!promotion.applicable_treatments || promotion.applicable_treatments.length === 0) {
    return 'All treatments';
  }
  
  // Format treatment codes to be more readable
  return promotion.applicable_treatments
    .map(treatment => {
      // Convert snake_case to Title Case
      return treatment
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    })
    .join(', ');
}

/**
 * Gets the formatted discount value as a string
 * @param promotion - The promotion object
 * @returns Formatted discount string
 */
export function getFormattedDiscount(promotion: Promotion): string {
  if (promotion.discount_type === 'percentage') {
    return `${promotion.discount_value}%`;
  } else {
    return `£${promotion.discount_value}`;
  }
}