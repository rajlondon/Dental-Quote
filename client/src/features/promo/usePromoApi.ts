import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { usePromoStore } from './usePromoStore';
import { PromoType, DiscountType } from '@shared/schema';

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

export interface PromoValidationPayload {
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

// Fetch active promotions, optionally filtered by city
export const useActivePromos = (city?: string) => {
  const queryKey = city ? ['promos', 'active', city] : ['promos', 'active'];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = city 
        ? `/api/v1/promos?isActive=true&city=${encodeURIComponent(city)}`
        : '/api/v1/promos?isActive=true';
      
      const response = await apiRequest('GET', url);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch active promotions');
      }
      
      return response.json();
    }
  });
};

// Fetch a promotion by slug
export const usePromoBySlug = (slug: string | null) => {
  const { setPromoData, setValidationStatus, setError } = usePromoStore();
  
  return useQuery({
    queryKey: ['promo', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No promotion slug provided');
      
      const response = await apiRequest('GET', `/api/v1/promos/by-slug/${slug}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch promotion details');
      }
      
      const result: PromoAPIResponse = await response.json();
      
      // Process the data for the store
      const promoData = {
        ...result.data,
        startDate: new Date(result.data.startDate),
        endDate: new Date(result.data.endDate),
        clinicIds: result.data.clinics.map(c => c.clinicId)
      };
      
      // Update the store
      setPromoData(promoData);
      setValidationStatus(true);
      
      return result;
    },
    enabled: !!slug,
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to fetch promotion');
      setValidationStatus(false);
    }
  });
};

// Validate a promotion against the current quote
export const useValidatePromo = () => {
  return useMutation({
    mutationFn: async ({ 
      slug, 
      payload 
    }: { 
      slug: string, 
      payload: PromoValidationPayload 
    }): Promise<PromoValidationResponse> => {
      const response = await apiRequest('POST', `/api/v1/promos/validate`, {
        promoSlug: slug,
        ...payload
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to validate promotion');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ['quote'] });
    }
  });
};

// Calculate discount based on promo rules (client-side version for display)
export const calculateDiscount = (
  subtotal: number, 
  promo: { 
    discountType: DiscountType, 
    discountValue: number 
  }
): number => {
  if (!promo) return 0;
  
  if (promo.discountType === DiscountType.PERCENT) {
    return (subtotal * promo.discountValue) / 100;
  } else if (promo.discountType === DiscountType.FIXED) {
    return Math.min(subtotal, promo.discountValue); // Can't discount more than the subtotal
  }
  
  return 0;
};