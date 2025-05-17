import { useEffect, useState } from 'react';

/**
 * Hook to automatically detect and apply promo codes from URL parameters
 * 
 * @param callback Function to call when a promo code is found in the URL
 * @returns The detected promo code (if any)
 */
export function useAutoApplyCode(callback?: (code: string) => void): string | null {
  const [promoCode, setPromoCode] = useState<string | null>(null);
  
  useEffect(() => {
    // Extract promo code from URL parameters
    const extractPromoCode = () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for different possible parameter names
      const code = urlParams.get('promo') || 
                  urlParams.get('code') || 
                  urlParams.get('coupon') ||
                  urlParams.get('discount');
      
      if (code) {
        setPromoCode(code);
        
        // Call the callback if provided
        if (callback) {
          callback(code);
        }
      }
    };
    
    // Extract promo code when component mounts
    extractPromoCode();
    
    // Also listen for popstate events (for browser back/forward buttons)
    const handlePopState = () => {
      extractPromoCode();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Clean up
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [callback]);
  
  return promoCode;
}