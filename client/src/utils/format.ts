/**
 * Utility functions for formatting data in the admin interface
 */

/**
 * Format a date string to a localized format
 * @param dateString - The date string to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString || 'N/A';
  }
}

/**
 * Format a number as currency in GBP
 * @param value - The number to format
 * @param currency - The currency code
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | string,
  currency: string = 'GBP'
): string {
  if (value === null || value === undefined) return 'N/A';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'N/A';
  
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
    }).format(numValue);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} ${numValue}`;
  }
}

/**
 * Format a number with commas as thousands separators
 * @param value - The number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number | string): string {
  if (value === null || value === undefined) return 'N/A';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'N/A';
  
  try {
    return new Intl.NumberFormat('en-GB').format(numValue);
  } catch (error) {
    console.error('Error formatting number:', error);
    return numValue.toString();
  }
}

/**
 * Format a number as a percentage
 * @param value - The number to format
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | string): string {
  if (value === null || value === undefined) return 'N/A';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'N/A';
  
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numValue / 100);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${numValue}%`;
  }
}