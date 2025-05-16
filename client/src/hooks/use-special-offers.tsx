import { useState, useEffect } from 'react';
import { SpecialOffer } from '../stores/quoteStore';

// Sample special offers data
const SAMPLE_OFFERS: SpecialOffer[] = [
  {
    id: 'offer-001',
    name: 'Free Consultation Package',
    description: 'Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.',
    discountType: 'percentage',
    discountValue: 100,
    applicableTreatments: ['dental_implant_standard', 'porcelain_veneers', 'full_mouth_reconstruction'],
    promoCode: 'FREECONSULT',
    terms: 'Applicable for new patients only. One consultation per patient.',
    bannerImage: '/cached-images/70717ea08ff903f399dd8cdf7bbe2d5a.jpg'
  },
  {
    id: 'offer-002',
    name: 'Premium Hotel Deal',
    description: 'Save up to 20% on premium hotels with your dental treatment booking. Enjoy luxury accommodations while you receive top-quality dental care.',
    discountType: 'percentage',
    discountValue: 20,
    applicableTreatments: ['dental_implant_standard', 'porcelain_veneers', 'dental_crowns'],
    promoCode: 'LUXHOTEL20',
    terms: 'Minimum treatment value of $1000 required. Subject to hotel availability.',
    bannerImage: '/cached-images/dbfdaf3bddf4b064773f3e7e2c6b4290.png'
  },
  {
    id: 'offer-003',
    name: 'Dental Implant + Crown Bundle',
    description: 'Get a special bundle price when combining dental implant with a crown. Save up to 30% compared to individual procedures.',
    discountType: 'percentage',
    discountValue: 30,
    applicableTreatments: ['dental_implant_standard', 'dental_crowns'],
    promoCode: 'IMPLANTCROWN30',
    terms: 'Valid for single tooth implant and crown combinations only.',
    bannerImage: '/cached-images/0f840f271c2825eaf4b1b8e89e2d105f.png'
  },
  {
    id: 'offer-004',
    name: 'Luxury Airport Transfer',
    description: 'Complimentary luxury airport transfer with premium vehicles when you book any major dental treatment package.',
    discountType: 'fixed_amount',
    discountValue: 80,
    applicableTreatments: ['full_mouth_reconstruction', 'hollywood_smile', 'all_on_4_implants'],
    promoCode: 'LUXTRAVEL',
    terms: 'Minimum treatment value of $2000 required. 48-hour advance booking required for transfers.',
    bannerImage: '/cached-images/ba010d660e29ec67e208a6b7d3910201.jpg'
  },
  {
    id: 'offer-005',
    name: 'Free Teeth Whitening',
    description: 'Receive a complimentary professional teeth whitening session with any veneer or crown treatment package.',
    discountType: 'fixed_amount',
    discountValue: 150,
    applicableTreatments: ['porcelain_veneers', 'dental_crowns', 'hollywood_smile'],
    promoCode: 'FREEWHITE',
    terms: 'Minimum of 4 veneers or crowns required. Not combinable with other offers.',
    bannerImage: '/cached-images/0f998c597de98e30c9da16e4f6587a96.png'
  }
];

// Calculate offer discount based on treatments
const calculateOfferDiscount = (
  offer: SpecialOffer | null, 
  treatments: any[]
): number => {
  if (!offer) return 0;
  
  // Filter treatments that are applicable to the offer
  const applicableTreatments = treatments.filter(
    treatment => treatment.category && offer.applicableTreatments.includes(treatment.category)
  );
  
  // Calculate the value of applicable treatments
  const applicableValue = applicableTreatments.reduce(
    (sum, treatment) => sum + (treatment.price * treatment.quantity), 
    0
  );
  
  // Calculate discount based on type
  if (offer.discountType === 'percentage') {
    return applicableValue * (offer.discountValue / 100);
  } else {
    // Fixed amount discount
    return Math.min(applicableValue, offer.discountValue);
  }
};

export function useSpecialOffers() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch offers on component mount
  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/special-offers');
        // const data = await response.json();
        
        // Using sample data for now
        setTimeout(() => {
          setOffers(SAMPLE_OFFERS);
          setIsLoading(false);
        }, 500); // Simulate API delay
      } catch (err) {
        setError('Failed to load special offers');
        setIsLoading(false);
      }
    };
    
    fetchOffers();
  }, []);

  // Select an offer and calculate its discount
  const selectOffer = (offer: SpecialOffer | null, treatments: any[] = []) => {
    setSelectedOffer(offer);
    
    if (offer) {
      // Calculate the discount based on applicable treatments
      const discount = calculateOfferDiscount(offer, treatments);
      setOfferDiscount(discount);
    } else {
      setOfferDiscount(0);
    }
  };

  return {
    offers,
    selectedOffer,
    selectOffer,
    offerDiscount,
    isLoading,
    error
  };
}