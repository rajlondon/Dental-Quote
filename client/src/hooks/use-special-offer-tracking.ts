import { useState, useEffect } from 'react';
import { useQuoteFlow } from '@/contexts/QuoteFlowContext';
import { TreatmentItem as ServiceTreatmentItem } from '@/services/specialOfferService';
import { TreatmentItem as BuilderTreatmentItem } from '@/components/TreatmentPlanBuilder';

export interface SpecialOfferDetails {
  id: string;
  title: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  clinicId: string;
  applicableTreatment?: string;
  applicableTreatments?: string[];
  description?: string;
  expiryDate?: string;
  termsAndConditions?: string;
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
  const applySpecialOfferToTreatments = (treatments: BuilderTreatmentItem[]): BuilderTreatmentItem[] => {
    if (!specialOffer) return treatments;
    
    console.log("Applying special offer to treatments:", specialOffer);
    console.log("Original treatments:", treatments);
    
    return treatments.map(treatment => {
      // For safety, ensure treatment has all required properties
      const safetyTreatment = {
        ...treatment,
        priceGBP: treatment.priceGBP || 0,
        quantity: treatment.quantity || 1,
        subtotalGBP: treatment.subtotalGBP || treatment.priceGBP || 0,
        subtotalUSD: treatment.subtotalUSD || Math.round((treatment.priceGBP || 0) * 1.29)
      };
      
      // Check if this treatment matches the applicable treatment
      // Use a more flexible matching system with multiple conditions
      const treatmentName = (safetyTreatment.name || '').toLowerCase();
      const treatmentId = (safetyTreatment.id || '').toLowerCase();
      const applicableTreatment = (specialOffer.applicableTreatment || '').toLowerCase();
      
      // Check for a match in the applicableTreatments array if it exists
      const isInApplicableTreatmentsArray = specialOffer.applicableTreatments && 
        specialOffer.applicableTreatments.length > 0 && 
        specialOffer.applicableTreatments.some(t => {
          const treatmentPattern = t.toLowerCase();
          return treatmentId === treatmentPattern || 
                 treatmentName.includes(treatmentPattern);
        });
        
      // Enhanced matching logic with multiple conditions
      const isMatch = 
        // Case 0: Treatment ID is in the applicable treatments array
        isInApplicableTreatmentsArray ||
        
        // Case 1: Direct match by name with the legacy applicableTreatment field
        treatmentName.includes(applicableTreatment) ||
        
        // Case 2: Consultation special offers should apply to any consultation
        (applicableTreatment.includes('consultation') && treatmentName.includes('consultation')) ||
        
        // Case 3: Implant offers should apply to implant treatments
        (applicableTreatment.includes('implant') && treatmentName.includes('implant')) ||
        
        // Case 4: Special offers that don't specify a treatment should apply to all
        (!specialOffer.applicableTreatment && (!specialOffer.applicableTreatments || specialOffer.applicableTreatments.length === 0)) ||
        
        // Case 5: "Bundle" offers should apply to the primary treatment
        (applicableTreatment.includes('bundle') && 
         (treatmentName.includes('implant') || 
          treatmentName.includes('crown') || 
          treatmentName.includes('veneer')));
      
      if (isMatch) {
        console.log(`Applying special offer to treatment: ${safetyTreatment.name}`);
        
        // Calculate discounted price
        let discountedPrice = safetyTreatment.priceGBP;
        let originalPrice = safetyTreatment.priceGBP;
        
        if (specialOffer.discountType === 'percentage') {
          discountedPrice = Math.round(originalPrice * (1 - (specialOffer.discountValue / 100)));
        } else if (specialOffer.discountType === 'fixed_amount') {
          discountedPrice = Math.max(0, originalPrice - specialOffer.discountValue);
        }
        
        // Calculate new subtotals based on the discounted price
        const newPrice = discountedPrice;
        const newSubtotalGBP = newPrice * safetyTreatment.quantity;
        const newSubtotalUSD = Math.round(newSubtotalGBP * 1.29); // Estimate USD price
        const discountAmount = originalPrice - newPrice;
        
        console.log(`Price calculation: ${originalPrice} -> ${newPrice} (saved ${discountAmount})`);
        
        return {
          ...safetyTreatment,
          originalPriceGBP: originalPrice,
          priceGBP: newPrice,
          subtotalGBP: newSubtotalGBP,
          subtotalUSD: newSubtotalUSD,
          specialOfferApplied: true,
          specialOfferId: specialOffer.id,
          specialOfferTitle: specialOffer.title,
          discountType: specialOffer.discountType,
          discountValue: specialOffer.discountValue,
          discountAmount: discountAmount
        };
      }
      
      return safetyTreatment;
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