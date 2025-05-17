import { useState, useEffect } from 'react';

/**
 * Hook to automatically detect and extract promo code from URL parameters
 * @param callback Optional callback function to execute when a promo code is detected
 * @returns The detected promo code or null if none found
 */
export function useAutoApplyCode(callback?: (code: string) => void): string | null {
  const [promoCode, setPromoCode] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if running in browser environment
    if (typeof window === 'undefined') return;
    
    // Parse URL for promo code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('promo') || urlParams.get('code') || urlParams.get('promocode');
    
    if (code) {
      // Set the promo code state
      setPromoCode(code);
      
      // Execute callback if provided
      if (callback) {
        callback(code);
      }
      
      // Optionally, log the detected code (for debugging)
      console.log(`Promo code detected from URL: ${code}`);
    }
  }, [callback]);
  
  return promoCode;
}