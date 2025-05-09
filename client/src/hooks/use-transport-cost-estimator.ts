import { useState, useCallback } from 'react';

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

const DEFAULT_COSTS = {
  flight: {
    low: { GBP: 180, USD: 240 },
    medium: { GBP: 220, USD: 290 },
    high: { GBP: 320, USD: 420 }
  },
  transfers: {
    GBP: 30,
    USD: 40
  },
  accommodation: {
    basic: { GBP: 40, USD: 55 },
    standard: { GBP: 70, USD: 95 },
    premium: { GBP: 120, USD: 160 }
  }
};

// Seasonal factors by month (1.0 = average)
const SEASONAL_FACTORS: Record<string, number> = {
  january: 0.7,
  february: 0.75,
  march: 0.8,
  april: 0.9,
  may: 1.0,
  june: 1.2,
  july: 1.4,
  august: 1.4,
  september: 1.1,
  october: 0.9,
  november: 0.8,
  december: 1.3
};

export const useTransportCostEstimator = () => {
  const [estimatedCost, setEstimatedCost] = useState<TransportCost | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const estimateCost = useCallback((params: TransportParams): TransportCost => {
    // Default values
    const destination = params.destination || 'istanbul';
    const month = params.month || 'may';
    const duration = params.duration || 7;
    const accommodationType = params.accommodation || 'standard';
    const includeTransfers = params.includeTransfers !== false;
    
    // Determine season factor (defaults to 1.0 if month not found)
    const seasonFactor = SEASONAL_FACTORS[month.toLowerCase()] || 1.0;
    
    // Calculate flight costs with seasonal adjustment
    const flightCostLevel = month === 'july' || month === 'august' || month === 'december' ? 'high' 
                          : month === 'january' || month === 'february' || month === 'november' ? 'low'
                          : 'medium';
    
    const flightGBP = Math.round(DEFAULT_COSTS.flight[flightCostLevel].GBP * seasonFactor);
    const flightUSD = Math.round(DEFAULT_COSTS.flight[flightCostLevel].USD * seasonFactor);
    
    // Calculate transfer costs if included
    const transfersGBP = includeTransfers ? DEFAULT_COSTS.transfers.GBP : 0;
    const transfersUSD = includeTransfers ? DEFAULT_COSTS.transfers.USD : 0;
    
    // Calculate accommodation costs based on duration and type
    const accommodationGBP = Math.round(DEFAULT_COSTS.accommodation[accommodationType].GBP * duration);
    const accommodationUSD = Math.round(DEFAULT_COSTS.accommodation[accommodationType].USD * duration);
    
    // Calculate totals
    const totalGBP = flightGBP + transfersGBP + accommodationGBP;
    const totalUSD = flightUSD + transfersUSD + accommodationUSD;
    
    return {
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
  }, []);

  const calculateCost = useCallback(async (params: TransportParams) => {
    setIsCalculating(true);
    
    try {
      // Simulate an API call with a small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate the estimate
      const cost = estimateCost(params);
      setEstimatedCost(cost);
      
      return cost;
    } catch (error) {
      console.error('Error calculating transport costs:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [estimateCost]);

  return {
    estimatedCost,
    isCalculating,
    calculateCost,
    estimateCost
  };
};

export default useTransportCostEstimator;