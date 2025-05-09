import { useState, useCallback } from 'react';
import { SpecialOfferDetails } from '../features/promo/promoTypes';

/**
 * A custom hook to detect and handle special offers from URL parameters
 * This hook extracts special offer parameters from the URL and provides
 * methods to apply special offers to treatments
 */
export const useSpecialOfferDetection = () => {
  const [specialOffer, setSpecialOffer] = useState<SpecialOfferDetails | null>(null);

  // Initialize from URL parameters - call this from a component inside Router context
  const initFromSearchParams = useCallback((params: URLSearchParams) => {
    const offerId = params.get('offerId');
    const offerTitle = params.get('offerTitle');
    const discountValue = params.get('discountValue');
    const discountType = params.get('discountType') as 'percentage' | 'fixed_amount';
    const clinicId = params.get('clinicId');
    const applicableTreatment = params.get('applicableTreatment');

    // If we have the necessary parameters, set the special offer
    if (offerId && offerTitle && discountValue && discountType) {
      setSpecialOffer({
        id: offerId,
        title: offerTitle,
        discountValue: parseFloat(discountValue),
        discountType: discountType,
        clinicId: clinicId || undefined,
        applicableTreatment: applicableTreatment || undefined
      });
    }
  }, []);

  // Clear the special offer
  const clearSpecialOffer = useCallback(() => {
    setSpecialOffer(null);
  }, []);

  // Check if a treatment is eligible for a special offer discount
  const isEligibleForDiscount = useCallback((treatmentType: string) => {
    if (!specialOffer) return false;
    
    // If no specific treatment is specified, all are eligible
    if (!specialOffer.applicableTreatment) return true;
    
    // Otherwise, check if this treatment matches the applicable treatment
    return specialOffer.applicableTreatment.toLowerCase() === treatmentType.toLowerCase();
  }, [specialOffer]);

  // Apply a special offer discount to a price
  const applyDiscount = useCallback((price: number) => {
    if (!specialOffer) return price;
    
    if (specialOffer.discountType === 'percentage') {
      return price * (1 - specialOffer.discountValue / 100);
    } else {
      return Math.max(0, price - specialOffer.discountValue);
    }
  }, [specialOffer]);

  // Apply special offer to a list of treatments
  const applySpecialOfferToTreatments = useCallback((treatments: any[]) => {
    if (!specialOffer) return treatments;
    
    return treatments.map(treatment => {
      if (isEligibleForDiscount(treatment.treatmentType)) {
        const discountedPriceGBP = applyDiscount(treatment.priceGBP);
        const discountedPriceUSD = applyDiscount(treatment.priceUSD);
        
        return {
          ...treatment,
          originalPriceGBP: treatment.priceGBP,
          originalPriceUSD: treatment.priceUSD,
          priceGBP: discountedPriceGBP,
          priceUSD: discountedPriceUSD,
          subtotalGBP: discountedPriceGBP * treatment.quantity,
          subtotalUSD: discountedPriceUSD * treatment.quantity,
          hasDiscount: true,
          discountPercent: specialOffer.discountType === 'percentage' ? specialOffer.discountValue : null,
          discountAmount: specialOffer.discountType === 'fixed_amount' ? specialOffer.discountValue : null,
          specialOffer: {
            ...specialOffer
          }
        };
      }
      return treatment;
    });
  }, [specialOffer, isEligibleForDiscount, applyDiscount]);

  // Get a list of treatments with discount notations
  const getDiscountedLines = useCallback((treatments: any[]) => {
    if (!specialOffer) return [];
    
    return treatments
      .filter(t => isEligibleForDiscount(t.treatmentType))
      .map(t => ({
        ...t,
        isDiscounted: true
      }));
  }, [specialOffer, isEligibleForDiscount]);

  return {
    specialOffer,
    setSpecialOffer,
    clearSpecialOffer,
    initFromSearchParams,
    applySpecialOfferToTreatments,
    getDiscountedLines,
    hasActiveOffer: !!specialOffer,
    isEligibleForDiscount,
    applyDiscount
  };
};

export default useSpecialOfferDetection;