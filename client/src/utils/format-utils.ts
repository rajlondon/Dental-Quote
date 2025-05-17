/**
 * Utility functions for formatting currency, dates, and other data consistently
 * throughout the MyDentalFly application
 */

/**
 * Format a number as currency with proper currency symbol
 * @param value The value to format as currency
 * @param currencyCode The ISO currency code (USD, EUR, GBP)
 * @param locale The locale to use for formatting (defaults to 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number, 
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string => {
  // Handle null or undefined values
  if (value === null || value === undefined) {
    return '';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    console.error(`Error formatting currency: ${error}`);
    return `${currencyCode} ${value.toFixed(2)}`;
  }
};

/**
 * Format a percentage value
 * @param value The percentage value to format (e.g., 25 for 25%)
 * @returns Formatted percentage string (e.g., "25%")
 */
export const formatPercentage = (value: number): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  return `${Math.round(value)}%`;
};

/**
 * Format a date string to a human-readable format
 * @param dateString The date string to format
 * @param format The format to use (short, medium, long, full)
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string, 
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'en-US'
): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, { dateStyle: format }).format(date);
  } catch (error) {
    console.error(`Error formatting date: ${error}`);
    return dateString;
  }
};

/**
 * Convert currency amount from one currency to another
 * @param amount The amount to convert
 * @param fromCurrency The source currency code (USD, EUR, GBP)
 * @param toCurrency The target currency code
 * @returns Converted amount
 */
export const convertCurrency = (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): number => {
  if (amount === null || amount === undefined) {
    return 0;
  }
  
  // Fixed conversion rates (would be replaced with API call in production)
  const rates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79
  };
  
  // Return original amount if currency codes are the same
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Convert to USD first if needed
  const usdAmount = fromCurrency === 'USD' 
    ? amount 
    : amount / rates[fromCurrency];
  
  // Convert from USD to target currency
  return toCurrency === 'USD' 
    ? usdAmount 
    : usdAmount * rates[toCurrency];
};

/**
 * Calculate discount amount based on discount type and value
 * @param subtotal The subtotal amount
 * @param discountType The type of discount ('percentage' or 'fixed_amount')
 * @param discountValue The discount value (percentage or fixed amount)
 * @returns The calculated discount amount
 */
export const calculateDiscountAmount = (
  subtotal: number, 
  discountType: 'percentage' | 'fixed_amount', 
  discountValue: number
): number => {
  if (subtotal <= 0 || discountValue <= 0) {
    return 0;
  }
  
  if (discountType === 'percentage') {
    // Ensure percentage doesn't exceed 100%
    const cappedPercentage = Math.min(discountValue, 100);
    return (subtotal * cappedPercentage) / 100;
  } else {
    // For fixed amount, make sure discount doesn't exceed subtotal
    return Math.min(discountValue, subtotal);
  }
};

/**
 * Format a quantity string with proper suffix
 * @param quantity The quantity value
 * @param singularSuffix The suffix for singular quantities (default: "item")
 * @param pluralSuffix The suffix for plural quantities (default: "items")
 * @returns Formatted quantity string
 */
export const formatQuantity = (
  quantity: number, 
  singularSuffix: string = 'item', 
  pluralSuffix: string = 'items'
): string => {
  if (quantity === null || quantity === undefined) {
    return '';
  }
  
  return quantity === 1
    ? `${quantity} ${singularSuffix}`
    : `${quantity} ${pluralSuffix}`;
};

/**
 * Truncate text with ellipsis if it exceeds specified length
 * @param text The text to truncate
 * @param maxLength The maximum length of the text
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
};