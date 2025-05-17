import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

/**
 * A hook that automatically extracts and applies a promo code from the URL
 * 
 * This hook looks for 'code' or 'promo' query parameters in the URL
 * and returns the extracted promo code if found.
 * 
 * @param onPromoCodeFound - Callback function when a promo code is found in the URL
 * @returns - The extracted promo code, if found
 */
export const useAutoApplyCode = (
  onPromoCodeFound?: (code: string) => void
): string | null => {
  const [location] = useLocation();
  const { toast } = useToast();

  // Extract promo code from URL
  useEffect(() => {
    try {
      // Create URL object from current location to easily parse query parameters
      // We need to add a base URL since location is just a path
      const url = new URL(location, window.location.origin);
      
      // Check for 'code' or 'promo' parameters
      const codeParam = url.searchParams.get('code');
      const promoParam = url.searchParams.get('promo');
      
      // Use the first available parameter
      const promoCode = codeParam || promoParam;
      
      if (promoCode) {
        // Notify the parent component about the code
        if (onPromoCodeFound) {
          onPromoCodeFound(promoCode);
          
          toast({
            title: 'Promo Code Found',
            description: `Promo code "${promoCode}" from URL has been applied.`,
          });
        }
        
        return promoCode;
      }
    } catch (error) {
      console.error('Error parsing URL for promo code:', error);
    }
    
    return null;
  }, [location, onPromoCodeFound, toast]);

  // Parse URL for promo code and return it
  const getPromoCodeFromUrl = (): string | null => {
    try {
      const url = new URL(location, window.location.origin);
      return url.searchParams.get('code') || url.searchParams.get('promo');
    } catch (error) {
      return null;
    }
  };

  return getPromoCodeFromUrl();
};

export default useAutoApplyCode;