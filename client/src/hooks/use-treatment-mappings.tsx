/**
 * Hook for fetching treatment category mappings
 * Used for patient quote editing functionality
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define types for treatment categories
export interface Treatment {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
}

export interface TreatmentCategory {
  id: string;
  name: string;
  treatments: Treatment[];
}

// Hook to fetch treatment categories
export function useTreatmentMappings() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Use TanStack Query to fetch treatment categories
  const { data: categories = [], isLoading, error } = useQuery<TreatmentCategory[]>({
    queryKey: ['/api/treatments/categories'],
    queryFn: async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/treatments/categories');
        const result = await response.json();
        
        console.log('[DEBUG] Treatment categories API response:', result);
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch treatment categories');
        }
        
        // Ensure we're getting the expected data structure
        const categories = result.data || [];
        console.log('[DEBUG] Parsed treatment categories:', categories);
        
        return categories;
      } catch (error) {
        console.error('[ERROR] Failed to load treatment mappings:', error);
        toast({
          title: 'Failed to load treatments',
          description: error instanceof Error ? error.message : 'An error occurred while loading treatment options.',
          variant: 'destructive',
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    refetchOnWindowFocus: false,
  });

  // Flatten all treatments into a single array
  const allTreatments = categories?.flatMap(category => category.treatments) || [];

  // Function to find a treatment by ID
  const getTreatmentById = (id: number): Treatment | undefined => {
    return allTreatments.find(t => t.id === id);
  };

  // Function to calculate price for a treatment
  const calculatePrice = (treatmentId: number, quantity: number = 1): number => {
    const treatment = getTreatmentById(treatmentId);
    if (!treatment) return 0;
    return treatment.price * quantity;
  };

  // Calculate total price for multiple treatments
  const calculateTotalPrice = (treatments: { treatmentId: number, quantity: number }[]): number => {
    return treatments.reduce((sum, item) => {
      return sum + calculatePrice(item.treatmentId, item.quantity);
    }, 0);
  };

  return {
    categories,
    allTreatments,
    loading: loading || isLoading,
    error,
    getTreatmentById,
    calculatePrice,
    calculateTotalPrice
  };
}