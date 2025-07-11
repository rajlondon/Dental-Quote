// Trending packages data
import React from "react";
import { Hotel, Car, Plane, Landmark, MapPin, Shield, Stethoscope, Coffee } from "lucide-react";

export type ExcursionTier = 'bronze' | 'silver' | 'gold';

export interface Excursion {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  included: boolean;
  tier: ExcursionTier; // minimum package tier needed for this to be complimentary
  image: string;
  icon: React.ReactNode;
}

export interface TrendingPackage {
  id: string;
  title: string;
  description: string;
  clinic: {
    id: string;
    name: string;
    location: string;
    image: string;
  };
  hotel: {
    name: string;
    stars: number;
    area: string;
    image: string;
  };
  accommodation: {
    nights: number;
    days: number;
    stars: number;
    description: string;
  };
  treatments: {
    name: string;
    count: number;
  }[];
  totalPrice: number;
  promoCode: string;
  savings: number;
  duration: string;
  includedServices: {
    hotel: boolean;
    transfers: boolean;
    consultation: boolean;
    cityTour: boolean;
    excursions: boolean;
  };
  excursions: Excursion[];
  tier: ExcursionTier; // bronze, silver, or gold
}

// Excursions data
export const excursions: Excursion[] = [
  {
    id: 'bosphorus-cruise',
    name: 'Bosphorus Cruise',
    description: 'Experience Istanbul from the water with a scenic cruise along the Bosphorus strait, offering panoramic views of historic palaces, mansions, and bridges.',
    price: 75,
    duration: '2-3 hours',
    included: false,
    tier: 'silver',
    image: '/images/excursions/bosphorus-cruise.jpg',
    icon: React.createElement(Plane, { className: "h-5 w-5" })
  },
  {
    id: 'old-city-tour',
    name: 'Old City Walking Tour',
    description: 'Explore Istanbul\'s historic peninsula with visits to the Blue Mosque, Hagia Sophia, Topkapi Palace, and Grand Bazaar with an expert local guide.',
    price: 90,
    duration: '6-7 hours',
    included: false,
    tier: 'gold',
    image: '/images/excursions/old-city-tour.jpg',
    icon: React.createElement(Landmark, { className: "h-5 w-5" })
  },
  {
    id: 'turkish-bath',
    name: 'Traditional Turkish Bath',
    description: 'Relax and rejuvenate with a traditional Turkish hammam experience including steam room, exfoliation, and massage at a historic bathhouse.',
    price: 60,
    duration: '1-2 hours',
    included: false,
    tier: 'bronze',
    image: '/images/excursions/turkish-bath.jpg',
    icon: React.createElement(Coffee, { className: "h-5 w-5" })
  },
  {
    id: 'culinary-tour',
    name: 'Turkish Culinary Tour',
    description: 'Sample the flavors of Turkish cuisine with a guided food tour through local markets, street food vendors, and traditional restaurants.',
    price: 85,
    duration: '4-5 hours',
    included: false,
    tier: 'silver',
    image: '/images/excursions/culinary-tour.jpg',
    icon: React.createElement(Coffee, { className: "h-5 w-5" })
  }
];

// Function to set inclusion status based on package tier
const setExcursionInclusion = (packageTier: ExcursionTier, excursion: Excursion): Excursion => {
  const tierValues = { bronze: 1, silver: 2, gold: 3 };
  const excursionTierValue = tierValues[excursion.tier];
  const packageTierValue = tierValues[packageTier];
  
  return {
    ...excursion,
    included: packageTierValue >= excursionTierValue
  };
};

// Define trending packages
export const trendingPackages: TrendingPackage[] = [
  {
    id: 'hollywood-smile-vacation',
    title: 'Hollywood Smile Luxury Family Vacation',
    description: 'The ultimate luxury dental vacation for discerning families. Combine premium Hollywood Smile treatments with an exclusive 7-day Istanbul experience featuring 5-star accommodations, VIP services, and curated cultural excursions.',
    clinic: {
      id: 'maltepe-dental-clinic',
      name: 'Maltepe Dental Clinic',
      location: 'Maltepe, Istanbul',
      image: '/images/carousel/clinic.png'
    },
    hotel: {
      name: 'Hilton Istanbul Bomonti',
      stars: 5,
      area: 'Şişli',
      image: '/images/hotels/luxury-hotel.jpg'
    },
    accommodation: {
      nights: 6,
      days: 7,
      stars: 5,
      description: '5-star luxury hotel accommodation'
    },
    treatments: [
      { name: 'Premium Porcelain Veneer', count: 10 },
      { name: 'Teeth Whitening', count: 1 },
      { name: 'Smile Design Consultation', count: 1 }
    ],
    totalPrice: 4250,
    promoCode: "HOLLYWOOD_SMILE",
    savings: 6750,
    duration: '7 days, 6 nights',
    includedServices: {
      hotel: true,
      transfers: true,
      consultation: true,
      cityTour: true,
      excursions: true
    },
    excursions: excursions.map(exc => setExcursionInclusion('gold', exc)),
    tier: 'gold'
  },
  {
    id: 'dental-implant-city-experience',
    title: 'Dental Implant & City Experience',
    description: 'Restore your smile with quality dental implants and enjoy exploring Istanbul with included hotel stay and select city experiences.',
    clinic: {
      id: 'dentgroup-istanbul',
      name: 'DentGroup Istanbul',
      location: 'Şişli, Istanbul',
      image: '/images/carousel/clinic.png'
    },
    hotel: {
      name: 'Radisson Blu Istanbul',
      stars: 4,
      area: 'Şişli',
      image: '/images/hotels/standard-hotel.jpg'
    },
    accommodation: {
      nights: 4,
      days: 5,
      stars: 4,
      description: '4-star hotel accommodation'
    },
    treatments: [
      { name: 'Single Dental Implant', count: 2 },
      { name: 'Zirconia Crown', count: 2 },
      { name: 'Dental Consultation', count: 1 }
    ],
    totalPrice: 2850,
    promoCode: "DENTAL_IMPLANT_CITY",
    savings: 1500,
    duration: '5 days',
    includedServices: {
      hotel: true,
      transfers: true,
      consultation: true,
      cityTour: true,
      excursions: true
    },
    excursions: excursions.map(exc => setExcursionInclusion('silver', exc)),
    tier: 'silver'
  },
  {
    id: 'value-veneer-istanbul-discovery',
    title: 'Value Veneer & Istanbul Discovery',
    description: 'Get affordable veneers to enhance your smile while exploring the highlights of Istanbul with basic accommodations and essential services.',
    clinic: {
      id: 'istanbul-dental-care',
      name: 'Istanbul Dental Care',
      location: 'Kadıköy, Istanbul',
      image: '/images/carousel/clinic.png'
    },
    hotel: {
      name: 'Ibis Istanbul City',
      stars: 3,
      area: 'Kadıköy',
      image: '/images/hotels/value-hotel.jpg'
    },
    accommodation: {
      nights: 3,
      days: 4,
      stars: 3,
      description: '3-star hotel accommodation'
    },
    treatments: [
      { name: 'Porcelain Veneer', count: 6 },
      { name: 'Teeth Whitening', count: 1 }
    ],
    totalPrice: 1650,
    promoCode: "VALUE_VENEER_ISTANBUL",
    savings: 950,
    duration: '4 days',
    includedServices: {
      hotel: true,
      transfers: true,
      consultation: true,
      cityTour: false,
      excursions: false
    },
    excursions: excursions.map(exc => setExcursionInclusion('bronze', exc)),
    tier: 'bronze'
  }
];