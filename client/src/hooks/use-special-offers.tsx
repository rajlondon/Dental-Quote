import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

// Define special offer type
export interface SpecialOffer {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  promoCode: string;
  imageUrl?: string;
  expiryDate?: string;
  featured?: boolean;
}

// Define special offers query result type
export interface UseSpecialOffersResult {
  offers: SpecialOffer[];
  isLoading: boolean;
  error: Error | null;
  selectedOffer: SpecialOffer | null;
  selectOffer: (offer: SpecialOffer | null) => void;
  offerDiscount: number;
}

export function useSpecialOffers(): UseSpecialOffersResult {
  const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null);
  
  // Query to fetch special offers from the API
  const { 
    data: offers = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/special-offers'],
    queryFn: async () => {
      try {
        // In a real implementation, this would fetch from the API
        // Using mock data for now
        return getMockSpecialOffers();
      } catch (error) {
        console.error('Error fetching special offers:', error);
        throw error;
      }
    },
  });
  
  // Function to select an offer
  const selectOffer = (offer: SpecialOffer | null) => {
    setSelectedOffer(offer);
  };
  
  // Calculate offer discount
  const calculateOfferDiscount = (subtotal: number = 1000) => {
    if (!selectedOffer) return 0;
    
    if (selectedOffer.discountType === 'percentage') {
      return subtotal * (selectedOffer.discountValue / 100);
    } else {
      // Fixed discount
      return selectedOffer.discountValue;
    }
  };
  
  return {
    offers,
    isLoading,
    error,
    selectedOffer,
    selectOffer,
    offerDiscount: calculateOfferDiscount()
  };
}

// Mock data function for development
function getMockSpecialOffers(): SpecialOffer[] {
  const today = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(today.getMonth() + 1);
  
  return [
    {
      id: 'off1',
      name: 'Summer Special',
      description: 'Limited time summer promotion with 15% off all dental treatments',
      discountType: 'percentage',
      discountValue: 15,
      promoCode: 'SUMMER15',
      imageUrl: 'https://placehold.co/600x400/e2f4ff/0a5282?text=Summer+Special',
      expiryDate: oneMonthLater.toISOString().split('T')[0],
      featured: true
    },
    {
      id: 'off2',
      name: 'New Patient Offer',
      description: 'Special 20% discount for first-time patients at our clinic',
      discountType: 'percentage',
      discountValue: 20,
      promoCode: 'NEWPATIENT',
      imageUrl: 'https://placehold.co/600x400/f5fff2/2a7d19?text=New+Patient',
      expiryDate: oneMonthLater.toISOString().split('T')[0]
    },
    {
      id: 'off3',
      name: 'Free Whitening with Treatment',
      description: 'Get a free teeth whitening session with any treatment over £500',
      discountType: 'fixed',
      discountValue: 250,
      promoCode: 'FREEWHITE',
      imageUrl: 'https://placehold.co/600x400/fff8f2/824b2a?text=Free+Whitening'
    },
    {
      id: 'off4',
      name: 'Implant & Crown Package',
      description: 'Get 30% off when combining dental implant and crown treatments',
      discountType: 'percentage',
      discountValue: 30,
      promoCode: 'IMPLANTCROWN30',
      imageUrl: 'https://placehold.co/600x400/f2f8ff/2a5c8d?text=Implant+Package'
    }
  ];
}