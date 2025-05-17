/**
 * Utility functions for formatting and converting values
 */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'TRY';

export interface CurrencyFormat {
  symbol: string;
  position: 'before' | 'after';
  separator: string;
  decimal: string;
  precision: number;
}

export const CURRENCY_FORMATS: Record<CurrencyCode, CurrencyFormat> = {
  USD: {
    symbol: '$',
    position: 'before',
    separator: ',',
    decimal: '.',
    precision: 2
  },
  EUR: {
    symbol: '€',
    position: 'after',
    separator: '.',
    decimal: ',',
    precision: 2
  },
  GBP: {
    symbol: '£',
    position: 'before',
    separator: ',',
    decimal: '.',
    precision: 2
  },
  TRY: {
    symbol: '₺',
    position: 'after',
    separator: '.',
    decimal: ',',
    precision: 2
  }
};

// Exchange rates from base currency (USD)
export const USD_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  TRY: 31.85
};

// Exchange rates from EUR
export const EUR_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.09,
  EUR: 1,
  GBP: 0.85,
  TRY: 34.65
};

// Exchange rates from GBP
export const GBP_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.27,
  EUR: 1.18,
  GBP: 1,
  TRY: 40.48
};

// Exchange rates from TRY
export const TRY_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 0.031,
  EUR: 0.029,
  GBP: 0.025,
  TRY: 1
};

/**
 * Formats a price according to the currency's format rules
 * 
 * @param amount - The amount to format
 * @param currency - The currency code (USD, EUR, etc.)
 * @returns Formatted price string
 */
export function formatPrice(amount: number, currency: CurrencyCode = 'USD'): string {
  // Get the currency format
  const format = CURRENCY_FORMATS[currency];
  
  // Format the number
  const formattedNumber = amount.toFixed(format.precision)
    .replace('.', format.decimal) // Replace decimal point
    .replace(/\B(?=(\d{3})+(?!\d))/g, format.separator); // Add thousands separator
  
  // Apply the currency symbol based on position
  if (format.position === 'before') {
    return `${format.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${format.symbol}`;
  }
}

/**
 * Converts a price from one currency to another
 * 
 * @param amount - The amount to convert
 * @param fromCurrency - The source currency
 * @param toCurrency - The target currency
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number, 
  fromCurrency: CurrencyCode = 'USD', 
  toCurrency: CurrencyCode = 'USD'
): number {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Get the appropriate exchange rate matrix based on fromCurrency
  let exchangeRates;
  switch (fromCurrency) {
    case 'USD':
      exchangeRates = USD_EXCHANGE_RATES;
      break;
    case 'EUR':
      exchangeRates = EUR_EXCHANGE_RATES;
      break;
    case 'GBP':
      exchangeRates = GBP_EXCHANGE_RATES;
      break;
    case 'TRY':
      exchangeRates = TRY_EXCHANGE_RATES;
      break;
    default:
      exchangeRates = USD_EXCHANGE_RATES;
  }
  
  // Convert to the target currency
  const convertedAmount = amount * exchangeRates[toCurrency];
  
  // Round to 2 decimal places
  return Math.round(convertedAmount * 100) / 100;
}

/**
 * Formats a price in the specified currency, converting from USD if needed
 * 
 * @param amount - The amount in USD
 * @param displayCurrency - The currency to display
 * @returns Formatted price string
 */
export function formatPriceInCurrency(
  amount: number, 
  displayCurrency: CurrencyCode = 'USD'
): string {
  // Convert from USD to the display currency
  const convertedAmount = convertCurrency(amount, 'USD', displayCurrency);
  
  // Format the converted amount
  return formatPrice(convertedAmount, displayCurrency);
}

/**
 * Formats a percentage with proper symbol
 * 
 * @param value - The percentage value (e.g., 0.15 for 15%)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  // Check if value is already in percentage form (e.g., 15 vs 0.15)
  const percentage = value > 1 ? value : value * 100;
  return `${percentage.toFixed(0)}%`;
}

/**
 * Formats a date in a readable format
 * 
 * @param date - The date to format
 * @param format - Optional format style (defaults to 'medium')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  // Convert string to Date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Define format options based on requested style
  let options: Intl.DateTimeFormatOptions;
  
  switch (format) {
    case 'short':
      options = { month: 'numeric', day: 'numeric', year: '2-digit' };
      break;
    case 'medium':
      options = { month: 'short', day: 'numeric', year: 'numeric' };
      break;
    case 'long':
      options = { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric'
      };
      break;
  }
  
  // Return formatted date
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}