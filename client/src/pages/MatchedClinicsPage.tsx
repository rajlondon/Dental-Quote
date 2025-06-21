import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageFooterActions from '@/components/PageFooterActions';
import {
  ArrowLeft,
  Award,
  Check,
  FileCheck,
  Heart,
  MapPin,
  Shield,
  ShieldCheck,
  Star,
  Target,
  User,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import ConsistentPageHeader from '@/components/ConsistentPageHeader';

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

const MatchedClinicsPage: React.FC<MatchedClinicsPageProps> = ({
  treatmentItems = [],
  patientInfo,
  totalGBP = 0,
  onSelectClinic,
  onBackToInfo,
  onQuoteDownload,
  onEmailQuote,
}) => {
  const [, setLocation] = useLocation();
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const { toast } = useToast();

  // Load treatment data from localStorage if not provided via props
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentItem[]>(treatmentItems);
  const [localTotalGBP, setTotalGBP] = useState<number>(totalGBP || 0);

  useEffect(() => {
    if (treatmentItems.length === 0) {
      const savedTreatmentData = localStorage.getItem('treatmentPlanData');
      if (savedTreatmentData) {
        try {
          const parsedData = JSON.parse(savedTreatmentData);
          if (parsedData.treatments && Array.isArray(parsedData.treatments)) {
            setTreatmentPlan(parsedData.treatments);
            setTotalGBP(parsedData.totalGBP || 0);
          }
        } catch (error) {
          console.error('Error parsing treatment data from localStorage:', error);
        }
      }
    }
  }, [treatmentItems.length]);

  // Use either props or localStorage data
  const activeTreatmentPlan = treatmentItems.length > 0 ? treatmentItems : treatmentPlan;
  const activeTotalGBP = totalGBP || localTotalGBP;

  // Fixed clinic data - consistent structure
  const clinicsData = [
    {
      id: 'dentspa',
      name: 'DentSpa Istanbul',
      tier: 'premium',
      description: 'A premium clinic offering luxury dental services with state-of-the-art technology and experienced international dentists.',
      priceFactor: 0.35,
      ratings: {
        overall: 4.9,
        reviews: 453,
        cleanliness: 4.9,
        staff: 4.9,
        value: 4.8,
        location: 4.8
      },
      location: {
        area: 'Kadıköy',
        city: 'Istanbul'
      },
      features: [
        'Free Airport Transfer',
        'Hotel Arrangement',
        'Multilingual Staff',
        'VIP Treatment Options',
        'Digital X-ray equipment'
      ],
      guarantees: {
        implants: '10 years',
        veneers: '5 years',
        crowns: '5 years',
        fillings: '2 years'
      }
    },
    {
      id: 'beyazada',
      name: 'Beyaz Ada Dental Clinic',
      tier: 'standard',
      description: 'A well-established mid-range clinic offering quality dental treatments at competitive prices.',
      priceFactor: 0.30,
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
        'Modern clinic facilities',
        'Airport pickup service',
        'Hotel booking assistance',
        'Multi-language service'
      ],
      guarantees: {
        implants: '5 years',
        veneers: '3 years',
        crowns: '3 years',
        fillings: '1 year'
      }
    },
    {
      id: 'maltepe',
      name: 'Maltepe Dental Center',
      tier: 'affordable',
      description: 'Budget-friendly clinic providing essential dental services at very competitive rates.',
      priceFactor: 0.25,
      ratings: {
        overall: 4.5,
        reviews: 178,
        cleanliness: 4.6,
        staff: 4.4,
        value: 4.9,
        location: 4.2
      },
      location: {
        area: 'Maltepe',
        city: 'Istanbul'
      },
      features: [
        'Budget-friendly options',
        'Basic airport transfer',
        'Hotel recommendations',
        'English-speaking staff'
      ],
      guarantees: {
        implants: '3 years',
        veneers: '2 years',
        crowns: '2 years',
        fillings: '1 year'
      }
    }
  ];

  // Check for promo code filtering
  const promoCodeClinicId = sessionStorage.getItem('pendingPromoCodeClinicId');

  // Filter clinics based on promo code or show all
  const filteredClinics = promoCodeClinicId 
    ? clinicsData.filter(clinic => clinic.id === promoCodeClinicId)
    : clinicsData;

  const getClinicPricing = (clinicId: string, treatments: TreatmentItem[]) => {
    const clinic = filteredClinics.find(c => c.id === clinicId);
    const priceFactor = clinic?.priceFactor || 0.35;

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
    return { clinicTreatments, totalPrice };
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

  const downloadPdf = (clinicId: string) => {
    try {
      const clinic = filteredClinics.find(c => c.id === clinicId);
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

          {/* Clinic Comparison */}
          <div className="space-y-8">
            {filteredClinics.map((clinic) => {
              const { clinicTreatments, totalPrice } = getClinicPricing(clinic.id, activeTreatmentPlan);
              const tierInfo = getTierLabel(clinic.tier);

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

                  <div className="border-b">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                      {/* Clinic Info */}
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

                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                          {clinic.description}
                        </p>

                        <div className="space-y-4">
                          <div className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-sm font-semibold text-gray-800">Features</span>
                              <div className="text-xs text-gray-600 mt-1 space-y-1">
                                {clinic.features.map((feature, idx) => (
                                  <div key={idx} className="flex items-center">
                                    <Check className="h-3 w-3 text-green-500 mr-1 shrink-0" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Shield className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-sm font-semibold text-gray-800">Treatment Guarantees</span>
                              <div className="text-xs text-gray-600 mt-1">
                                <div>Implants: {clinic.guarantees.implants} warranty</div>
                                <div>Veneers: {clinic.guarantees.veneers} warranty</div>
                                <div>Crowns: {clinic.guarantees.crowns} warranty</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quote Details */}
                      <div className="lg:col-span-2">
                        <div className="flex flex-col h-full">
                          <h3 className="text-lg font-semibold mb-4">Your Personalized Treatment Quote</h3>

                          <div className="overflow-hidden mb-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="mb-3">
                                <h4 className="font-medium mb-2">Treatment Details</h4>
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
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="border-t pt-4 mb-4">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="text-lg font-semibold text-gray-900">Total Price:</span>
                                    <div className="text-right">
                                      <span className="text-2xl font-bold text-blue-600">£{totalPrice}</span>
                                      <div className="text-sm text-gray-500 line-through">UK: £{ukTotal}</div>
                                    </div>
                                  </div>

                                  <div className="bg-green-100 border border-green-200 rounded-md p-3">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center">
                                        <Target className="h-4 w-4 text-green-600 mr-2" />
                                        <span className="font-medium text-green-800">You Save:</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-lg font-bold text-green-600">£{ukTotal - totalPrice}</span>
                                        <div className="text-sm text-green-700">({Math.round((ukTotal - totalPrice) / ukTotal * 100)}% discount)</div>
                                      </div>
                                    </div>
                                  </div>
                              </div>
                              </div>

                              <div className="text-xs text-gray-500">
                                <p>* Final quote will be confirmed after clinic review of your dental records</p>
                                <p>* Hotel stays often included in treatment packages</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto">
                            <div className="flex flex-wrap gap-3 justify-end">
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
                                onClick={() => {
                                  setSelectedClinic(clinic.id);
                                  localStorage.setItem('selectedClinicId', clinic.id);

                                  const bookingData = {
                                    clinicId: clinic.id,
                                    clinicName: clinic.name,
                                    treatments: clinicTreatments,
                                    totalPrice: totalPrice,
                                    treatmentPlan: activeTreatmentPlan,
                                    patientInfo: patientInfo,
                                    timestamp: new Date().toISOString()
                                  };

                                  localStorage.setItem('selectedClinicData', JSON.stringify(bookingData));
                                  localStorage.setItem('pendingBooking', JSON.stringify(bookingData));

                                  if (onSelectClinic) {
                                    onSelectClinic(clinic.id);
                                  }

                                  setLocation('/patient-portal');

                                  toast({
                                    title: "Clinic Selected",
                                    description: "Sign in to your patient portal to complete your booking.",
                                  });
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

export default MatchedClinicsPage;