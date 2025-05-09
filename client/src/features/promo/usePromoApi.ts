import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { usePromoStore } from './usePromoStore';
import { DiscountType, PromoType } from '@shared/schema';

// API response types
export interface PromoAPIResponse {
  success: boolean;
  data: {
    id: string;
    slug: string;
    title: string;
    description: string;
    promoType: PromoType;
    discountType: DiscountType;
    discountValue: number;
    heroImageUrl?: string;
    startDate: string; // ISO string
    endDate: string; // ISO string 
    isActive: boolean;
    items: Array<{
      id: string;
      itemType: string;
      itemCode: string;
      qty: number;
    }>;
    clinics: Array<{
      id: string;
      clinicId: string;
    }>;
  };
}

export interface PromoListResponse {
  success: boolean;
  data: PromoAPIResponse['data'][];
}

export interface PromoValidationPayload {
  promoSlug: string;
  treatments: Array<{
    code: string;
    qty: number;
  }>;
  clinicId?: string;
}

export interface PromoValidationResponse {
  success: boolean;
  data: {
    isValid: boolean;
    validationErrors?: string[];
    discountAmount: number;
    subtotal: number;
    total: number;
  };
}

/**
 * Hook to fetch all active promotions
 * Optional city filter to get promos for a specific area
 */
export const useActivePromos = (city?: string) => {
  return useQuery<PromoListResponse>({
    queryKey: ['/api/v1/promos', city],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      
      const response = await apiRequest(
        'GET', 
        `/api/v1/promos?${params.toString()}`
      );
      
      return response.json();
    }
  });
};

/**
 * Hook to fetch a specific promotion by slug
 * Sets the promotion in the store if found
 */
export const usePromoBySlug = (slug: string | null) => {
  const { setPromoData, setApiState } = usePromoStore();
  
  const query = useQuery<PromoAPIResponse>({
    queryKey: ['/api/v1/promos/by-slug', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Promo slug is required');
      
      try {
        const response = await apiRequest(
          'GET',
          `/api/v1/promos/by-slug/${slug}`
        );
        
        const result: PromoAPIResponse = await response.json();
        
        // Store the promo data in the global store
        if (result.success && result.data) {
          setPromoData(result.data);
        }
        
        return result;
      } catch (error) {
        // Handle the error here and update the store
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch promotion';
        setApiState('error', errorMessage, false);
        throw error;
      }
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
  
  return query;
};

/**
 * Hook for validating promotions against the current selection
 * Returns the discount amount, subtotal, and total
 */
export const useValidatePromo = () => {
  return useMutation<PromoValidationResponse, Error, PromoValidationPayload>({
    mutationFn: async (payload: PromoValidationPayload) => {
      const response = await apiRequest(
        'POST',
        '/api/v1/promos/validate',
        payload
      );
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate any queries that depend on the promotion data
      queryClient.invalidateQueries({ queryKey: ['/api/v1/promos'] });
    }
  });
};

/**
 * Helper function to calculate discount based on type and value
 */
export const calculateDiscount = (
  amount: number, 
  discountType: DiscountType, 
  discountValue: number
): number => {
  if (discountType === DiscountType.PERCENT) {
    return (amount * Number(discountValue)) / 100;
  } else {
    return Math.min(amount, Number(discountValue));
  }
};