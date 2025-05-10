/**
 * City data constants for MyDentalFly application
 * This file contains city information used for filtering and display throughout the app
 */

export interface City {
  code: string;
  name: string;
  country: string;
  isActive: boolean;
}

/**
 * City codes are used as unique identifiers throughout the application
 * Format: lowercase, no spaces, use hyphens for multi-word city names
 */
export const CITIES: City[] = [
  {
    code: 'istanbul',
    name: 'Istanbul',
    country: 'Turkey',
    isActive: true
  },
  {
    code: 'antalya',
    name: 'Antalya',
    country: 'Turkey',
    isActive: true
  },
  {
    code: 'izmir',
    name: 'Izmir',
    country: 'Turkey',
    isActive: false // Coming soon
  },
  {
    code: 'ankara',
    name: 'Ankara',
    country: 'Turkey',
    isActive: false // Coming soon
  }
];

/**
 * Get list of active cities only
 */
export const getActiveCities = (): City[] => {
  return CITIES.filter(city => city.isActive);
};

/**
 * Get city by code
 */
export const getCityByCode = (code: string): City | undefined => {
  return CITIES.find(city => city.code === code);
};

/**
 * Get cities by country
 */
export const getCitiesByCountry = (country: string): City[] => {
  return CITIES.filter(city => city.country === country);
};

/**
 * Default city code to use when none is selected
 */
export const DEFAULT_CITY_CODE = 'istanbul';

/**
 * Get default city object
 */
export const getDefaultCity = (): City => {
  return getCityByCode(DEFAULT_CITY_CODE) || CITIES[0];
};