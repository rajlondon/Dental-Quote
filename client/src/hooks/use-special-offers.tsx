import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Define the special offer type
export interface SpecialOffer {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  promoCode: string;
  expiryDate?: string;
  cityCode?: string;
  clinicId?: string;
}

export interface UseSpecialOffersResult {
  offers: SpecialOffer[];
  isLoading: boolean;
  error: Error | null;
  offerDiscount: number;
  selectedOffer: SpecialOffer | null;
  selectOffer: (offer: SpecialOffer | null) => void;
  calculateOfferDiscount: (offer: SpecialOffer, subtotal: number) => number;
}

export function useSpecialOffers(): UseSpecialOffersResult {
  const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null);
  const [offerDiscount, setOfferDiscount] = useState<number>(0);
  
  // Fetch special offers from API
  const { data: offers = [], isLoading, error } = useQuery({
    queryKey: ['/api/v1/special-offers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/v1/special-offers');
      if (!response.ok) {
        throw new Error('Failed to fetch special offers');
      }
      return response.json();
    }
  });

  // Calculate discount amount for an offer based on subtotal
  const calculateOfferDiscount = (offer: SpecialOffer, subtotal: number): number => {
    if (!offer) {
      return 0;
    }

    if (offer.discountType === 'percentage') {
      return subtotal * (offer.discountValue / 100);
    } else {
      // For fixed discount
      return offer.discountValue;
    }
  };

  // Handle offer selection
  const selectOffer = (offer: SpecialOffer | null) => {
    setSelectedOffer(offer);
    
    // Reset discount if no offer is selected
    if (!offer) {
      setOfferDiscount(0);
      return;
    }
    
    // Calculate initial discount (will be updated when subtotal changes)
    // Using a placeholder subtotal of 1000 initially, will be replaced by actual subtotal
    const discount = calculateOfferDiscount(offer, 1000);
    setOfferDiscount(discount);
  };

  // Use effect to update discount when selected offer changes
  useEffect(() => {
    if (selectedOffer) {
      // Recalculate with actual subtotal
      // Note: In a real implementation, this would use the actual subtotal from quoteStore
      const discount = calculateOfferDiscount(selectedOffer, 1000);
      setOfferDiscount(discount);
    }
  }, [selectedOffer]);

  return {
    offers,
    isLoading,
    error,
    offerDiscount,
    selectedOffer,
    selectOffer,
    calculateOfferDiscount
  };
}