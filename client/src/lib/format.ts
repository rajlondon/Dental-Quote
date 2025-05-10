/**
 * Utility functions for formatting data in a consistent manner
 */

/**
 * Format a number as currency with Euro symbol
 * @param value The number to format
 * @param currencySymbol The currency symbol to use (default: €)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | string | undefined, currencySymbol = '€'): string {
  if (value === undefined || value === null) {
    return `${currencySymbol}0.00`;
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return `${currencySymbol}0.00`;
  }
  
  return `${currencySymbol}${numValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Format a percentage value
 * @param value The percentage value to format
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | string | undefined): string {
  if (value === undefined || value === null) {
    return '0%';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0%';
  }
  
  return `${numValue}%`;
}

/**
 * Format a discount amount or percentage for display
 * @param value The discount value
 * @param type The discount type ('PERCENT' or 'AMOUNT')
 * @param currencySymbol The currency symbol to use (default: €)
 * @returns Formatted discount string
 */
export function formatDiscount(
  value: number | string | undefined, 
  type: 'PERCENT' | 'AMOUNT' | string, 
  currencySymbol = '€'
): string {
  if (value === undefined || value === null) {
    return '-';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '-';
  }
  
  if (type === 'PERCENT') {
    return formatPercentage(numValue);
  }
  
  return formatCurrency(numValue, currencySymbol);
}

/**
 * Format a date in a consistent manner
 * @param date The date to format
 * @param includeTime Whether to include the time (default: false)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | undefined, includeTime = false): string {
  if (!date) {
    return '-';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('en-GB', options);
}

/**
 * Format a promotional code for display
 * @param code The promotional code to format
 * @returns Formatted code string
 */
export function formatPromoCode(code: string | undefined): string {
  if (!code) {
    return '';
  }
  
  // Return the code in uppercase with proper spacing
  return code.toUpperCase().trim();
}