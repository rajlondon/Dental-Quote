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
  Heart
} from 'lucide-react';
import { getUKPriceForIstanbulTreatment } from '@/services/ukDentalPriceService';
import EditQuoteModal from '@/components/EditQuoteModal';
import TreatmentPlanBuilder from '@/components/TreatmentPlanBuilder';

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

interface PlanTreatmentItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  priceGBP: number;
  priceUSD: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
  specialOffer?: {
    id: string;
    title: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    clinicId: string;
  };
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
  const [specialOffer, setSpecialOffer] = useState<any | null>(() => {
    console.log("Initializing YourQuotePage with URL params:", window.location.search);

    // First check URL parameters
    const offerId = searchParams.get('specialOffer');
    console.log("Special offer ID from URL:", offerId);

    if (offerId) {
      const offerData = {
        id: offerId,
        title: searchParams.get('offerTitle') || 'Special Offer',
        clinicId: searchParams.get('offerClinic') || '',
        discountValue: parseInt(searchParams.get('offerDiscount') || '0'),
        discountType: (searchParams.get('offerDiscountType') || 'percentage') as 'percentage' | 'fixed_amount',
        applicableTreatment: searchParams.get('treatment') || 'Dental Implants'
      };

      sessionStorage.setItem('activeSpecialOffer', JSON.stringify(offerData));
      return offerData;
    }

    // Check sessionStorage
    const storedOffer = sessionStorage.getItem('activeSpecialOffer');
    if (storedOffer) {
      try {
        return JSON.parse(storedOffer);
      } catch (error) {
        console.error("Error parsing special offer from sessionStorage:", error);
      }
    }

    console.log("No special offer found in URL or sessionStorage");
    return null;
  });

  // Clinics state
  const [clinics, setClinics] = useState<ClinicInfo[]>(() => {
    let clinicsList = [...CLINIC_DATA];

    if (specialOffer && specialOffer.clinicId) {
      clinicsList = clinicsList.sort((a, b) => {
        if (a.id === specialOffer.clinicId) return -1;
        if (b.id === specialOffer.clinicId) return 1;
        if (a.tier === 'premium' && b.tier !== 'premium') return -1;
        if (a.tier !== 'premium' && b.tier === 'premium') return 1;
        return a.priceGBP - b.priceGBP;
      });

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
    }

    return clinicsList;
  });

  // Treatment Plan Builder State - Start with empty treatment list
  const [treatmentItems, setTreatmentItems] = useState<PlanTreatmentItem[]>([]);

  // Edit Quote Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Function to handle treatment plan changes
  const handleTreatmentPlanChange = (items: PlanTreatmentItem[]) => {
    setTreatmentItems(items);
  };

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
  const totalGBP = treatmentItems.reduce((sum, item) => sum + item.subtotalGBP, 0);

  // Format currency with commas
  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Estimated total for cost comparison
  const estimatedTotal = treatmentItems.reduce((sum, item) => sum + item.subtotalGBP, 0);

  useEffect(() => {
    document.title = "Build Your Dental Treatment Quote | MyDentalFly";

    if (specialOffer && searchParams.get('specialOffer')) {
      sessionStorage.setItem('activeSpecialOffer', JSON.stringify(specialOffer));
    }

    const hasShownWelcome = sessionStorage.getItem('welcomeToastShown');
    if (!hasShownWelcome) {
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
      sessionStorage.setItem('welcomeToastShown', 'true');
    }
  }, [specialOffer]);

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

          {/* Quote Parameters Summary */}
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
                      <div className="text-xs text-gray-500 mt-1">
                        Hotel stays often included in treatment packages depending on the cost of your treatment.
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Cost Comparison Summary */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Cost Comparison Summary</CardTitle>
                <CardDescription>See how much you could save compared to UK dental treatments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estimated UK Cost</p>
                    <p className="font-medium">£{Math.round(estimatedTotal * 2.5).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estimated Istanbul Price</p>
                    <p className="font-medium">£{Math.round(estimatedTotal).toLocaleString()}</p>
                    <p className="text-sm text-green-500">Save up to {Math.round(((estimatedTotal * 2.5 - estimatedTotal) / (estimatedTotal * 2.5)) * 100)}% compared to UK</p>
                  </div>
                </div>
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

          {/* Treatment Plan Builder */}
          <div className="mb-8">
            <TreatmentPlanBuilder 
              initialTreatments={treatmentItems}
              onTreatmentsChange={handleTreatmentPlanChange}
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default YourQuotePage;