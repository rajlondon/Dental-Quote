import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Pencil
} from 'lucide-react';
import { getUKPriceForIstanbulTreatment } from '@/services/ukDentalPriceService';
import TreatmentPlanBuilder, { TreatmentItem as PlanTreatmentItem } from '@/components/TreatmentPlanBuilder';
import EditQuoteModal from '@/components/EditQuoteModal';

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

interface TreatmentItem {
  treatment: string;
  priceGBP: number;
  priceUSD: number;
  quantity: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
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
  
  return (
    <Card className={`relative mb-6 border-2 hover:shadow-md transition-all ${
      isSelected 
        ? 'border-blue-500 shadow-lg' 
        : clinic.hasSpecialOffer 
          ? 'border-blue-300 shadow-md' 
          : 'border-gray-200'
    }`}>
      {isSelected && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-semibold z-10 rounded-bl-md">
          Selected
        </div>
      )}
      
      {clinic.hasSpecialOffer && (
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
        
        {/* Right column - Price and action */}
        <div className="md:w-1/4 p-4 bg-gray-50 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200">
          <div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-blue-600">£{clinic.priceGBP}</p>
              <p className="text-sm text-gray-500">${clinic.priceUSD}</p>
              <p className="text-xs text-gray-500 mt-1">Treatment price</p>
              
              {/* Display special offer details if available */}
              {clinic.hasSpecialOffer && clinic.specialOfferDetails && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-sm font-medium text-blue-700 flex items-center">
                    <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                    {clinic.specialOfferDetails.title}
                  </p>
                  <p className="text-xs font-bold text-blue-800">
                    {clinic.specialOfferDetails.discountType === 'percentage' 
                      ? `${clinic.specialOfferDetails.discountValue}% OFF` 
                      : `£${clinic.specialOfferDetails.discountValue} OFF`
                    }
                  </p>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <div className="flex items-start mb-1">
                <Check className="h-4 w-4 text-green-500 mr-1 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700">£200 deposit, remainder paid in-person at clinic after consultation</span>
              </div>
              <div className="flex items-start mb-1">
                <Check className="h-4 w-4 text-green-500 mr-1 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700">Price confirmed before treatment</span>
              </div>
              <div className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-1 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700">
                  Concierge by {clinic.conciergeType === 'mydentalfly' ? 'MyDentalFly' : 'clinic'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <Button 
              className="w-full mb-2" 
              onClick={onSelect}
              variant={isSelected ? "outline" : "default"}
              size="sm"
            >
              {isSelected ? 'Selected' : 'Choose This Clinic'}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full text-xs flex items-center justify-center"
              size="sm"
            >
              <span>View Clinic Details</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const QuoteSummary: React.FC<{ 
  params: QuoteParams,
  selectedClinic: ClinicInfo | null,
  onEditQuote: () => void
}> = ({ params, selectedClinic, onEditQuote }) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  
  // Promo code states
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [isValidPromo, setIsValidPromo] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);
  
  // Extract user info from URL query parameters
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const userName = searchParams.get('name');
  const userEmail = searchParams.get('email');
  const userPhone = searchParams.get('phone');
  
  // Extract special offer info if any
  const [specialOffer, setSpecialOffer] = useState<{
    id: string;
    title: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    applicableTreatment: string;
  } | null>(null);
  
  // Handle promo code application
  const handleApplyPromoCode = async (code: string) => {
    if (!selectedClinic) {
      toast({
        title: "Error",
        description: "Please select a clinic before applying a promo code",
        variant: "destructive",
      });
      return;
    }
    
    setPromoCodeLoading(true);
    
    try {
      // Call the API to validate the promo code
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      
      if (data.success && data.valid) {
        // Calculate the discount amount based on the original price
        const originalPrice = selectedClinic.priceGBP;
        let discountAmount = 0;
        
        if (data.discountType === 'percentage') {
          discountAmount = Math.round((originalPrice * data.discountValue) / 100);
        } else if (data.discountType === 'fixed_amount') {
          discountAmount = Math.min(originalPrice, data.discountValue);
        }
        
        setPromoCode(code);
        setIsValidPromo(true);
        setPromoDiscount(discountAmount);
        
        toast({
          title: "Promo Code Applied",
          description: `${data.message}. You saved £${discountAmount}.`,
        });
      } else {
        setPromoCode(code);
        setIsValidPromo(false);
        setPromoDiscount(0);
        
        toast({
          title: "Invalid Promo Code",
          description: data.message || "This promo code is not valid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      toast({
        title: "Error",
        description: "Failed to validate promo code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPromoCodeLoading(false);
    }
  };
  
  // Handle removing promo code
  const handleRemovePromoCode = () => {
    setPromoCode(null);
    setIsValidPromo(false);
    setPromoDiscount(0);
    
    toast({
      title: "Promo Code Removed",
      description: "The promo code has been removed from your quote.",
    });
  };

  // Placeholder for download and email functions
  const handleDownloadQuote = () => {
    setIsDownloading(true);
    
    // Simulate PDF generation delay
    setTimeout(() => {
      setIsDownloading(false);
      toast({
        title: "PDF Download",
        description: "Your quote PDF is being generated. It will download automatically.",
      });
    }, 1500);
  };
  
  const handleEmailQuote = () => {
    setIsEmailing(true);
    
    // Simulate email sending delay
    setTimeout(() => {
      setIsEmailing(false);
      toast({
        title: "Email Sent",
        description: `Your quote has been emailed to ${userEmail || 'you'}.`,
      });
    }, 1500);
  };
  
  // Calculate final price with any promo code discount applied
  const originalPrice = selectedClinic ? selectedClinic.priceGBP : 0;
  const finalPrice = isValidPromo ? Math.max(0, originalPrice - promoDiscount) : originalPrice;
  
  // Calculate UK price comparison (simplified for this example)
  const ukTreatmentPrice = selectedClinic ? selectedClinic.priceGBP * 2.5 : 0;
  const savingsAmount = selectedClinic ? ukTreatmentPrice - finalPrice : 0;
  const savingsPercentage = selectedClinic ? Math.round((savingsAmount / ukTreatmentPrice) * 100) : 0;
  
  return (
    <Card className="bg-white shadow-md mb-8">
      <CardHeader className="bg-blue-50 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <CardTitle className="text-xl font-bold">Your Quote Summary</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center text-xs mt-2 md:mt-0"
            onClick={onEditQuote}
          >
            <Edit3 className="mr-2 h-3 w-3" />
            Edit Quote
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {/* Special Offer Section - Show if there's a special offer */}
        {specialOffer && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-md relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center transform rotate-12">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-start">
              <div className="flex-1 pr-16">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-primary">{specialOffer.title}</h3>
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary ml-2 px-2 py-0">
                    {specialOffer.discountType === 'percentage' ? 
                      `${specialOffer.discountValue}% OFF` : 
                      `£${specialOffer.discountValue} OFF`}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  This special offer includes a discount on {specialOffer.applicableTreatment}.
                  The discount has been applied to your quote.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* If promo code applied but not a special offer */}
        {!specialOffer && isValidPromo && promoDiscount > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-md relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-100/50 rounded-full flex items-center justify-center transform rotate-12">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-start">
              <div className="flex-1 pr-16">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-green-700">Promo Code Applied</h3>
                  <Badge variant="outline" className="bg-green-100 border-green-200 text-green-700 ml-2 px-2 py-0">
                    £{promoDiscount} OFF
                  </Badge>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Your promo code "{promoCode}" has been successfully applied to your quote.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* User Information Section - only show if we have user info from form */}
        {userName && (
          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-md font-medium mb-3 text-blue-900">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-blue-700">Name</p>
                <p className="text-base font-semibold mt-1">{userName}</p>
              </div>
              {userEmail && (
                <div>
                  <p className="text-sm font-medium text-blue-700">Email</p>
                  <p className="text-base font-semibold mt-1">{userEmail}</p>
                </div>
              )}
              {userPhone && (
                <div>
                  <p className="text-sm font-medium text-blue-700">Phone</p>
                  <p className="text-base font-semibold mt-1">{userPhone}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Treatment</h3>
            <p className="text-base">{params.treatment || 'Not specified'}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Travel Month</h3>
            <p className="text-base">{params.travelMonth || 'Not specified'}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Budget Range</h3>
            <p className="text-base">{params.budget || 'Not specified'}</p>
          </div>
        </div>
        
        {selectedClinic && (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Selected Clinic</h3>
              <div className="flex items-center p-3 bg-blue-50 rounded-md">
                <img 
                  src={selectedClinic.images[0]} 
                  alt={selectedClinic.name} 
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
                <div>
                  <h4 className="font-semibold">{selectedClinic.name}</h4>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{selectedClinic.location}</span>
                  </div>
                  <TierBadge tier={selectedClinic.tier} />
                </div>
                <div className="ml-auto text-right">
                  {isValidPromo ? (
                    <>
                      <p className="text-2xl font-bold text-blue-600">
                        £{finalPrice}
                        <span className="text-sm line-through text-gray-500 ml-2">£{originalPrice}</span>
                      </p>
                      <p className="text-sm text-green-600">You saved £{promoDiscount}!</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-blue-600">£{selectedClinic.priceGBP}</p>
                      <p className="text-sm text-gray-500">${selectedClinic.priceUSD}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Promo Code Section */}
            <div className="mb-6">
              <PromoCodeInput
                onApplyPromoCode={handleApplyPromoCode}
                onRemovePromoCode={handleRemovePromoCode}
                appliedCode={promoCode}
                isValidCode={isValidPromo}
                discountAmount={promoDiscount}
                disabled={promoCodeLoading}
              />
            </div>
            
            <div className="border rounded-md p-4 mb-6 bg-emerald-50">
              <h3 className="text-lg font-semibold mb-3">UK Price Comparison</h3>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-3 md:mb-0">
                  <div className="bg-white p-3 rounded-full mr-4 border border-emerald-200">
                    <Sparkles className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Same treatment in the UK would cost:</p>
                    <p className="text-xl font-bold">£{ukTreatmentPrice}</p>
                  </div>
                </div>
                
                <div className="bg-emerald-100 p-3 rounded-md text-center">
                  <p className="text-sm text-gray-700">Your savings</p>
                  <p className="text-xl font-bold text-emerald-700">£{savingsAmount} ({savingsPercentage}%)</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
              <Button 
                onClick={() => {}}
                className="flex-1 flex items-center justify-center py-6"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Pay £200 Deposit & Book
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={handleDownloadQuote}
                  disabled={isDownloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  PDF Quote
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={handleEmailQuote}
                  disabled={isEmailing}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Quote
                </Button>
              </div>
            </div>
          </>
        )}
        
        {!selectedClinic && (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-3">Please select a clinic from the options below</p>
            <ChevronRight className="h-8 w-8 mx-auto text-gray-400 animate-bounce" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EducationalSection: React.FC = () => {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">Understanding Your Quote</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Materials & Brands</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">Clinics use different dental implant brands and materials which affect price and longevity. Premium clinics use globally recognized brands like Nobel Biocare and Straumann.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Price Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">Final prices may adjust slightly (±10%) after your X-rays and consultation, as your exact needs become clear. We'll always confirm before proceeding.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Guarantees & Aftercare</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">All treatments include guarantees (ranging from 3-10 years) that are honored internationally. Your dental work is backed by both the clinic and MyDentalFly.</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4 text-center">
        <Button variant="link" className="text-blue-600">
          Read Our Full Pricing Guide
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const FAQSection: React.FC = () => {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border rounded-md mb-3 border-gray-200">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="text-base font-medium">What happens after I choose a clinic?</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-gray-700">
              Once you select a clinic and pay the £200 deposit, your personal concierge will contact you within 24 hours to confirm your booking and discuss your travel dates. We'll then arrange your consultation, accommodation, and transportation in Istanbul.
            </p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2" className="border rounded-md mb-3 border-gray-200">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="text-base font-medium">Is my £200 deposit refundable?</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-gray-700">
              Yes, your deposit is fully refundable if you cancel more than 7 days before your scheduled consultation. If you proceed with treatment, the £200 is deducted from your final bill at the clinic. This deposit ensures we can secure your appointment and make all necessary arrangements.
            </p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="border rounded-md mb-3 border-gray-200">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="text-base font-medium">Will my quote change after my dental review?</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-gray-700">
              In most cases, your quote will remain within ±10% of the estimate. However, after your X-rays and in-person consultation, the dentist might recommend adjustments to your treatment plan based on your specific dental condition. Any changes to your treatment plan and costs will be clearly explained and require your approval before proceeding.
            </p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-4" className="border rounded-md mb-3 border-gray-200">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="text-base font-medium">How do I contact MyDentalFly for help?</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-gray-700">
              Our team is available 24/7 through multiple channels. You can reach us by:
            </p>
            <ul className="list-disc pl-5 mt-2 text-gray-700">
              <li>Calling our UK number: +44 7572 445856</li>
              <li>WhatsApp chat for quick responses</li>
              <li>Email: info@mydentalfly.com</li>
              <li>Or through the live chat on our website</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const CTASection: React.FC<{ 
  selectedClinic: ClinicInfo | null,
  treatmentItems?: PlanTreatmentItem[]
}> = ({ selectedClinic, treatmentItems = [] }) => {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const userName = searchParams.get('name')?.split(' ')[0];
  const treatment = searchParams.get('treatment');
  
  // Calculate total from treatment items if available
  const totalGBP = treatmentItems.reduce((sum, item) => sum + item.subtotalGBP, 0);
  const hasCustomPlan = treatmentItems.length > 0;
  
  // Format the deposit amount with commas for thousands
  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mb-10">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {userName ? `${userName}, Ready to Transform Your Smile?` : 'Ready to Transform Your Smile?'}
        </h2>
        
        <p className="text-blue-100 mb-4">
          {selectedClinic ? (
            <>
              Book your {treatment || 'dental treatment'} at {selectedClinic.name} today with just a £200 deposit. 
              Your personal concierge will handle all arrangements for a stress-free experience.
            </>
          ) : (
            <>
              Select a clinic above and book your dental treatment today with just a £200 deposit.
              Your concierge will handle all arrangements for a stress-free experience.
            </>
          )}
        </p>
        
        {hasCustomPlan && (
          <div className="bg-white/10 rounded-lg p-4 mb-6 inline-block">
            <h3 className="text-lg font-semibold mb-1">Estimated Istanbul Price</h3>
            <p className="text-2xl font-bold">£{formatCurrency(totalGBP)}</p>
            <p className="text-sm text-blue-200">Final price confirmed after dental review, payment only in-person at clinic</p>
            <p className="text-xs text-blue-200">Hotel stays often included in treatment packages depending on the cost of your treatment.</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <Button 
            className="bg-white text-blue-700 hover:bg-blue-50"
            size="lg"
            disabled={!selectedClinic}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Pay £200 Deposit & Book Now
          </Button>
          
          <Button 
            variant="outline"
            className="border-white text-white hover:bg-blue-700"
            size="lg"
          >
            <Mail className="mr-2 h-5 w-5" />
            Contact a Dental Advisor
          </Button>
        </div>
        
        <div className="mt-6 flex justify-center">
          <div className="inline-block text-left bg-blue-500/30 rounded-lg p-4 max-w-md">
            <h4 className="font-medium mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Booking Process
            </h4>
            <ul className="text-sm text-blue-100 space-y-2">
              <li className="flex items-start">
                <Check className="h-3 w-3 mt-1 mr-2 flex-shrink-0" />
                Pay £200 deposit to secure your appointment
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 mt-1 mr-2 flex-shrink-0" />
                Receive confirmation and pre-travel guidance
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 mt-1 mr-2 flex-shrink-0" />
                Attend consultation and finalize treatment plan
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 mt-1 mr-2 flex-shrink-0" />
                Pay remaining balance directly to the clinic
              </li>
            </ul>
            <p className="text-xs text-blue-200 mt-3">
              Your £200 deposit is fully refundable if you cancel more than 7 days before your consultation,
              and is deducted from your final treatment cost.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// WhatsApp floating button component
const WhatsAppButton: React.FC = () => {
  return (
    <a
      href="https://wa.me/447572445856?text=Hello%20MyDentalFly,%20I%20need%20assistance%20with%20my%20dental%20treatment%20quote."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white rounded-full p-3 shadow-lg hover:bg-green-600 transition-colors z-50 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
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

import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Pencil
} from 'lucide-react';
import { getUKPriceForIstanbulTreatment } from '@/services/ukDentalPriceService';
import TreatmentPlanBuilder, { TreatmentItem as PlanTreatmentItem } from '@/components/TreatmentPlanBuilder';
import EditQuoteModal from '@/components/EditQuoteModal';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

// Import the new components
import PatientInfoForm, { PatientInfo } from '@/components/PatientInfoForm';
import TreatmentGuide from '@/components/TreatmentGuide';

// Interface for special offer from URL parameters
interface SpecialOfferParams {
  id: string;
  title: string;
  clinicId: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed_amount';
  applicableTreatment: string;
}

const YourQuotePage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
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
    
    // First check URL parameters
    const offerId = searchParams.get('specialOffer');
    console.log("Special offer ID from URL:", offerId);
    
    // If there's a special offer ID in the URL parameters, create a special offer object
    if (offerId) {
      console.log("Special offer parameters found in URL:");
      console.log("- Title:", searchParams.get('offerTitle'));
      console.log("- Clinic ID:", searchParams.get('offerClinic'));
      console.log("- Discount Value:", searchParams.get('offerDiscount'));
      console.log("- Discount Type:", searchParams.get('offerDiscountType'));
      console.log("- Treatment:", searchParams.get('treatment'));
      
      const offerData = {
        id: offerId,
        title: searchParams.get('offerTitle') || 'Special Offer',
        clinicId: searchParams.get('offerClinic') || '',
        discountValue: parseInt(searchParams.get('offerDiscount') || '0'),
        discountType: (searchParams.get('offerDiscountType') || 'percentage') as 'percentage' | 'fixed_amount',
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
        
        // Save to activeSpecialOffer key for future use and clear pending
        sessionStorage.setItem('activeSpecialOffer', JSON.stringify(formattedOffer));
        sessionStorage.removeItem('pendingSpecialOffer');
        
        return formattedOffer;
      } catch (error) {
        console.error("Error parsing pending special offer:", error);
      }
    }
    
    console.log("No special offer found in URL or sessionStorage");
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
  const [treatmentItems, setTreatmentItems] = useState<PlanTreatmentItem[]>([]);
  
  // Patient Info State
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  
  // Edit Quote Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Quote steps tracking
  const [currentStep, setCurrentStep] = useState<'build-plan' | 'patient-info' | 'select-clinic' | 'review'>('build-plan');
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
  
  // Function to handle treatment plan changes
  const handleTreatmentPlanChange = (items: PlanTreatmentItem[]) => {
    setTreatmentItems(items);
    
    if (items.length > 0) {
      toast({
        title: "Treatment Plan Updated",
        description: "Your treatment plan has been updated.",
      });
    }
  };
  
  // Function to handle patient info form submission
  const handlePatientInfoSubmit = (data: PatientInfo) => {
    setPatientInfo(data);
    setCurrentStep('select-clinic');
    
    toast({
      title: "Information Saved",
      description: "Your personal information has been saved successfully. Now select a clinic for your treatment.",
    });
    
    // Scroll to the top of the section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Function to handle clinic selection
  const handleClinicSelect = (clinic: ClinicInfo) => {
    setSelectedClinic(clinic);
    
    toast({
      title: "Clinic Selected",
      description: `You have selected ${clinic.name} for your treatment.`,
    });
  };
  
  // Function to confirm clinic selection and move to review
  const handleConfirmClinic = () => {
    if (selectedClinic) {
      setCurrentStep('review');
      setIsQuoteReady(true);
      
      toast({
        title: "Clinic Confirmed",
        description: "Your clinic selection has been confirmed. Please review your quote details.",
      });
      
      // Scroll to the top of the review section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast({
        title: "No Clinic Selected",
        description: "Please select a clinic before proceeding.",
        variant: "destructive"
      });
    }
  };
  
  // Calculate totals
  const totalGBP = treatmentItems.reduce((sum, item) => sum + item.subtotalGBP, 0);
  const totalUSD = treatmentItems.reduce((sum, item) => sum + item.subtotalUSD, 0);
  
  // Format currency with commas
  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  useEffect(() => {
    // In a real implementation, we would parse query parameters here
    // and fetch real data from an API
    document.title = "Build Your Dental Treatment Quote | MyDentalFly";
    
    // If we have a special offer from URL params, store it in sessionStorage for persistence across page reloads
    if (specialOffer && searchParams.get('specialOffer')) {
      // Save to sessionStorage for persistence across authentication redirects
      sessionStorage.setItem('activeSpecialOffer', JSON.stringify(specialOffer));
      console.log("Saved special offer to sessionStorage:", specialOffer);
    }
    
    // Show welcome toast - adjusting based on whether this came from special offer
    if (specialOffer) {
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
    
    // Initialize treatments based on whether we have a special offer
    if (specialOffer) {
      // Create a treatment item from the special offer
      const specialOfferTreatment: PlanTreatmentItem = {
        id: `special_offer_${Date.now()}`,
        category: 'special_offer',
        name: specialOffer.applicableTreatment,
        quantity: 1,
        priceGBP: 450, // Base price, will be discounted later
        priceUSD: 580, // Base price, will be discounted later
        subtotalGBP: 450,
        subtotalUSD: 580,
        guarantee: '5-year',
        specialOffer: {
          id: specialOffer.id,
          title: specialOffer.title,
          discountType: specialOffer.discountType,
          discountValue: specialOffer.discountValue,
          clinicId: specialOffer.clinicId
        }
      };
      
      // Apply the discount based on type
      if (specialOffer.discountType === 'percentage') {
        const discountMultiplier = (100 - specialOffer.discountValue) / 100;
        specialOfferTreatment.priceGBP = Math.round(specialOfferTreatment.priceGBP * discountMultiplier);
        specialOfferTreatment.priceUSD = Math.round(specialOfferTreatment.priceUSD * discountMultiplier);
        specialOfferTreatment.subtotalGBP = specialOfferTreatment.priceGBP * specialOfferTreatment.quantity;
        specialOfferTreatment.subtotalUSD = specialOfferTreatment.priceUSD * specialOfferTreatment.quantity;
      } else if (specialOffer.discountType === 'fixed_amount') {
        specialOfferTreatment.priceGBP = Math.max(0, specialOfferTreatment.priceGBP - specialOffer.discountValue);
        specialOfferTreatment.priceUSD = Math.max(0, specialOfferTreatment.priceUSD - Math.round(specialOffer.discountValue * 1.28)); // Convert GBP to USD
        specialOfferTreatment.subtotalGBP = specialOfferTreatment.priceGBP * specialOfferTreatment.quantity;
        specialOfferTreatment.subtotalUSD = specialOfferTreatment.priceUSD * specialOfferTreatment.quantity;
      }
      
      setTreatmentItems([specialOfferTreatment]);
    }
    // Initialize with a default treatment if the user came from selecting a specific treatment
    else if (quoteParams.treatment && quoteParams.treatment !== 'Flexible') {
      const initialTreatment: PlanTreatmentItem = {
        id: `default_${Date.now()}`,
        category: 'implants', // Default category, would be determined by mapping in real app
        name: quoteParams.treatment,
        quantity: 1,
        priceGBP: 450, // Default price, would be determined by API in real app
        priceUSD: 580, // Default price, would be determined by API in real app
        subtotalGBP: 450,
        subtotalUSD: 580,
        guarantee: '5-year'
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
                  className={`p-3 rounded-md border flex items-center gap-3 cursor-pointer
                    ${currentStep === 'build-plan' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                  `}
                  onClick={() => setCurrentStep('build-plan')}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${
                    currentStep === 'build-plan' ? 'bg-blue-500' : 
                    treatmentItems.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {treatmentItems.length > 0 ? <Check className="h-5 w-5" /> : '1'}
                  </div>
                  <div>
                    <p className="font-medium">Build Treatment Plan</p>
                    <p className="text-xs text-gray-600">{treatmentItems.length} treatments added</p>
                  </div>
                </div>
                
                <div 
                  className={`p-3 rounded-md border flex items-center gap-3 cursor-pointer
                    ${currentStep === 'patient-info' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${treatmentItems.length === 0 ? 'opacity-50' : ''}
                  `}
                  onClick={() => treatmentItems.length > 0 && setCurrentStep('patient-info')}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${
                    currentStep === 'patient-info' ? 'bg-blue-500' : 
                    patientInfo ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {patientInfo ? <Check className="h-5 w-5" /> : '2'}
                  </div>
                  <div>
                    <p className="font-medium">Your Information</p>
                    <p className="text-xs text-gray-600">
                      {patientInfo ? 'Information saved' : 'Add your details'}
                    </p>
                  </div>
                </div>
                
                <div 
                  className={`p-3 rounded-md border flex items-center gap-3 cursor-pointer
                    ${currentStep === 'select-clinic' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${!patientInfo ? 'opacity-50' : ''}
                  `}
                  onClick={() => patientInfo && setCurrentStep('select-clinic')}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${
                    currentStep === 'select-clinic' ? 'bg-blue-500' : 
                    selectedClinic ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {selectedClinic ? <Check className="h-5 w-5" /> : '3'}
                  </div>
                  <div>
                    <p className="font-medium">Select Clinic</p>
                    <p className="text-xs text-gray-600">
                      {selectedClinic ? `Selected: ${selectedClinic.name}` : 'Choose your preferred clinic'}
                    </p>
                  </div>
                </div>
                
                <div 
                  className={`p-3 rounded-md border flex items-center gap-3 cursor-pointer
                    ${currentStep === 'review' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${!selectedClinic ? 'opacity-50' : ''}
                  `}
                  onClick={() => selectedClinic && setCurrentStep('review')}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${
                    currentStep === 'review' ? 'bg-blue-500' : 
                    isQuoteReady ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {isQuoteReady ? <Check className="h-5 w-5" /> : '4'}
                  </div>
                  <div>
                    <p className="font-medium">Review & Submit</p>
                    <p className="text-xs text-gray-600">
                      {isQuoteReady ? 'Quote ready' : 'Complete previous steps'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quote Parameters Summary (always visible) */}
          <div className="mb-8">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Quote Preferences</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditQuote}
                    className="flex items-center gap-2 text-xs h-8"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Treatment</p>
                    <p className="font-medium">{quoteParams.treatment}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Travel Month</p>
                    <p className="font-medium">{quoteParams.travelMonth}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Budget Range</p>
                    <p className="font-medium">{quoteParams.budget}</p>
                  </div>
                </div>
                
                {treatmentItems.length > 0 && (
                  <div className="flex justify-end mt-4">
                    <div className="bg-blue-50 py-2 px-4 rounded-md">
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-gray-700">Estimated Istanbul Price:</span>
                        <span className="font-bold">£{formatCurrency(Math.round(totalGBP * 0.35))}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-xs text-gray-500">
                        <span>USD:</span>
                        <span>${formatCurrency(Math.round(totalUSD * 0.35))}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Hotel stays often included in treatment packages depending on the cost of your treatment.
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Edit Quote Modal */}
          <EditQuoteModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            initialParams={quoteParams}
            onSave={handleSaveQuoteParams}
          />
          
          {/* Step 1: Build Treatment Plan (conditionally displayed) */}
          {currentStep === 'build-plan' && (
            <>
              {/* Treatment Guide - Educational Component */}
              <TreatmentGuide />
              
              {/* Treatment Plan Builder */}
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl font-bold">
                      <Pencil className="mr-2 h-5 w-5 text-blue-500" />
                      Build Your Treatment Plan
                    </CardTitle>
                    <CardDescription>
                      Add all the treatments you're interested in to get a comprehensive quote
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TreatmentPlanBuilder 
                      initialTreatments={treatmentItems}
                      onTreatmentsChange={handleTreatmentPlanChange}
                    />
                    
                    {treatmentItems.length > 0 && (
                      <div className="mt-6 flex justify-end">
                        <Button 
                          onClick={() => setCurrentStep('patient-info')}
                          className="flex items-center gap-2"
                        >
                          Continue to Next Step
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
          
          {/* Step 2: Patient Information (conditionally displayed) */}
          {currentStep === 'patient-info' && (
            <>
              <PatientInfoForm
                initialData={patientInfo || {
                  fullName: searchParams.get('name') || '',
                  email: searchParams.get('email') || '',
                  phone: searchParams.get('phone') || '',
                  travelMonth: searchParams.get('travelMonth') || '',
                }}
                onSubmit={handlePatientInfoSubmit}
              />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep('build-plan')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Treatment Plan
                </Button>
              </div>
            </>
          )}
          
          {/* Step 3: Clinic Selection (conditionally displayed) */}
          {currentStep === 'select-clinic' && (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                    Select Your Preferred Clinic
                  </CardTitle>
                  <CardDescription>
                    Choose a clinic that best matches your needs and budget. {specialOffer && "Clinics with special offers are highlighted."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Special Offer Notification - Show if there's a special offer */}
                    {specialOffer && (
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start">
                          <Sparkles className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium text-blue-700">Special Offer Applied</h3>
                            <p className="text-sm text-blue-600">
                              Your quote includes the "{specialOffer.title}" special offer from a participating clinic.
                              This clinic is listed first in your results.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Clinic sorting options */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                      <p className="text-sm text-gray-700">Showing {clinics.length} available clinics for your treatment</p>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700">Sort by:</label>
                        <select 
                          className="text-sm border rounded-md px-2 py-1"
                          onChange={(e) => {
                            // Here we'd implement sorting logic
                            const sortOption = e.target.value;
                            let sortedClinics = [...clinics];
                            
                            if (sortOption === 'price-asc') {
                              sortedClinics.sort((a, b) => a.priceGBP - b.priceGBP);
                            } else if (sortOption === 'price-desc') {
                              sortedClinics.sort((a, b) => b.priceGBP - a.priceGBP);
                            } else if (sortOption === 'rating') {
                              sortedClinics.sort((a, b) => b.rating - a.rating);
                            } else if (sortOption === 'special-offers') {
                              sortedClinics.sort((a, b) => {
                                if (a.hasSpecialOffer && !b.hasSpecialOffer) return -1;
                                if (!a.hasSpecialOffer && b.hasSpecialOffer) return 1;
                                return 0;
                              });
                            }
                            
                            setClinics(sortedClinics);
                          }}
                        >
                          <option value="special-offers">Special Offers First</option>
                          <option value="price-asc">Price (Low to High)</option>
                          <option value="price-desc">Price (High to Low)</option>
                          <option value="rating">Rating</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Clinic list */}
                    <div className="space-y-6">
                      {clinics.map((clinic) => (
                        <ClinicCard
                          key={clinic.id}
                          clinic={clinic}
                          isSelected={selectedClinic?.id === clinic.id}
                          onSelect={() => handleClinicSelect(clinic)}
                        />
                      ))}
                    </div>
                    
                    {/* Navigation buttons */}
                    <div className="flex justify-between mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('patient-info')}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Patient Info
                      </Button>
                      
                      <Button
                        onClick={handleConfirmClinic}
                        className="flex items-center gap-2"
                        disabled={!selectedClinic}
                      >
                        Continue to Review
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          {/* Step 4: Review and Submit (conditionally displayed) */}
          {currentStep === 'review' && (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    Your Quote is Ready
                  </CardTitle>
                  <CardDescription>
                    Review your treatment plan and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Treatment Summary */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">Treatment Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        {treatmentItems.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Treatment</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {treatmentItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">{item.name}</TableCell>
                                  <TableCell className="text-center">{item.quantity}</TableCell>
                                  <TableCell className="text-right">£{item.priceGBP}</TableCell>
                                  <TableCell className="text-right">£{item.subtotalGBP}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                            <TableFooter>
                              <TableRow>
                                <TableCell colSpan={3}>Total</TableCell>
                                <TableCell className="text-right">£{formatCurrency(totalGBP)}</TableCell>
                              </TableRow>
                            </TableFooter>
                          </Table>
                        ) : (
                          <p>No treatments added yet.</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Selected Clinic Information */}
                    {selectedClinic && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-3">Selected Clinic</h3>
                        <div className="bg-gray-50 p-4 rounded-md flex items-start gap-4">
                          <img 
                            src={selectedClinic.images[0]} 
                            alt={selectedClinic.name} 
                            className="w-20 h-20 object-cover rounded-md hidden md:block" 
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg">{selectedClinic.name}</h4>
                              <TierBadge tier={selectedClinic.tier} />
                              {selectedClinic.hasSpecialOffer && (
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                  <Sparkles className="h-3 w-3 mr-1" /> Special Offer
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center text-gray-700 mb-2">
                              <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                              <span className="text-sm">{selectedClinic.location}</span>
                              <span className="mx-2">•</span>
                              <RatingStars rating={selectedClinic.rating} />
                              <span className="ml-1 text-xs text-gray-500">({selectedClinic.reviewCount})</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Price</p>
                                <p className="font-bold text-blue-600">£{selectedClinic.priceGBP}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Guarantee</p>
                                <p>{selectedClinic.guarantee}</p>
                              </div>
                            </div>
                            
                            {selectedClinic.hasSpecialOffer && selectedClinic.specialOfferDetails && (
                              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-100">
                                <p className="text-sm font-medium text-blue-700">
                                  {selectedClinic.specialOfferDetails.title} - 
                                  {selectedClinic.specialOfferDetails.discountType === 'percentage' ? 
                                    ` ${selectedClinic.specialOfferDetails.discountValue}% OFF` : 
                                    ` £${selectedClinic.specialOfferDetails.discountValue} OFF`}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Patient Information */}
                    {patientInfo && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-3">Your Information</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Name</p>
                              <p>{patientInfo.fullName}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Email</p>
                              <p>{patientInfo.email}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Phone</p>
                              <p>{patientInfo.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Travel Month</p>
                              <p>{patientInfo.travelMonth || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Departure City</p>
                              <p>{patientInfo.departureCity || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Contact Preference</p>
                              <p className="capitalize">{patientInfo.preferredContactMethod}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500">Dental Records</p>
                            <div className="flex flex-wrap gap-3 mt-1">
                              <Badge variant={patientInfo.hasXrays ? "default" : "outline"}>
                                {patientInfo.hasXrays ? 'Has X-Rays' : 'No X-Rays'}
                              </Badge>
                              <Badge variant={patientInfo.hasCtScan ? "default" : "outline"}>
                                {patientInfo.hasCtScan ? 'Has CT Scan' : 'No CT Scan'}
                              </Badge>
                            </div>
                          </div>
                          
                          {patientInfo.additionalNotes && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-500">Additional Notes</p>
                              <p className="text-sm mt-1">{patientInfo.additionalNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Next Steps */}
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h3 className="font-semibold text-blue-800 mb-2">Next Steps</h3>
                      <ol className="space-y-2">
                        <li className="flex items-start">
                          <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                            <span className="text-xs">1</span>
                          </div>
                          <p className="text-blue-700">Our dental experts will review your treatment plan within 24 hours</p>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                            <span className="text-xs">2</span>
                          </div>
                          <p className="text-blue-700">You will receive a detailed quote from our partner clinics via email</p>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                            <span className="text-xs">3</span>
                          </div>
                          <p className="text-blue-700">A dental advisor will contact you to discuss the options and answer questions</p>
                        </li>
                      </ol>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          variant="outline"
                          onClick={() => setCurrentStep('build-plan')}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Treatment Plan
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={() => setCurrentStep('patient-info')}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Information
                        </Button>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          variant="default"
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Email Quote
                        </Button>
                        
                        <Button 
                          variant="default"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Call to Action */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mb-10">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Ready to Get Started?
                  </h2>
                  
                  <p className="text-blue-100 mb-6">
                    Pay a £200 refundable deposit to secure your consultation and have our concierge team handle all your travel arrangements.
                  </p>
                  
                  {totalGBP > 0 && (
                    <div className="bg-white/10 rounded-lg p-4 mb-6 inline-block">
                      <h3 className="text-lg font-semibold mb-1">Estimated Istanbul Price</h3>
                      <p className="text-2xl font-bold">£{formatCurrency(Math.round(totalGBP * 0.35))}</p>
                      <p className="text-sm text-blue-200">Final price confirmed after dental review, payment only in-person at clinic</p>
                      <p className="text-xs text-blue-200">Hotel stays often included in treatment packages depending on the cost of your treatment.</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button 
                      className="bg-white text-blue-700 hover:bg-blue-50"
                      size="lg"
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pay £200 Deposit & Book Now
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="border-white text-white hover:bg-blue-700"
                      size="lg"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Speak to a Dental Advisor
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* FAQ Section */}
          <FAQSection />
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default YourQuotePage;