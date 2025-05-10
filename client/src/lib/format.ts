/**
 * Format a number as currency (EUR)
 * @param amount Number to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string): string {
  // Convert string to number if needed
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN
  if (isNaN(numericAmount)) {
    return '€0.00';
  }
  
  // Format the number as currency
  return new Intl.NumberFormat('en-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericAmount);
}

/**
 * Format a number as percentage
 * @param value Number to format
 * @param digits Number of digits after decimal point
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | string, digits: number = 1): string {
  // Convert string to number if needed
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle NaN
  if (isNaN(numericValue)) {
    return '0%';
  }
  
  // Format the number as percentage
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(numericValue / 100);
}

/**
 * Format a discount value based on discount type
 * @param discountType The type of discount (fixed_amount, percentage, etc)
 * @param discountValue The discount value
 * @returns Formatted discount string
 */
export function formatDiscount(discountType: string, discountValue: number | string): string {
  // Handle undefined values
  if (discountValue === undefined || discountValue === null) {
    return '€0';
  }
  
  // Convert string to number if needed
  const numericValue = typeof discountValue === 'string' ? parseFloat(discountValue) : discountValue;
  
  // Handle NaN
  if (isNaN(numericValue)) {
    return '€0';
  }
  
  // Format based on discount type
  if (discountType === 'percentage' || discountType === 'PERCENTAGE' || discountType === 'PERCENT') {
    return `${numericValue}%`;
  } else {
    return formatCurrency(numericValue);
  }
}

/**
 * Format a date as a string
 * @param date Date to format
 * @param format Format to use
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string {
  // Convert string to date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Handle invalid date
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  // Format based on the requested format
  switch(format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'full':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'short':
    default:
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
  }
}

/**
 * Truncate a string to a specific length
 * @param str String to truncate
 * @param length Maximum length
 * @param suffix Suffix to add when truncated
 * @returns Truncated string
 */
export function truncateString(str: string, length: number = 50, suffix: string = '...'): string {
  if (!str) return '';
  if (str.length <= length) return str;
  
  return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Capitalize the first letter of a string
 * @param str String to capitalize
 * @returns Capitalized string
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str || str.length === 0) return '';
  
  return str.charAt(0).toUpperCase() + str.slice(1);
}