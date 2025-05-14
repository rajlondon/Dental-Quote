import { useState, useEffect } from 'react';
import { useQuoteBuilder } from './use-quote-builder';
import { useSpecialOffers } from './use-special-offers';
import { trackEvent } from '@/lib/analytics';

// Define the Treatment interface for quote treatments
interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'treatment';
}

// Define the SpecialOffer interface conforming to API structure
interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  applicable_treatments: string[];
  clinic_id?: string | number;
  [key: string]: any;
}

// Map API special offer structure to our local structure
const mapApiOfferToLocalOffer = (apiOffer: any): SpecialOffer => {
  return {
    id: apiOffer.id,
    title: apiOffer.title,
    description: apiOffer.description || '',
    discount_type: apiOffer.discountType === 'percentage' ? 'percentage' : 'fixed_amount',
    discount_value: Number(apiOffer.discountValue || 0),
    applicable_treatments: Array.isArray(apiOffer.applicableTreatments) 
      ? apiOffer.applicableTreatments 
      : [],
    clinic_id: apiOffer.clinicId,
    promo_code: apiOffer.promoCode
  };
};

/**
 * Custom hook for integrating special offers into the quote builder
 * 
 * This hook provides functionality to find applicable special offers for the
 * current quote treatments and apply them to calculate discounts.
 */
export function useSpecialOffersInQuote() {
  const { quote, setQuote } = useQuoteBuilder();
  const { offers, packages } = useSpecialOffers();
  const [applicableOffers, setApplicableOffers] = useState<SpecialOffer[]>([]);
  
  // Convert API offers to our local structure
  const mappedOffers = offers.map(mapApiOfferToLocalOffer);
  
  // Update applicable offers when treatments change
  useEffect(() => {
    if (quote.treatments && quote.treatments.length > 0) {
      const treatmentIds = quote.treatments.map((t: Treatment) => t.id);
      
      // Filter offers that apply to any of the treatments in the quote
      const applicable = mappedOffers.filter(offer => {
        if (!offer.applicable_treatments || !Array.isArray(offer.applicable_treatments)) {
          return false;
        }
        
        // Check if any of the quote treatments are in the offer's applicable treatments
        return offer.applicable_treatments.some(treatmentId => 
          treatmentIds.includes(treatmentId)
        );
      });
      
      setApplicableOffers(applicable);
    } else {
      setApplicableOffers([]);
    }
  }, [quote.treatments, mappedOffers]);
  
  // Helper function to calculate discount amount
  const calculateDiscountAmount = (currentQuote: any, offer: SpecialOffer): number => {
    if (offer.discount_type === 'percentage') {
      return Math.round((currentQuote.subtotal * offer.discount_value) / 100);
    } else if (offer.discount_type === 'fixed_amount') {
      return Math.min(offer.discount_value, currentQuote.subtotal);
    }
    return 0;
  };
  
  // Apply an offer to the quote
  const applyOffer = (offerId: string): boolean => {
    const offer = mappedOffers.find((o: SpecialOffer) => o.id === offerId);
    if (!offer) return false;
    
    // Calculate new total with discount
    const discountAmount = calculateDiscountAmount(quote, offer);
    
    // Track the special offer application
    trackEvent('special_offer_applied', 'quote', offer.title);
    
    // Update the quote with the special offer discount
    setQuote({
      ...quote,
      appliedOfferId: offerId,
      offerDiscount: discountAmount,
      discount: (quote.promoDiscount || 0) + discountAmount,
      total: quote.subtotal - ((quote.promoDiscount || 0) + discountAmount)
    });
    
    return true;
  };
  
  // Remove any applied offer from the quote
  const removeOffer = (): boolean => {
    if (!quote.appliedOfferId) return false;
    
    trackEvent('special_offer_removed', 'quote');
    
    setQuote({
      ...quote,
      appliedOfferId: undefined,
      offerDiscount: 0,
      discount: (quote.promoDiscount || 0),
      total: quote.subtotal - (quote.promoDiscount || 0)
    });
    
    return true;
  };
  
  return {
    applicableOffers,
    applyOffer,
    removeOffer,
    hasAppliedOffer: !!quote.appliedOfferId,
    currentOfferId: quote.appliedOfferId
  };
}