/**
 * City-specific price calculations and adjustments
 * This utility helps with calculations that might vary by city
 */

import { CITIES, getCityByCode, getDefaultCity } from '../../client/src/constants/cities';

// City price coefficients (1.0 = standard pricing)
const CITY_PRICE_COEFFICIENTS: Record<string, number> = {
  'istanbul': 1.0,   // Istanbul (base city, standard pricing)
  'antalya': 1.05,   // Antalya (5% higher)
  'izmir': 0.95,     // Izmir (5% lower)
  'ankara': 0.9      // Ankara (10% lower)
};

/**
 * Get price coefficient for a specific city
 * @param cityCode The city code
 * @returns The price coefficient (default: 1.0)
 */
export function getCityPriceCoefficient(cityCode?: string): number {
  if (!cityCode) return 1.0;
  
  const coefficient = CITY_PRICE_COEFFICIENTS[cityCode];
  return coefficient || 1.0;
}

/**
 * Adjust price based on city
 * @param basePrice The base price (typically for Istanbul)
 * @param cityCode The city code
 * @returns The adjusted price for the specified city
 */
export function adjustPriceForCity(basePrice: number, cityCode?: string): number {
  if (basePrice < 0) {
    throw new Error('Base price cannot be negative');
  }
  
  const coefficient = getCityPriceCoefficient(cityCode);
  return parseFloat((basePrice * coefficient).toFixed(2));
}

/**
 * Get city display name from code
 * @param cityCode The city code
 * @returns The display name of the city
 */
export function getCityDisplayName(cityCode?: string): string {
  if (!cityCode) return getDefaultCity().name;
  
  const city = getCityByCode(cityCode);
  return city?.name || getDefaultCity().name;
}

/**
 * Check if a city is available for treatment packages
 * @param cityCode The city code
 * @returns True if the city is available
 */
export function isCityAvailable(cityCode?: string): boolean {
  if (!cityCode) return false;
  
  const city = getCityByCode(cityCode);
  return !!city && city.isActive;
}