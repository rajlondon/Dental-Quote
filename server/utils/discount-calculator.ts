/**
 * Utility for calculating discounts
 */

export interface TreatmentItem {
  id: string;
  price?: number;
  quantity?: number;
  isPackage?: boolean;
}

/**
 * Calculate a discount based on a promo code and items
 */
export function calculateDiscount(
  promoCode: string, 
  items: TreatmentItem[], 
  subtotal: number = 0
): { 
  discount: number;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
} {
  // Calculate subtotal if not provided
  let calculatedSubtotal = subtotal;
  
  // Standard discount calculations based on code patterns
  // These are fallbacks for testing when no database record exists
  let discountType: 'percentage' | 'fixed_amount' = 'percentage';
  let discountValue = 10; // Default 10% discount
  
  // Extract discount value from code if it contains numbers
  const numberMatch = promoCode.match(/\d+/);
  if (numberMatch) {
    const extractedValue = parseInt(numberMatch[0], 10);
    if (!isNaN(extractedValue)) {
      // If the number is 100 or less, assume it's a percentage
      if (extractedValue <= 100) {
        discountType = 'percentage';
        discountValue = extractedValue;
      } else {
        // Otherwise it's a fixed amount
        discountType = 'fixed_amount';
        discountValue = extractedValue;
      }
    }
  } else {
    // Special codes
    if (promoCode.includes('FREE') || promoCode.includes('CONSULT')) {
      discountType = 'fixed_amount';
      discountValue = 100;
    } else if (promoCode.includes('SUMMER')) {
      discountType = 'percentage';
      discountValue = 15;
    } else if (promoCode.includes('WELCOME')) {
      discountType = 'percentage';
      discountValue = 20;
    }
  }
  
  // Calculate the discount amount
  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = (calculatedSubtotal * discountValue) / 100;
  } else {
    discountAmount = Math.min(discountValue, calculatedSubtotal);
  }
  
  return {
    discount: discountAmount,
    discountType,
    discountValue
  };
}