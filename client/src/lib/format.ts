/**
 * Format utilities for consistent display of currency and other values across the application
 */

/**
 * Format a number as currency based on locale and currency code
 * 
 * @param value The numeric value to format
 * @param currencyCode The ISO 4217 currency code (default: EUR)
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | string | null | undefined,
  currencyCode: string = 'EUR',
  locale: string = 'en-US'
): string => {
  if (value === null || value === undefined) return '—';
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) return '—';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
};

/**
 * Format a percentage value
 * 
 * @param value The percentage value (0-100)
 * @param includeSymbol Whether to include the % symbol
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number | string | null | undefined,
  includeSymbol: boolean = true
): string => {
  if (value === null || value === undefined) return '—';
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) return '—';
  
  return `${numericValue.toFixed(0)}${includeSymbol ? '%' : ''}`;
};

/**
 * Format a discount amount based on the discount type
 * 
 * @param value The discount value
 * @param discountType The type of discount (AMOUNT, PERCENT)
 * @returns Formatted discount string
 */
export const formatDiscount = (
  value: number | string | null | undefined,
  discountType: 'AMOUNT' | 'PERCENT' | string
): string => {
  if (value === null || value === undefined) return '—';
  
  if (discountType === 'PERCENT') {
    return formatPercentage(value);
  } else {
    return formatCurrency(value);
  }
};

/**
 * Calculate the discounted amount based on original price and discount
 * 
 * @param originalPrice The original price
 * @param discountValue The discount value
 * @param discountType The type of discount (AMOUNT, PERCENT)
 * @returns The discounted amount
 */
export const calculateDiscountedAmount = (
  originalPrice: number,
  discountValue: number,
  discountType: 'AMOUNT' | 'PERCENT' | string
): number => {
  if (discountType === 'PERCENT') {
    return originalPrice * (discountValue / 100);
  } else {
    return Math.min(discountValue, originalPrice);
  }
};

/**
 * Calculate the final price after discount
 * 
 * @param originalPrice The original price
 * @param discountValue The discount value
 * @param discountType The type of discount (AMOUNT, PERCENT)
 * @returns The final price after discount
 */
export const calculateFinalPrice = (
  originalPrice: number,
  discountValue: number,
  discountType: 'AMOUNT' | 'PERCENT' | string
): number => {
  const discountAmount = calculateDiscountedAmount(originalPrice, discountValue, discountType);
  return Math.max(0, originalPrice - discountAmount);
};