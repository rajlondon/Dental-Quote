/**
 * Format utilities for displaying currencies, percentages and other values
 */

/**
 * Formats a number as a currency price
 * @param amount - The price to format
 * @param currency - The currency code (USD, GBP, EUR)
 * @param locale - The locale to use for formatting
 * @returns Formatted price string
 */
export function formatPrice(
  amount: number,
  currency: 'USD' | 'GBP' | 'EUR' = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a discount type and value for display
 * @param type - The discount type ('percentage' or 'fixed_amount')
 * @param value - The discount value
 * @param currency - The currency code (for fixed amount discounts)
 * @returns Formatted discount string
 */
export function formatDiscount(
  type: 'percentage' | 'fixed_amount' | null | undefined,
  value: number | null | undefined,
  currency: 'USD' | 'GBP' | 'EUR' = 'USD'
): string {
  if (!type || value === null || value === undefined) {
    return '';
  }
  
  if (type === 'percentage') {
    return `${value}%`;
  } else {
    return formatPrice(value, currency);
  }
}

/**
 * Formats a date for display
 * @param date - The date to format
 * @param format - The format style ('short', 'medium', 'long')
 * @param locale - The locale to use for formatting
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' = 'medium',
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'numeric' : 'long',
    day: 'numeric',
  };
  
  if (format === 'long') {
    options.hour = 'numeric';
    options.minute = 'numeric';
  }
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Shortens a long text string with ellipsis
 * @param text - The text to shorten
 * @param maxLength - The maximum length
 * @returns Shortened text with ellipsis if needed
 */
export function shortenText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
}

/**
 * Formats a phone number based on country code
 * @param phoneNumber - The phone number to format
 * @param countryCode - The country code
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string, countryCode: string = 'US'): string {
  if (!phoneNumber) {
    return '';
  }
  
  // Basic formatting for common country codes
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  
  if (countryCode === 'US' || countryCode === 'CA') {
    // Format: (XXX) XXX-XXXX
    if (cleanedNumber.length === 10) {
      return `(${cleanedNumber.substring(0, 3)}) ${cleanedNumber.substring(3, 6)}-${cleanedNumber.substring(6)}`;
    }
  } else if (countryCode === 'GB') {
    // UK format
    if (cleanedNumber.length === 11) {
      return `${cleanedNumber.substring(0, 5)} ${cleanedNumber.substring(5, 8)} ${cleanedNumber.substring(8)}`;
    }
  }
  
  // Default: just return with country code prefix
  return `+${countryCode} ${cleanedNumber}`;
}

/**
 * Calculates the discount amount based on a subtotal and discount type/value
 * @param subtotal - The subtotal amount
 * @param discountType - The discount type ('percentage' or 'fixed_amount')
 * @param discountValue - The discount value
 * @returns The calculated discount amount
 */
export function calculateDiscountAmount(
  subtotal: number,
  discountType?: 'percentage' | 'fixed_amount' | null,
  discountValue?: number | null
): number {
  if (!discountType || discountValue === null || discountValue === undefined) {
    return 0;
  }
  
  if (discountType === 'percentage') {
    return (subtotal * discountValue) / 100;
  } else {
    return Math.min(discountValue, subtotal); // Don't exceed subtotal
  }
}

/**
 * Calculate total price after discount
 * @param subtotal - The subtotal amount
 * @param discountAmount - The discount amount
 * @returns The total price after discount
 */
export function calculateTotal(subtotal: number, discountAmount: number): number {
  return Math.max(0, subtotal - discountAmount);
}