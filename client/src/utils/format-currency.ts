/**
 * Currency Formatting Utility
 * Provides consistent currency formatting across the application
 */

/**
 * Format a number as currency
 * @param value The value to format
 * @param currency The currency code (default: GBP)
 * @param locale The locale to use for formatting (default: en-GB)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = 'GBP',
  locale: string = 'en-GB'
): string {
  // Handle zero or undefined values
  if (value === 0 || value === undefined || isNaN(value)) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(0);
  }

  // Format the value
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}

/**
 * Calculate total cost from an array of treatment items
 * @param items Array of treatment items with price and quantity
 * @returns The total cost
 */
export function calculateTotalCost(
  items: Array<{ price?: number; quantity?: number }>
): number {
  return items.reduce((total, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return total + price * quantity;
  }, 0);
}