/**
 * Discount calculator utilities for treatment packages and special offers
 */

/**
 * Calculate discounted price from original price and discount percentage
 * @param originalPrice The original price value
 * @param discountPercentage The discount percentage (0-100)
 * @returns The discounted price
 */
export function calculateDiscountedPrice(originalPrice: number, discountPercentage: number): number {
  if (originalPrice < 0) {
    throw new Error('Original price cannot be negative');
  }
  
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }
  
  const discountMultiplier = 1 - (discountPercentage / 100);
  return parseFloat((originalPrice * discountMultiplier).toFixed(2));
}

/**
 * Calculate discount amount from original price and discounted price
 * @param originalPrice The original price
 * @param discountedPrice The price after discount
 * @returns The discount amount
 */
export function calculateDiscountAmount(originalPrice: number, discountedPrice: number): number {
  if (originalPrice < 0 || discountedPrice < 0) {
    throw new Error('Prices cannot be negative');
  }
  
  if (discountedPrice > originalPrice) {
    throw new Error('Discounted price cannot be greater than original price');
  }
  
  return parseFloat((originalPrice - discountedPrice).toFixed(2));
}

/**
 * Calculate discount percentage from original price and discounted price
 * @param originalPrice The original price
 * @param discountedPrice The price after discount
 * @returns The discount percentage (0-100)
 */
export function calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0) {
    throw new Error('Original price must be greater than zero');
  }
  
  if (discountedPrice < 0) {
    throw new Error('Discounted price cannot be negative');
  }
  
  if (discountedPrice > originalPrice) {
    throw new Error('Discounted price cannot be greater than original price');
  }
  
  const discountPercentage = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return parseFloat(discountPercentage.toFixed(2));
}

/**
 * Convert GBP to USD using current exchange rate
 * @param gbpAmount The amount in GBP
 * @param exchangeRate The GBP to USD exchange rate (default: 1.3)
 * @returns The amount in USD
 */
export function gbpToUsd(gbpAmount: number, exchangeRate: number = 1.3): number {
  if (gbpAmount < 0) {
    throw new Error('Amount cannot be negative');
  }
  
  return parseFloat((gbpAmount * exchangeRate).toFixed(2));
}

/**
 * Calculate rounded price for display purposes
 * @param price The price to round
 * @returns The rounded price
 */
export function roundPrice(price: number): number {
  return Math.round(price);
}