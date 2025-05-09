import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { usePromoStore } from '@/features/promo/usePromoStore';
import { DiscountType } from '@shared/schema';

export interface TreatmentSelection {
  code: string;
  qty: number;
}

export interface PromoValidationRequest {
  promoSlug: string;
  treatments: TreatmentSelection[];
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
 * Hook for calculating promo discounts in the quote builder
 * This provides a simple, consistent interface for validating and calculating
 * promotion discounts based on the user's current treatment selection
 */
export function usePromoDiscount() {
  const { activePromoSlug, promoData, clearPromo } = usePromoStore();
  
  // Mutation for validating promo against selected treatments
  const validationMutation = useMutation<
    PromoValidationResponse,
    Error,
    PromoValidationRequest
  >({
    mutationFn: async (data: PromoValidationRequest) => {
      const response = await apiRequest('POST', '/api/v1/promos/validate', data);
      return response.json();
    }
  });
  
  /**
   * Calculate discount for the given treatments and clinic
   * If the promo is invalid, it will return 0 as the discount amount
   */
  const calculateDiscount = async (
    treatments: TreatmentSelection[],
    clinicId?: string
  ) => {
    // If no promo is active, return zero discount
    if (!activePromoSlug) {
      return {
        discountAmount: 0,
        subtotal: 0,
        total: 0,
        isValid: false,
        validationErrors: ['No active promotion']
      };
    }
    
    try {
      const result = await validationMutation.mutateAsync({
        promoSlug: activePromoSlug,
        treatments,
        clinicId
      });
      
      if (!result.success || !result.data.isValid) {
        return {
          discountAmount: 0,
          subtotal: result.data.subtotal,
          total: result.data.subtotal,
          isValid: false,
          validationErrors: result.data.validationErrors || ['Invalid promotion']
        };
      }
      
      return {
        discountAmount: result.data.discountAmount,
        subtotal: result.data.subtotal,
        total: result.data.total,
        isValid: true,
        validationErrors: undefined
      };
    } catch (error) {
      console.error('Error calculating promo discount:', error);
      return {
        discountAmount: 0,
        subtotal: 0,
        total: 0,
        isValid: false,
        validationErrors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  };
  
  /**
   * Utility function to calculate discount on the client side
   * This is a fallback method if the API call fails
   */
  const calculateLocalDiscount = (subtotal: number): number => {
    if (!promoData) return 0;
    
    if (promoData.discountType === DiscountType.PERCENT) {
      return (subtotal * Number(promoData.discountValue)) / 100;
    } else {
      return Math.min(subtotal, Number(promoData.discountValue));
    }
  };
  
  /**
   * Get a formatted discount label for display
   */
  const getDiscountLabel = (): string => {
    if (!promoData) return '';
    
    return promoData.discountType === DiscountType.PERCENT
      ? `${promoData.discountValue}%`
      : `£${promoData.discountValue.toFixed(2)}`;
  };
  
  /**
   * Build a CSS class string for discount styling
   */
  const getDiscountClasses = (additionalClasses = ''): string => {
    return `text-emerald-600 font-medium ${additionalClasses}`;
  };
  
  return {
    calculateDiscount,
    calculateLocalDiscount,
    getDiscountLabel,
    getDiscountClasses,
    isLoading: validationMutation.isPending,
    error: validationMutation.error,
    hasActivePromo: !!activePromoSlug,
    clearPromo
  };
}