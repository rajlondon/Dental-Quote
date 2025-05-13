/**
 * Format a date string or Date object to a localized string
 * @param date Date to format
 * @param options Options for Intl.DateTimeFormat
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a number as currency
 * @param amount Amount to format
 * @param currency Currency code (default: USD)
 * @param locale Locale (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (amount === null || amount === undefined) return 'N/A';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return 'Invalid amount';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${numAmount}`;
  }
}

/**
 * Format a number with commas
 * @param num Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numValue)) return 'Invalid number';
  
  try {
    return new Intl.NumberFormat().format(numValue);
  } catch (error) {
    console.error('Error formatting number:', error);
    return `${numValue}`;
  }
}

/**
 * Format a percentage value
 * @param value Percentage value (0-100)
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | string | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) return 'N/A';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'Invalid percentage';
  
  try {
    return `${numValue.toFixed(decimals)}%`;
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${numValue}%`;
  }
}