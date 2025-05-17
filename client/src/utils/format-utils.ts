/**
 * Format utilities for the dental quote application
 */

// Format a date to localized string
export const formatDate = (dateString: string, format: 'short' | 'long' = 'long'): string => {
  try {
    const date = new Date(dateString);
    
    if (format === 'short') {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

// Format currency
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

// Format percentage
export const formatPercentage = (
  value: number,
  locale: string = 'en-US',
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 0
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value / 100);
  } catch (error) {
    console.error('Percentage formatting error:', error);
    return `${value}%`;
  }
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// Format phone number (US format)
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format: (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format: XXX-XXX-XXXX if exactly 10 digits
  // Otherwise return the original value
  return phoneNumber;
};

// Calculate discount amount
export const calculateDiscount = (
  subtotal: number,
  discountType: 'percentage' | 'fixed_amount',
  discountValue: number
): number => {
  if (discountType === 'percentage') {
    return (subtotal * discountValue) / 100;
  }
  return discountValue;
};

// Calculate total after discount
export const calculateTotal = (
  subtotal: number,
  discountAmount: number
): number => {
  return Math.max(0, subtotal - discountAmount);
};

// Convert camelCase to Title Case with spaces
export const camelCaseToTitleCase = (text: string): string => {
  // Add space before capital letters and uppercase the first character
  const result = text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
  
  return result;
};

// Slugify text for URLs
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};