/**
 * Utility functions for handling promotional offers and discount calculations
 */

/**
 * Format a price with currency symbol
 */
export const formatPrice = (price: number, currency: string = 'GBP'): string => {
  const symbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
    TRY: '₺',
  };

  const symbol = symbols[currency] || symbols.GBP;
  return `${symbol}${price.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

/**
 * Calculate discount amount based on original price and discount percentage
 */
export const calculateDiscount = (
  originalPrice: number,
  discountType: 'percentage' | 'fixed_amount',
  discountValue: number
): number => {
  if (discountType === 'percentage') {
    return (originalPrice * discountValue) / 100;
  }
  return discountValue;
};

/**
 * Calculate the discounted price
 */
export const calculateDiscountedPrice = (
  originalPrice: number,
  discountType: 'percentage' | 'fixed_amount',
  discountValue: number
): number => {
  const discountAmount = calculateDiscount(originalPrice, discountType, discountValue);
  return Math.max(0, originalPrice - discountAmount);
};

/**
 * Format a date string in a human-readable format
 */
export const formatOfferDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Calculate and format savings from a discount
 */
export const formatSavings = (
  originalPrice: number,
  discountType: 'percentage' | 'fixed_amount',
  discountValue: number,
  currency: string = 'GBP'
): string => {
  const discountAmount = calculateDiscount(originalPrice, discountType, discountValue);
  return `Save ${formatPrice(discountAmount, currency)}`;
};

/**
 * Generate a user-friendly description of the offer's time validity
 */
export const getOfferTimeRemaining = (endDateString: string): string => {
  const endDate = new Date(endDateString);
  const now = new Date();
  
  // If offer has expired
  if (endDate < now) {
    return 'Expired';
  }
  
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 30) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} left`;
  }
  
  if (diffDays > 1) {
    return `${diffDays} days left`;
  }
  
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} left`;
  }
  
  return 'Ending soon';
};