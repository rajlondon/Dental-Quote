import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useGlobalAuth } from '@/contexts/GlobalAuthProvider';
import ConsistentPageHeader from '@/components/ConsistentPageHeader';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageFooterActions from '@/components/PageFooterActions';
import {
  MapPin,
  Star,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Sparkles,
  Zap,
  Users,
  Calendar,
  Award,
  Shield,
  Building,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Eye,
  Heart,
  Target,
  User,
  ShieldCheck,
  Tag,
  Package
} from 'lucide-react';
import { QuoteEngine, enhanceClinicData, type QuoteRequest, type EnhancedClinic } from '@/services/quoteEngine';

interface TreatmentItem {
  id: string;
  name: string;
  quantity: number;
  subtotalGBP: number;
  category: string;
}

interface PatientInfo {
  fullName: string;
  email: string;
  phone: string;
  hasXrays: boolean;
  hasCtScan: boolean;
  hasDentalPhotos: boolean;
  preferredContactMethod: 'email' | 'phone' | 'whatsapp';
  travelMonth?: string;
  departureCity?: string;
  additionalNotesForClinic?: string;
}

interface MatchedClinicsPageProps {
  treatmentItems?: TreatmentItem[];
  patientInfo?: PatientInfo;
  totalGBP?: number;
  onSelectClinic?: (clinicId: string) => void;
  onBackToInfo?: () => void;
  onQuoteDownload?: () => void;
  onEmailQuote?: () => void;
}

interface ClinicTreatmentPrice {
  treatmentName: string;
  originalName: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
  category: string;
}

// Fixed clinic data - defined outside component to prevent re-initialization issues
const clinicsData = [
  {
    id: 'maltepe-dental-clinic',
    name: 'Maltepe Dental Clinic',
    tier: 'premium',
    description: 'Premier dental clinic specializing in Hollywood Smile makeovers and cosmetic dentistry with state-of-the-art technology.',
    priceFactor: 0.35,
    ratings: {
      overall: 5.0,
      reviews: 312,
      cleanliness: 5.0,
      staff: 5.0,
      value: 4.8,
      location: 4.7
    },
    location: {
      area: 'Maltepe',
      city: 'Istanbul'
    },
    features: [
      'Hollywood Smile Specialist',
      'Premium Porcelain Veneers',
      'Free Airport Transfer',
      'Luxury Hotel Arrangement',
      'Multilingual Staff',
      'VIP Treatment Options',
      'Digital Smile Design',
      'Advanced 3D Imaging'
    ],
    guarantees: {
      implants: '10 years',
      veneers: '10 years',
      crowns: '10 years',
      fillings: '5 years'
    }
  },
  {
    id: 'dentgroup-istanbul',
    name: 'DentGroup Istanbul',
    tier: 'standard',
    description: 'A well-established clinic offering quality dental treatments including implants and cosmetic dentistry.',
    priceFactor: 0.30,
    ratings: {
      overall: 4.9,
      reviews: 453,
      cleanliness: 4.9,
      staff: 4.9,
      value: 4.8,
      location: 4.8
    },
    location: {
      area: 'Nişantaşı',
      city: 'Istanbul'
    },
    features: [
      'Implant Dentistry',
      'Modern clinic facilities',
      'Airport pickup service',
      'Hotel booking assistance',
      'Multi-language service'
    ],
    guarantees: {
      implants: '7 years',
      veneers: '5 years',
      crowns: '5 years',
      fillings: '2 years'
    }
  },
  {
    id: 'istanbul-dental-care',
    name: 'Istanbul Dental Care',
    tier: 'affordable',
    description: 'Budget-friendly clinic providing essential dental services at very competitive rates.',
    priceFactor: 0.25,
    ratings: {
      overall: 4.7,
      reviews: 243,
      cleanliness: 4.8,
      staff: 4.7,
      value: 4.9,
      location: 4.5
    },
    location: {
      area: 'Şişli',
      city: 'Istanbul'
    },
    features: [
      'Value Veneers',
      'Budget-friendly options',
      'Basic airport transfer',
      'Hotel recommendations',
      'English-speaking staff'
    ],
    guarantees: {
      implants: '5 years',
      veneers: '3 years',
      crowns: '3 years',
      fillings: '1 year'
    }
  }
];

const MatchedClinicsPage: React.FC<MatchedClinicsPageProps> = ({
  treatmentItems = [],
  patientInfo,
  totalGBP = 0,
  onSelectClinic,
  onBackToInfo,
  onQuoteDownload,
  onEmailQuote,
}) => {
  // ALL HOOKS MUST BE CALLED IN THE SAME ORDER EVERY TIME
  const [, setLocation] = useLocation();
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentItem[]>([]);
  const [localTotalGBP, setLocalTotalGBP] = useState<number>(0);
  const [expandedClinics, setExpandedClinics] = useState<{[key: string]: boolean}>({});
  const [isSmartMatchEnabled, setIsSmartMatchEnabled] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('smartMatch') === 'true';
  });
  const [clinics, setClinics] = useState(clinicsData);
  const { toast } = useToast();
  const { user } = useAuth();
  const globalAuth = useGlobalAuth();

  // Initialize data once on mount
  useEffect(() => {
    if (treatmentItems.length > 0) {
      setTreatmentPlan(treatmentItems);
      setLocalTotalGBP(totalGBP || 0);
    } else {
      const savedTreatmentData = localStorage.getItem('treatmentPlanData');
      if (savedTreatmentData) {
        try {
          const parsedData = JSON.parse(savedTreatmentData);
          if (parsedData.treatments && Array.isArray(parsedData.treatments)) {
            setTreatmentPlan(parsedData.treatments);
            setLocalTotalGBP(parsedData.totalGBP || 0);
          }
        } catch (error) {
          console.error('Error parsing treatment data from localStorage:', error);
        }
      }
    }
  }, [treatmentItems.length, totalGBP]);

  // Apply smart matching logic
  useEffect(() => {
    let clinicsList = [...clinicsData];

    if (isSmartMatchEnabled && treatmentPlan.length > 0) {
      const treatmentPlanData = localStorage.getItem('treatmentPlanData');
      if (treatmentPlanData) {
        try {
          const parsedData = JSON.parse(treatmentPlanData);
          if (parsedData.patientPreferences) {
            const quoteRequest: QuoteRequest = {
              id: 'temp-' + Date.now(),
              treatments: treatmentPlan.map(item => item.name),
              patientPreferences: parsedData.patientPreferences
            };

            const enhancedClinics: EnhancedClinic[] = clinicsList.map(clinic => enhanceClinicData({
              ...clinic,
              specialties: getClinicSpecialties(clinic.id)
            }));

            const smartMatched = QuoteEngine.assignBestClinics(quoteRequest, enhancedClinics);
            const smartMatchedIds = new Set(smartMatched.map(c => c.id));

            clinicsList = [
              ...clinicsList.filter(c => smartMatchedIds.has(c.id)),
              ...clinicsList.filter(c => !smartMatchedIds.has(c.id))
            ];

            console.log('Smart matching applied:', {
              preferences: parsedData.patientPreferences,
              matchedClinics: smartMatched.length,
              topMatch: smartMatched[0]?.name
            });
          }
        } catch (error) {
          console.error('Error applying smart matching:', error);
        }
      }
    }

    setClinics(clinicsList);
  }, [isSmartMatchEnabled, treatmentPlan.length]);

  // Use either props or localStorage data
  const activeTreatmentPlan = treatmentItems.length > 0 ? treatmentItems : treatmentPlan;
  const activeTotalGBP = totalGBP || localTotalGBP;

  // Check for promo code filtering and package data
  const promoCodeClinicId = sessionStorage.getItem('pendingPromoCodeClinicId');
  const pendingPackageData = sessionStorage.getItem('pendingPackageData');
  let packageData = null;

  if (pendingPackageData) {
    try {
      packageData = JSON.parse(pendingPackageData);
      console.log('📦 Package data found:', packageData);
    } catch (error) {
      console.error('Error parsing package data:', error);
    }
  }

  console.log('🔍 Promo code clinic ID from session:', promoCodeClinicId);
  console.log('🏥 Available clinics:', clinicsData.map(c => ({ id: c.id, name: c.name })));

  // Filter clinics based on promo code or show all
  const filteredClinics = promoCodeClinicId 
    ? clinicsData.filter(clinic => clinic.id === promoCodeClinicId)
    : clinicsData;

  console.log('✅ Filtered clinics:', filteredClinics.map(c => ({ id: c.id, name: c.name })));

  // If no clinic matches the promo code, show all clinics but log the issue
  if (promoCodeClinicId && filteredClinics.length === 0) {
    console.warn('⚠️ No clinic found for promo code clinic ID:', promoCodeClinicId);
    console.log('🔄 Falling back to all clinics');
  }

  // FIXED: Always use filtered clinics when promo code is present
  const clinicsToDisplay = promoCodeClinicId && filteredClinics.length > 0 ? filteredClinics : clinicsData;

  const getClinicPricing = (clinicId: string, treatments: TreatmentItem[]) => {
    const clinic = clinicsToDisplay.find(c => c.id === clinicId);
    const priceFactor = clinic?.priceFactor || 0.35;

    // If we have package data and this is the package clinic, use package pricing
    if (packageData && promoCodeClinicId === clinicId) {
      const clinicTreatments: ClinicTreatmentPrice[] = treatments.map(treatment => {
        const ukPricePerUnit = treatment.subtotalGBP / treatment.quantity;
        const clinicPricePerUnit = Math.round(ukPricePerUnit * priceFactor);

        return {
          treatmentName: treatment.name,
          originalName: treatment.name,
          quantity: treatment.quantity,
          pricePerUnit: clinicPricePerUnit,
          subtotal: clinicPricePerUnit * treatment.quantity,
          category: treatment.category
        };
      });

      // Calculate luxury family vacation value comparison
      const ukPrivateDental = 5715;
      const ukFamilyVacation = 4000; // Average of £3,000-5,000 range
      const ukTransfersCoordination = 500;
      const ukTotalEquivalent = ukPrivateDental + ukFamilyVacation + ukTransfersCoordination;

      return {
        clinicTreatments,
        totalPrice: packageData.packagePrice || packageData.totalPrice,
        isPackage: true,
        packageName: packageData.name,
        packageSavings: ukTotalEquivalent - (packageData.packagePrice || packageData.totalPrice),
        originalPrice: ukTotalEquivalent
      };
    }

    // Regular treatment pricing
    const clinicTreatments: ClinicTreatmentPrice[] = treatments.map(treatment => {
      const ukPricePerUnit = treatment.subtotalGBP / treatment.quantity;
      const clinicPricePerUnit = Math.round(ukPricePerUnit * priceFactor);

      return {
        treatmentName: treatment.name,
        originalName: treatment.name,
        quantity: treatment.quantity,
        pricePerUnit: clinicPricePerUnit,
        subtotal: clinicPricePerUnit * treatment.quantity,
        category: treatment.category
      };
    });

    const totalPrice = clinicTreatments.reduce((sum, item) => sum + item.subtotal, 0);
    return { clinicTreatments, totalPrice, isPackage: false };
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'premium':
        return { label: 'Premium', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'standard':
        return { label: 'Standard', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'affordable':
        return { label: 'Affordable', color: 'bg-green-50 text-green-700 border-green-200' };
      default:
        return { label: 'Standard', color: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const toggleClinicExpansion = (clinicId: string) => {
    setExpandedClinics(prev => ({
      ...prev,
      [clinicId]: !prev[clinicId]
    }));
  };

  const downloadPdf = (clinicId: string) => {
    try {
      const clinic = clinicsToDisplay.find(c => c.id === clinicId);
      if (!clinic) return;

      const { clinicTreatments, totalPrice } = getClinicPricing(clinicId, activeTreatmentPlan);

      localStorage.setItem('selectedClinicId', clinicId);
      localStorage.setItem('selectedClinicData', JSON.stringify({
        name: clinic.name,
        treatments: clinicTreatments,
        totalPrice: totalPrice
      }));

      if (onQuoteDownload) {
        onQuoteDownload();
        return;
      }

      const quoteData = {
        items: activeTreatmentPlan.map(item => ({
          treatment: item.name,
          priceGBP: item.subtotalGBP / item.quantity,
          priceUSD: Math.round((item.subtotalGBP / item.quantity) * 1.25),
          quantity: item.quantity,
          subtotalGBP: item.subtotalGBP,
          subtotalUSD: Math.round(item.subtotalGBP * 1.25),
          guarantee: "2-5 years"
        })),
        totalGBP: activeTotalGBP,
        totalUSD: Math.round(activeTotalGBP * 1.25),
        patientName: patientInfo?.fullName || "",
        patientEmail: patientInfo?.email || "",
        patientPhone: patientInfo?.phone || "",
        travelMonth: patientInfo?.travelMonth || "year-round",
        departureCity: patientInfo?.departureCity || "UK",
        clinics: [
          {
            name: clinic.name,
            priceGBP: totalPrice,
            extras: clinic.features?.slice(0, 3).join(", ") || "",
            location: `${clinic.location.area}, ${clinic.location.city}`,
            guarantee: clinic.guarantees?.implants || "5 years",
            rating: clinic.ratings?.overall.toString() || "4.8"
          }
        ],
        selectedClinicIndex: 0
      };

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/jspdf-quote-v2';
      form.target = '_blank';

      const dataInput = document.createElement('input');
      dataInput.type = 'hidden';
      dataInput.name = 'quoteData';
      dataInput.value = JSON.stringify(quoteData);
      form.appendChild(dataInput);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      toast({
        title: "Download Started",
        description: "Your quote PDF will download shortly.",
      });
    } catch (error) {
      console.error('Error in downloadPdf:', error);
      toast({
        title: "Download Failed",
        description: "There was an error preparing your PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Helper function to get clinic specialties
  const getClinicSpecialties = (clinicId: string): string[] => {
    const specialtyMap: Record<string, string[]> = {
      'istanbul-dental-care': ['General Dentistry', 'Cosmetic Dentistry', 'Implant Dentistry'],
      'dentgroup-istanbul': ['Implant Dentistry', 'Cosmetic Dentistry', 'Orthodontics'],
      'maltepe-dental-clinic': ['Implant Dentistry', 'Cosmetic Dentistry', 'Oral Surgery', 'Full Mouth Reconstruction'],
      'dentakay-clinic': ['Cosmetic Dentistry', 'Implant Dentistry', 'Orthodontics', 'Full Mouth Reconstruction'],
      'crown-dental': ['Cosmetic Dentistry', 'General Dentistry', 'Implant Dentistry']
    };
    return specialtyMap[clinicId] || ['General Dentistry'];
  };

  // Calculate UK total for comparison
  const ukTotal = activeTreatmentPlan.reduce((sum, item) => sum + item.subtotalGBP, 0);

  if (!activeTreatmentPlan.length) {
    return (
      <>
        <ConsistentPageHeader
          title="Matched Clinics"
          subtitle="Compare personalized quotes from verified Turkish dental clinics"
          showBackButton={true}
          backButtonText="Back"
          onBack={() => setLocation('/your-quote')}
        />
        <div className="container mx-auto py-10 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">No Treatment Plan Available</h1>
          <p className="mb-6">Please create a treatment plan first to view matched clinics.</p>
          <Button onClick={() => setLocation('/your-quote')}>Return to Quote</Button>
        </div>
      </>
    );
  }

  const treatmentPlanData = JSON.parse(localStorage.getItem('treatmentPlanData') || '{}');

  return (
    <>
      <ConsistentPageHeader
        title="Matched Clinics"
        subtitle="Compare personalized quotes from verified Turkish dental clinics"
        showBackButton={true}
        backButtonText="Back"
        onBack={() => setLocation('/your-quote')}
        showLocationInfo={true}
        location="Istanbul, Turkey"
        travelDate={patientInfo?.travelMonth ? `${patientInfo.travelMonth} 2025` : undefined}
      />

      <main>
        <div className="container mx-auto py-8 px-4">
          {/* Promo code filtering indicator */}
          {promoCodeClinicId && (
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Tag className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">Special Offer Applied</h3>
                      <p className="text-sm text-green-600">
                        Showing clinic associated with your selected promo code or package
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Features highlight bar */}
          <div className="mb-8 bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <Award className="h-4 w-4 text-blue-500 mr-2" />
                <span>All clinics verified & accredited</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-green-500 mr-2" />
                <span>Treatment guarantees included</span>
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-red-500 mr-2" />
                <span>English-speaking staff</span>
              </div>
            </div>
          </div>

          {/* Treatment Summary */}
          <div className="bg-gray-50 border rounded-lg p-4 mb-6">
            <h2 className="font-semibold mb-3">Your Treatment Plan Summary</h2>
            <div className="space-y-1 mb-3">
              {activeTreatmentPlan.map((treatment) => (
                <div key={treatment.id} className="flex justify-between">
                  <span className="text-gray-700">
                    {treatment.name} {treatment.quantity > 1 && `x${treatment.quantity}`}
                  </span>
                  <span className="font-medium">£{treatment.subtotalGBP}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold">
              <span>UK Estimated Price:</span>
              <span>£{Math.round(ukTotal)}</span>
            </div>
          </div>

          {/* Smart Matching Status */}
          {isSmartMatchEnabled && (
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800">Smart Matching Active</h3>
                      <p className="text-sm text-blue-600">
                        Clinics are ranked based on your preferences. Top matches appear first.
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsSmartMatchEnabled(false)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-100"
                      >
                        View All Clinics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Filter Options */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {!isSmartMatchEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-sm bg-blue-50 border-blue-300 text-blue-700"
                  onClick={() => setIsSmartMatchEnabled(true)}
                >
                  <Sparkles className="h-4 w-4" />
                  Enable Smart Matching
                </Button>
              )}
            </div>
          </div>

          {/* Clinic Comparison */}
          <div className="space-y-8">
            {clinicsToDisplay.map((clinic, clinicIndex) => {
              const pricingResult = getClinicPricing(clinic.id, activeTreatmentPlan);
              const { clinicTreatments, totalPrice, isPackage, packageName, packageSavings, originalPrice } = pricingResult;
              const tierInfo = getTierLabel(clinic.tier);
              const isExpanded = expandedClinics[clinic.id] || false;

              return (
                <Card key={clinic.id} className="overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white relative">
                  {/* Popular/Best Value badges */}
                  {clinic.tier === 'premium' && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-amber-500 text-white font-medium px-3 py-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  {Math.round((ukTotal - totalPrice) / ukTotal * 100) > 70 && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-green-500 text-white font-medium px-3 py-1">
                        <Zap className="h-3 w-3 mr-1" />
                        Best Value
                      </Badge>
                    </div>
                  )}

                  {/* Main Card Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">{clinic.name}</h3>
                        <TierBadge tier={clinic.tier} />
                        {isSmartMatchEnabled && clinicIndex < 3 && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Smart Match
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Clinic Info - Left Column */}
                      <div className="lg:col-span-1">
                        <div className="aspect-video rounded-lg overflow-hidden mb-4 relative shadow-md border-2 border-gray-100">
                          <img 
                            src={`/images/clinics/${clinic.id}/exterior.jpg`} 
                            alt={`${clinic.name} Exterior`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = clinic.tier === 'premium' 
                                ? 'https://placehold.co/600x400/fef3c7/92400e?text=Premium+Clinic'
                                : clinic.tier === 'standard'
                                  ? 'https://placehold.co/600x400/e0f2fe/1e40af?text=Standard+Clinic'
                                  : 'https://placehold.co/600x400/f0fdf4/166534?text=Affordable+Clinic';
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="outline" className={`
                              ${clinic.tier === 'premium' 
                                ? 'bg-amber-500/90 text-white border-amber-400' 
                                : clinic.tier === 'standard' 
                                  ? 'bg-blue-500/90 text-white border-blue-400' 
                                  : 'bg-green-500/90 text-white border-green-400'
                              }
                            `}>
                              {tierInfo.label}
                            </Badge>
                          </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-2">{clinic.name}</h2>

                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className={tierInfo.color}>
                            {tierInfo.label}
                          </Badge>

                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${
                                    i < Math.floor(clinic.ratings.overall) 
                                      ? 'text-yellow-500 fill-yellow-500' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm font-medium">{clinic.ratings.overall}</span>
                            <span className="ml-1 text-xs text-gray-500">({clinic.ratings.reviews} reviews)</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-gray-700 mb-4">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                          <span className="font-medium">{clinic.location.area}, {clinic.location.city}</span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {clinic.description}
                        </p>

                        {/* Key Features Preview */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Key Features: </span>
                              <span className="text-gray-600">{clinic.features.slice(0, 2).join(', ')}</span>
                              {clinic.features.length > 2 && <span className="text-gray-500"> +{clinic.features.length - 2} more</span>}
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Warranty: </span>
                              <span className="text-gray-600">Up to {clinic.guarantees.implants}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quote Details - Right Columns */}
                      <div className="lg:col-span-2">
                        <div className="flex flex-col h-full">
                          <h3 className="text-lg font-semibold mb-4">
                            {isPackage ? `${packageName} - Package Quote` : 'Your Personalized Treatment Quote'}
                          </h3>

                          <div className="overflow-hidden mb-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              {isPackage && (
                                <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Package className="h-5 w-5 text-amber-600" />
                                    <span className="font-semibold text-amber-800">Luxury Family Dental Vacation</span>
                                  </div>
                                  <p className="text-sm text-amber-700">
                                    Premium dental care meets luxury family vacation. Includes 5-star accommodation, VIP transfers, personal coordination, and exclusive cultural experiences - designed for discerning families seeking exceptional value.
                                  </p>
                                  <div className="mt-2 text-xs bg-amber-100 p-2 rounded border border-amber-300">
                                    <strong>UK Equivalent Value:</strong> Private dental (£5,715) + Luxury vacation (£4,000) + Transfers & coordination (£500) = <strong>£10,215+</strong>
                                  </div>
                                </div>
                              )}

                              <div className="mb-3">
                                <h4 className="font-medium mb-2">
                                  {isPackage ? 'Package Includes' : 'Treatment Details'}
                                </h4>
                                <div className="space-y-2">
                                  {clinicTreatments.map((treatment, i) => (
                                    <div key={i} className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-700">
                                          {treatment.treatmentName}
                                        </span>
                                        {treatment.quantity > 1 && (
                                          <span className="text-sm text-gray-500 ml-1">
                                            (x{treatment.quantity})
                                          </span>
                                        )}
                                      </div>
                                      {!isPackage && (
                                        <div className="text-right">
                                          <div className="text-sm font-medium">
                                            £{treatment.subtotal}
                                          </div>
                                          {treatment.quantity > 1 && (
                                            <div className="text-xs text-gray-500">
                                              £{treatment.pricePerUnit} each
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}

                                  {isPackage && packageData && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <div className="space-y-1 text-sm text-gray-600">
                                          <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            <span>
                                              {packageData.accommodation?.description || `${packageData.accommodation?.stars || 4}-star hotel accommodation`} 
                                              ({packageData.accommodation?.nights || 5} nights, {packageData.accommodation?.days || 6} days)
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            <span>VIP airport transfers</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            <span>Personal patient coordinator</span>
                                          </div>
                                          {packageData.excursions && packageData.excursions.filter(exc => exc.included).length > 0 && (
                                            <>
                                              <div className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-green-500" />
                                                <span className="font-medium">
                                                  {packageData.excursions.filter(exc => exc.included).length} Complimentary Excursion{packageData.excursions.filter(exc => exc.included).length > 1 ? 's' : ''}:
                                                </span>
                                              </div>
                                              <div className="ml-6 space-y-1">
                                                {packageData.excursions
                                                  .filter(exc => exc.included)
                                                  .map((excursion, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                      <Check className="h-3 w-3 text-green-500" />
                                                      <span>{excursion.name}</span>
                                                    </div>
                                                  ))}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                  )}
                                </div>
                              </div>

                              <div className="border-t pt-4 mb-4">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="text-lg font-semibold text-gray-900">
                                      {isPackage ? 'Package Price:' : 'Total Price:'}
                                    </span>
                                    <div className="text-right">
                                      <span className="text-2xl font-bold text-blue-600">£{totalPrice}</span>
                                      <div className="text-sm text-gray-500 line-through">
                                        {isPackage ? `Regular: £${originalPrice}` : `UK: £${ukTotal}`}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-green-100 border border-green-200 rounded-md p-3">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center">
                                        <Target className="h-4 w-4 text-green-600 mr-2" />
                                        <span className="font-medium text-green-800">You Save:</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-lg font-bold text-green-600">
                                          £{isPackage ? packageSavings : (ukTotal - totalPrice)}
                                        </span>
                                        <div className="text-sm text-green-700">
                                          ({Math.round((isPackage ? packageSavings / originalPrice : (ukTotal - totalPrice) / ukTotal) * 100)}% discount)
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="text-xs text-gray-500">
                                <p>* Final quote will be confirmed after clinic review of your dental records</p>
                                {isPackage ? (
                                  <p>* Package includes all accommodations and experiences as listed</p>
                                ) : (
                                  <p>* Hotel stays often included in treatment packages</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto">
                            <div className="flex flex-wrap gap-3 justify-between items-center">
                              <Button 
                                variant="contained"
                                size="sm"
                                onClick={() => toggleClinicExpansion(clinic.id)}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                              >
                                {isExpanded ? 'Show Less' : 'View Details'}
                                <Eye className="ml-2 h-4 w-4" />
                              </Button>

                              <div className="flex gap-3">
                                <Button 
                                  variant="outline"
                                  size="lg"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                  onClick={() => downloadPdf(clinic.id)}
                                >
                                  <FileCheck className="mr-2 h-4 w-4" />
                                  Download Quote
                                </Button>
                                <Button 
                                  size="lg"
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 shadow-md hover:shadow-lg transition-all duration-200" 
                                  onClick={async () => {
                                    try {
                                      // Store selected clinic for booking
                                      const bookingData = {
                                        clinicId: clinic.id,
                                        clinicName: clinic.name,
                                        selectedTreatments: treatmentItems,
                                        totalCost: totalGBP,
                                        timestamp: new Date().toISOString()
                                      };

                                      localStorage.setItem('selectedBookingData', JSON.stringify(bookingData));

                                      // Check authentication state properly
                                      const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                                      const globalUser = globalAuth.user;
                                      const localUser = user;

                                      console.log('🔐 RESERVE NOW AUTH CHECK:', {
                                        authToken: !!authToken,
                                        globalUser: !!globalUser,
                                        localUser: !!localUser,
                                        globalUserEmail: globalUser?.email,
                                        localUserEmail: localUser?.email
                                      });

                                      // If user is not authenticated, redirect to login
                                      if (!authToken && !globalUser && !localUser) {
                                        console.log('🚫 RESERVE NOW: User not authenticated, redirecting to login');
                                        setLocation('/portal-login?redirect=/patient-portal&action=reserve');
                                        toast({
                                          title: "Authentication Required",
                                          description: "Please sign in to complete your booking.",
                                        });
                                        return;
                                      }

                                      // User is authenticated, proceed to patient portal
                                      console.log('✅ RESERVE NOW: User authenticated, proceeding to patient portal');
                                      setLocation('/patient-portal');

                                      toast({
                                        title: "Clinic Selected",
                                        description: "Proceeding to your patient portal to complete booking.",
                                      });
                                    } catch (error) {
                                      console.error('Error in Reserve Now button:', error);
                                      toast({
                                        title: "Error",
                                        description: "There was an error processing your selection. Please try again.",
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                >
                                  <Heart className="mr-2 h-4 w-4" />
                                  Reserve Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details Section */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-6">
                      <Tabs defaultValue="features" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="features">Features & Tech</TabsTrigger>
                          <TabsTrigger value="ratings">Reviews</TabsTrigger>
                          <TabsTrigger value="guarantees">Guarantees</TabsTrigger>
                          <TabsTrigger value="gallery">Gallery</TabsTrigger>
                        </TabsList>

                        <TabsContent value="features" className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-3 text-gray-800">Clinic Features</h4>
                              <div className="space-y-2">
                                {clinic.features.map((feature, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-sm text-gray-700">{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-3 text-gray-800">Technology & Equipment</h4>
                              <div className="space-y-2">
                                {[
                                  "Digital X-ray Systems",
                                  "3D CBCT Scanner",
                                  "CAD/CAM Technology",
                                  "Intraoral Scanners",
                                  "Laser Dentistry Equipment",
                                  "Digital Smile Design Software"
                                ].map((tech, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <Zap className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span className="text-sm text-gray-700">{tech}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="ratings" className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-3 text-gray-800">Overall Ratings</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Overall Experience</span>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(clinic.ratings.overall) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                      ))}
                                    </div>
                                    <span className="text-sm font-medium">{clinic.ratings.overall}</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Cleanliness</span>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(clinic.ratings.cleanliness) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                      ))}
                                    </div>
                                    <span className="text-sm font-medium">{clinic.ratings.cleanliness}</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Staff Quality</span>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(clinic.ratings.staff) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                      ))}
                                    </div>
                                    <span className="text-sm font-medium">{clinic.ratings.staff}</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Value for Money</span>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(clinic.ratings.value) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                      ))}
                                    </div>
                                    <span className="text-sm font-medium">{clinic.ratings.value}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-3 text-gray-800">Patient Reviews</h4>
                              <div className="text-center py-8 text-gray-500">
                                <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">Patient reviews coming soon</p>
                                <p className="text-xs">Based on {clinic.ratings.reviews} verified reviews</p>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="guarantees" className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-3 text-gray-800">Treatment Warranties</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                    <span className="font-medium">Dental Implants</span>
                                  </div>
                                  <span className="text-sm font-medium text-green-600">{clinic.guarantees.implants}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                    <span className="font-medium">Veneers</span>
                                  </div>
                                  <span className="text-sm font-medium text-green-600">{clinic.guarantees.veneers}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                    <span className="font-medium">Crowns</span>
                                  </div>
                                  <span className="text-sm font-medium text-green-600">{clinic.guarantees.crowns}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                    <span className="font-medium">Fillings</span>
                                  </div>
                                  <span className="text-sm font-medium text-green-600">{clinic.guarantees.fillings}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-3 text-gray-800">What's Covered</h4>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span>Free follow-up appointments during warranty period</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span>Replacement of failed implants at no cost</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span>Repair or replacement of damaged restorations</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span>24/7 emergency support hotline</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="gallery" className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="aspect-video rounded-lg overflow-hidden">
                              <img 
                                src={`/images/clinics/${clinic.id}/exterior.jpg`} 
                                alt="Clinic Exterior"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://placehold.co/400x300/e5e7eb/6b7280?text=Clinic+Exterior';
                                }}
                              />
                            </div>
                            <div className="aspect-video rounded-lg overflow-hidden">
                              <img 
                                src={`/images/clinics/${clinic.id}/interior.jpg`} 
                                alt="Clinic Interior"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://placehold.co/400x300/e5e7eb/6b7280?text=Clinic+Interior';
                                }}
                              />
                            </div>
                            <div className="aspect-video rounded-lg overflow-hidden">
                              <img 
                                src={`/images/clinics/${clinic.id}/team.jpg`} 
                                alt="Medical Team"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://placehold.co/400x300/e5e7eb/6b7280?text=Medical+Team';
                                }}
                              />
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Footer Actions */}
          <PageFooterActions 
            helpMessage="Need help choosing the right clinic? Our dental tourism specialists are here to help."
            whatsappNumber="+905465465050"
          />
        </div>
      </main>
    </>
  );
};

interface TierBadgeProps {
  tier: string;
}

const TierBadge: React.FC<TierBadgeProps> = ({ tier }) => {
  let label: string;
  let color: string;

  switch (tier) {
    case 'premium':
      label = 'Premium';
      color = 'bg-amber-500';
      break;
    case 'standard':
      label = 'Standard';
      color = 'bg-blue-500';
      break;
    case 'affordable':
      label = 'Affordable';
      color = 'bg-green-500';
      break;
    default:
      label = 'Unknown';
      color = 'bg-gray-500';
      break;
  }

  return (
    <Badge className={`${color} text-white`}>{label}</Badge>
  );
};

export default MatchedClinicsPage;