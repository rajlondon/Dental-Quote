/**
 * Promo Code Service
 * Handles validation and application of promo codes for special offers and treatment packages
 */
import { specialOffers } from '../routes/special-offers-routes-fixed';
import { treatmentPackages } from '../routes/treatment-package-routes';

export interface PromoCodeData {
  code: string;
  valid: boolean;
  message: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  appliedTo?: 'special_offer' | 'treatment_package';
  itemId?: string;
  clinicId?: string;
  title?: string;
}

/**
 * Validates a promo code and returns information about the discount
 * @param code The promo code to validate
 * @returns PromoCodeData object with validation results
 */
export async function validatePromoCode(code: string): Promise<PromoCodeData> {
  if (!code || typeof code !== 'string') {
    return {
      code,
      valid: false,
      message: 'Invalid promo code format'
    };
  }

  const normalizedCode = code.trim().toUpperCase();
  
  // First check special offers
  for (const [clinicId, offers] of specialOffers.entries()) {
    for (const offer of offers) {
      if (offer.promo_code && offer.promo_code.toUpperCase() === normalizedCode) {
        // Check if the offer is still active
        if (!offer.is_active) {
          return {
            code,
            valid: false,
            message: 'This promo code has expired'
          };
        }

        return {
          code,
          valid: true,
          message: `Successfully applied promo code for ${offer.title}`,
          discountType: offer.discount_type,
          discountValue: offer.discount_value,
          appliedTo: 'special_offer',
          itemId: offer.id,
          clinicId: offer.clinic_id,
          title: offer.title
        };
      }
    }
  }

  // Then check treatment packages
  for (const pkg of treatmentPackages) {
    if (pkg.promoCode && pkg.promoCode.toUpperCase() === normalizedCode) {
      // Check if the package is still active
      if (!pkg.isActive) {
        return {
          code,
          valid: false,
          message: 'This promo code has expired'
        };
      }

      return {
        code,
        valid: true,
        message: `Successfully applied promo code for ${pkg.title}`,
        discountType: pkg.discountType || 'percentage',
        discountValue: pkg.discountValue || 15, // Default 15% if not specified
        appliedTo: 'treatment_package',
        itemId: pkg.id,
        clinicId: pkg.clinicId,
        title: pkg.title
      };
    }
  }

  // No matching promo code found
  return {
    code,
    valid: false,
    message: 'Invalid promo code'
  };
}

/**
 * Calculates the discount amount based on the promo code and original price
 * @param promoData The validated promo code data
 * @param originalPrice The original price before discount
 * @returns The amount to be discounted
 */
export function calculateDiscount(promoData: PromoCodeData, originalPrice: number): number {
  if (!promoData.valid || !promoData.discountType || promoData.discountValue === undefined) {
    return 0;
  }

  if (promoData.discountType === 'percentage') {
    return Math.round((originalPrice * promoData.discountValue) / 100);
  } else if (promoData.discountType === 'fixed_amount') {
    return Math.min(originalPrice, promoData.discountValue);
  }

  return 0;
}

/**
 * Applies a discount to a price based on promo code data
 * @param promoData The validated promo code data
 * @param originalPrice The original price before discount
 * @returns The final price after discount
 */
export function applyDiscount(promoData: PromoCodeData, originalPrice: number): number {
  if (!promoData.valid) {
    return originalPrice;
  }

  const discountAmount = calculateDiscount(promoData, originalPrice);
  return Math.max(0, originalPrice - discountAmount);
}