import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'wouter';

// Custom hook to parse search params from the URL
const useSearchParams = () => {
  const getParams = () => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  };
  
  const [searchParams] = useState(getParams());
  
  return [searchParams];
};
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useQuoteFlow, useInitializeQuoteFlow } from '@/contexts/QuoteFlowContext';
import { useSpecialOfferTracking } from '@/hooks/use-special-offer-tracking';
import ActiveOfferBadge from '@/components/specialOffers/ActiveOfferBadge';
import { usePromoStore } from '@/features/promo/usePromoStore';
import { usePromoBySlug } from '@/features/promo/usePromoApi';
import { useSpecialOfferDetection } from '@/hooks/use-special-offer-detection';
import { usePackageDetection } from '@/hooks/use-package-detection';
import { DiscountType, PromoType } from '@shared/schema';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Calendar, Check, CheckCircle, Info, Loader2, MapPin, Package, Phone, User, X } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import QuoteFormFooter from '@/components/QuoteFormFooter';
import PromoRibbon from '@/pages/QuoteBuilder/PromoRibbon';
import ClinicCard from '@/components/ClinicCard';
import QuoteTreatmentSelectionPanel from '@/components/QuoteTreatmentSelectionPanel';
import TreatmentPlanCard from '@/components/TreatmentPlanCard';
import EnhancedTreatmentPlanBuilder from '@/components/EnhancedTreatmentPlanBuilder';
import Confetti from '@/components/animations/Confetti';
import FreeConsultationWidget from '@/components/free-consultation/FreeConsultationWidget';
import { useTransportCostEstimator } from '@/hooks/use-transport-cost-estimator';

// Define interfaces
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

interface TreatmentItem {
  treatmentType: string;
  name: string;
  quantity: number;
  priceGBP: number;
  priceUSD: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
  isBonus?: boolean;
  isLocked?: boolean;
  isSpecialOffer?: boolean;
  packageId?: string;
  specialOffer?: {
    id: string;
    title: string;
    discountType: string;
    discountValue: number;
    clinicId: string;
  };
}

interface SpecialOfferParams {
  id: string;
  title: string;
  clinicId: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed_amount';
  applicableTreatment: string;
}

// WhatsApp button component
const WhatsAppButton = ({ clinic }: { clinic: ClinicInfo }) => {
  const { t } = useTranslation();
  const whatsappMessage = encodeURIComponent(
    `Hello! I'm interested in dental treatment at ${clinic.name}. Can you provide more information?`
  );
  const whatsappNumber = "+90123456789"; // Replace with actual number

  return (
    <a 
      href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
    >
      <span>{t('contact.whatsapp')}</span>
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.6 6.32C16.27 4.985 14.448 4.24 12.525 4.24C8.59 4.24 5.395 7.435 5.395 11.37C5.395 12.619 5.74 13.839 6.395 14.895L5.34 18.84L9.37 17.805C10.388 18.405 11.443 18.72 12.525 18.72C16.46 18.72 19.655 15.525 19.655 11.59C19.655 9.667 18.91 7.845 17.6 6.535V6.32ZM12.525 17.56C11.555 17.56 10.598 17.245 9.765 16.735L9.535 16.6L7.121 17.215L7.75 14.85L7.6 14.62C6.98 13.731 6.642 12.625 6.642 11.59C6.642 8.115 9.265 5.28 12.525 5.28C14.133 5.28 15.635 5.91 16.752 7.025C17.87 8.14 18.5 9.645 18.5 11.37C18.5 14.845 15.877 17.56 12.525 17.56ZM15.407 13.075C15.2 12.985 14.122 12.46 13.942 12.39C13.765 12.32 13.63 12.285 13.5 12.495C13.368 12.705 12.965 13.185 12.84 13.32C12.7 13.455 12.602 13.502 12.395 13.365C12.188 13.275 11.495 13.02 10.68 12.305C10.047 11.755 9.627 11.065 9.485 10.855C9.35 10.645 9.467 10.525 9.582 10.41C9.685 10.305 9.8 10.15 9.917 10.015C10.035 9.88 10.068 9.79 10.137 9.655C10.205 9.52 10.175 9.385 10.123 9.295C10.07 9.205 9.645 8.127 9.477 7.707C9.35 7.27 9.142 7.35 9.01 7.35C8.875 7.35 8.742 7.325 8.61 7.325C8.478 7.325 8.267 7.376 8.09 7.586C7.915 7.796 7.354 8.322 7.354 9.399C7.354 10.477 8.142 11.5 8.26 11.67C8.377 11.805 9.627 13.705 11.5 14.63C11.94 14.827 12.282 14.942 12.547 15.027C12.993 15.172 13.395 15.152 13.725 15.099C14.09 15.039 14.96 14.572 15.143 14.072C15.323 13.572 15.323 13.152 15.257 13.057C15.19 12.962 15.077 12.937 14.87 12.827L15.407 13.075Z"/>
      </svg>
    </a>
  );
};

// Main component for the Quote Page
const YourQuotePage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { 
    source, setSource,
    offerId, setOfferId,
    packageId, setPackageId,
    clinicId, setClinicId,
    isSpecialOfferFlow, isPackageFlow
  } = useQuoteFlow();
  
  // Extract promo features from the Zustand store (all at once to prevent conditional hooks)
  const { 
    activePromoSlug,
    setPromoSlug,
    promoToken,
    setPromoToken,
    promoType,
    setPromoType,
    hasActivePromo,
    trackedPromo
  } = usePromoStore();
  
  // Use our new hooks for special offers and packages
  const { 
    specialOffer, 
    setSpecialOffer,
    initFromSearchParams,
    clearSpecialOffer,
    applySpecialOfferToTreatments,
    getDiscountedLines,
    hasActiveOffer,
    isEligibleForDiscount,
    applyDiscount
  } = useSpecialOfferDetection();
  
  // Use packageDetection hook
  const { 
    packageDetails,
    setPackageDetails,
    hasActivePackage
  } = usePackageDetection();
  
  // Fetch promo data by slug if needed - must be called unconditionally
  const { data: promoData, isLoading: isLoadingPromo } = usePromoBySlug(activePromoSlug);
  
  // Initialize tracking for special offers
  const { trackOffer } = useSpecialOfferTracking();
  
  // Track the selected clinic (to show in the clinic panel when scrolling down)
  const [selectedClinic, setSelectedClinic] = useState<ClinicInfo | null>(null);
  
  // Track the selected clinics (3 clinics to be shown and compared)
  const [selectedClinics, setSelectedClinics] = useState<ClinicInfo[]>([]);
  
  // Track the patient information
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    fullName: '',
    email: '',
    phone: '',
    travelMonth: '',
    departureCity: '',
    hasXrays: false,
    hasCtScan: false,
    additionalNotes: '',
    preferredContactMethod: 'email'
  });
  
  // Track quote parameters
  const [quoteParams, setQuoteParams] = useState<QuoteParams>({
    treatment: searchParams.get('treatment') || 'Dental Implants',
    travelMonth: searchParams.get('travelMonth') || '',
    budget: searchParams.get('budget') || 'all'
  });
  
  // Special states for form handling
  const [formStep, setFormStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  
  // Treatment plan states
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentItem[]>([]);
  
  // Handle saving quote parameters
  const handleSaveQuoteParams = (params: QuoteParams) => {
    setQuoteParams(params);
    
    // Also update the URL with the new parameters
    const currentParams = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        currentParams.set(key, value);
      } else {
        currentParams.delete(key);
      }
    });
    
    // Update page URL with the new parameters
    const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
    
    toast({
      title: "Parameters Updated",
      description: "Your quote preferences have been saved."
    });
  };
  
  // Initialize quote flow parameters from URL and session storage
  useEffect(() => {
    // Process URL parameters for any potential context variables
    console.log("Initializing quote flow from URL and session storage");
    
    // Check for promo data and update context if available
    if (promoData && activePromoSlug) {
      console.log("Promo data available:", promoData);
      
      // Update context with promo data
      if (source !== 'promo' && setSource) {
        setSource('promo');
        
        // Notify user that a promo has been applied
        toast({
          title: `${promoData.name || promoData.title} Applied`,
          description: `This promotion gives you ${promoData.discount_value || promoData.discountValue}% off ${promoData.applicable_treatments?.[0] || promoData.applicableTreatment || 'selected treatments'}.`,
          variant: "default"
        });
      }
    }
    
    // Update the document title based on parameters
    document.title = `Quote for ${quoteParams.treatment} | MyDentalFly`;
    
    // Track special offer view if present
    if (specialOffer && !isLoadingPromo && trackOffer) {
      trackOffer(specialOffer.id, 'view');
    }
    
  }, [
    promoData, 
    activePromoSlug, 
    source, 
    setSource, 
    quoteParams.treatment,
    specialOffer,
    isLoadingPromo,
    trackOffer,
    toast
  ]);
  
  // Create treatment items based on context flow
  const createInitialTreatmentItem = useCallback(() => {
    // If special offer is active, create a special offer treatment
    if (specialOffer) {
      console.log("Creating special offer treatment item");
      return {
        treatmentType: 'special-offer',
        name: `${specialOffer.title} - Special Offer`,
        quantity: 1,
        priceGBP: 0,
        priceUSD: 0,
        subtotalGBP: 0,
        subtotalUSD: 0,
        guarantee: '30-day',
        isSpecialOffer: true,
        specialOffer: {
          id: specialOffer.id,
          title: specialOffer.title,
          discountType: specialOffer.discountType,
          discountValue: specialOffer.discountValue,
          clinicId: specialOffer.clinicId || ''
        }
      };
    }
    
    // If package is active, create a package treatment
    if (packageDetails) {
      console.log("Creating package treatment item");
      return {
        treatmentType: 'treatment-package',
        name: packageDetails.title,
        quantity: 1,
        priceGBP: 0, // Will be populated from API
        priceUSD: 0, // Will be populated from API
        subtotalGBP: 0,
        subtotalUSD: 0,
        guarantee: '30-day',
        packageId: packageDetails.id
      };
    }
    
    // If promo token is active, create a promo treatment
    if (promoToken && promoType) {
      console.log("Creating promo token treatment item");
      return {
        treatmentType: 'promo',
        name: `${promoType === PromoType.DISCOUNT ? 'Discount' : 'Bonus'} Promo`,
        quantity: 1,
        priceGBP: 0,
        priceUSD: 0,
        subtotalGBP: 0,
        subtotalUSD: 0,
        guarantee: '30-day'
      };
    }
    
    // Default treatment item based on query parameters
    console.log("Creating standard treatment item");
    return {
      treatmentType: 'standard',
      name: quoteParams.treatment || 'Dental Implants',
      quantity: 1,
      priceGBP: 0, // Will be populated from API
      priceUSD: 0, // Will be populated from API
      subtotalGBP: 0,
      subtotalUSD: 0,
      guarantee: '30-day'
    };
  }, [specialOffer, packageDetails, promoToken, promoType, quoteParams.treatment]);
  
  // Initialize treatment plan on component mount
  useEffect(() => {
    const initialTreatment = createInitialTreatmentItem();
    console.log("Setting initial treatment plan:", initialTreatment);
    setTreatmentPlan([initialTreatment]);
  }, [createInitialTreatmentItem]);
  
  // Handle clearing promo data
  const handleClearPromo = () => {
    // Clear session storage
    sessionStorage.removeItem('activePromoSlug');
    sessionStorage.removeItem('activeSpecialOffer');
    
    // Clear state
    if (setPromoSlug) setPromoSlug(null);
    if (setSource && source === 'promo') setSource('standard');
    
    // Clear token if any
    if (setPromoToken) setPromoToken(null);
    if (setPromoType) setPromoType(null);
    
    // Notify user
    toast({
      title: "Promo Cleared",
      description: "The promotional offer has been removed from your quote."
    });
    
    // Reset treatment plan
    const standardTreatment = {
      treatmentType: 'standard',
      name: quoteParams.treatment || 'Dental Implants',
      quantity: 1,
      priceGBP: 0,
      priceUSD: 0,
      subtotalGBP: 0,
      subtotalUSD: 0,
      guarantee: '30-day'
    };
    
    setTreatmentPlan([standardTreatment]);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Submit logic here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      toast({
        title: "Quote Generated",
        description: "Your dental quote has been generated successfully!",
        variant: "default"
      });
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      // Navigate to results page
      setLocation('/results');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was an error generating your quote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setPatientInfo(prev => ({
        ...prev,
        travelMonth: format(date, 'MMMM yyyy')
      }));
      setCalendarOpen(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Promo ribbon - shown conditionally based on active promo */}
        {(activePromoSlug || specialOffer || promoToken) && (
          <PromoRibbon 
            title={
              promoData?.name || 
              specialOffer?.title || 
              (promoToken ? `${promoType === PromoType.DISCOUNT ? 'Discount' : 'Bonus'} Promo` : null) || 
              'Special Offer'
            }
            description={
              promoData?.description || 
              (specialOffer ? 
                `${specialOffer.discountValue}% off ${specialOffer.applicableTreatment || 'selected treatments'}` : 
                'Limited time offer for your dental treatment')
            }
            onClear={handleClearPromo}
          />
        )}
        
        <div className="container px-4 py-6 mx-auto md:py-8 lg:py-12">
          <div className="mb-6 space-y-2">
            <h1 className="text-3xl font-bold md:text-4xl">Get Your Personalized Dental Quote</h1>
            <p className="text-lg text-muted-foreground">
              Compare prices from top clinics in Istanbul and find the perfect match for your dental treatment.
            </p>
          </div>
          
          <Tabs defaultValue="treatment" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="treatment">Treatment</TabsTrigger>
              <TabsTrigger value="clinic">Clinic Selection</TabsTrigger>
              <TabsTrigger value="contact">Your Details</TabsTrigger>
            </TabsList>
            
            {/* Treatment Tab */}
            <TabsContent value="treatment" className="px-1 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Treatment</CardTitle>
                  <CardDescription>
                    Tell us what dental treatment you're interested in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Treatment selection panel */}
                  <QuoteTreatmentSelectionPanel 
                    initialParams={quoteParams}
                    onSave={handleSaveQuoteParams}
                    className="mb-6"
                  />
                  
                  {/* Treatment plan builder */}
                  <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold">Your Treatment Plan</h3>
                    <EnhancedTreatmentPlanBuilder 
                      treatments={treatmentPlan}
                      setTreatments={setTreatmentPlan}
                      specialOffer={specialOffer}
                      promoData={promoData}
                      isSpecialOfferFlow={isSpecialOfferFlow}
                      isPromoTokenFlow={!!promoToken}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Clinic Selection Tab */}
            <TabsContent value="clinic" className="px-1 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Compare Clinics</CardTitle>
                  <CardDescription>
                    Choose up to 3 clinics to compare treatment options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Clinic selection will be implemented here */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="overflow-hidden">
                      <CardHeader className="p-0">
                        <AspectRatio ratio={16/9}>
                          <img 
                            src="/images/clinics/premium-clinic-1.jpg" 
                            alt="Premium Clinic" 
                            className="object-cover w-full h-full"
                          />
                        </AspectRatio>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">Premium Dental</h3>
                          <Badge>Premium</Badge>
                        </div>
                        <div className="flex items-center mb-2 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>Istanbul, Turkey</span>
                        </div>
                        <div className="flex items-center mb-4 text-sm">
                          <span className="flex items-center mr-2">
                            <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            4.9
                          </span>
                          <span>(120 reviews)</span>
                        </div>
                        <p className="mb-4 text-sm text-muted-foreground">Premium quality dental care with state-of-the-art facilities and internationally trained doctors.</p>
                        <div className="flex justify-between">
                          <Button>Select Clinic</Button>
                          <WhatsAppButton clinic={{ 
                            id: '1', 
                            name: 'Premium Dental', 
                            tier: 'premium',
                            priceGBP: 1200,
                            priceUSD: 1500,
                            location: 'Istanbul, Turkey',
                            rating: 4.9,
                            reviewCount: 120,
                            guarantee: '5-year',
                            materials: ['Premium'],
                            conciergeType: 'mydentalfly',
                            features: ['Airport Transfer', 'Hotel Booking'],
                            description: 'Premium quality dental care with state-of-the-art facilities.',
                            packages: {
                              hotel: true,
                              transfers: true
                            },
                            images: []
                          }} />
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* More clinic cards would be rendered here */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Contact Tab */}
            <TabsContent value="contact" className="px-1 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Contact Information</CardTitle>
                  <CardDescription>
                    Fill in your details to receive your personalized quote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          placeholder="Enter your full name" 
                          value={patientInfo.fullName}
                          onChange={(e) => setPatientInfo(prev => ({ ...prev, fullName: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="Enter your email" 
                          value={patientInfo.email}
                          onChange={(e) => setPatientInfo(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          placeholder="Enter your phone number" 
                          value={patientInfo.phone}
                          onChange={(e) => setPatientInfo(prev => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="travelMonth">Preferred Travel Month</Label>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="justify-start w-full text-left"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              {selectedDate ? (
                                format(selectedDate, 'MMMM yyyy')
                              ) : (
                                <span>Select month</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleDateSelect}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="departureCity">Departure City/Country</Label>
                      <Input 
                        id="departureCity" 
                        placeholder="Where will you travel from?" 
                        value={patientInfo.departureCity || ''}
                        onChange={(e) => setPatientInfo(prev => ({ ...prev, departureCity: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Do you have dental records?</Label>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="hasXrays" 
                            checked={patientInfo.hasXrays}
                            onCheckedChange={(checked) => 
                              setPatientInfo(prev => ({ ...prev, hasXrays: checked === true }))
                            }
                          />
                          <Label htmlFor="hasXrays" className="font-normal">I have dental X-rays</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="hasCtScan" 
                            checked={patientInfo.hasCtScan}
                            onCheckedChange={(checked) => 
                              setPatientInfo(prev => ({ ...prev, hasCtScan: checked === true }))
                            }
                          />
                          <Label htmlFor="hasCtScan" className="font-normal">I have a CT scan</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="additionalNotes">Additional Information</Label>
                      <textarea 
                        id="additionalNotes" 
                        className="w-full h-32 p-2 border rounded-md"
                        placeholder="Please provide any additional information about your dental needs..."
                        value={patientInfo.additionalNotes}
                        onChange={(e) => setPatientInfo(prev => ({ ...prev, additionalNotes: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Preferred Contact Method</Label>
                      <RadioGroup 
                        value={patientInfo.preferredContactMethod}
                        onValueChange={(value) => 
                          setPatientInfo(prev => ({ 
                            ...prev, 
                            preferredContactMethod: value as 'email' | 'whatsapp' 
                          }))
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="email-contact" />
                          <Label htmlFor="email-contact" className="font-normal">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="whatsapp" id="whatsapp-contact" />
                          <Label htmlFor="whatsapp-contact" className="font-normal">WhatsApp</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Get Your Quote"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <FreeConsultationWidget />
      <Footer />
      <ScrollToTop />
      
      <Confetti active={showConfetti} />
    </div>
  );
};

export default YourQuotePage;