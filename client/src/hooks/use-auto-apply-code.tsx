import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

/**
 * Enhanced hook to extract parameters from URL and auto-apply them
 * @param applyPromoCallback Function to call when a promo code is found in the URL
 * @param applyClinicCallback Optional function to call when a clinic ID is found in the URL
 */
export const useAutoApplyCode = (
  applyPromoCallback: (code: string) => void,
  applyClinicCallback?: (clinicId: string) => void
) => {
  const [location] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Extract parameters from URL
    const searchParams = new URLSearchParams(window.location.search);
    const promoCode = searchParams.get('promo');
    const clinicId = searchParams.get('clinicId');
    const specialOffer = searchParams.get('specialOffer') === 'true';
    
    // Handle promo code if present
    if (promoCode) {
      console.log('Auto-applying promo code:', promoCode);
      applyPromoCallback(promoCode);
      
      toast({
        title: 'Promo code applied',
        description: `Automatically applied promo code: ${promoCode}`,
      });
    }
    
    // Handle clinic ID if present and callback provided
    if (clinicId && applyClinicCallback) {
      console.log('Quote initiated from clinic portal. Clinic ID:', clinicId);
      applyClinicCallback(clinicId);
      
      // Notify when creating as a clinic staff
      toast({
        title: 'Clinic Mode Active',
        description: `Creating quote as clinic staff (ID: ${clinicId})`,
      });
    }
    
    // Handle special offer flag
    if (specialOffer) {
      console.log('Special offers mode active');
    }
    
  }, [location, applyPromoCallback, applyClinicCallback, toast]);
  
  return null;
};