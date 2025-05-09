import { useState, useEffect, useCallback } from 'react';
import specialOffersService, { 
  SpecialOffer, 
  Package, 
  PromoToken 
} from '@/services/SpecialOffersService';
import { TreatmentItem } from '@/components/TreatmentPlanBuilder';

interface UseSpecialOffersOptions {
  initialOffer?: SpecialOffer;
  initialPackage?: Package;
  initialPromoToken?: PromoToken;
  autoParseUrl?: boolean;
}

/**
 * Custom hook for working with special offers, packages, and promo tokens
 */
export const useSpecialOffers = (options: UseSpecialOffersOptions = {}) => {
  const {
    initialOffer,
    initialPackage,
    initialPromoToken,
    autoParseUrl = true
  } = options;
  
  // State for the offers
  const [specialOffer, setSpecialOffer] = useState<SpecialOffer | undefined>(initialOffer);
  const [packageData, setPackageData] = useState<Package | undefined>(initialPackage);
  const [promoToken, setPromoToken] = useState<PromoToken | undefined>(initialPromoToken);
  
  // Derived state
  const [isSpecialOfferFlow, setIsSpecialOfferFlow] = useState<boolean>(!!initialOffer);
  const [isPackageFlow, setIsPackageFlow] = useState<boolean>(!!initialPackage);
  const [isPromoTokenFlow, setIsPromoTokenFlow] = useState<boolean>(!!initialPromoToken);
  
  // Parse URL parameters on mount
  useEffect(() => {
    if (autoParseUrl) {
      const offerFromUrl = specialOffersService.getSpecialOfferFromUrl();
      const packageFromUrl = specialOffersService.getPackageFromUrl();
      const promoTokenFromUrl = specialOffersService.getPromoTokenFromUrl();
      
      if (offerFromUrl) {
        setSpecialOffer(offerFromUrl);
        setIsSpecialOfferFlow(true);
      }
      
      if (packageFromUrl) {
        setPackageData(packageFromUrl);
        setIsPackageFlow(true);
      }
      
      if (promoTokenFromUrl) {
        setPromoToken(promoTokenFromUrl);
        setIsPromoTokenFlow(true);
      }
    }
  }, [autoParseUrl]);
  
  // Reset all offers
  const resetOffers = useCallback(() => {
    setSpecialOffer(undefined);
    setPackageData(undefined);
    setPromoToken(undefined);
    setIsSpecialOfferFlow(false);
    setIsPackageFlow(false);
    setIsPromoTokenFlow(false);
  }, []);
  
  // Process treatments based on active offers
  const processTreatments = useCallback((currentTreatments: TreatmentItem[]): TreatmentItem[] => {
    return specialOffersService.processTreatments(currentTreatments, {
      specialOffer,
      package: packageData,
      promoToken
    });
  }, [specialOffer, packageData, promoToken]);
  
  // Calculate total discount for a treatment plan
  const calculateTotalDiscount = useCallback((treatments: TreatmentItem[]): number => {
    let totalDiscount = 0;
    
    // Get base price from treatments
    const baseSubtotal = treatments
      .filter(t => !t.isBonus && !t.isSpecialOffer)
      .reduce((sum, item) => sum + item.subtotalGBP, 0);
    
    // Apply special offer discount
    if (isSpecialOfferFlow && specialOffer) {
      totalDiscount += specialOffersService.calculateDiscount(
        baseSubtotal,
        specialOffer.discountType,
        specialOffer.discountValue
      );
    }
    
    // Apply promo token discount if it's a discount type
    if (isPromoTokenFlow && promoToken && promoToken.type === 'special_offer') {
      totalDiscount += specialOffersService.calculateDiscount(
        baseSubtotal,
        promoToken.discountType,
        promoToken.discountValue
      );
    }
    
    return totalDiscount;
  }, [isSpecialOfferFlow, specialOffer, isPromoTokenFlow, promoToken]);
  
  return {
    // State
    specialOffer,
    packageData,
    promoToken,
    isSpecialOfferFlow,
    isPackageFlow,
    isPromoTokenFlow,
    
    // Setters
    setSpecialOffer,
    setPackageData,
    setPromoToken,
    setIsSpecialOfferFlow,
    setIsPackageFlow,
    setIsPromoTokenFlow,
    
    // Actions
    resetOffers,
    processTreatments,
    calculateTotalDiscount,
    
    // Helpers
    hasActiveOffer: isSpecialOfferFlow || isPackageFlow || isPromoTokenFlow
  };
};

export default useSpecialOffers;