/**
 * Hook for applying coupon codes to quotes
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

export interface ApplyCodeParams {
  quoteId: string;
  clinicId: string;
  code: string;
}

export interface ApplyCodeResponse {
  success: boolean;
  data?: {
    quoteId: string;
    subtotal: number;
    discount: number;
    total: number;
    promoLabel: string;
  };
  message?: string;
}

/**
 * Hook for applying coupon codes to quotes
 * @param options Optional configuration options
 * @returns Mutation for applying a coupon code
 */
export const useApplyCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApplyCodeResponse, Error, ApplyCodeParams>({
    mutationFn: async ({ quoteId, clinicId, code }) => {
      const response = await apiRequest('POST', '/quotes/apply-code', {
        quoteId,
        clinicId,
        code: code.toUpperCase().trim()
      });
      
      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate the quote query to refetch with the new discount
      queryClient.invalidateQueries({ 
        queryKey: ['quote', variables.quoteId]
      });
      
      // Show success message with debounce to prevent multiple toasts
      if (data.success && data.data) {
        toast({
          title: 'Promo code applied',
          description: data.data.promoLabel,
          variant: 'default',
        });
      }
    },
    onError: (error, variables) => {
      console.error('Error applying code:', error);
      
      let message = 'Failed to apply promo code';
      if (error.message?.includes('INVALID_CODE')) {
        message = 'Invalid promo code';
      } else if (error.message?.includes('INACTIVE_CODE')) {
        message = 'This promo code has expired';
      } else if (error.message?.includes('INVALID_CLINIC')) {
        message = 'This promo code is not valid for the selected clinic';
      }
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  });
};

export default useApplyCode;