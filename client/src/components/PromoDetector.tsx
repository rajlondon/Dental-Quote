import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSpecialOfferDetection } from '@/hooks/use-special-offer-detection';
import { usePackageDetection } from '@/hooks/use-package-detection';
import { usePromoStore } from '@/features/promo/usePromoStore';

/**
 * PromoDetector is a component that runs inside the router context
 * to detect URL parameters related to promotions, packages, and special offers.
 * This prevents hooks rule violations by encapsulating the use of router hooks.
 */
export const PromoDetector: React.FC = () => {
  // Router hooks (only safe to use inside a Router component)
  const [location] = useLocation();
  
  // Create searchParams from the current URL
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );
  
  // Our custom hooks
  const specialOfferHook = useSpecialOfferDetection();
  const packageHook = usePackageDetection();
  const { setPromoSlug } = usePromoStore();

  // Process URL parameters once on mount or when they change
  useEffect(() => {
    // Initialize special offers from URL params
    specialOfferHook.initFromSearchParams(searchParams);
    
    // Initialize package details from URL params
    packageHook.initFromSearchParams(searchParams);
    
    // Check for promo slug
    const promoSlug = searchParams.get('promo');
    if (promoSlug) {
      setPromoSlug(promoSlug);
    }
  }, [location, specialOfferHook, packageHook, setPromoSlug]);

  // This component doesn't render anything visible
  return null;
};

export default PromoDetector;