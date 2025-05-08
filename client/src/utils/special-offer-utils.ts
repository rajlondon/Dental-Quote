/**
 * Utility functions for handling special offers in treatments
 */

type SpecialOffer = {
  id: string;
  title: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  clinicId: string;
};

type Treatment = {
  name: string;
  quantity?: number;
  price?: number;
  priceGBP?: number;
  basePriceGBP?: number;
  unitPriceGBP?: number;
  subtotalGBP?: number;
  isPackage?: boolean;
  isSpecialOffer?: boolean;
  isLocked?: boolean;
  packageId?: string;
  specialOffer?: SpecialOffer;
  promoToken?: string;
  promoType?: 'special_offer' | 'package';
};

/**
 * Applies special offer data to a list of treatments
 * 
 * @param treatments List of treatments to enhance
 * @param specialOffer Special offer data to apply
 * @returns Enhanced treatments with special offer data
 */
export const applySpecialOfferToTreatments = (
  treatments: Treatment[],
  specialOffer: SpecialOffer | undefined
): Treatment[] => {
  if (!specialOffer) return treatments;

  return treatments.map(treatment => {
    // Only apply to treatments that are eligible for the special offer
    // For now, we apply to all treatments, but you could add logic to check 
    // against specialOffer.applicableTreatments if available
    
    // Calculate the discounted price if applicable
    let discountedPrice = treatment.priceGBP || treatment.price || 0;
    let originalPrice = discountedPrice;
    
    // Store original price for reference
    const basePriceGBP = originalPrice;
    
    // Apply discount if discount value > 0
    if (specialOffer.discountValue > 0) {
      if (specialOffer.discountType === 'percentage') {
        // Apply percentage discount
        discountedPrice = originalPrice * (1 - (specialOffer.discountValue / 100));
      } else {
        // Apply fixed amount discount
        discountedPrice = Math.max(0, originalPrice - specialOffer.discountValue);
      }
    }
    
    // Calculate subtotal based on quantity
    const quantity = treatment.quantity || 1;
    const subtotalGBP = discountedPrice * quantity;
    
    return {
      ...treatment,
      isSpecialOffer: true,
      basePriceGBP: basePriceGBP,
      priceGBP: discountedPrice,
      unitPriceGBP: discountedPrice,
      subtotalGBP: subtotalGBP,
      specialOffer: specialOffer
    };
  });
};

/**
 * Calculates the total price of all treatments
 * 
 * @param treatments List of treatments
 * @returns Total price in GBP
 */
export const calculateTotalPrice = (treatments: Treatment[]): number => {
  return treatments.reduce((total, treatment) => {
    const price = treatment.subtotalGBP || 
                  (treatment.priceGBP || treatment.price || 0) * (treatment.quantity || 1);
    return total + price;
  }, 0);
};

/**
 * Checks if any treatment has a special offer applied
 * 
 * @param treatments List of treatments to check
 * @returns True if any treatment has a special offer
 */
export const hasSpecialOffer = (treatments: Treatment[]): boolean => {
  return treatments.some(t => t.isSpecialOffer || t.specialOffer);
};