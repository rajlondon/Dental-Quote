import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook to extract promo code from URL parameters and auto-apply it
 * @param applyCallback Function to call when a promo code is found in the URL
 */
export const useAutoApplyCode = (applyCallback: (code: string) => void) => {
  const [location] = useLocation();
  
  useEffect(() => {
    // Extract promo code from URL query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const promoCode = searchParams.get('promo');
    
    if (promoCode) {
      console.log('Auto-applying promo code:', promoCode);
      applyCallback(promoCode);
      
      // Optionally remove the promo code from the URL to prevent reapplication
      // on page refresh, but only if desired behavior
      // const newUrl = window.location.pathname;
      // window.history.replaceState({}, document.title, newUrl);
    }
  }, [location, applyCallback]);
  
  return null;
};