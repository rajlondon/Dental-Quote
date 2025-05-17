/**
 * Utility functions for formatting data in the application
 */

/**
 * Format a date string or Date object to a localized string
 * @param dateInput Date string (ISO format) or Date object
 * @param format Format option: 'full', 'long', 'medium', 'short'
 * @returns Formatted date string
 */
export function formatDate(
  dateInput: string | Date,
  format: 'full' | 'long' | 'medium' | 'short' = 'medium'
): string {
  if (!dateInput) return '';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: format,
      timeStyle: format === 'short' || format === 'medium' ? 'short' : undefined
    }).format(date);
  } catch (e) {
    // Fallback if Intl API fails
    return date.toLocaleString();
  }
}

/**
 * Format a number as currency
 * @param amount Amount to format
 * @param currency Currency code (default: 'USD')
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  decimals: number = 2
): string {
  if (amount === undefined || amount === null) return '';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  } catch (e) {
    // Fallback if Intl API fails or currency is invalid
    const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    return `${symbol}${amount.toFixed(decimals)}`;
  }
}

/**
 * Format a percentage value
 * @param value Value to format as percentage
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  if (value === undefined || value === null) return '';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  } catch (e) {
    // Fallback if Intl API fails
    return `${value.toFixed(decimals)}%`;
  }
}

/**
 * Format a phone number for display
 * @param phoneNumber Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format for different countries
  if (cleaned.length === 10) {
    // US format: (XXX) XXX-XXXX
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US with country code: +1 (XXX) XXX-XXXX
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length > 8) {
    // Generic international format with groups of 3-4 digits
    const groups = [];
    let remaining = cleaned;
    
    // Country code (1-4 digits)
    if (remaining.length > 8) {
      const countryCodeLength = Math.min(remaining.length - 8, 4);
      groups.push(`+${remaining.slice(0, countryCodeLength)}`);
      remaining = remaining.slice(countryCodeLength);
    }
    
    // Rest of the digits in groups of 2-4
    while (remaining.length > 0) {
      const groupSize = remaining.length > 4 ? 3 : remaining.length;
      groups.push(remaining.slice(0, groupSize));
      remaining = remaining.slice(groupSize);
    }
    
    return groups.join(' ');
  }
  
  // If no specific format matches, return with spaces every 3 digits
  return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}