import { useCallback, useState } from 'react';

interface TransportCost {
  totalGBP: number;
  totalUSD: number;
  breakdown: {
    flightGBP: number;
    flightUSD: number;
    transfersGBP: number;
    transfersUSD: number;
    accommodationGBP: number;
    accommodationUSD: number;
  };
}

interface TransportParams {
  destination?: string;
  month?: string;
  duration?: number;
  accommodation?: 'basic' | 'standard' | 'premium';
  includeTransfers?: boolean;
}

// Base prices for different destinations
const DESTINATIONS = {
  'istanbul': { baseFlightGBP: 280, baseFlightUSD: 350 },
  'antalya': { baseFlightGBP: 320, baseFlightUSD: 400 },
  'izmir': { baseFlightGBP: 300, baseFlightUSD: 375 },
  'bodrum': { baseFlightGBP: 340, baseFlightUSD: 425 },
  'default': { baseFlightGBP: 300, baseFlightUSD: 375 }
};

// Seasonal multipliers for flight costs
const MONTH_MULTIPLIERS = {
  'january': 0.7,
  'february': 0.7,
  'march': 0.8,
  'april': 0.9,
  'may': 1.0,
  'june': 1.2,
  'july': 1.5,
  'august': 1.5,
  'september': 1.2,
  'october': 1.0,
  'november': 0.8,
  'december': 1.0,
  'default': 1.0
};

// Accommodation prices per night
const ACCOMMODATION_PRICES = {
  'basic': { priceGBP: 40, priceUSD: 50 },
  'standard': { priceGBP: 70, priceUSD: 90 },
  'premium': { priceGBP: 120, priceUSD: 150 },
  'default': { priceGBP: 70, priceUSD: 90 }
};

// Transfer prices
const TRANSFER_PRICES = {
  'istanbul': { priceGBP: 30, priceUSD: 40 },
  'antalya': { priceGBP: 25, priceUSD: 35 },
  'izmir': { priceGBP: 25, priceUSD: 35 },
  'bodrum': { priceGBP: 30, priceUSD: 40 },
  'default': { priceGBP: 30, priceUSD: 40 }
};

/**
 * A custom hook for estimating transport and accommodation costs
 * based on destination, travel time, and preferences
 */
export const useTransportCostEstimator = () => {
  const [lastCalculation, setLastCalculation] = useState<TransportCost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate transport costs based on provided parameters
  const estimateCost = useCallback((params: TransportParams): TransportCost => {
    // Get base flight cost for destination or use default
    const destination = params.destination?.toLowerCase() || 'default';
    const destinationData = DESTINATIONS[destination as keyof typeof DESTINATIONS] || DESTINATIONS.default;
    
    // Apply seasonal multiplier based on month
    const month = params.month?.toLowerCase() || 'default';
    const monthMultiplier = MONTH_MULTIPLIERS[month as keyof typeof MONTH_MULTIPLIERS] || MONTH_MULTIPLIERS.default;
    
    // Calculate flight costs with seasonal adjustment
    const flightGBP = Math.round(destinationData.baseFlightGBP * monthMultiplier);
    const flightUSD = Math.round(destinationData.baseFlightUSD * monthMultiplier);
    
    // Calculate transfer costs if included
    const transfersGBP = params.includeTransfers 
      ? (TRANSFER_PRICES[destination as keyof typeof TRANSFER_PRICES] || TRANSFER_PRICES.default).priceGBP 
      : 0;
    const transfersUSD = params.includeTransfers 
      ? (TRANSFER_PRICES[destination as keyof typeof TRANSFER_PRICES] || TRANSFER_PRICES.default).priceUSD 
      : 0;
    
    // Calculate accommodation costs based on duration and type
    const accommodation = params.accommodation || 'standard';
    const accommodationPrices = ACCOMMODATION_PRICES[accommodation as keyof typeof ACCOMMODATION_PRICES] || ACCOMMODATION_PRICES.default;
    const duration = params.duration || 5; // Default to 5 nights if not specified
    const accommodationGBP = accommodationPrices.priceGBP * duration;
    const accommodationUSD = accommodationPrices.priceUSD * duration;
    
    // Calculate totals
    const totalGBP = flightGBP + transfersGBP + accommodationGBP;
    const totalUSD = flightUSD + transfersUSD + accommodationUSD;
    
    // Create and return cost breakdown
    const result: TransportCost = {
      totalGBP,
      totalUSD,
      breakdown: {
        flightGBP,
        flightUSD,
        transfersGBP,
        transfersUSD,
        accommodationGBP,
        accommodationUSD
      }
    };
    
    return result;
  }, []);

  // Make the calculation and handle async operations if needed
  const calculateCost = useCallback(async (params: TransportParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For now, we're using a synchronous calculation
      // But this structure allows for API-based pricing in the future
      const result = estimateCost(params);
      setLastCalculation(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      console.error('Error calculating transport costs:', err);
      setError('Could not calculate transport costs');
      setIsLoading(false);
      throw err;
    }
  }, [estimateCost]);

  return {
    calculateCost,
    estimateCost, // Synchronous version for immediate calculations
    lastCalculation,
    isLoading,
    error
  };
};

export default useTransportCostEstimator;