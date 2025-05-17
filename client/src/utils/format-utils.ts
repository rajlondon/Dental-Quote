/**
 * Utility functions for formatting values (currency, dates, etc.)
 */

/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency code (e.g., 'USD', 'GBP', 'EUR')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Format a date string or Date object
 * @param date The date to format
 * @param format The format to use (default: 'medium')
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = 
    format === 'short' ? 
      { month: 'numeric', day: 'numeric', year: 'numeric' } : 
    format === 'medium' ? 
      { month: 'short', day: 'numeric', year: 'numeric' } : 
      { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' };
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format a number as a percentage
 * @param value The value to format as percentage (0.1 = 10%)
 * @param decimals Number of decimal places to show
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Truncate a string to a maximum length with ellipsis
 * @param str The string to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export function truncateString(str: string, maxLength: number = 50): string {
  if (!str) return '';
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
}