/**
 * Utils for formatting data in the dental tourism platform
 */

/**
 * Available currency codes for the application
 */
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'TRY';

/**
 * Format a number as currency with the specified currency code
 * 
 * @param amount The amount to format
 * @param currencyCode The currency code to use (default: USD)
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  currencyCode: CurrencyCode = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a percentage value
 * 
 * @param value The percentage value (0-100)
 * @param decimalPlaces Number of decimal places to show
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  decimalPlaces: number = 0
): string {
  return `${value.toFixed(decimalPlaces)}%`;
}

/**
 * Convert currency amount between different currencies
 * Uses approximate exchange rates (for demo purposes)
 * 
 * @param amount The amount to convert
 * @param fromCurrency The source currency code
 * @param toCurrency The target currency code
 * @returns The converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  // Exchange rates (approximate)
  const rates: Record<CurrencyCode, Record<CurrencyCode, number>> = {
    USD: { USD: 1, EUR: 0.93, GBP: 0.79, TRY: 32.18 },
    EUR: { USD: 1.08, EUR: 1, GBP: 0.85, TRY: 34.74 },
    GBP: { USD: 1.27, EUR: 1.17, GBP: 1, TRY: 40.73 },
    TRY: { USD: 0.031, EUR: 0.029, GBP: 0.025, TRY: 1 }
  };
  
  return amount * rates[fromCurrency][toCurrency];
}

/**
 * Format a treatment name for display
 * 
 * @param name The treatment name to format
 * @returns Formatted treatment name
 */
export function formatTreatmentName(name: string): string {
  // Split on camel case, underscore, or hyphen
  const words = name.split(/([A-Z][a-z]+)|_|-/).filter(Boolean);
  
  // Capitalize each word and join with spaces
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format a discount for display
 * 
 * @param discount The discount amount or percentage
 * @param isPercentage Whether the discount is a percentage
 * @returns Formatted discount string
 */
export function formatDiscount(
  discount: number,
  isPercentage: boolean = true
): string {
  if (isPercentage) {
    return formatPercentage(discount);
  } else {
    return formatCurrency(discount);
  }
}

/**
 * Format a date for display in the dental tourism context
 * 
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatTreatmentDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
}

/**
 * Format a phone number for display
 * 
 * @param phoneNumber The phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Simple formatting for international numbers
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    // US format: (XXX) XXX-XXXX
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  } else if (cleaned.length > 10) {
    // International format: +X XXX XXX XXXX
    return `+${cleaned.substring(0, cleaned.length - 10)} ${cleaned.substring(cleaned.length - 10, cleaned.length - 7)} ${cleaned.substring(cleaned.length - 7, cleaned.length - 4)} ${cleaned.substring(cleaned.length - 4)}`;
  }
  
  // Return as-is if it doesn't match expected formats
  return phoneNumber;
}