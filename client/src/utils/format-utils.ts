/**
 * Utility functions for formatting data in the UI
 */

/**
 * Format a number as currency
 * @param value - The value to format
 * @param currency - The currency code (USD, EUR, GBP)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });
  
  return formatter.format(value);
}

/**
 * Format a date to a friendly string
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a percentage value
 * @param value - The value to format as percentage
 * @param decimalPlaces - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimalPlaces = 0): string {
  return `${value.toFixed(decimalPlaces)}%`;
}

/**
 * Convert a string to title case
 * @param str - The string to convert
 * @returns Title case string
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

/**
 * Format a dental procedure name
 * @param name - The procedure name
 * @returns Formatted procedure name
 */
export function formatProcedureName(name: string): string {
  // Custom formatting for dental procedure names
  return toTitleCase(name)
    .replace('Implant', 'Dental Implant')
    .replace('Crown', 'Dental Crown')
    .replace('Bridge', 'Dental Bridge')
    .replace('Veneer', 'Porcelain Veneer');
}

/**
 * Calculate and format a discount amount
 * @param price - The original price
 * @param discountPercent - The discount percentage
 * @param currency - The currency code
 * @returns Formatted discount amount
 */
export function formatDiscountAmount(
  price: number, 
  discountPercent: number, 
  currency = 'USD'
): string {
  const discountAmount = price * (discountPercent / 100);
  return formatCurrency(discountAmount, currency);
}

/**
 * Format a phone number in international format
 * @param phone - The phone number
 * @param countryCode - The country code (default: +1 for US)
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string, countryCode = '+1'): string {
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it already has a country code
  if (cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  return `${countryCode}${cleaned}`;
}

/**
 * Format a file size in human-readable format
 * @param bytes - The size in bytes
 * @returns Formatted file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}