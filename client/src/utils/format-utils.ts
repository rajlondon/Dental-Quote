/**
 * Utility functions for formatting values in the UI
 */

// Define currency types and interfaces
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'TRY';

export interface CurrencyFormat {
  symbol: string;
  position: 'before' | 'after';
  separator: string;
  decimal: string;
  precision: number;
}

// Currency formatting configurations
export const CURRENCY_FORMATS: Record<CurrencyCode, CurrencyFormat> = {
  USD: {
    symbol: '$',
    position: 'before',
    separator: ',',
    decimal: '.',
    precision: 2,
  },
  EUR: {
    symbol: '€',
    position: 'after',
    separator: '.',
    decimal: ',',
    precision: 2,
  },
  GBP: {
    symbol: '£',
    position: 'before',
    separator: ',',
    decimal: '.',
    precision: 2,
  },
  TRY: {
    symbol: '₺',
    position: 'after',
    separator: '.',
    decimal: ',',
    precision: 2,
  },
};

// Approximate exchange rates (as of May 2025)
export const USD_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.91,
  GBP: 0.78,
  TRY: 31.45,
};

export const EUR_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.10,
  EUR: 1,
  GBP: 0.86,
  TRY: 34.56,
};

export const GBP_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.28,
  EUR: 1.16,
  GBP: 1,
  TRY: 40.32,
};

export const TRY_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 0.032,
  EUR: 0.029,
  GBP: 0.025,
  TRY: 1,
};

/**
 * Formats a price according to the currency's format rules
 * 
 * @param amount - The amount to format
 * @param currency - The currency code (USD, EUR, etc.)
 * @returns Formatted price string
 */
export function formatPrice(amount: number, currency: CurrencyCode = 'USD'): string {
  if (amount === null || amount === undefined) {
    return 'N/A';
  }

  const format = CURRENCY_FORMATS[currency];
  
  // Round to the specified precision
  const roundedAmount = Math.round(amount * Math.pow(10, format.precision)) / Math.pow(10, format.precision);
  
  // Format the number with appropriate separators
  let [integerPart, decimalPart] = roundedAmount.toFixed(format.precision).split('.');
  
  // Add thousand separators
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, format.separator);
  
  // Combine parts with appropriate decimal separator
  const formattedNumber = decimalPart ? `${integerPart}${format.decimal}${decimalPart}` : integerPart;
  
  // Apply symbol in the correct position
  return format.position === 'before' 
    ? `${format.symbol}${formattedNumber}` 
    : `${formattedNumber} ${format.symbol}`;
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
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  let exchangeRate = 1;
  
  // Select the appropriate exchange rate table based on from currency
  switch (fromCurrency) {
    case 'USD':
      exchangeRate = USD_EXCHANGE_RATES[toCurrency];
      break;
    case 'EUR':
      exchangeRate = EUR_EXCHANGE_RATES[toCurrency];
      break;
    case 'GBP':
      exchangeRate = GBP_EXCHANGE_RATES[toCurrency];
      break;
    case 'TRY':
      exchangeRate = TRY_EXCHANGE_RATES[toCurrency];
      break;
  }
  
  return amount * exchangeRate;
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
  if (amount === null || amount === undefined) {
    return 'N/A';
  }
  
  const convertedAmount = convertCurrency(amount, 'USD', displayCurrency);
  return formatPrice(convertedAmount, displayCurrency);
}

/**
 * Formats a percentage with proper symbol
 * 
 * @param value - The percentage value (e.g., 0.15 for 15%)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  // Multiply by 100 if the value is in decimal form (0.xx)
  const displayValue = value <= 1 ? value * 100 : value;
  return `${displayValue.toFixed(0)}%`;
}

/**
 * Formats a date in a readable format
 * 
 * @param date - The date to format
 * @param format - Optional format style (defaults to 'medium')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  if (!date) {
    return 'N/A';
  }
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: format === 'short' ? 'short' : 'long', 
    day: 'numeric' 
  };
  
  if (format === 'long') {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}