import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SpecialOffer } from '@shared/offer-types';
import { apiRequest } from '@/lib/queryClient';

interface UseSpecialOffersResult {
  data: SpecialOffer[] | undefined;
  isLoading: boolean;
  error: Error | null;
  availableOffers: SpecialOffer[];
  selectedOffer: SpecialOffer | null;
  selectOffer: (offerId: string | null) => void;
  discountAmount: number;
  isOfferApplicable: (offerId: string, treatmentIds: string[]) => boolean;
  applyOfferToTreatments: (treatments: any[], offerId: string | null) => any[];
  getApplicableTreatments: (offerId: string, treatments: any[]) => string[];
  calculateDiscountAmount: (selectedOffer: SpecialOffer | null, treatments: any[]) => number;
}

/**
 * Hook for managing special offers in the quote builder
 */
export function useSpecialOffers(initialOfferId?: string): UseSpecialOffersResult {
  const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Fetch all available special offers
  const { data, isLoading, error } = useQuery<SpecialOffer[], Error>({
    queryKey: ['/api/special-offers'],
    refetchOnWindowFocus: false,
  });

  // Derived state for available offers
  const availableOffers = data || [];

  // Effect to select initial offer if provided
  useEffect(() => {
    if (initialOfferId && data && !isLoading) {
      const offer = data.find(offer => offer.id === initialOfferId);
      if (offer) {
        setSelectedOffer(offer);
      }
    }
  }, [initialOfferId, data, isLoading]);

  // Function to select an offer
  const selectOffer = (offerId: string | null) => {
    if (!offerId) {
      setSelectedOffer(null);
      setDiscountAmount(0);
      return;
    }

    const offer = availableOffers.find(offer => offer.id === offerId);
    if (offer) {
      setSelectedOffer(offer);
    } else {
      console.warn(`Offer with ID ${offerId} not found`);
    }
  };

  // Check if an offer is applicable to a set of treatments
  const isOfferApplicable = (offerId: string, treatmentIds: string[]): boolean => {
    const offer = availableOffers.find(offer => offer.id === offerId);
    if (!offer) return false;

    // If the offer has no applicable treatments specified, it applies to all
    if (!offer.applicableTreatments || offer.applicableTreatments.length === 0) {
      return true;
    }

    // Check if any of the treatments are applicable
    return treatmentIds.some(id => 
      offer.applicableTreatments?.includes(id)
    );
  };

  // Get applicable treatments for an offer
  const getApplicableTreatments = (offerId: string, treatments: any[]): string[] => {
    const offer = availableOffers.find(offer => offer.id === offerId);
    if (!offer || !offer.applicableTreatments) return [];

    return treatments
      .filter(treatment => offer.applicableTreatments?.includes(treatment.id))
      .map(treatment => treatment.id);
  };

  // Calculate the discount amount for a selected offer
  const calculateDiscountAmount = (offer: SpecialOffer | null, treatments: any[]): number => {
    if (!offer) return 0;

    // Get total price of applicable treatments
    const applicableTreatmentIds = getApplicableTreatments(offer.id, treatments);
    const applicableTreatments = treatments.filter(t => 
      applicableTreatmentIds.includes(t.id)
    );

    const totalEligibleAmount = applicableTreatments.reduce(
      (sum, treatment) => sum + (treatment.price || 0) * (treatment.quantity || 1), 
      0
    );

    // Apply minimum treatment count check if specified
    if (offer.minTreatmentCount && applicableTreatments.length < offer.minTreatmentCount) {
      return 0;
    }

    // Calculate discount
    let discount = 0;
    if (offer.discountType === 'percentage') {
      discount = totalEligibleAmount * (offer.discountValue / 100);
    } else {
      discount = offer.discountValue;
    }

    return discount;
  };

  // Apply offer discounts to treatments
  const applyOfferToTreatments = (treatments: any[], offerId: string | null): any[] => {
    if (!offerId) return treatments;

    const offer = availableOffers.find(offer => offer.id === offerId);
    if (!offer) return treatments;

    const applicableTreatmentIds = getApplicableTreatments(offerId, treatments);
    
    return treatments.map(treatment => {
      if (applicableTreatmentIds.includes(treatment.id)) {
        // Apply discount to this treatment
        let discountedPrice = treatment.price;
        
        if (offer.discountType === 'percentage') {
          discountedPrice = treatment.price * (1 - (offer.discountValue / 100));
        } else if (offer.discountType === 'fixed') {
          // For fixed amount, distribute discount proportionally
          const totalApplicablePrice = treatments
            .filter(t => applicableTreatmentIds.includes(t.id))
            .reduce((sum, t) => sum + (t.price || 0), 0);
          
          const proportionalDiscount = 
            (treatment.price / totalApplicablePrice) * offer.discountValue;
          
          discountedPrice = Math.max(0, treatment.price - proportionalDiscount);
        }
        
        return {
          ...treatment,
          originalPrice: treatment.price,
          price: discountedPrice,
          discounted: true,
          appliedOfferId: offer.id,
          discountAmount: treatment.price - discountedPrice
        };
      }
      return treatment;
    });
  };

  // Update the discount amount when the selected offer changes
  useEffect(() => {
    // This would be called with actual treatments in practice
    // Here we're just setting a placeholder
    if (selectedOffer) {
      setDiscountAmount(selectedOffer.discountValue || 0);
    } else {
      setDiscountAmount(0);
    }
  }, [selectedOffer]);

  return {
    data,
    isLoading,
    error,
    availableOffers,
    selectedOffer,
    selectOffer,
    discountAmount,
    isOfferApplicable,
    applyOfferToTreatments,
    getApplicableTreatments,
    calculateDiscountAmount
  };
}