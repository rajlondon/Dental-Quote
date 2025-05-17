export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

interface CurrencySettings {
  symbol: string;
  rate: number; // Exchange rate from USD
  position: 'before' | 'after';
  spaceBetween: boolean;
}

const currencyMap: Record<CurrencyCode, CurrencySettings> = {
  USD: { symbol: '$', rate: 1, position: 'before', spaceBetween: false },
  EUR: { symbol: '€', rate: 0.92, position: 'before', spaceBetween: true },
  GBP: { symbol: '£', rate: 0.78, position: 'before', spaceBetween: false },
};

/**
 * Format a price in the given currency with proper formatting
 * 
 * @param price - The price in the original currency (typically USD)
 * @param currencyCode - The currency code to convert to
 * @returns Formatted price string with currency symbol
 */
export function formatPriceInCurrency(price: number, currencyCode: CurrencyCode = 'USD'): string {
  const currency = currencyMap[currencyCode];
  
  // Convert price to target currency
  const convertedPrice = price * currency.rate;
  
  // Format the number with 2 decimal places
  const formattedValue = convertedPrice.toFixed(2);
  
  // Apply currency formatting based on position
  if (currency.position === 'before') {
    return `${currency.symbol}${currency.spaceBetween ? ' ' : ''}${formattedValue}`;
  } else {
    return `${formattedValue}${currency.spaceBetween ? ' ' : ''}${currency.symbol}`;
  }
}

/**
 * Simple price formatter that uses the browser's Intl API
 * 
 * @param price - The price to format
 * @param currencyCode - The currency code
 * @returns Formatted price string
 */
export function formatPrice(price: number, currencyCode: CurrencyCode = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

/**
 * Convert a price from one currency to another
 * 
 * @param price - The price in the source currency
 * @param fromCurrency - The source currency code
 * @param toCurrency - The target currency code
 * @returns Converted price in target currency
 */
export function convertCurrency(
  price: number, 
  fromCurrency: CurrencyCode = 'USD', 
  toCurrency: CurrencyCode = 'USD'
): number {
  // First convert to USD if not already
  const priceInUSD = fromCurrency === 'USD' 
    ? price 
    : price / currencyMap[fromCurrency].rate;
  
  // Then convert from USD to target currency
  return priceInUSD * currencyMap[toCurrency].rate;
}

/**
 * Get the exchange rate between two currencies
 * 
 * @param fromCurrency - The source currency code
 * @param toCurrency - The target currency code
 * @returns Exchange rate
 */
export function getExchangeRate(
  fromCurrency: CurrencyCode = 'USD',
  toCurrency: CurrencyCode = 'USD'
): number {
  // Rate to convert 1 unit of fromCurrency to toCurrency
  return currencyMap[toCurrency].rate / currencyMap[fromCurrency].rate;
}

/**
 * Get currency symbol for a given currency code
 * 
 * @param currencyCode - The currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: CurrencyCode = 'USD'): string {
  return currencyMap[currencyCode].symbol;
}