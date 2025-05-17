/**
 * Formatting utilities for displaying consistent data across the application
 */

/**
 * Format a price according to the selected currency
 * @param price The price to format
 * @param currency The currency to use (defaults to USD)
 * @returns Formatted price string with currency symbol
 */
export const formatPrice = (price: number, currency: 'USD' | 'GBP' | 'EUR' = 'USD'): string => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '—';
  }

  const currencySymbols = {
    USD: '$',
    GBP: '£',
    EUR: '€'
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return formatter.format(price);
};

/**
 * Format a date to a human-readable string
 * @param dateString The date string to format
 * @param includeTime Whether to include the time in the output
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | Date,
  includeTime: boolean = false
): string => {
  if (!dateString) return '—';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) {
    return '—';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

/**
 * Format a percentage value
 * @param value The percentage value (e.g., 15 for 15%)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '—';
  }
  
  return `${value}%`;
};

/**
 * Format a phone number for consistent display
 * @param phoneNumber The phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '—';
  
  // Simple formatting for international numbers
  return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};

/**
 * Get a status badge color based on quote status
 * @param status The quote status
 * @returns CSS color class for the status
 */
export const getStatusColor = (
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'completed'
): string => {
  const statusColors = {
    draft: 'bg-amber-100 text-amber-800',
    sent: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-purple-100 text-purple-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Format a discount display value
 * @param type The discount type ('percentage' or 'fixed_amount')
 * @param value The discount value
 * @param currency The currency to use for fixed amount discounts
 * @returns Formatted discount string
 */
export const formatDiscount = (
  type: 'percentage' | 'fixed_amount' | undefined,
  value: number | undefined,
  currency: 'USD' | 'GBP' | 'EUR' = 'USD'
): string => {
  if (!type || typeof value !== 'number' || isNaN(value)) {
    return '—';
  }
  
  if (type === 'percentage') {
    return `${value}%`;
  } else {
    return formatPrice(value, currency);
  }
};

/**
 * Truncate text with ellipsis if it exceeds the max length
 * @param text The text to truncate
 * @param maxLength Maximum allowed length
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.substring(0, maxLength)}...`;
};