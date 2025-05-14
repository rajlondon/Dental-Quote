import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';

interface PromoValidationResult {
  isValid: boolean;
  code: string;
  message: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
}

/**
 * Custom hook that extracts a promo code from URL search parameters and automatically validates it
 * 
 * @returns {Object} Hook result containing:
 *   - promoCode: The promo code from the URL (if present)
 *   - isValidatingPromo: Whether validation is in progress
 *   - promoValidationResult: The result of validation (success/error)
 *   - discountType: The type of discount (percentage or fixed_amount)
 *   - discountValue: The value of the discount
 */
export function useAutoApplyCode() {
  const [location] = useLocation();
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const { toast } = useToast();

  // Extract promo code from URL on component mount
  useEffect(() => {
    try {
      // Parse the URL search parameters
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const codeFromUrl = params.get('promo');
      
      if (codeFromUrl) {
        setPromoCode(codeFromUrl);
        // Track that a promo code was found in URL
        trackEvent('promo_code_detected_in_url', 'promo', codeFromUrl);
      }
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
    }
  }, [location]);

  // Validate the promo code if one is found
  const {
    data: promoValidationResult,
    isLoading: isValidatingPromo,
    isError,
    error
  } = useQuery({
    queryKey: ['/api/promo/validate', promoCode],
    queryFn: async () => {
      if (!promoCode) {
        return null;
      }

      try {
        const response = await apiRequest('POST', '/api/promo/validate', { code: promoCode });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Invalid promo code' }));
          throw new Error(errorData.message || 'Invalid promo code');
        }
        
        const result = await response.json();
        
        // Track successful validation
        if (result.isValid) {
          trackEvent('promo_code_valid', 'promo', promoCode);
          
          // Show toast notification for valid promo code
          toast({
            title: 'Promo Code Applied',
            description: `${result.message || 'Promotion applied successfully'}`,
          });
        } else {
          // Track invalid promo code
          trackEvent('promo_code_invalid', 'promo', promoCode);
          
          // Show toast notification for invalid promo code
          toast({
            title: 'Invalid Promo Code',
            description: result.message || 'This promotion code is not valid',
            variant: 'destructive',
          });
        }
        
        return result as PromoValidationResult;
      } catch (error) {
        console.error('Error validating promo code:', error);
        
        // Track error during validation
        trackEvent('promo_code_validation_error', 'error', error instanceof Error ? error.message : 'unknown');
        
        // Show error toast
        toast({
          title: 'Promo Code Error',
          description: error instanceof Error ? error.message : 'Failed to validate promo code',
          variant: 'destructive',
        });
        
        throw error;
      }
    },
    enabled: !!promoCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle errors from the query
  useEffect(() => {
    if (isError && error) {
      console.error('Promo validation error:', error);
    }
  }, [isError, error]);

  return {
    promoCode,
    isValidatingPromo,
    promoValidationResult,
    discountType: promoValidationResult?.discountType,
    discountValue: promoValidationResult?.discountValue,
  };
}

export default useAutoApplyCode;