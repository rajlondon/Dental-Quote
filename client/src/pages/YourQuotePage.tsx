import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useQuoteFlow, useInitializeQuoteFlow } from '@/contexts/QuoteFlowContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import QuoteSummaryPanel from '@/components/quote/QuoteSummaryPanel';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  ChevronRight, 
  MapPin, 
  Star, 
  Clock, 
  Calendar, 
  Download, 
  Mail, 
  CreditCard,
  Hotel,
  Car,
  Shield,
  Plane,
  Sparkles,
  Info,
  ArrowLeft,
  Edit3,
  RefreshCcw,
  MessageCircle,
  CheckCircle,
  HeartHandshake,
  Pencil,
  Tag,
  Package
} from 'lucide-react';
import { getUKPriceForIstanbulTreatment } from '@/services/ukDentalPriceService';
import TreatmentPlanBuilder, { TreatmentItem } from '@/components/TreatmentPlanBuilder';
import EditQuoteModal from '@/components/EditQuoteModal';
import SpecialOfferHandler from '@/components/specialOffers/SpecialOfferHandler';

// Types
interface ClinicInfo {
  id: string;
  name: string;
  tier: 'affordable' | 'mid' | 'premium';
  priceGBP: number;
  priceUSD: number;
  location: string;
  rating: number;
  reviewCount: number;
  guarantee: string;
  materials: string[];
  conciergeType: 'mydentalfly' | 'clinic';
  features: string[];
  description: string;
  packages: {
    hotel?: boolean;
    transfers?: boolean;
    consultation?: boolean;
    cityTour?: boolean;
  };
  images: string[];
  // Special offer fields
  hasSpecialOffer?: boolean;
  specialOfferDetails?: {
    id: string;
    title: string;
    discountValue: number;
    discountType: 'percentage' | 'fixed_amount';
  };
}

interface QuoteParams {
  treatment: string;
  travelMonth: string;
  budget: string;
}

// We're now using the TreatmentItem interface imported from TreatmentPlanBuilder

interface PatientInfo {
  fullName: string;
  email: string;
  phone: string;
  travelMonth?: string;
  departureCity?: string;
  hasXrays: boolean;
  hasCtScan: boolean;
  additionalNotes: string;
  preferredContactMethod: 'email' | 'whatsapp';
}

interface SpecialOfferParams {
  id: string;
  title: string;
  clinicId: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed_amount';
  applicableTreatment: string;
}

// Mock data for clinics
const CLINIC_DATA: ClinicInfo[] = [
  {
    id: 'istanbul-dental-care',
    name: 'Istanbul Dental Care',
    tier: 'affordable',
    priceGBP: 1550,
    priceUSD: 1999,
    location: 'Şişli, Istanbul',
    rating: 4.1,
    reviewCount: 58,
    guarantee: '3-year',
    materials: ['Generic Implants', 'Standard Materials'],
    conciergeType: 'mydentalfly',
    features: ['Airport pickup', 'Modern facility', 'English-speaking staff'],
    description: 'A cost-effective option with quality care and modern facilities. Perfect for simple procedures and budget-conscious patients.',
    packages: {
      hotel: true,
      transfers: true,
      consultation: true
    },
    images: ['/images/clinics/istanbul-dental.jpg']
  },
  {
    id: 'dentgroup-istanbul',
    name: 'DentGroup Istanbul',
    tier: 'mid',
    priceGBP: 1950,
    priceUSD: 2499,
    location: 'Kadıköy, Istanbul',
    rating: 4.7,
    reviewCount: 124,
    guarantee: '5-year',
    materials: ['Straumann Implants', 'Premium Materials'],
    conciergeType: 'mydentalfly',
    features: ['Airport pickup', 'Hotel transfers', 'Advanced technology', 'Multilingual staff'],
    description: 'A balanced option offering premium quality at reasonable prices with excellent aftercare support. Popular with international patients.',
    packages: {
      hotel: true,
      transfers: true,
      consultation: true,
      cityTour: true
    },
    images: ['/images/clinics/dentgroup.jpg']
  },
  {
    id: 'maltepe-dental-clinic',
    name: 'Maltepe Dental Clinic',
    tier: 'premium',
    priceGBP: 2250,
    priceUSD: 2899,
    location: 'Maltepe, Istanbul',
    rating: 4.9,
    reviewCount: 203,
    guarantee: '10-year',
    materials: ['Nobel Biocare Implants', 'Premium Zirconia'],
    conciergeType: 'mydentalfly',
    features: ['VIP airport service', 'Luxury hotel arrangements', 'State-of-the-art technology', 'VIP transfers'],
    description: 'Our premium option offering VIP service, cutting-edge technology, and the finest materials. The choice for patients seeking luxury and perfection.',
    packages: {
      hotel: true,
      transfers: true,
      consultation: true,
      cityTour: true
    },
    images: ['/images/clinics/maltepe.jpg']
  },
  {
    id: 'dentakay-clinic',
    name: 'Dentakay',
    tier: 'premium',
    priceGBP: 2190,
    priceUSD: 2799,
    location: 'Sisli, Istanbul',
    rating: 4.8,
    reviewCount: 176,
    guarantee: '7-year',
    materials: ['Straumann Implants', 'E.max Crowns'],
    conciergeType: 'clinic',
    features: ['Dedicated patient coordinators', 'Luxury accommodation', 'VIP transfers', 'International accreditation'],
    description: 'A prestigious clinic offering luxury services with its own concierge team. Known for catering to international celebrities and VIP clients.',
    packages: {
      hotel: true,
      transfers: true,
      consultation: true,
      cityTour: true
    },
    images: ['/images/clinics/dentakay.jpg']
  },
  {
    id: 'crown-dental',
    name: 'Crown Dental Clinic',
    tier: 'mid',
    priceGBP: 1890,
    priceUSD: 2399,
    location: 'Taksim, Istanbul',
    rating: 4.6,
    reviewCount: 92,
    guarantee: '5-year',
    materials: ['Osstem Implants', 'Zirconia Crowns'],
    conciergeType: 'mydentalfly',
    features: ['Central location', 'Hotel booking assistance', 'Airport transfers', 'Multilingual staff'],
    description: 'Located in the heart of Istanbul, this clinic combines convenience with quality care. Great for patients who want to explore the city.',
    packages: {
      hotel: true,
      transfers: true,
      consultation: true
    },
    images: ['/images/clinics/crown.jpg']
  }
];

// Helper components
const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.3;
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < fullStars 
              ? 'fill-yellow-400 text-yellow-400' 
              : (i === fullStars && hasHalfStar)
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating}</span>
    </div>
  );
};

const TierBadge: React.FC<{ tier: 'affordable' | 'mid' | 'premium' }> = ({ tier }) => {
  const colors = {
    affordable: 'bg-blue-100 text-blue-800',
    mid: 'bg-purple-100 text-purple-800',
    premium: 'bg-amber-100 text-amber-800'
  };
  
  const labels = {
    affordable: 'Budget-Friendly',
    mid: 'Mid-Range',
    premium: 'Premium'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[tier]}`}>
      {labels[tier]}
    </span>
  );
};

const PackageIcon: React.FC<{ type: 'hotel' | 'transfers' | 'consultation' | 'cityTour', included: boolean }> = ({ type, included }) => {
  const icons = {
    hotel: <Hotel className={`h-5 w-5 ${included ? 'text-green-600' : 'text-gray-300'}`} />,
    transfers: <Car className={`h-5 w-5 ${included ? 'text-green-600' : 'text-gray-300'}`} />,
    consultation: <Shield className={`h-5 w-5 ${included ? 'text-green-600' : 'text-gray-300'}`} />,
    cityTour: <Plane className={`h-5 w-5 ${included ? 'text-green-600' : 'text-gray-300'}`} />
  };

  const labels = {
    hotel: 'Hotel',
    transfers: 'Transfers',
    consultation: 'Consultation',
    cityTour: 'City Tour'
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {icons[type]}
      <span className={`text-xs ${included ? 'text-gray-700' : 'text-gray-400'}`}>{labels[type]}</span>
    </div>
  );
};

const ClinicCard: React.FC<{ 
  clinic: ClinicInfo, 
  isSelected: boolean,
  onSelect: () => void 
}> = ({ clinic, isSelected, onSelect }) => {
  // Get promo information from context - this is the proper way to get the values
  const { 
    promoToken, 
    promoType, 
    isPromoTokenFlow,
    clinicId: promoClinicId 
  } = useQuoteFlow();
  
  const searchParams = new URLSearchParams(window.location.search);
  const promoTitle = searchParams.get('promoTitle') || searchParams.get('offerTitle') || 'Special Promotion';
  
  // Show promotion badge if this clinic is the one specified in the context
  // This uses the clinicId from the context which is properly initialized from URL params
  const hasPromoForThisClinic = promoToken && promoClinicId === clinic.id;
  
  return (
    <Card className={`relative mb-6 border-2 hover:shadow-md transition-all ${
      isSelected 
        ? 'border-blue-500 shadow-lg' 
        : hasPromoForThisClinic
          ? 'border-primary shadow-md' 
        : clinic.hasSpecialOffer 
          ? 'border-blue-300 shadow-md' 
          : 'border-gray-200'
    }`}>
      {isSelected && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-semibold z-10 rounded-bl-md">
          Selected
        </div>
      )}
      
      {/* Promo token badge takes priority if this clinic has a promo */}
      {hasPromoForThisClinic ? (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-primary to-primary/90 text-white px-3 py-1 text-sm font-semibold z-10 rounded-br-md flex items-center">
          <Tag className="h-4 w-4 mr-1 text-white" />
          {promoType === 'special_offer' ? 'Special Offer' : 
           promoType === 'package' ? 'Treatment Package' : 
           'Promotion'}
        </div>
      ) : clinic.hasSpecialOffer && (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 text-sm font-semibold z-10 rounded-br-md flex items-center">
          <Sparkles className="h-4 w-4 mr-1 text-yellow-300" />
          Special Offer
        </div>
      )}
      
      <div className="flex flex-col md:flex-row overflow-hidden">
        {/* Left column - Clinic Image */}
        <div className="md:w-1/4 h-52 md:h-auto relative overflow-hidden">
          <img 
            src={clinic.images[0]} 
            alt={clinic.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <TierBadge tier={clinic.tier} />
          </div>
        </div>
        
        {/* Middle column - Clinic details */}
        <div className="md:w-2/4 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold">{clinic.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <RatingStars rating={clinic.rating} />
                <span className="text-sm text-gray-500">({clinic.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-700 mb-3">
            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm">{clinic.location}</span>
          </div>
          
          <p className="text-gray-700 mb-4 text-sm">{clinic.description}</p>
          
          <div className="mb-4">
            <div className="flex gap-6 flex-wrap">
              <PackageIcon type="hotel" included={clinic.packages.hotel || false} />
              <PackageIcon type="transfers" included={clinic.packages.transfers || false} />
              <PackageIcon type="consultation" included={clinic.packages.consultation || false} />
              <PackageIcon type="cityTour" included={clinic.packages.cityTour || false} />
            </div>
          </div>
          
          <div className="mb-3">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Highlights:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
              {clinic.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex items-center text-sm text-gray-700 font-medium">
            <Shield className="h-4 w-4 mr-1 text-blue-500" />
            <span>{clinic.guarantee} guarantee</span>
          </div>
        </div>
        
        {/* Right column - Pricing and action */}
        <div className="md:w-1/4 p-4 bg-gray-50 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-lg mb-1">£{clinic.priceGBP}</h4>
            <p className="text-gray-500 text-sm mb-4">Base package from</p>
            
            {clinic.hasSpecialOffer && (
              <div className="bg-blue-50 p-2 rounded-md mb-4 border border-blue-100">
                <div className="flex items-center mb-1">
                  <Sparkles className="h-4 w-4 text-blue-500 mr-1" />
                  <h5 className="font-semibold text-blue-700 text-sm">
                    {clinic.specialOfferDetails?.title}
                  </h5>
                </div>
                
                <p className="text-blue-600 text-xs">
                  {clinic.specialOfferDetails?.discountType === 'percentage' 
                    ? `${clinic.specialOfferDetails?.discountValue}% discount on selected treatments` 
                    : `£${clinic.specialOfferDetails?.discountValue} off selected treatments`}
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-2 mb-4">
              <h4 className="font-medium text-sm text-gray-700">Materials:</h4>
              <ul className="space-y-1">
                {clinic.materials.map((material, index) => (
                  <li key={index} className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                    <span>{material}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <Button
            onClick={onSelect}
            className={`w-full ${isSelected ? 'bg-blue-700 hover:bg-blue-800' : ''}`}
          >
            {isSelected ? 'Selected Clinic' : 'Select This Clinic'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// WhatsApp button component
const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/447312345678?text=Hi%20MyDentalFly%2C%20I%20have%20a%20question%20about%20my%20dental%20quote."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
      aria-label="Contact on WhatsApp"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="mr-0"
      >
        <path d="M17.6 6.32C16.27 4.985 14.448 4.24 12.525 4.24C8.59 4.24 5.395 7.435 5.395 11.37C5.395 12.619 5.74 13.839 6.395 14.895L5.34 18.84L9.37 17.805C10.388 18.405 11.443 18.72 12.525 18.72C16.46 18.72 19.655 15.525 19.655 11.59C19.655 9.667 18.91 7.845 17.6 6.535V6.32ZM12.525 17.56C11.555 17.56 10.598 17.245 9.765 16.735L9.535 16.6L7.121 17.215L7.75 14.85L7.6 14.62C6.98 13.731 6.642 12.625 6.642 11.59C6.642 8.115 9.265 5.28 12.525 5.28C14.133 5.28 15.635 5.91 16.752 7.025C17.87 8.14 18.5 9.645 18.5 11.37C18.5 14.845 15.877 17.56 12.525 17.56ZM15.407 13.075C15.2 12.985 14.122 12.46 13.942 12.39C13.765 12.32 13.63 12.285 13.5 12.495C13.368 12.705 12.965 13.185 12.84 13.32C12.7 13.455 12.602 13.502 12.395 13.365C12.188 13.275 11.495 13.02 10.68 12.305C10.047 11.755 9.627 11.065 9.485 10.855C9.35 10.645 9.467 10.525 9.582 10.41C9.685 10.305 9.8 10.15 9.917 10.015C10.035 9.88 10.068 9.79 10.137 9.655C10.205 9.52 10.175 9.385 10.123 9.295C10.07 9.205 9.645 8.127 9.477 7.707C9.35 7.27 9.142 7.35 9.01 7.35C8.875 7.35 8.742 7.325 8.61 7.325C8.478 7.325 8.267 7.376 8.09 7.586C7.915 7.796 7.354 8.322 7.354 9.399C7.354 10.477 8.142 11.5 8.26 11.67C8.377 11.805 9.627 13.705 11.5 14.63C11.94 14.827 12.282 14.942 12.547 15.027C12.993 15.172 13.395 15.152 13.725 15.099C14.09 15.039 14.96 14.572 15.143 14.072C15.323 13.572 15.323 13.152 15.257 13.057C15.19 12.962 15.077 12.937 14.87 12.827L15.407 13.075Z"/>
      </svg>
    </a>
  );
};

// Main component for the Quote Page
const YourQuotePage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { 
    source, setSource,
    offerId, setOfferId,
    packageId, setPackageId,
    clinicId, setClinicId,
    promoToken, setPromoToken,
    promoType, setPromoType,
    isSpecialOfferFlow, isPackageFlow, isPromoTokenFlow,
    quoteId, setQuoteId,
    resetFlow,
    buildUrl
  } = useQuoteFlow();
  
  // Parse URL query parameters
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  
  const [quoteParams, setQuoteParams] = useState<QuoteParams>({
    treatment: searchParams.get('treatment') || 'Dental Implants',
    travelMonth: searchParams.get('travelMonth') || 'Flexible',
    budget: searchParams.get('budget') || '£1,500 - £2,500'
  });
  
  // Special offer data (if passed from homepage or stored in sessionStorage)
  const [specialOffer, setSpecialOffer] = useState<SpecialOfferParams | null>(() => {
    console.log("Initializing YourQuotePage with URL params:", window.location.search);
    
    // First check URL parameters - look for both offerId and specialOffer parameters
    const offerIdFromUrl = searchParams.get('offerId') || searchParams.get('specialOffer');
    console.log("Special offer ID from URL:", offerIdFromUrl, 
      "offerId param:", searchParams.get('offerId'),
      "specialOffer param:", searchParams.get('specialOffer'));
    
    // If there's a special offer ID in the URL parameters, create a special offer object
    if (offerIdFromUrl) {
      console.log("Special offer parameters found in URL:");
      console.log("- Title:", searchParams.get('offerTitle'));
      console.log("- Clinic ID:", searchParams.get('clinicId') || searchParams.get('offerClinic'));
      console.log("- Discount Value:", searchParams.get('offerDiscount'));
      console.log("- Discount Type:", searchParams.get('offerDiscountType'));
      console.log("- Treatment:", searchParams.get('treatment'));
      
      // Log all URL parameters for debugging
      const urlParams: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        urlParams[key] = value;
      });
      console.log("All URL parameters for debugging:", urlParams);
      
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
      
      // Always save to sessionStorage for persistence in future navigation
      sessionStorage.setItem('activeSpecialOffer', JSON.stringify(offerData));
      
      return offerData;
    }
    
    // If not in URL, check sessionStorage
    const storedOffer = sessionStorage.getItem('activeSpecialOffer');
    if (storedOffer) {
      try {
        const offerData = JSON.parse(storedOffer);
        console.log("Retrieved special offer from sessionStorage:", offerData);
        return {
          id: offerData.id,
          title: offerData.title,
          clinicId: offerData.clinicId,
          discountValue: offerData.discountValue || 0,
          discountType: offerData.discountType || 'percentage',
          applicableTreatment: offerData.applicableTreatment || 'Dental Implants'
        };
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
        return formattedOffer;
      } catch (error) {
        console.error("Error parsing pendingSpecialOffer from sessionStorage:", error);
      }
    }
    
    return null;
  });
  
  // Define package data interface for better type safety
  interface PackageData {
    id: string;
    clinicId: string;
    title: string;
  }
  
  // Treatment Package data (if passed from packages page or stored in sessionStorage)
  const [packageData, setPackageData] = useState<PackageData | null>(() => {
    console.log("Initializing package data from all possible sources");
    
    // First check URL parameters for packageId and package JSON params
    const packageIdFromUrl = searchParams.get('packageId');
    const packageJsonFromUrl = searchParams.get('package');
    
    console.log("Package info from URL:", {
      packageId: packageIdFromUrl,
      packageJsonExists: !!packageJsonFromUrl,
      clinicId: searchParams.get('clinicId'),
      source: searchParams.get('source')
    });
    
    // Try to read package from special "package" JSON parameter first
    if (packageJsonFromUrl) {
      try {
        // The 'package' parameter contains a JSON string with complete package details
        const packageInfo = JSON.parse(decodeURIComponent(packageJsonFromUrl));
        console.log("Successfully parsed package JSON from URL param:", packageInfo);
        
        // Save it to multiple storages for maximum availability
        sessionStorage.setItem('activePackage', JSON.stringify(packageInfo));
        sessionStorage.setItem('pendingPackage', JSON.stringify(packageInfo));
        localStorage.setItem('selectedPackage', JSON.stringify(packageInfo));
        
        // Also save it to the treatment plan format for compatibility
        sessionStorage.setItem('pendingTreatmentPlan', JSON.stringify({
          id: `package-${packageInfo.id}`,
          packageId: packageInfo.id,
          clinicId: packageInfo.clinicId,
          treatments: [{
            treatmentType: 'treatment-package',
            name: packageInfo.title,
            packageId: packageInfo.id
          }]
        }));
        
        return packageInfo;
      } catch (error) {
        console.error("Error parsing package JSON from URL:", error);
      }
    }
    
    // If there's a package ID in the URL parameters, create a package object
    if (packageIdFromUrl) {
      console.log("Package parameters found in URL parameters:");
      console.log("- Package ID:", packageIdFromUrl);
      console.log("- Clinic ID:", searchParams.get('clinicId'));
      console.log("- Package Title:", searchParams.get('packageTitle'));
      
      const packageInfo = {
        id: packageIdFromUrl,
        clinicId: searchParams.get('clinicId') || '',
        title: searchParams.get('packageTitle') || 'Treatment Package'
      };
      
      console.log("Created package data from URL params:", packageInfo);
      
      // Save to multiple storage locations for redundancy
      sessionStorage.setItem('activePackage', JSON.stringify(packageInfo));
      localStorage.setItem('selectedPackage', JSON.stringify(packageInfo));
      
      // Also save as a treatment plan for compatibility with treatment builder
      sessionStorage.setItem('pendingTreatmentPlan', JSON.stringify({
        id: `package-${packageInfo.id}`,
        packageId: packageInfo.id,
        clinicId: packageInfo.clinicId,
        treatments: [{
          treatmentType: 'treatment-package',
          name: packageInfo.title,
          packageId: packageInfo.id
        }]
      }));
      
      return packageInfo;
    }
    
    // If not in URL, check localStorage first (most recent)
    const storedPackageLS = localStorage.getItem('selectedPackage');
    if (storedPackageLS) {
      try {
        const packageInfo = JSON.parse(storedPackageLS);
        console.log("Retrieved package from localStorage:", packageInfo);
        
        // Sync it to sessionStorage as well
        sessionStorage.setItem('activePackage', JSON.stringify(packageInfo));
        
        return packageInfo;
      } catch (error) {
        console.error("Error parsing package from localStorage:", error);
      }
    }
    
    // Then check sessionStorage
    const storedPackage = sessionStorage.getItem('activePackage');
    if (storedPackage) {
      try {
        const packageInfo = JSON.parse(storedPackage);
        console.log("Retrieved package from sessionStorage:", packageInfo);
        return packageInfo;
      } catch (error) {
        console.error("Error parsing package from sessionStorage:", error);
      }
    }
    
    // Also check for pendingPackage which may happen when redirected after login
    const pendingPackageData = sessionStorage.getItem('pendingPackage');
    if (pendingPackageData) {
      try {
        const packageInfo = JSON.parse(pendingPackageData);
        console.log("Found pendingPackage in sessionStorage:", packageInfo);
        
        // Convert to the right format
        const formattedPackage = {
          id: packageInfo.id,
          title: packageInfo.title || packageInfo.name || 'Treatment Package',
          clinicId: packageInfo.clinicId || ''
        };
        
        // Store it to other locations but don't remove yet
        sessionStorage.setItem('activePackage', JSON.stringify(formattedPackage));
        localStorage.setItem('selectedPackage', JSON.stringify(formattedPackage));
        
        console.log("Converted pendingPackage to activePackage:", formattedPackage);
        return formattedPackage;
      } catch (error) {
        console.error("Error parsing pendingPackage from sessionStorage:", error);
      }
    }
    
    // Finally check for treatment plan data that might contain package info
    const pendingTreatmentPlan = sessionStorage.getItem('pendingTreatmentPlan');
    if (pendingTreatmentPlan) {
      try {
        const planData = JSON.parse(pendingTreatmentPlan);
        console.log("Found pendingTreatmentPlan in sessionStorage:", planData);
        
        // Check if this is a package-based treatment plan
        if (planData.packageId || (planData.treatments && planData.treatments.some((t: any) => t.packageId))) {
          const packageId = planData.packageId || planData.treatments.find((t: any) => t.packageId)?.packageId;
          const packageTitle = planData.treatments?.find((t: any) => t.packageId)?.name || 'Treatment Package';
          
          console.log("Found package info in treatment plan:", { packageId, packageTitle });
          
          if (packageId) {
            const formattedPackage = {
              id: packageId,
              title: packageTitle,
              clinicId: planData.clinicId || ''
            };
            
            sessionStorage.setItem('activePackage', JSON.stringify(formattedPackage));
            return formattedPackage;
          }
        }
      } catch (error) {
        console.error("Error parsing pendingTreatmentPlan from sessionStorage:", error);
      }
    }
    
    return null;
  });
  
  // Clinics state
  const [clinics, setClinics] = useState<ClinicInfo[]>(() => {
    // Start with our clinic data
    let clinicsList = [...CLINIC_DATA];
    
    // If there's a special offer, sort clinics to prioritize the one with the offer
    if (specialOffer && specialOffer.clinicId) {
      clinicsList = clinicsList.sort((a, b) => {
        // Put the clinic with the special offer first
        if (a.id === specialOffer.clinicId) return -1;
        if (b.id === specialOffer.clinicId) return 1;
        
        // Then sort by tier (premium first)
        if (a.tier === 'premium' && b.tier !== 'premium') return -1;
        if (a.tier !== 'premium' && b.tier === 'premium') return 1;
        
        // Then by price (ascending)
        return a.priceGBP - b.priceGBP;
      });
      
      // Add special offer indicator to the relevant clinic
      clinicsList = clinicsList.map(clinic => {
        if (clinic.id === specialOffer.clinicId) {
          return {
            ...clinic,
            hasSpecialOffer: true,
            specialOfferDetails: {
              id: specialOffer.id,
              title: specialOffer.title,
              discountValue: specialOffer.discountValue,
              discountType: specialOffer.discountType
            }
          };
        }
        return clinic;
      });
      
      console.log(`Prioritized clinic ${specialOffer.clinicId} for special offer: ${specialOffer.title}`);
    } else {
      // Regular sorting by tier and then price
      clinicsList = clinicsList.sort((a, b) => {
        if (a.tier === 'premium' && b.tier !== 'premium') return -1;
        if (a.tier !== 'premium' && b.tier === 'premium') return 1;
        return a.priceGBP - b.priceGBP;
      });
    }
    
    return clinicsList;
  });
  
  const [selectedClinic, setSelectedClinic] = useState<ClinicInfo | null>(null);
  
  // Treatment Plan Builder State
  const [treatmentItems, setTreatmentItems] = useState<TreatmentItem[]>([]);
  
  // Patient Info State
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  
  // Edit Quote Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Quote steps tracking - add offer-confirmation step
  const [currentStep, setCurrentStep] = useState<'build-plan' | 'offer-confirmation' | 'patient-info' | 'select-clinic' | 'review'>('build-plan');
  
  // Extract query parameters to control the flow
  const stepFromUrl = searchParams.get('step');
  const skipInfoParam = searchParams.get('skipInfo');
  const clinicIdFromUrl = searchParams.get('clinicId') || clinicId; // Use clinicId from context if available
  const fromSpecialOffer = (clinicIdFromUrl && clinicIdFromUrl.length > 0) || isSpecialOfferFlow;
  const [isQuoteReady, setIsQuoteReady] = useState(false);
  
  // Function to open edit quote modal
  const handleEditQuote = () => {
    setIsEditModalOpen(true);
  };
  
  // Function to save updated quote parameters
  const handleSaveQuoteParams = (params: QuoteParams) => {
    setQuoteParams(params);
    toast({
      title: "Quote Updated",
      description: "Your quote preferences have been updated.",
    });
  };
  
  // Calculate totals
  const calculateTotalGBP = () => {
    return treatmentItems.reduce((total, item) => total + item.subtotalGBP, 0);
  };
  
  const calculateTotalUSD = () => {
    return treatmentItems.reduce((total, item) => total + item.subtotalUSD, 0);
  };
  
  // Helper function to save a treatment plan
  const saveTreatmentPlan = async () => {
    if (!patientInfo) {
      toast({
        title: "Missing Information",
        description: "Please complete the patient info form before saving your quote.",
        variant: "destructive"
      });
      return null;
    }
    
    if (!selectedClinic) {
      toast({
        title: "Clinic Required",
        description: "Please select a clinic for your treatment plan.",
        variant: "destructive"
      });
      return null;
    }
    
    if (treatmentItems.length === 0) {
      toast({
        title: "Treatment Plan Empty",
        description: "Please add at least one treatment to your plan.",
        variant: "destructive"
      });
      return null;
    }
    
    // Prepare the data to send
    const planData = {
      patientInfo: {
        fullName: patientInfo.fullName,
        email: patientInfo.email,
        phone: patientInfo.phone,
        travelMonth: patientInfo.travelMonth || quoteParams.travelMonth,
        departureCity: patientInfo.departureCity || 'Unknown',
        hasXrays: patientInfo.hasXrays,
        hasCtScan: patientInfo.hasCtScan,
        additionalNotes: patientInfo.additionalNotes || ''
      },
      quoteParams: quoteParams,
      treatments: treatmentItems.map(item => ({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        priceGBP: item.priceGBP,
        priceUSD: item.priceUSD,
        specialOffer: item.specialOffer || null
      })),
      clinic: {
        id: selectedClinic.id,
        name: selectedClinic.name,
        tier: selectedClinic.tier
      },
      totalGBP: calculateTotalGBP(),
      totalUSD: calculateTotalUSD(),
      source: source,
      offerId: offerId,
      packageId: packageId
    };
    
    try {
      // Call the API to save the treatment plan
      const response = await fetch('/api/treatment-plans/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save treatment plan');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Your treatment plan has been saved!",
        });
        
        // Clear the special offer from session storage as it's now been used
        if (specialOffer) {
          sessionStorage.removeItem('activeSpecialOffer');
        }
        
        return result;
      } else {
        throw new Error(result.message || 'Unknown error saving treatment plan');
      }
    } catch (error) {
      console.error('Error saving treatment plan:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save your treatment plan",
        variant: "destructive"
      });
      
      return null;
    }
  };
  
  // Function to format numbers with commas for thousands
  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Leverage the useInitializeQuoteFlow hook
  const { initializeFromUrlParams } = useInitializeQuoteFlow();
  
  // Add dedicated effect to ensure special offers are added to treatment items
  useEffect(() => {
    // Only run this if we have a special offer, package or promo token but no treatment items yet
    if ((isSpecialOfferFlow || isPackageFlow || isPromoTokenFlow) && treatmentItems.length === 0) {
      console.log("🔍 Special offer flow detected but no treatment items yet. Adding special offer to treatment items list.");
      
      if (isSpecialOfferFlow && specialOffer) {
        // Create a special offer treatment item
        const specialOfferTreatment: TreatmentItem = {
          id: `special_offer_${Date.now()}`,
          category: 'special_offer',
          name: `${specialOffer.title || 'Special Offer'} - ${specialOffer.applicableTreatment || 'Free Consultation'}`,
          quantity: 1,
          priceGBP: 0, // Free consultation
          priceUSD: 0,
          subtotalGBP: 0,
          subtotalUSD: 0,
          guarantee: 'N/A',
          isSpecialOffer: true,
          specialOffer: {
            id: specialOffer.id,
            title: specialOffer.title,
            discountType: specialOffer.discountType,
            discountValue: specialOffer.discountValue,
            clinicId: specialOffer.clinicId
          }
        };
        
        console.log("📋 Adding special offer to treatment items:", specialOfferTreatment);
        setTreatmentItems(current => [...current, specialOfferTreatment]);
        
        toast({
          title: "Special Offer Added",
          description: `${specialOffer.title} has been added to your treatment plan.`,
        });
      } else if (isPackageFlow && packageData) {
        // Create a package treatment item
        const packageTreatment: TreatmentItem = {
          id: `package_${Date.now()}`,
          category: 'packages',
          name: packageData.title || 'Treatment Package',
          quantity: 1,
          priceGBP: 1200, // Default price, would be fetched from API
          priceUSD: 1550,
          subtotalGBP: 1200,
          subtotalUSD: 1550,
          guarantee: '5-year',
          isPackage: true,
          packageId: packageData.id
        };
        
        console.log("📋 Adding package to treatment items:", packageTreatment);
        setTreatmentItems(current => [...current, packageTreatment]);
        
        toast({
          title: "Package Added",
          description: `${packageData.title} has been added to your treatment plan.`,
        });
      } else if (isPromoTokenFlow && promoToken) {
        // Create a promo token treatment item
        // Handle null promoType by defaulting to 'special_offer'
        const safePromoType = promoType === 'package' ? 'package' : 'special_offer';
        
        const promoTreatment: TreatmentItem = {
          id: `promo_${Date.now()}`,
          category: safePromoType === 'package' ? 'packages' : 'special_offer',
          name: `${safePromoType === 'package' ? 'Package' : 'Special Offer'}: ${searchParams.get('promoTitle') || 'Promotion'}`,
          quantity: 1,
          priceGBP: 0,
          priceUSD: 0,
          subtotalGBP: 0,
          subtotalUSD: 0,
          guarantee: 'N/A',
          isSpecialOffer: safePromoType === 'special_offer',
          isPackage: safePromoType === 'package',
          promoToken: promoToken,
          promoType: safePromoType
        };
        
        console.log("📋 Adding promo token treatment to items:", promoTreatment);
        setTreatmentItems(current => [...current, promoTreatment]);
        
        toast({
          title: "Promotion Added",
          description: `Your promotion has been added to your treatment plan.`,
        });
      }
    }
  }, [isSpecialOfferFlow, isPackageFlow, isPromoTokenFlow, specialOffer, packageData, promoToken, promoType, treatmentItems.length]);

  useEffect(() => {
    // Set page title
    document.title = "Build Your Dental Treatment Quote | MyDentalFly";
    
    console.log("🔄 Initializing YourQuotePage with URL parameters");
    
    // Parse URL parameters
    const offerIdFromUrl = searchParams.get('specialOffer') || searchParams.get('offerId');
    const packageIdFromUrl = searchParams.get('packageId');
    const clinicIdFromUrl = searchParams.get('clinicId');
    const sourceTypeFromUrl = searchParams.get('source');

    // First, initialize the QuoteFlowContext using our utility
    initializeFromUrlParams();
    
    console.log('YourQuotePage: QuoteFlow context initialized with:', {
      source,
      offerId,
      packageId,
      clinicId,
      isSpecialOfferFlow,
      isPackageFlow
    });
    
    // Then add additional processing for this specific page
    // Determine the source type from URL parameters or use existing context
    // Priority: explicit source parameter > specialOffer/packageId/promoToken parameters > existing context
    let detectedSource = source; // Default to existing context value
    
    // Check for promo token in the URL
    const promoTokenFromUrl = searchParams.get('promoToken');
    const promoTypeFromUrl = searchParams.get('promoType');
    
    if (sourceTypeFromUrl && ['special_offer', 'package', 'promo_token', 'normal'].includes(sourceTypeFromUrl)) {
      // Explicit source parameter has highest priority
      detectedSource = sourceTypeFromUrl as 'special_offer' | 'package' | 'promo_token' | 'normal';
      console.log(`Source explicitly specified in URL: ${detectedSource}`);
    } else if (promoTokenFromUrl) {
      // Promo token indicates a promo_token source
      detectedSource = 'promo_token';
      console.log(`Source determined from promoToken parameter: ${detectedSource}`);
    } else if (offerIdFromUrl) {
      // Special offer ID parameter indicates special_offer source
      detectedSource = 'special_offer';
      console.log(`Source determined from specialOffer parameter: ${detectedSource}`);
    } else if (packageIdFromUrl) {
      // Package ID parameter indicates package source
      detectedSource = 'package';
      console.log(`Source determined from packageId parameter: ${detectedSource}`);
    }
    
    // Update context with the determined source type and relevant IDs
    if (detectedSource !== source) {
      console.log(`Updating source from ${source} to ${detectedSource}`);
      setSource(detectedSource);
    }
    
    // Always update IDs if they are provided in URL, regardless of source type
    if (offerIdFromUrl && offerIdFromUrl !== offerId) {
      console.log(`Updating offerId from ${offerId} to ${offerIdFromUrl}`);
      setOfferId(offerIdFromUrl);
    }
    
    if (packageIdFromUrl && packageIdFromUrl !== packageId) {
      console.log(`Updating packageId from ${packageId} to ${packageIdFromUrl}`);
      setPackageId(packageIdFromUrl);
    }
    
    if (clinicIdFromUrl && clinicIdFromUrl !== clinicId) {
      console.log(`Updating clinicId from ${clinicId} to ${clinicIdFromUrl}`);
      setClinicId(clinicIdFromUrl);
    }
    
    // Handle promo token in URL if present
    if (promoTokenFromUrl) {
      console.log(`Setting promoToken to ${promoTokenFromUrl}`);
      setPromoToken(promoTokenFromUrl);
      
      // Set promo type if available, default to 'special_offer' if not specified
      const type = promoTypeFromUrl || 'special_offer';
      console.log(`Setting promoType to ${type}`);
      setPromoType(type as 'special_offer' | 'package');
    }
    
    console.log("QuoteFlowContext after sync:", {
      source: detectedSource,
      offerId: offerIdFromUrl || offerId,
      packageId: packageIdFromUrl || packageId,
      clinicId: clinicIdFromUrl || clinicId,
      promoToken: promoTokenFromUrl,
      promoType: promoTypeFromUrl
    });
    
    // If we have a special offer from URL params, store it in sessionStorage for persistence across page reloads
    if (specialOffer && searchParams.get('specialOffer')) {
      // Save to sessionStorage for persistence across authentication redirects
      sessionStorage.setItem('activeSpecialOffer', JSON.stringify(specialOffer));
      console.log("Saved special offer to sessionStorage:", specialOffer);
    }
    
    // Handle URL parameters for special offer flow
    if (fromSpecialOffer) {
      console.log("Special offer flow detected with clinicId:", clinicIdFromUrl);
      
      // If skipInfo is true, we should move straight to selecting a clinic
      if (skipInfoParam === 'true' && patientInfo) {
        console.log("Skipping patient info step as requested in URL");
        setCurrentStep('select-clinic');
      }
      
      // For special offers, automatically select the clinic if it matches
      if (clinicIdFromUrl && clinics.length > 0) {
        const matchingClinic = clinics.find(c => c.id.toString() === clinicIdFromUrl);
        if (matchingClinic) {
          console.log("Auto-selecting clinic for special offer:", matchingClinic.name);
          setSelectedClinic(matchingClinic);
          
          // If we already have patient info, we can move to review
          if (patientInfo && treatmentItems.length > 0) {
            console.log("Moving directly to review step with selected clinic");
            setCurrentStep('review');
            setIsQuoteReady(true);
          }
        }
      }
    }
    
    // Set the initial step based on URL parameters
    if (stepFromUrl === 'dental-quiz') {
      setCurrentStep('build-plan');
    } else if (stepFromUrl === 'patient-info' && treatmentItems.length > 0) {
      setCurrentStep('patient-info');
    }
    
    // Show welcome toast - adjusting based on whether this came from special offer
    if (specialOffer) {
      // Create and add the special offer as a treatment item if we don't have any items yet
      if (treatmentItems.length === 0) {
        console.log("📣 Creating and adding special offer treatment from specialOffer object:", specialOffer);
        
        // Determine if this is a Free Consultation Package
        const isFreeConsultation = 
          specialOffer.title?.includes('Consultation') || 
          specialOffer.title?.includes('consultation') || 
          specialOffer.applicableTreatment?.includes('Consultation');
          
        // Set appropriate starting price based on offer type
        let basePriceGBP = isFreeConsultation ? 75 : 450; // Lower price for consultations
        let basePriceUSD = isFreeConsultation ? 95 : 580;
            
        const specialOfferTreatment: TreatmentItem = {
          id: `special_offer_${Date.now()}`,
          category: isFreeConsultation ? 'consultation' : 'special_offer',
          name: specialOffer.title || specialOffer.applicableTreatment || 'Special Offer',
          quantity: 1,
          priceGBP: basePriceGBP,
          priceUSD: basePriceUSD,
          subtotalGBP: basePriceGBP,
          subtotalUSD: basePriceUSD,
          guarantee: isFreeConsultation ? '30-day' : '5-year',
          isSpecialOffer: true, // Add flag for consistent detection
          specialOffer: {
            id: specialOffer.id,
            title: specialOffer.title || 'Special Offer',
            // Handle case where discount parameters may be missing
            discountType: specialOffer.discountType || (isFreeConsultation ? 'percentage' : 'fixed_amount'),
            discountValue: specialOffer.discountValue || (isFreeConsultation ? 100 : 50),
            clinicId: specialOffer.clinicId || 'dentakay-istanbul'
          }
        };
        
        // For free consultation, ensure 100% discount
        if (isFreeConsultation && specialOffer.title?.includes('Free')) {
          console.log("📢 Handling Free Consultation Package - setting 100% discount");
          specialOfferTreatment.specialOffer.discountType = 'percentage';
          specialOfferTreatment.specialOffer.discountValue = 100;
        }
        
        // Apply the discount based on type
        if (specialOfferTreatment.specialOffer.discountType === 'percentage') {
          const discountMultiplier = (100 - specialOfferTreatment.specialOffer.discountValue) / 100;
          specialOfferTreatment.priceGBP = Math.round(specialOfferTreatment.priceGBP * discountMultiplier);
          specialOfferTreatment.priceUSD = Math.round(specialOfferTreatment.priceUSD * discountMultiplier);
          specialOfferTreatment.subtotalGBP = specialOfferTreatment.priceGBP * specialOfferTreatment.quantity;
          specialOfferTreatment.subtotalUSD = specialOfferTreatment.priceUSD * specialOfferTreatment.quantity;
        } else if (specialOfferTreatment.specialOffer.discountType === 'fixed_amount') {
          specialOfferTreatment.priceGBP = Math.max(0, specialOfferTreatment.priceGBP - specialOfferTreatment.specialOffer.discountValue);
          specialOfferTreatment.priceUSD = Math.max(0, specialOfferTreatment.priceUSD - Math.round(specialOfferTreatment.specialOffer.discountValue * 1.28)); // Convert GBP to USD
          specialOfferTreatment.subtotalGBP = specialOfferTreatment.priceGBP * specialOfferTreatment.quantity;
          specialOfferTreatment.subtotalUSD = specialOfferTreatment.priceUSD * specialOfferTreatment.quantity;
        }
        
        // Actually add the treatment item to state
        console.log("Setting special offer treatment:", specialOfferTreatment);
        setTreatmentItems([specialOfferTreatment]);
      }
      
      toast({
        title: "Special Offer Selected",
        description: `Your quote includes: ${specialOffer.title}`,
      });
    } else {
      toast({
        title: "Let's Build Your Quote",
        description: "Start by creating your custom treatment plan below.",
      });
    }
    
    // Create a ref to access TreatmentPlanBuilder methods
  const treatmentPlanBuilderRef = React.useRef<any>(null);
  
  // Initialize treatments based on whether we have a special offer, package, or promo token
    // We discovered the source should be promo_token but isPromoTokenFlow isn't reflecting that
    // Check if we have a promo token regardless of the current isPromoTokenFlow value
    if (promoTokenFromUrl) {
      console.log("Initializing treatment plan with promo token:", promoTokenFromUrl);
      console.log("Current flow state:", { source, isPromoTokenFlow });
      
      // Force set the source to promo_token to ensure the banner displays
      if (source !== 'promo_token') {
        console.log("Forcing source to promo_token");
        setSource('promo_token');
      }
      
      // Fetch the promotion details from the token
      const treatmentType = promoTypeFromUrl || 'special_offer';
      const treatmentName = searchParams.get('treatmentName') || 'Dental Treatment';
      const promoTitle = searchParams.get('promoTitle') || 'Special Promotion';
      
      // Create a promo treatment item
      const promoTreatment: TreatmentItem = {
        id: `promo_${Date.now()}`,
        category: treatmentType === 'special_offer' ? 'special_offer' : 'packages',
        name: treatmentName,
        quantity: 1,
        priceGBP: 450, // Base price, will be adjusted after API fetch
        priceUSD: 580, // Base price, will be adjusted after API fetch
        subtotalGBP: 450,
        subtotalUSD: 580,
        guarantee: '5-year',
        isSpecialOffer: treatmentType === 'special_offer',
        isPackage: treatmentType === 'package',
        // Add promo token data
        promoToken: promoTokenFromUrl,
        promoType: treatmentType as 'special_offer' | 'package'
      };
      
      // Add the promo treatment to our treatment items
      console.log("Setting promo token treatment:", promoTreatment);
      setTreatmentItems([promoTreatment]);
      
      // Show welcome toast for promo
      toast({
        title: `${treatmentType === 'package' ? 'Treatment Package' : 'Special Offer'} Selected`,
        description: `Your quote includes: ${promoTitle}`,
      });
    }
    else if (specialOffer) {
      console.log("📣 Creating treatment from special offer:", specialOffer);
      
      // Check for Free Consultation Package
      const isFreeConsultation = 
        specialOffer.title?.includes('Consultation') || 
        specialOffer.title?.includes('consultation') || 
        (searchParams.get('treatment')?.includes('Consultation'));
        
      console.log("🔎 Checking if this is a consultation offer:", {
        isFreeConsultation,
        title: specialOffer.title,
        treatment: searchParams.get('treatment')
      });
      
      // Set appropriate base price based on offer type
      const basePriceGBP = isFreeConsultation ? 75 : 450;
      const basePriceUSD = isFreeConsultation ? 95 : 580;
      
      // Use our utility function to create a special offer treatment
      const specialOfferTreatment: TreatmentItem = {
        id: `special_offer_${Date.now()}`,
        category: isFreeConsultation ? 'consultation' : 'special_offer',
        name: specialOffer.title || specialOffer.applicableTreatment || 'Special Offer', // Use title as main name
        quantity: 1,
        priceGBP: basePriceGBP,
        priceUSD: basePriceUSD,
        subtotalGBP: basePriceGBP,
        subtotalUSD: basePriceUSD,
        guarantee: isFreeConsultation ? '30-day' : '5-year',
        isSpecialOffer: true, // Add flag for consistent detection
        specialOffer: {
          id: specialOffer.id,
          title: specialOffer.title || 'Special Offer',
          discountType: specialOffer.discountType || (isFreeConsultation ? 'percentage' : 'fixed_amount'),
          discountValue: specialOffer.discountValue || (isFreeConsultation ? 100 : 50),
          clinicId: specialOffer.clinicId || 'dentakay-istanbul'
        }
      };
      
      // Force 100% discount for Free Consultation Package
      if (isFreeConsultation && 
         (specialOffer.title?.includes('Free') || searchParams.get('offerDiscount') === '100') &&
         specialOfferTreatment.specialOffer) {
        console.log("📢 Handling Free Consultation Package - setting 100% discount");
        specialOfferTreatment.specialOffer.discountType = 'percentage';
        specialOfferTreatment.specialOffer.discountValue = 100;
      }
      
      // Apply the discount based on type and ensure specialOffer.discountType/Value are defined
      const discountType = specialOfferTreatment.specialOffer?.discountType || 'percentage';
      const discountValue = specialOfferTreatment.specialOffer?.discountValue || 0;
      
      if (discountType === 'percentage') {
        const discountMultiplier = (100 - discountValue) / 100;
        specialOfferTreatment.priceGBP = Math.round(specialOfferTreatment.priceGBP * discountMultiplier);
        specialOfferTreatment.priceUSD = Math.round(specialOfferTreatment.priceUSD * discountMultiplier);
        specialOfferTreatment.subtotalGBP = specialOfferTreatment.priceGBP * specialOfferTreatment.quantity;
        specialOfferTreatment.subtotalUSD = specialOfferTreatment.priceUSD * specialOfferTreatment.quantity;
      } else if (discountType === 'fixed_amount') {
        specialOfferTreatment.priceGBP = Math.max(0, specialOfferTreatment.priceGBP - discountValue);
        specialOfferTreatment.priceUSD = Math.max(0, specialOfferTreatment.priceUSD - Math.round(discountValue * 1.28)); // Convert GBP to USD
        specialOfferTreatment.subtotalGBP = specialOfferTreatment.priceGBP * specialOfferTreatment.quantity;
        specialOfferTreatment.subtotalUSD = specialOfferTreatment.priceUSD * specialOfferTreatment.quantity;
      }
      
      // Add the special offer treatment to our treatment items
      console.log("Setting special offer treatment:", specialOfferTreatment);
      setTreatmentItems([specialOfferTreatment]);
    }
    // Initialize with package data if available
    else if (packageData && isPackageFlow) {
      console.log("Initializing treatment plan with package data:", packageData);
      
      // Create a package treatment item
      const packageTreatment: TreatmentItem = {
        id: `package_${Date.now()}`,
        category: 'packages',
        name: packageData.title || 'Treatment Package',
        quantity: 1,
        priceGBP: 1200, // Default package price, would be fetched from API in real app
        priceUSD: 1550, // Default package price in USD
        subtotalGBP: 1200,
        subtotalUSD: 1550,
        guarantee: '5-year',
        isPackage: true,
        packageId: packageData.id
      };
      
      setTreatmentItems([packageTreatment]);
      
      // If we have a clinicId in packageData, prioritize that clinic
      if (packageData.clinicId) {
        console.log("Attempting to select clinic from package clinicId:", packageData.clinicId);
        const packageClinic = clinics.find(c => c.id === packageData.clinicId);
        if (packageClinic) {
          console.log("Auto-selecting clinic for package:", packageClinic.name);
          setSelectedClinic(packageClinic);
          
          // If we already have patient info, we can move to review
          if (patientInfo && treatmentItems.length > 0) {
            console.log("Moving directly to review step with selected clinic for package");
            setCurrentStep('review');
            setIsQuoteReady(true);
          }
        }
      }
      
      // Show welcome toast for package
      toast({
        title: "Treatment Package Selected",
        description: `Your quote includes: ${packageData.title || 'Treatment Package'}`,
      });
    }
    // Initialize with a default treatment if the user came from selecting a specific treatment
    else if (quoteParams.treatment && quoteParams.treatment !== 'Flexible') {
      const initialTreatment: TreatmentItem = {
        id: `default_${Date.now()}`,
        category: 'implants', // Default category, would be determined by mapping in real app
        name: quoteParams.treatment,
        quantity: 1,
        priceGBP: 450, // Default price, would be determined by API in real app
        priceUSD: 580, // Default price, would be determined by API in real app
        subtotalGBP: 450,
        subtotalUSD: 580,
        guarantee: '5-year',
        isSpecialOffer: false, // Explicitly mark as not a special offer for consistency
        isPackage: false // Explicitly mark as not a package for consistency
      };
      
      setTreatmentItems([initialTreatment]);
    }
    
    // Initialize patient info from URL parameters if available
    if (searchParams.get('name') || searchParams.get('email') || searchParams.get('phone')) {
      setPatientInfo({
        fullName: searchParams.get('name') || '',
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        travelMonth: searchParams.get('travelMonth') || '',
        departureCity: '',
        hasXrays: false,
        hasCtScan: false,
        additionalNotes: '',
        preferredContactMethod: 'email'
      });
    }
  }, []);
  
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <WhatsAppButton />
      
      <main className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Promo token banner - displayed if we have a valid promo token */}
          {isPromoTokenFlow && promoToken && (
            <div className="mb-6 bg-gradient-to-r from-primary to-primary/90 text-white p-4 rounded-lg shadow-md flex items-center justify-between">
              <div className="flex items-center">
                <Tag className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">
                    {promoType === 'special_offer' ? 'Special Offer' : 
                     promoType === 'package' ? 'Treatment Package' : 
                     'Promotion'}: {searchParams.get('promoTitle') || searchParams.get('offerTitle') || 'Exclusive Promotion'}
                  </h3>
                  <p className="text-sm opacity-90">
                    {promoType === 'special_offer' 
                      ? `${searchParams.get('offerDiscount') || searchParams.get('discountValue') || ''}% off selected treatments` 
                      : promoType === 'package' 
                        ? 'Complete treatment package with special benefits' 
                        : 'Limited time offer - Continue to claim your offer'}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <Badge variant="outline" className="bg-white/20 hover:bg-white/30 border-none text-white">
                  Promo: {promoToken}
                </Badge>
              </div>
            </div>
          )}
          
          {/* Back button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center text-gray-600"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
          
          {/* Page header */}
          {searchParams.get('name') ? (
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Hello, {searchParams.get('name')?.split(' ')[0]}!
            </h1>
          ) : (
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Build Your Treatment Plan</h1>
          )}
          
          {searchParams.get('name') && (
            <p className="text-gray-600 mb-6 text-lg">Let's create your personalized dental treatment quote</p>
          )}
          
          {/* Always show debug info */}
          <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold mb-2 text-gray-600">Debug Information:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Source: {source}</p>
              <p>Special Offer Flow: {isSpecialOfferFlow ? 'Yes' : 'No'}</p>
              <p>Package Flow: {isPackageFlow ? 'Yes' : 'No'}</p>
              <p>Promo Token Flow: {isPromoTokenFlow ? 'Yes' : 'No'}</p>
              {offerId && <p>Offer ID: {offerId}</p>}
              {packageId && <p>Package ID: {packageId}</p>}
              {clinicId && <p>Clinic ID: {clinicId}</p>}
              {promoToken && <p>Promo Token: {promoToken}</p>}
              {promoType && <p>Promo Type: {promoType}</p>}
              {quoteId && <p>Quote ID: {quoteId}</p>}
              {specialOffer && <p>Special Offer Title: {specialOffer.title}</p>}
              {packageData && <p>Package Title: {packageData.title}</p>}
              <p>URL Search: {window.location.search}</p>
            </div>
          </div>

          {/* Special Offer, Package, or Promo Token Banner - Now with stronger visual styling */}
          {/* Force show the banner if we have ANY promotion related data */}
          {(isSpecialOfferFlow || isPackageFlow || isPromoTokenFlow || promoToken) && (
            <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-5 shadow-md text-white">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {promoType === 'package' ? (
                    <Package className="h-7 w-7 text-yellow-300" />
                  ) : (
                    <Sparkles className="h-7 w-7 text-yellow-300" />
                  )}
                </div>
                <div className="ml-4">
                  <h2 className="font-bold text-xl">
                    {isSpecialOfferFlow ? 'Special Offer Selected' : 
                     isPackageFlow ? 'Treatment Package Selected' : 
                     promoToken && promoType === 'special_offer' ? 'Special Offer Applied' :
                     promoToken && promoType === 'package' ? 'Treatment Package Applied' :
                     promoToken ? 'Promotion Applied' : 
                     'Promotion Applied'}
                  </h2>
                  <p className="text-white font-medium text-lg mt-2">
                    {isSpecialOfferFlow && offerId ? (
                      <>Your quote includes the special offer: <span className="font-bold underline">{specialOffer?.title || 'Special Offer'}</span></>
                    ) : isPackageFlow && packageId ? (
                      <>Your quote includes the package: <span className="font-bold underline">{packageData?.title || 'Treatment Package'}</span></>
                    ) : promoToken ? (
                      <>Promotion token applied: <span className="font-bold underline">{searchParams.get('promoTitle') || searchParams.get('offerTitle') || 'Special Promotion'}</span></>
                    ) : (
                      <>We'll prepare your personalized treatment plan</>
                    )}
                  </p>
                  {quoteId && (
                    <p className="text-white bg-blue-700 px-2 py-1 rounded-md text-sm mt-2 inline-block">
                      Quote ID: {quoteId}
                    </p>
                  )}
                  <p className="text-blue-100 mt-2">
                    Complete the dental quiz below to customize your treatment experience
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Progress tracker */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Your Quote Progress</h2>
                  <p className="text-gray-600 text-sm">Follow these steps to get your personalized quote</p>
                </div>
                
                {isQuoteReady && (
                  <div className="mt-4 sm:mt-0">
                    <Button 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Quote PDF
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div 
                  className={`relative flex items-center p-3 rounded-md ${
                    currentStep === 'build-plan' 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                    currentStep === 'build-plan' 
                      ? 'bg-blue-500 text-white' 
                      : treatmentItems.length > 0 
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {treatmentItems.length > 0 ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span>1</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Build Treatment Plan</h3>
                    <p className="text-xs text-gray-500">Select your treatments</p>
                  </div>
                  {currentStep !== 'build-plan' && treatmentItems.length > 0 && (
                    <Button
                      variant="ghost" 
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setCurrentStep('build-plan')}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <div className={`relative flex items-center p-3 rounded-md ${
                  currentStep === 'patient-info' 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                    currentStep === 'patient-info' 
                      ? 'bg-blue-500 text-white' 
                      : patientInfo 
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {patientInfo ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span>2</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Patient Information</h3>
                    <p className="text-xs text-gray-500">Your contact details</p>
                  </div>
                  {currentStep !== 'patient-info' && patientInfo && (
                    <Button
                      variant="ghost" 
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setCurrentStep('patient-info')}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <div className={`relative flex items-center p-3 rounded-md ${
                  currentStep === 'select-clinic' 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                    currentStep === 'select-clinic' 
                      ? 'bg-blue-500 text-white' 
                      : selectedClinic 
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {selectedClinic ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span>3</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Select Clinic</h3>
                    <p className="text-xs text-gray-500">Choose your preferred clinic</p>
                  </div>
                  {currentStep !== 'select-clinic' && selectedClinic && (
                    <Button
                      variant="ghost" 
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setCurrentStep('select-clinic')}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <div className={`relative flex items-center p-3 rounded-md ${
                  currentStep === 'review' 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                    currentStep === 'review' 
                      ? 'bg-blue-500 text-white' 
                      : isQuoteReady 
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isQuoteReady ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span>4</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Final Review</h3>
                    <p className="text-xs text-gray-500">Review and save your quote</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content based on current step */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Main content */}
            <div className="lg:col-span-2">
              {/* Step 1: Build Plan */}
              {currentStep === 'build-plan' && (
                <>
                  <Card className="mb-6">
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2">
                      <div>
                        <CardTitle className="text-xl">Build Your Treatment Plan</CardTitle>
                        <p className="text-gray-500 text-sm">Select treatments to include in your quote</p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-2 sm:mt-0 flex items-center gap-1"
                        onClick={handleEditQuote}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit Quote Preferences
                      </Button>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 p-3 bg-blue-50 rounded-md">
                        <div className="flex items-start gap-3">
                          <div className="text-blue-500 mt-0.5">
                            <Info className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-blue-900">Your Quote Preferences</h3>
                            <ul className="text-sm text-blue-700 space-y-1 mt-1">
                              <li className="flex items-center gap-2">
                                <span className="font-medium">Treatment:</span> {quoteParams.treatment}
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="font-medium">Travel Month:</span> {quoteParams.travelMonth}
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="font-medium">Budget:</span> {quoteParams.budget}
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-0">
                          <RefreshCcw className="h-5 w-5 text-blue-500" />
                        </div>
                      </div>
                      
                      {/* Add the SpecialOfferHandler component that ensures special offers are in the treatment items */}
                      <SpecialOfferHandler
                        specialOffer={specialOffer}
                        packageData={packageData}
                        treatmentItems={treatmentItems}
                        onTreatmentsChange={setTreatmentItems}
                      />
                      
                      <TreatmentPlanBuilder
                        initialTreatments={treatmentItems}
                        onTreatmentsChange={setTreatmentItems}
                      />
                      
                      <div className="mt-6">
                        <Button 
                          onClick={() => {
                            if (treatmentItems.length === 0) {
                              toast({
                                title: "Empty Plan",
                                description: "Please add at least one treatment to your plan",
                                variant: "destructive"
                              });
                              return;
                            }
                            setCurrentStep('patient-info');
                          }}
                          className="w-full sm:w-auto"
                        >
                          Continue to Patient Information
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {/* Step 2: Patient Info */}
              {currentStep === 'patient-info' && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl">Patient Information</CardTitle>
                    <p className="text-gray-500 text-sm">Provide your details so we can prepare your quote</p>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={(e) => {
                      e.preventDefault();
                      setCurrentStep('select-clinic');
                    }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="fullName" className="text-sm font-medium">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            id="fullName"
                            value={patientInfo?.fullName || ''}
                            onChange={(e) => setPatientInfo(prev => ({ ...prev!, fullName: e.target.value }))}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={patientInfo?.email || ''}
                            onChange={(e) => setPatientInfo(prev => ({ ...prev!, email: e.target.value }))}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="phone" className="text-sm font-medium">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            value={patientInfo?.phone || ''}
                            onChange={(e) => setPatientInfo(prev => ({ ...prev!, phone: e.target.value }))}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="travelMonth" className="text-sm font-medium">
                            Preferred Travel Month
                          </label>
                          <select
                            id="travelMonth"
                            value={patientInfo?.travelMonth || ''}
                            onChange={(e) => setPatientInfo(prev => ({ ...prev!, travelMonth: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select a month</option>
                            <option value="Flexible">Flexible</option>
                            <option value="May 2025">May 2025</option>
                            <option value="June 2025">June 2025</option>
                            <option value="July 2025">July 2025</option>
                            <option value="August 2025">August 2025</option>
                            <option value="September 2025">September 2025</option>
                            <option value="October 2025">October 2025</option>
                            <option value="November 2025">November 2025</option>
                            <option value="December 2025">December 2025</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="departureCity" className="text-sm font-medium">
                            Departure City/Country
                          </label>
                          <input
                            type="text"
                            id="departureCity"
                            value={patientInfo?.departureCity || ''}
                            onChange={(e) => setPatientInfo(prev => ({ ...prev!, departureCity: e.target.value }))}
                            placeholder="e.g., London, UK"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="contactMethod" className="text-sm font-medium">
                            Preferred Contact Method
                          </label>
                          <div className="flex gap-4 mt-1">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="contactMethod"
                                value="email"
                                checked={patientInfo?.preferredContactMethod === 'email'}
                                onChange={() => setPatientInfo(prev => ({ ...prev!, preferredContactMethod: 'email' }))}
                                className="mr-2"
                              />
                              Email
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="contactMethod"
                                value="whatsapp"
                                checked={patientInfo?.preferredContactMethod === 'whatsapp'}
                                onChange={() => setPatientInfo(prev => ({ ...prev!, preferredContactMethod: 'whatsapp' }))}
                                className="mr-2"
                              />
                              WhatsApp
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Do you have dental records?</label>
                        <div className="flex flex-wrap gap-6 mt-1">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={patientInfo?.hasXrays}
                              onChange={(e) => setPatientInfo(prev => ({ ...prev!, hasXrays: e.target.checked }))}
                              className="mr-2"
                            />
                            I have dental X-rays
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={patientInfo?.hasCtScan}
                              onChange={(e) => setPatientInfo(prev => ({ ...prev!, hasCtScan: e.target.checked }))}
                              className="mr-2"
                            />
                            I have CT Scan
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="additionalNotes" className="text-sm font-medium">
                          Additional Notes or Questions
                        </label>
                        <textarea
                          id="additionalNotes"
                          value={patientInfo?.additionalNotes || ''}
                          onChange={(e) => setPatientInfo(prev => ({ ...prev!, additionalNotes: e.target.value }))}
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Any specific questions or concerns you'd like to mention..."
                        ></textarea>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep('build-plan')}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        
                        <Button type="submit">
                          Continue to Select Clinic <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
              
              {/* Step 3: Select Clinic */}
              {currentStep === 'select-clinic' && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl">Select Your Preferred Clinic</CardTitle>
                    <p className="text-gray-500 text-sm">Choose a dental clinic that best meets your needs</p>
                  </CardHeader>
                  <CardContent>
                    {/* Clinic filtering and sorting (simplified) */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-medium mb-2">Filter & Sort Options</h3>
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="outline" className="bg-white cursor-pointer">All Clinics</Badge>
                        <Badge variant="outline" className="bg-white cursor-pointer">Premium</Badge>
                        <Badge variant="outline" className="bg-white cursor-pointer">Mid-Range</Badge>
                        <Badge variant="outline" className="bg-white cursor-pointer">Budget-Friendly</Badge>
                      </div>
                    </div>
                    
                    {/* Special offer notice if applicable */}
                    {isSpecialOfferFlow && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md flex items-start">
                        <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-blue-800">Special Offer Selected</h3>
                          <p className="text-sm text-blue-700">
                            Your quote includes a special offer from a specific clinic. 
                            We've highlighted this clinic at the top of the list.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Clinic selection */}
                    <div className="space-y-6">
                      {clinics.map((clinic) => (
                        <ClinicCard
                          key={clinic.id}
                          clinic={clinic}
                          isSelected={selectedClinic?.id === clinic.id}
                          onSelect={() => setSelectedClinic(clinic)}
                        />
                      ))}
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('patient-info')}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      
                      <Button
                        onClick={() => {
                          if (!selectedClinic) {
                            toast({
                              title: "No Clinic Selected",
                              description: "Please select a clinic to continue",
                              variant: "destructive"
                            });
                            return;
                          }
                          setCurrentStep('review');
                          setIsQuoteReady(true);
                        }}
                      >
                        Continue to Review <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Step 4: Review */}
              {currentStep === 'review' && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl">Review Your Quote</CardTitle>
                    <p className="text-gray-500 text-sm">Review the details of your treatment plan</p>
                  </CardHeader>
                  <CardContent>
                    {/* Treatment Plan Review */}
                    <div className="mb-6">
                      <h3 className="font-medium text-lg mb-3">Treatment Plan</h3>
                      <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                        <table className="w-full">
                          <thead className="border-b border-gray-200">
                            <tr>
                              <th className="text-left py-2 text-sm font-medium text-gray-600">Treatment</th>
                              <th className="text-center py-2 text-sm font-medium text-gray-600">Qty</th>
                              <th className="text-right py-2 text-sm font-medium text-gray-600">Price</th>
                              <th className="text-right py-2 text-sm font-medium text-gray-600">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {treatmentItems.map((item, index) => (
                              <tr key={index} className="border-b border-gray-200 last:border-0">
                                <td className="py-3 text-sm">
                                  {item.name}
                                  {item.specialOffer && (
                                    <div className="mt-1 flex items-center">
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                        <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                                        Special Offer: {item.specialOffer.title}
                                      </Badge>
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 text-center text-sm">{item.quantity}</td>
                                <td className="py-3 text-right text-sm">
                                  {item.specialOffer ? (
                                    <div>
                                      <span className="line-through text-gray-400 mr-1">£{item.specialOffer.discountType === 'percentage' ? Math.round(item.priceGBP / (1 - item.specialOffer.discountValue / 100)) : item.priceGBP + item.specialOffer.discountValue}</span>
                                      <span className="font-medium">£{item.priceGBP}</span>
                                    </div>
                                  ) : (
                                    <span>£{item.priceGBP}</span>
                                  )}
                                </td>
                                <td className="py-3 text-right text-sm font-medium">£{item.subtotalGBP}</td>
                              </tr>
                            ))}
                            
                            {/* Totals */}
                            <tr className="bg-gray-50">
                              <td colSpan={3} className="py-3 text-right font-medium">Total</td>
                              <td className="py-3 text-right font-bold">£{formatCurrency(calculateTotalGBP())}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Clinic Details */}
                    {selectedClinic && (
                      <div className="mb-6">
                        <h3 className="font-medium text-lg mb-3">Clinic Details</h3>
                        <div className="bg-gray-50 rounded-md p-4 border border-gray-200 flex">
                          <div className="w-24 h-24 flex-shrink-0 mr-4 overflow-hidden rounded-md">
                            <img 
                              src={selectedClinic.images[0]} 
                              alt={selectedClinic.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold">{selectedClinic.name}</h4>
                            <div className="flex items-center gap-1 mb-1">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{selectedClinic.location}</span>
                            </div>
                            <div className="flex items-center mb-2">
                              <RatingStars rating={selectedClinic.rating} />
                              <span className="text-sm text-gray-500 ml-2">({selectedClinic.reviewCount} reviews)</span>
                            </div>
                            <p className="text-sm text-gray-700">{selectedClinic.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Patient Details */}
                    {patientInfo && (
                      <div className="mb-6">
                        <h3 className="font-medium text-lg mb-3">Patient Information</h3>
                        <div className="bg-gray-50 rounded-md p-4 border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">{patientInfo.fullName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{patientInfo.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{patientInfo.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Travel Month</p>
                            <p className="font-medium">{patientInfo.travelMonth || quoteParams.travelMonth || 'Flexible'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Departure City</p>
                            <p className="font-medium">{patientInfo.departureCity || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Dental Records</p>
                            <p className="font-medium">
                              {patientInfo.hasXrays ? 'X-rays available' : ''}
                              {patientInfo.hasXrays && patientInfo.hasCtScan ? ', ' : ''}
                              {patientInfo.hasCtScan ? 'CT Scan available' : ''}
                              {!patientInfo.hasXrays && !patientInfo.hasCtScan ? 'None available' : ''}
                            </p>
                          </div>
                          {patientInfo.additionalNotes && (
                            <div className="col-span-2">
                              <p className="text-sm text-gray-500">Additional Notes</p>
                              <p className="font-medium">{patientInfo.additionalNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('select-clinic')}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      
                      <Button
                        className="flex items-center"
                        onClick={async () => {
                          try {
                            // Attempt to save the treatment plan
                            const result = await saveTreatmentPlan();
                            
                            if (!result) {
                              // Error handling is done in saveTreatmentPlan
                              return;
                            }
                            
                            // Clear session storage items
                            sessionStorage.removeItem('activeSpecialOffer');
                            
                            // Reset context and redirect after successful save
                            setTimeout(() => {
                              // Reset context
                              resetFlow();
                              
                              // Use the redirectUrl from API if available, otherwise use standard redirect
                              const redirectPath = result.redirectUrl || `/client-portal?source=${source}&planId=${result.id}`;
                              console.log(`Redirecting to: ${redirectPath}`);
                              window.location.href = redirectPath;
                            }, 1500);
                          } catch (error) {
                            console.error('Error saving treatment plan:', error);
                            toast({
                              title: "Error",
                              description: "Failed to save your treatment plan. Please try again.",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Your {source === 'package' ? 'Package' : 'Treatment'} Plan
                      </Button>
                      
                      {/* Download Quote button would go here */}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Supplementary information - Customer testimonials */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">What Our Patients Say</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 inline-block fill-current" />
                          ))}
                        </div>
                        <span className="font-medium">5.0</span>
                      </div>
                      <p className="text-sm italic mb-3">
                        "MyDentalFly made my dental trip to Istanbul so easy. The clinic was fantastic and I saved over £3,000 compared to UK prices!"
                      </p>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm mr-2">
                          SJ
                        </div>
                        <div>
                          <p className="font-medium text-sm">Sarah J.</p>
                          <p className="text-xs text-gray-500">London, UK</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 inline-block fill-current" />
                          ))}
                        </div>
                        <span className="font-medium">5.0</span>
                      </div>
                      <p className="text-sm italic mb-3">
                        "The quality of care I received in Istanbul was better than anything I'd experienced before. My new smile looks amazing!"
                      </p>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm mr-2">
                          DT
                        </div>
                        <div>
                          <p className="font-medium text-sm">David T.</p>
                          <p className="text-xs text-gray-500">Manchester, UK</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* FAQs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-base font-medium">How does dental tourism work?</AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-600">
                        Dental tourism allows you to receive high-quality dental care in another country at a fraction of the cost. With MyDentalFly, we handle all the logistics from clinic selection to transportation and accommodation arrangements, making your dental trip as comfortable as possible.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-base font-medium">Is the quality of treatment comparable to the UK?</AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-600">
                        Yes! The clinics we partner with in Istanbul use the same or better materials and technologies as those in the UK. Many dentists are internationally trained and clinics maintain international certifications. The key difference is the significantly lower cost due to lower overhead expenses.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-base font-medium">How long will I need to stay in Istanbul?</AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-600">
                        The duration of your stay depends on the treatments you need. Simple procedures may require just 3-4 days, while more complex treatments like full-mouth reconstructions typically need 7-10 days across two visits. Your quote will include a recommended stay duration.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-4">
                      <AccordionTrigger className="text-base font-medium">What happens if I need adjustments after returning home?</AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-600">
                        All treatments come with guarantees ranging from 3 to 10 years. Minor adjustments can often be handled by your local dentist, but for significant issues, the clinics will cover the cost of any necessary return visits. MyDentalFly provides ongoing support even after you return home.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
            
            {/* Right column - Summary panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <QuoteSummaryPanel
                  treatments={treatmentItems.map(item => ({
                    name: item.name,
                    priceGBP: item.priceGBP,
                    quantity: item.quantity,
                    subtotalGBP: item.subtotalGBP
                  }))}
                  onContinue={() => {}} 
                  specialOfferTitle={specialOffer?.title}
                  discountValue={specialOffer?.discountValue}
                  discountType={specialOffer?.discountType}
                  clinicName={selectedClinic?.name}
                />
                
                <Card className="mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <HeartHandshake className="h-5 w-5 mr-2 text-blue-500" />
                      How We Support You
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 text-green-500">
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="text-sm">Personal dental treatment coordinator</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 text-green-500">
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="text-sm">Pre-travel consultation & planning</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 text-green-500">
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="text-sm">Clinic-verified guarantees & aftercare</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 text-green-500">
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="text-sm">Help with flights & accommodation</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 text-green-500">
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="text-sm">Airport & clinic transfers</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 text-green-500">
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="text-sm">24/7 support during your stay</span>
                      </li>
                    </ul>
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center" 
                        size="sm"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Talk to a Coordinator
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Edit Quote Modal */}
                {isEditModalOpen && (
                  <EditQuoteModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    initialParams={quoteParams}
                    onSave={handleSaveQuoteParams}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default YourQuotePage;