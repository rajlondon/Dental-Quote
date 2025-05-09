import { useState, useEffect } from 'react';

// Transport cost estimator options
interface TransportOption {
  id: string;
  name: string;
  priceGBP: number;
  priceUSD: number;
  description: string;
}

// Define interface for return value
interface TransportCostEstimatorResult {
  options: TransportOption[];
  loading: boolean;
  error: Error | null;
  selectedOption: TransportOption | null;
  setSelectedOption: (option: TransportOption | null) => void;
}

/**
 * Custom hook to estimate transportation costs based on location and preferences
 */
export function useTransportCostEstimator(
  departureCity?: string,
  travelMonth?: string,
  includePrivateTransfer: boolean = false
): TransportCostEstimatorResult {
  const [options, setOptions] = useState<TransportOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedOption, setSelectedOption] = useState<TransportOption | null>(null);

  useEffect(() => {
    const estimateTransportCosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Here we would normally make an API call to get real-time pricing
        // For now, we'll use simulated data based on inputs
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Base options that are always available
        const baseOptions: TransportOption[] = [
          {
            id: 'economy',
            name: 'Economy Airport Transfer',
            priceGBP: 25,
            priceUSD: 32,
            description: 'Shared shuttle service from Istanbul Airport to your hotel'
          },
          {
            id: 'standard',
            name: 'Standard Airport Transfer',
            priceGBP: 40,
            priceUSD: 50,
            description: 'Private sedan car transfer with meet & greet service'
          },
          {
            id: 'luxury',
            name: 'Luxury Airport Transfer',
            priceGBP: 75,
            priceUSD: 95,
            description: 'Premium vehicle with professional driver and complimentary refreshments'
          }
        ];
        
        // If private transfer is requested, filter out economy option
        const filteredOptions = includePrivateTransfer 
          ? baseOptions.filter(option => option.id !== 'economy')
          : baseOptions;
          
        // Adjust prices based on travel month (peak vs off-peak)
        const peakMonths = ['june', 'july', 'august', 'december'];
        const isPeakSeason = travelMonth && peakMonths.includes(travelMonth.toLowerCase());
        
        const adjustedOptions = filteredOptions.map(option => {
          if (isPeakSeason) {
            // 20% surcharge during peak season
            return {
              ...option,
              priceGBP: Math.round(option.priceGBP * 1.2),
              priceUSD: Math.round(option.priceUSD * 1.2)
            };
          }
          return option;
        });
        
        // Set the options and auto-select the standard option
        setOptions(adjustedOptions);
        
        // Default to standard option if available, otherwise first option
        const standardOption = adjustedOptions.find(o => o.id === 'standard');
        setSelectedOption(standardOption || adjustedOptions[0] || null);
        
      } catch (err) {
        console.error('Error estimating transport costs:', err);
        setError(err instanceof Error ? err : new Error('Failed to estimate transport costs'));
      } finally {
        setLoading(false);
      }
    };
    
    estimateTransportCosts();
  }, [departureCity, travelMonth, includePrivateTransfer]);
  
  return {
    options,
    loading,
    error,
    selectedOption,
    setSelectedOption
  };
}