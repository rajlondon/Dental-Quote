import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';

interface PromoValidationResult {
  isValid: boolean;
  code: string;
  message: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
}

// Known promo codes for demo purposes
const VALID_PROMO_CODES: Record<string, { discountType: 'percentage' | 'fixed_amount', discountValue: number }> = {
  'SUMMER15': { discountType: 'percentage', discountValue: 15 },
  'DENTAL25': { discountType: 'percentage', discountValue: 25 },
  'NEWPATIENT': { discountType: 'percentage', discountValue: 20 },
  'TEST10': { discountType: 'percentage', discountValue: 10 },
  'FREECONSULT': { discountType: 'fixed_amount', discountValue: 75 },
  'LUXHOTEL20': { discountType: 'percentage', discountValue: 20 },
  'IMPLANTCROWN30': { discountType: 'percentage', discountValue: 30 },
  'FREEWHITE': { discountType: 'fixed_amount', discountValue: 150 }
};

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
      
      // Check both 'promo' and 'promoCode' parameters since we're using both in different places
      const codeFromUrl = params.get('promoCode') || params.get('promo') || params.get('code');
      
      if (codeFromUrl && codeFromUrl !== promoCode) {
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
    queryKey: ['/api/promo-codes/validate', promoCode],
    queryFn: async () => {
      if (!promoCode) {
        return null;
      }

      try {
        // For demonstration purposes, validate locally with known promo codes
        const upperPromoCode = promoCode.toUpperCase();
        
        if (upperPromoCode in VALID_PROMO_CODES) {
          const promoDetails = VALID_PROMO_CODES[upperPromoCode];
          
          // Show success toast
          toast({
            title: 'Promo Code Applied',
            description: `${upperPromoCode} promotion applied successfully!`,
          });
          
          return {
            isValid: true,
            code: upperPromoCode,
            message: `${upperPromoCode} promotion applied successfully!`,
            discountType: promoDetails.discountType,
            discountValue: promoDetails.discountValue
          };
        } else {
          // Show error toast for invalid code
          toast({
            title: 'Invalid Promo Code',
            description: 'This promotion code is not valid',
            variant: 'destructive',
          });
          
          return {
            isValid: false,
            code: promoCode,
            message: 'Invalid promo code'
          };
        }
      } catch (error) {
        console.error('Error validating promo code:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Show error toast
        toast({
          title: 'Promo Code Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        return {
          isValid: false,
          code: promoCode,
          message: errorMessage
        };
      }
    },
    enabled: !!promoCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle validation results
  useEffect(() => {
    if (promoValidationResult) {
      if (promoValidationResult.isValid) {
        trackEvent('promo_code_valid', 'promo', promoValidationResult.code);
      } else {
        trackEvent('promo_code_invalid', 'promo', promoValidationResult.code);
      }
    }
  }, [promoValidationResult]);

  return {
    promoCode,
    isValidatingPromo,
    promoValidationResult,
    discountType: promoValidationResult?.discountType,
    discountValue: promoValidationResult?.discountValue,
  };
}

export default useAutoApplyCode;