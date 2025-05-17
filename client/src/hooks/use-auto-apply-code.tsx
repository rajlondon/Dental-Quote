import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook to automatically detect and apply promo codes from URL parameters
 * @param onCodeDetected Optional callback that runs when a code is detected
 * @returns The detected promo code or null if none is present
 */
export function useAutoApplyCode(onCodeDetected?: (code: string) => void) {
  const [location] = useLocation();
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Parse URL parameters to find promo code
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    
    if (codeParam && codeParam !== promoCode) {
      setPromoCode(codeParam);
      
      // Notify via callback if provided
      if (onCodeDetected) {
        onCodeDetected(codeParam);
      } else {
        // Default notification if no callback is provided
        toast({
          title: 'Promo Code Detected',
          description: `The promo code "${codeParam}" has been detected in the URL.`,
        });
      }
    }
  }, [location, promoCode, toast, onCodeDetected]);

  return promoCode;
}