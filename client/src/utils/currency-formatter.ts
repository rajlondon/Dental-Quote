/**
 * Utility functions for currency formatting
 */

// Default locale and currency settings
const DEFAULT_LOCALE = 'en-UK';
const DEFAULT_CURRENCY = 'GBP';

/**
 * Format a number as currency
 * 
 * @param amount The amount to format
 * @param currency The currency code (default: GBP)
 * @param locale The locale to use for formatting (default: en-UK)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  currency: string = DEFAULT_CURRENCY, 
  locale: string = DEFAULT_LOCALE
): string {
  if (amount === undefined || amount === null) {
    return '-';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number as a percentage
 * 
 * @param value The value to format as percentage (e.g., 0.15 for 15%)
 * @param locale The locale to use for formatting (default: en-UK)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  locale: string = DEFAULT_LOCALE
): string {
  if (value === undefined || value === null) {
    return '-';
  }

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format price difference as a savings amount
 * 
 * @param originalPrice The original price
 * @param discountedPrice The discounted price
 * @param currency The currency code (default: GBP)
 * @param locale The locale to use for formatting (default: en-UK)
 * @returns Formatted savings string
 */
export function formatSavings(
  originalPrice: number,
  discountedPrice: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  const savings = originalPrice - discountedPrice;
  if (savings <= 0) {
    return '';
  }

  return `Save ${formatCurrency(savings, currency, locale)}`;
}

/**
 * Calculate and format a discount percentage
 * 
 * @param originalPrice The original price
 * @param discountedPrice The discounted price
 * @param locale The locale to use for formatting (default: en-UK)
 * @returns Formatted discount percentage string
 */
export function formatDiscountPercentage(
  originalPrice: number,
  discountedPrice: number,
  locale: string = DEFAULT_LOCALE
): string {
  if (originalPrice <= 0 || discountedPrice >= originalPrice) {
    return '';
  }

  const discountPercentage = (originalPrice - discountedPrice) / originalPrice;
  return formatPercentage(discountPercentage, locale);
}