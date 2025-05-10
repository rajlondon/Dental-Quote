/**
 * Utility functions for formatting values
 */

/**
 * Format a number as currency
 * @param value The value to format
 * @param currency The currency code (defaults to GBP)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = 'GBP'): string {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });
  
  return formatter.format(value);
}

/**
 * Format a date as a readable string
 * @param date The date to format
 * @param format The format to use
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format = 'medium'): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = 
    format === 'short' ? { month: 'short', day: 'numeric', year: 'numeric' } :
    format === 'medium' ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' } :
    { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    
  return new Intl.DateTimeFormat('en-GB', options).format(dateObj);
}

/**
 * Format a percentage
 * @param value The value to format as percentage
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a file size
 * @param bytes Size in bytes
 * @returns Formatted file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Truncate text to a specific length with ellipsis
 * @param text Text to truncate
 * @param length Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, length: number): string {
  if (!text) return '';
  if (text.length <= length) return text;
  
  return `${text.substring(0, length)}...`;
}