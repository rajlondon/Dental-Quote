import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook to extract promo code from URL parameters and auto-apply it
 * @param applyCallback Function to call when a promo code is found in the URL
 */
export const useAutoApplyCode = (applyCallback: (code: string) => void) => {
  const [location] = useLocation();
  
  useEffect(() => {
    // Function to extract promo code from query parameters
    const getPromoCodeFromUrl = () => {
      if (typeof window === 'undefined') return null;
      
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for 'promo' parameter first (used in special offers)
      const promoParam = urlParams.get('promo');
      if (promoParam) return promoParam;
      
      // Alternative parameter names
      const codeParam = urlParams.get('code');
      if (codeParam) return codeParam;
      
      const couponParam = urlParams.get('coupon');
      if (couponParam) return couponParam;
      
      return null;
    };
    
    // If we have a promo code in the URL, apply it
    const promoCode = getPromoCodeFromUrl();
    if (promoCode) {
      console.log('Auto-applying promo code from URL:', promoCode);
      applyCallback(promoCode);
      
      // Optionally, clear the promo parameter from the URL to prevent re-application
      // on page refresh, but keep the rest of the query parameters
      /* 
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete('promo');
      urlParams.delete('code');
      urlParams.delete('coupon');
      
      const newUrl = window.location.pathname + 
        (urlParams.toString() ? `?${urlParams.toString()}` : '') +
        window.location.hash;
      
      window.history.replaceState({}, '', newUrl);
      */
    }
  }, [location, applyCallback]);
};