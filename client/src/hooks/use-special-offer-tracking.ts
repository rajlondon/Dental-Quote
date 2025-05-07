import { useState, useEffect } from 'react';
import { useQuoteFlow } from '@/contexts/QuoteFlowContext';
import { TreatmentItem } from '@/services/specialOfferService';

export interface SpecialOfferDetails {
  id: string;
  title: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  clinicId: string;
  applicableTreatment?: string;
}

/**
 * Custom hook to track special offers throughout the quote flow
 * This centralizes the logic for detecting, persisting, and applying special offers
 */
export function useSpecialOfferTracking() {
  const { 
    source, setSource,
    offerId, setOfferId,
    clinicId, setClinicId,
    isSpecialOfferFlow
  } = useQuoteFlow();
  
  const [specialOffer, setSpecialOffer] = useState<SpecialOfferDetails | null>(null);
  
  // Initialize from session storage on mount
  useEffect(() => {
    // Check URL parameters first
    const searchParams = new URLSearchParams(window.location.search);
    const offerIdFromUrl = searchParams.get('offerId') || searchParams.get('specialOffer');
    const clinicIdFromUrl = searchParams.get('clinicId');
    const sourceFromUrl = searchParams.get('source');
    
    // If URL has offer parameters, set them in the QuoteFlow context
    if (offerIdFromUrl) {
      console.log("Found special offer ID in URL params:", offerIdFromUrl);
      setOfferId(offerIdFromUrl);
      
      if (clinicIdFromUrl) {
        setClinicId(clinicIdFromUrl);
      }
      
      if (sourceFromUrl === 'special_offer') {
        setSource('special_offer');
      } else if (!source) {
        // If no source explicitly set but we have an offerId, assume it's a special offer
        setSource('special_offer');
      }
      
      // Create special offer details from URL parameters
      const offerDetails: SpecialOfferDetails = {
        id: offerIdFromUrl,
        title: searchParams.get('offerTitle') || 'Special Offer',
        discountType: (searchParams.get('offerDiscountType') as 'percentage' | 'fixed_amount') || 'percentage',
        discountValue: searchParams.get('offerDiscount') ? parseInt(searchParams.get('offerDiscount') || '20') : 20,
        clinicId: clinicIdFromUrl || '1',
        applicableTreatment: searchParams.get('treatment') || 'Dental Implants'
      };
      
      setSpecialOffer(offerDetails);
      
      // Also store in session storage for persistence across page refreshes
      sessionStorage.setItem('activeSpecialOffer', JSON.stringify(offerDetails));
      
    } else if (isSpecialOfferFlow && offerId) {
      // If not in URL but in QuoteFlow context, use that
      console.log("Using special offer from QuoteFlow context:", offerId);
      
      // Check session storage for details
      const storedOffer = sessionStorage.getItem('activeSpecialOffer');
      if (storedOffer) {
        try {
          const offerData = JSON.parse(storedOffer);
          setSpecialOffer(offerData);
        } catch (error) {
          console.error("Error parsing stored offer data:", error);
        }
      }
    } else {
      // Check session storage as a fallback
      const storedOffer = sessionStorage.getItem('activeSpecialOffer');
      if (storedOffer) {
        try {
          const offerData = JSON.parse(storedOffer);
          console.log("Found stored special offer:", offerData);
          
          // Update the QuoteFlow context
          setOfferId(offerData.id);
          setClinicId(offerData.clinicId);
          setSource('special_offer');
          
          setSpecialOffer(offerData);
        } catch (error) {
          console.error("Error parsing stored offer data:", error);
        }
      }
    }
  }, [setOfferId, setClinicId, setSource, source, offerId, isSpecialOfferFlow]);
  
  /**
   * Apply special offer to treatments
   */
  const applySpecialOfferToTreatments = (treatments: TreatmentItem[]): TreatmentItem[] => {
    if (!specialOffer) return treatments;
    
    console.log("Applying special offer to treatments:", specialOffer);
    
    return treatments.map(treatment => {
      // Check if this treatment matches the applicable treatment
      // (Note: we could enhance this with our string normalization logic from the backend)
      const isMatch = 
        specialOffer.applicableTreatment &&
        (treatment.name.toLowerCase().includes(specialOffer.applicableTreatment.toLowerCase()) ||
         (specialOffer.applicableTreatment.toLowerCase().includes('consultation') && 
          treatment.name.toLowerCase().includes('consultation')));
      
      if (isMatch) {
        // Calculate discounted price
        let discountedPrice = treatment.priceGBP;
        
        if (specialOffer.discountType === 'percentage') {
          discountedPrice = Math.round(treatment.priceGBP * (1 - (specialOffer.discountValue / 100)));
        } else if (specialOffer.discountType === 'fixed_amount') {
          discountedPrice = Math.max(0, treatment.priceGBP - specialOffer.discountValue);
        }
        
        return {
          ...treatment,
          originalPriceGBP: treatment.priceGBP,
          priceGBP: discountedPrice,
          specialOfferApplied: true,
          specialOfferId: specialOffer.id,
          specialOfferTitle: specialOffer.title,
          discountAmount: treatment.priceGBP - discountedPrice
        };
      }
      
      return treatment;
    });
  };
  
  /**
   * Set a special offer and update all related state
   */
  const setActiveSpecialOffer = (offerDetails: SpecialOfferDetails) => {
    // Update internal state
    setSpecialOffer(offerDetails);
    
    // Update QuoteFlow context
    setOfferId(offerDetails.id);
    setClinicId(offerDetails.clinicId);
    setSource('special_offer');
    
    // Store in session storage for persistence
    sessionStorage.setItem('activeSpecialOffer', JSON.stringify(offerDetails));
    
    console.log("Set active special offer:", offerDetails);
  };
  
  /**
   * Clear the special offer from all storage
   */
  const clearSpecialOffer = () => {
    setSpecialOffer(null);
    sessionStorage.removeItem('activeSpecialOffer');
    sessionStorage.removeItem('pendingSpecialOffer');
    sessionStorage.removeItem('processingSpecialOffer');
    
    // Don't clear the QuoteFlow context here, as that should be done
    // through the resetFlow method when actually resetting the flow
  };
  
  return {
    specialOffer,
    setSpecialOffer: setActiveSpecialOffer,
    clearSpecialOffer,
    applySpecialOfferToTreatments,
    hasActiveOffer: !!specialOffer,
    isSpecialOfferFlow
  };
}