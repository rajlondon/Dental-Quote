import { useState, useEffect } from 'react';
import { useQuoteBuilder } from './use-quote-builder';
import { useSpecialOffers } from './use-special-offers';

// Import types
interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'treatment';
}

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  applicable_treatments: string[];
  [key: string]: any;
}

export function useSpecialOffersInQuote() {
  const { quote, setQuote } = useQuoteBuilder();
  const { offers, packages, getApplicableOffers } = useSpecialOffers();
  const [applicableOffers, setApplicableOffers] = useState<SpecialOffer[]>([]);
  
  // Update applicable offers when treatments change
  useEffect(() => {
    if (quote.treatments && quote.treatments.length > 0) {
      const treatmentIds = quote.treatments.map((t: Treatment) => t.id);
      const applicableOffers = getApplicableOffers(treatmentIds);
      setApplicableOffers(applicableOffers);
    } else {
      setApplicableOffers([]);
    }
  }, [quote.treatments, getApplicableOffers]);
  
  // Helper function to calculate discount amount
  const calculateDiscountAmount = (currentQuote: any, offer: SpecialOffer): number => {
    if (offer.discount_type === 'percentage') {
      return (currentQuote.subtotal * offer.discount_value) / 100;
    } else if (offer.discount_type === 'fixed_amount') {
      return Math.min(offer.discount_value, currentQuote.subtotal);
    }
    return 0;
  };
  
  // Apply an offer to the quote
  const applyOffer = (offerId: string): boolean => {
    const offer = offers.find((o: SpecialOffer) => o.id === offerId);
    if (!offer) return false;
    
    // Calculate new total with discount
    const discountAmount = calculateDiscountAmount(quote, offer);
    
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
  
  return {
    applicableOffers,
    applyOffer
  };
}