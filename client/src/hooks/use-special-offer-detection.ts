import { useState, useEffect } from 'react';

// Custom hook to parse search params from the URL
const useSearchParams = () => {
  const getParams = () => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  };
  
  const [searchParams] = useState(getParams());
  
  return [searchParams];
};

interface SpecialOfferParams {
  id: string;
  title: string;
  clinicId: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed_amount';
  applicableTreatment: string;
}

interface UseSpecialOfferDetectionProps {
  source?: string;
  setSource?: (source: string) => void;
  offerId?: string;
  setOfferId?: (id: string) => void;
  clinicId?: string;
  setClinicId?: (id: string) => void;
  isSpecialOfferFlow?: boolean;
}

export function useSpecialOfferDetection({
  source,
  setSource,
  offerId,
  setOfferId,
  clinicId,
  setClinicId,
  isSpecialOfferFlow
}: UseSpecialOfferDetectionProps = {}) {
  const [searchParams] = useSearchParams();
  const [specialOffer, setSpecialOffer] = useState<SpecialOfferParams | null>(null);

  // Run this effect once on component mount
  useEffect(() => {
    console.log("Initializing special offer detection with URL params:", window.location.search);
    
    // First check URL parameters - look for both offerId and specialOffer parameters
    const offerIdFromUrl = searchParams.get('offerId') || searchParams.get('specialOffer');
    console.log("Special offer ID from URL:", offerIdFromUrl, 
      "offerId param:", searchParams.get('offerId'),
      "specialOffer param:", searchParams.get('specialOffer'));
    
    // Log all URL parameters for debugging
    const urlParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      urlParams[key] = value;
    });
    console.log("All URL parameters for debugging:", urlParams);
    
    // NEW: First check QuoteFlowContext - if we have offerId there, use it
    const quoteFlowOfferId = offerId || searchParams.get('offerId');
    console.log("Quote flow offerId:", quoteFlowOfferId, "isSpecialOfferFlow:", isSpecialOfferFlow);
    
    // If source=special_offer is already set in QuoteFlowContext, prioritize that
    if (source === 'special_offer' && quoteFlowOfferId) {
      console.log("Using special offer from QuoteFlowContext:", quoteFlowOfferId);
      
      // Check for corresponding sessionStorage data
      const storedActiveOffer = sessionStorage.getItem('activeSpecialOffer');
      if (storedActiveOffer) {
        try {
          const offerData = JSON.parse(storedActiveOffer);
          console.log("Found matching activeSpecialOffer in sessionStorage:", offerData);
          
          if (offerData.id === quoteFlowOfferId) {
            setSpecialOffer({
              id: offerData.id,
              title: offerData.title,
              clinicId: offerData.clinicId || clinicId || '1',
              discountValue: offerData.discountValue || offerData.discount_value || 0,
              discountType: offerData.discountType || offerData.discount_type || 'percentage',
              applicableTreatment: offerData.applicableTreatment || offerData.applicable_treatments?.[0] || 'Dental Implants'
            });
            return;
          }
        } catch (error) {
          console.error("Error parsing activeSpecialOffer from sessionStorage:", error);
        }
      }
    }
    
    // If there's a special offer ID in the URL parameters, create a special offer object
    if (offerIdFromUrl) {
      console.log("Special offer parameters found in URL:");
      console.log("- Title:", searchParams.get('offerTitle'));
      console.log("- Clinic ID:", searchParams.get('clinicId') || searchParams.get('offerClinic'));
      console.log("- Discount Value:", searchParams.get('offerDiscount'));
      console.log("- Discount Type:", searchParams.get('offerDiscountType'));
      console.log("- Treatment:", searchParams.get('treatment'));
      
      // Ensure consistent parameter parsing with proper error handling
      let discountValue = 0;
      try {
        const discountStr = searchParams.get('offerDiscount');
        if (discountStr) {
          discountValue = parseInt(discountStr);
          if (isNaN(discountValue)) {
            console.warn(`Invalid discount value "${discountStr}", defaulting to 0`);
            discountValue = 0;
          }
        }
      } catch (e) {
        console.error("Error parsing discount value:", e);
      }
      
      // Ensure we have the correct discount type (percentage or fixed_amount)
      const rawDiscountType = searchParams.get('offerDiscountType') || 'percentage';
      const discountType = (rawDiscountType === 'fixed' || rawDiscountType === 'fixed_amount') 
        ? 'fixed_amount' 
        : 'percentage';
      
      const offerData = {
        id: offerIdFromUrl,
        title: searchParams.get('offerTitle') || 'Special Offer',
        clinicId: searchParams.get('clinicId') || searchParams.get('offerClinic') || '',
        discountValue,
        discountType: discountType as 'percentage' | 'fixed_amount',
        applicableTreatment: searchParams.get('treatment') || 'Dental Implants'
      };
      
      console.log("Created special offer data from URL params:", offerData);
      
      // Update both storage locations for maximum reliability
      sessionStorage.setItem('activeSpecialOffer', JSON.stringify(offerData));
      sessionStorage.setItem('pendingSpecialOffer', JSON.stringify(offerData));
      
      // Also set the QuoteFlowContext values
      if (setSource && source !== 'special_offer') {
        setSource('special_offer');
      }
      if (setOfferId && !offerId) {
        setOfferId(offerIdFromUrl);
      }
      if (setClinicId && !clinicId && offerData.clinicId) {
        setClinicId(offerData.clinicId);
      }
      
      setSpecialOffer(offerData);
      return;
    }
    
    // If not in URL, check sessionStorage
    const storedOffer = sessionStorage.getItem('activeSpecialOffer');
    if (storedOffer) {
      try {
        const offerData = JSON.parse(storedOffer);
        console.log("Retrieved special offer from sessionStorage:", offerData);
        
        // Ensure QuoteFlowContext is updated with these values
        if (setSource && source !== 'special_offer') {
          setSource('special_offer');
        }
        if (setOfferId && !offerId) {
          setOfferId(offerData.id);
        }
        if (setClinicId && !clinicId && offerData.clinicId) {
          setClinicId(offerData.clinicId);
        }
        
        setSpecialOffer({
          id: offerData.id,
          title: offerData.title,
          clinicId: offerData.clinicId || clinicId || '1',
          discountValue: offerData.discountValue || offerData.discount_value || 0,
          discountType: offerData.discountType || offerData.discount_type || 'percentage',
          applicableTreatment: offerData.applicableTreatment || offerData.applicable_treatments?.[0] || 'Dental Implants'
        });
        return;
      } catch (error) {
        console.error("Error parsing special offer from sessionStorage:", error);
      }
    }
    
    // Also check for pendingSpecialOffer which may happen when redirected after login
    const pendingOfferData = sessionStorage.getItem('pendingSpecialOffer');
    if (pendingOfferData) {
      try {
        const offerData = JSON.parse(pendingOfferData);
        console.log("Found pendingSpecialOffer in sessionStorage:", offerData);
        
        // Ensure QuoteFlowContext is updated with these values
        if (setSource && source !== 'special_offer') {
          setSource('special_offer');
        }
        if (setOfferId && !offerId) {
          setOfferId(offerData.id);
        }
        if (setClinicId && !clinicId && offerData.clinicId) {
          setClinicId(offerData.clinicId);
        }
        
        // Convert to the right format
        const formattedOffer = {
          id: offerData.id,
          title: offerData.title,
          clinicId: offerData.clinicId || offerData.clinic_id || '',
          discountValue: offerData.discountValue || offerData.discount_value || 0,
          discountType: (offerData.discountType || offerData.discount_type || 'percentage') as 'percentage' | 'fixed_amount',
          applicableTreatment: offerData.applicableTreatment || offerData.applicable_treatments?.[0] || 'Dental Implants'
        };
        
        // Now that we've processed it, clear it
        sessionStorage.removeItem('pendingSpecialOffer');
        
        // But save it to activeSpecialOffer for future persistence
        sessionStorage.setItem('activeSpecialOffer', JSON.stringify(formattedOffer));
        
        console.log("Converted pendingSpecialOffer to activeSpecialOffer:", formattedOffer);
        setSpecialOffer(formattedOffer);
        return;
      } catch (error) {
        console.error("Error parsing pendingSpecialOffer from sessionStorage:", error);
      }
    }
    
  }, [
    searchParams, 
    source, 
    offerId, 
    clinicId, 
    isSpecialOfferFlow, 
    setSource, 
    setOfferId, 
    setClinicId
  ]);

  return { specialOffer, setSpecialOffer };
}