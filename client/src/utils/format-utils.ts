export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'TRY';

/**
 * Format a price with the appropriate currency symbol
 * @param price - The price to format
 * @param currencyCode - The currency code (USD, EUR, GBP, TRY)
 * @returns Formatted price string with currency symbol
 */
export const formatPriceInCurrency = (price: number, currencyCode: CurrencyCode = 'USD'): string => {
  const currencyMap: Record<CurrencyCode, { symbol: string, locale: string }> = {
    USD: { symbol: '$', locale: 'en-US' },
    EUR: { symbol: '€', locale: 'de-DE' },
    GBP: { symbol: '£', locale: 'en-GB' },
    TRY: { symbol: '₺', locale: 'tr-TR' }
  };

  const { symbol, locale } = currencyMap[currencyCode];
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Format a date string into a more readable format
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a percentage value
 * @param value - The percentage value (0-100)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${value}%`;
};

/**
 * Convert a price from one currency to another based on exchange rates
 * @param amount - The amount to convert
 * @param fromCurrency - The source currency
 * @param toCurrency - The target currency
 * @returns Converted amount
 */
export const convertCurrency = (
  amount: number, 
  fromCurrency: CurrencyCode, 
  toCurrency: CurrencyCode
): number => {
  // Current exchange rates (as of May 2025)
  const exchangeRates: Record<CurrencyCode, Record<CurrencyCode, number>> = {
    USD: { USD: 1, EUR: 0.93, GBP: 0.79, TRY: 32.14 },
    EUR: { USD: 1.08, EUR: 1, GBP: 0.85, TRY: 34.81 },
    GBP: { USD: 1.26, EUR: 1.17, GBP: 1, TRY: 40.78 },
    TRY: { USD: 0.031, EUR: 0.029, GBP: 0.025, TRY: 1 }
  };

  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert using exchange rate
  return amount * exchangeRates[fromCurrency][toCurrency];
};

/**
 * Truncate a string to a specified length and add an ellipsis if needed
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
};