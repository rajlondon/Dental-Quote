import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  BadgePercent,
  Check,
  ChevronDown,
  Columns,
  FileCheck,
  Gem,
  Heart,
  HeartPulse,
  Mail,
  MapPin,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  User,
  Zap,
  Tag,
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import { useQuoteFlow } from '@/contexts/QuoteFlowContext';
import { useSpecialOfferTracking } from '@/hooks/use-special-offer-tracking';
import ClientPdfGenerator from '@/components/ClientPdfGenerator';
import ApplicableTreatmentsList from '@/components/specialOffers/ApplicableTreatmentsList';
import SingleClinicCard from '@/components/SingleClinicCard';

// Enhanced special offer interface with all required metadata
interface SpecialOfferDetails {
  id: string;
  title: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  clinicId: string;
  applicableTreatments?: string[];
  applicableTreatment?: string; // For backward compatibility
  description?: string;
  expiryDate?: string;
  termsAndConditions?: string;
}

// Helper function to check if there are applicable treatments in a special offer
const hasApplicableTreatments = (offer: SpecialOfferDetails | undefined): boolean => {
  if (!offer) return false;
  return (
    (offer.applicableTreatments && offer.applicableTreatments.length > 0) || 
    Boolean(offer.applicableTreatment)
  );
};

interface TreatmentItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  priceGBP: number;
  priceUSD?: number;
  subtotalGBP: number;
  subtotalUSD?: number;
  guarantee?: string;
  ukPriceGBP?: number;
  ukPriceUSD?: number;
  isPackage?: boolean;
  packageId?: string;
  specialOffer?: SpecialOfferDetails;
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
  isPackage?: boolean;
  packageId?: string;
  specialOffer?: SpecialOfferDetails;
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
  const [expandedOfferDetails, setExpandedOfferDetails] = useState<string | null>(null);
  const { toast } = useToast();
  const { source, offerId, clinicId, promoToken, isSpecialOfferFlow, isPromoTokenFlow } = useQuoteFlow();
  const { 
    specialOffer, 
    setSpecialOffer, 
    clearSpecialOffer,
    hasActiveOffer
  } = useSpecialOfferTracking();
  
  // Function to handle clinic selection
  const handleSelectClinic = (clinicId: string) => {
    setSelectedClinic(clinicId);
    
    // Store the selection in localStorage for compatibility with existing code
    localStorage.setItem('selectedClinicId', clinicId);
    
    const clinic = clinicsData.find(c => c.id === clinicId);
    if (clinic) {
      const { clinicTreatments, totalPrice } = getClinicPricing(clinicId, treatmentPlan);
      
      localStorage.setItem('selectedClinicData', JSON.stringify({
        name: clinic.name,
        treatments: clinicTreatments,
        totalPrice: totalPrice
      }));
      
      // If a callback is provided, use it
      if (onSelectClinic) {
        onSelectClinic(clinicId);
      } else {
        // Otherwise navigate to the quote summary page
        setLocation('/quote-summary');
      }
    }
  };
  
  // New function to handle direct PDF download
  const downloadPdf = (clinicId: string) => {
    try {
      // Get the clinic data
      const clinic = clinicsData.find(c => c.id === clinicId);
      if (!clinic) return;
      
      const { clinicTreatments, totalPrice } = getClinicPricing(clinicId, treatmentPlan);
      
      // Store in localStorage for compatibility with existing code
      localStorage.setItem('selectedClinicId', clinicId);
      localStorage.setItem('selectedClinicData', JSON.stringify({
        name: clinic?.name,
        treatments: clinicTreatments,
        totalPrice: totalPrice
      }));
      
      // If onQuoteDownload is provided, use that first
      if (onQuoteDownload) {
        onQuoteDownload();
        return;
      }

      // Use the same format as the working JSPDFGenerator component
      const quoteData = {
        items: treatmentPlan.map(item => ({
          treatment: item.name,
          priceGBP: item.subtotalGBP / item.quantity,
          priceUSD: Math.round((item.subtotalGBP / item.quantity) * 1.25), // Rough GBP to USD conversion
          quantity: item.quantity,
          subtotalGBP: item.subtotalGBP,
          subtotalUSD: Math.round(item.subtotalGBP * 1.25), // Rough GBP to USD conversion
          guarantee: "2-5 years"
        })),
        totalGBP: totalGBP,
        totalUSD: Math.round(totalGBP * 1.25), // Rough GBP to USD conversion
        patientName: patientInfo?.fullName || "",
        patientEmail: patientInfo?.email || "",
        patientPhone: patientInfo?.phone || "",
        travelMonth: patientInfo?.travelMonth || "year-round", // Ensure a fallback value
        departureCity: patientInfo?.departureCity || "UK", // Ensure a fallback value
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
        selectedClinicIndex: 0 // First (and only) clinic in the array
      };
      
      toast({
        title: "Generating PDF",
        description: "Preparing your quote PDF...",
      });

      // Create a form to submit directly to the server instead of using AJAX
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/jspdf-quote-v2';
      form.target = '_blank'; // Open in new tab or trigger download
      
      // Add the quote data as hidden fields
      const dataInput = document.createElement('input');
      dataInput.type = 'hidden';
      dataInput.name = 'quoteData';
      dataInput.value = JSON.stringify(quoteData);
      form.appendChild(dataInput);
      
      // Submit the form
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      toast({
        title: "Download Started",
        description: "Your quote PDF is being generated and will download shortly.",
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
  
  // Mock data for clinics
  const treatmentPlan = treatmentItems;
  
  const clinicsData = [
    {
      id: 'dentspa',
      name: 'DentSpa Istanbul',
      tier: 'premium',
      description: 'A premium clinic offering luxury dental services with state-of-the-art technology and experienced international dentists. Includes hotel stay and VIP transfers.',
      priceFactor: 0.4, // 40% of UK price (premium experience)
      ratings: {
        overall: 4.9,
        reviews: 187,
        cleanliness: 5.0,
        staff: 4.9,
        value: 4.8,
        location: 4.7
      },
      location: {
        area: 'Nişantaşı',
        city: 'Istanbul',
        fullAddress: 'Teşvikiye Mahallesi, Nişantaşı, Istanbul'
      },
      features: [
        'Luxury modern facility',
        'VIP airport transfers',
        '5-star hotel accommodation included',
        'Multilingual staff',
        'Digital X-ray equipment',
        'In-house dental lab',
        'Patient lounge with refreshments',
        'Painless dentistry technology'
      ],
      certifications: [
        { name: 'ISO 9001', year: 2023 },
        { name: 'JCI Accredited', year: 2022 }
      ],
      doctors: [
        { name: 'Dr. Ahmet Yılmaz', specialty: 'Implantology', experience: 15 },
        { name: 'Dr. Elif Kaya', specialty: 'Cosmetic Dentistry', experience: 12 },
        { name: 'Dr. Mehmet Demir', specialty: 'Prosthodontics', experience: 10 }
      ],
      paymentOptions: ['Credit Card', 'Bank Transfer', 'Cash'],
      guarantees: {
        implants: '10 years',
        veneers: '5 years',
        crowns: '5 years',
        fillings: '2 years'
      },
      // Specific special offer for DentSpa
      hasSpecialOffer: true,
      specialOffer: {
        id: "dentspa_premium_vip_package",
        title: "VIP Treatment Package",
        discountType: "percentage" as "percentage" | "fixed_amount",
        discountValue: 20,
        clinicId: "dentspa",
        applicableTreatments: ["dental_implant_standard", "dental_crown", "teeth_whitening"],
        description: "Enjoy a 20% discount on implants, crowns, and whitening treatments along with our luxury VIP package including extended hotel stay and premium transfers.",
        expiryDate: "2025-12-31",
        termsAndConditions: "Minimum treatment value £2000. Cannot be combined with other offers."
      }
    },
    // more clinics...
  ];

  // Helper function to get tier label and styling
  const getTierLabel = (tier: string) => {
    const clinic = clinicsData.find(c => c.id === clinicId);
    
    // Get pricing factor based on clinic tier
    switch(tier) {
      case 'premium':
        return {
          label: 'Premium Clinic',
          color: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
        };
      case 'standard':
        return {
          label: 'Standard Clinic',
          color: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
        };
      case 'affordable':
      default:
        return {
          label: 'Affordable Clinic',
          color: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
        };
    }
  };

  // Helper function to get clinic-specific pricing
  const getClinicPricing = (clinicId: string, treatmentItems: TreatmentItem[]) => {
    const clinic = clinicsData.find(c => c.id === clinicId);
    
    if (!clinic) {
      return {
        clinicTreatments: [],
        totalPrice: 0
      };
    }
    
    const clinicTreatments = treatmentItems.map(treatment => {
      // Base price calculation using clinic's price factor
      const basePrice = treatment.subtotalGBP / treatment.quantity;
      let finalPrice = basePrice;
      
      // Apply clinic tier pricing - adjust for different tiers
      switch(clinic.tier) {
        case 'premium':
          finalPrice = basePrice * 0.4; // 40% of UK price for premium
          break;
        case 'standard':
          finalPrice = basePrice * 0.35; // 35% of UK price for standard
          break;
        case 'affordable':
        default:
          finalPrice = basePrice * 0.3; // 30% of UK price for affordable
          break;
      }
      
      // Round to 2 decimal places
      finalPrice = Math.round(finalPrice * 100) / 100;
      
      // Calculate subtotal
      const subtotal = finalPrice * treatment.quantity;
      
      return {
        treatmentName: treatment.name,
        originalName: treatment.name, // For tracking original name
        quantity: treatment.quantity,
        pricePerUnit: finalPrice, 
        subtotal: subtotal,
        category: treatment.category,
        isPackage: treatment.isPackage,
        packageId: treatment.packageId,
        specialOffer: treatment.specialOffer // Pass through any special offer data
      };
    });
    
    // Calculate total price
    const totalPrice = clinicTreatments.reduce((sum, item) => sum + item.subtotal, 0);
    
    return {
      clinicTreatments,
      totalPrice
    };
  };

  // Function to email the quote data
  const emailQuote = (clinicId: string) => {
    try {
      const clinic = clinicsData.find(c => c.id === clinicId);
      if (!clinic) return;
      
      const { clinicTreatments, totalPrice } = getClinicPricing(clinicId, treatmentPlan);
      
      // Store in localStorage for compatibility with existing code
      localStorage.setItem('selectedClinicId', clinicId);
      localStorage.setItem('selectedClinicData', JSON.stringify({
        name: clinic?.name,
        treatments: clinicTreatments,
        totalPrice: totalPrice
      }));
      
      if (onEmailQuote) {
        onEmailQuote();
      } else {
        toast({
          title: "Email Quote",
          description: "This feature will be available soon!",
        });
      }
    } catch (error) {
      console.error('Error in emailQuote:', error);
      toast({
        title: "Email Failed",
        description: "There was an error emailing your quote. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBackToInfo}
          className="mb-4"
        >
          ← Back to Patient Information
        </Button>
        
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Your Matched Clinics</h1>
        <div className="text-gray-600">
          <p>Based on your requirements, we've matched you with the following clinics in Istanbul. Compare your options and select the one that best suits your needs.</p>
        </div>
      </div>
      
      {/* Treatment Plan Summary */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-blue-700 mb-1">Your Treatment Plan</h2>
            <p className="text-sm text-gray-600">Summary of your requested dental treatments</p>
          </div>
          <div className="mt-2 md:mt-0">
            <p className="text-sm text-gray-600">UK Estimated Value: <span className="font-semibold">£{totalGBP.toFixed(2)}</span></p>
          </div>
        </div>
        
        <div className="overflow-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-blue-200">
                <th className="py-2 px-4 text-left text-sm font-semibold text-blue-700">Treatment</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-blue-700">Quantity</th>
                <th className="py-2 px-4 text-right text-sm font-semibold text-blue-700">UK Est. Price/Unit</th>
                <th className="py-2 px-4 text-right text-sm font-semibold text-blue-700">UK Est. Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {treatmentPlan.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                  <td className="py-2 px-4 text-sm">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.category}</div>
                  </td>
                  <td className="py-2 px-4 text-sm">{item.quantity}</td>
                  <td className="py-2 px-4 text-sm text-right">£{(item.priceGBP).toFixed(2)}</td>
                  <td className="py-2 px-4 text-sm text-right font-medium">£{item.subtotalGBP.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="border-t border-blue-200 bg-blue-100">
                <td colSpan={3} className="py-2 px-4 text-right font-semibold text-blue-700">Total UK Estimate:</td>
                <td className="py-2 px-4 text-right font-bold text-blue-700">£{totalGBP.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium text-blue-600">Save 60-70% in Istanbul</p>
          <div className="text-xs text-gray-500 mt-1">
            Price varies by clinic tier (affordable, mid, or premium). Hotel stays often included in packages.
          </div>
        </div>
      </div>
      
      {/* Clinic Comparison */}
      <div className="space-y-8">
        {isPromoTokenFlow && promoToken ? (
          // If we're in a promo flow, only show the clinic associated with the promo
          // We'll use the SingleClinicCard component for this
          clinicsData
            .filter(clinic => clinic.id === clinicId)
            .map(clinic => {
              const { clinicTreatments, totalPrice } = getClinicPricing(clinic.id, treatmentPlan);
              
              return (
                <SingleClinicCard 
                  key={clinic.id}
                  clinic={clinic}
                  badge={`Special Offer: ${promoToken}`}
                  onSelect={() => handleSelectClinic(clinic.id)}
                  totalPrice={totalPrice}
                />
              );
            })
        ) : (
          // Normal flow - show all clinics
          clinicsData.map((clinic) => {
            const { clinicTreatments, totalPrice } = getClinicPricing(clinic.id, treatmentPlan);
            const tierInfo = getTierLabel(clinic.tier);
            
            return (
              <Card key={clinic.id} className="overflow-hidden border-2 border-blue-300 hover:border-blue-500 transition-colors shadow-md">
                <div className="border-b">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                    {/* Clinic Info */}
                    <div className="md:col-span-1">
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
                        
                        {/* Small badge in the corner to indicate tier */}
                        <div className="absolute top-2 right-2">
                          <Badge 
                            variant="outline" 
                            className={`
                              ${clinic.tier === 'premium' 
                                ? 'bg-amber-500/90 text-white border-amber-400' 
                                : clinic.tier === 'standard' 
                                  ? 'bg-blue-500/90 text-white border-blue-400' 
                                  : 'bg-green-500/90 text-white border-green-400'
                              }
                            `}
                          >
                            {tierInfo.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-bold mb-1">{clinic.name}</h2>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className={tierInfo.color}>
                          {tierInfo.label}
                        </Badge>
                        
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="ml-1 text-sm font-medium">{clinic.ratings.overall}</span>
                          <span className="ml-1 text-xs text-gray-500">({clinic.ratings.reviews})</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 text-sm text-gray-700 mb-3">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{clinic.location.area}, {clinic.location.city}</span>
                      </div>
                    </div>
                    
                    {/* Clinic Features */}
                    <div className="md:col-span-1">
                      <h3 className="text-sm font-semibold text-gray-500 mb-3">CLINIC HIGHLIGHTS</h3>
                      <ul className="space-y-2">
                        {clinic.features.slice(0, 5).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="rounded-full bg-green-100 p-1 mt-0.5">
                              <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">GUARANTEES</h3>
                        <ul className="space-y-1">
                          <li className="text-sm flex items-center gap-1">
                            <ShieldCheck className="h-4 w-4 text-blue-500" />
                            <span>Implants: {clinic.guarantees.implants}</span>
                          </li>
                          <li className="text-sm flex items-center gap-1">
                            <ShieldCheck className="h-4 w-4 text-blue-500" />
                            <span>Crowns: {clinic.guarantees.crowns}</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">CERTIFICATIONS</h3>
                        <div className="flex flex-wrap gap-2">
                          {clinic.certifications.map((cert, idx) => (
                            <Badge key={idx} variant="outline" className="bg-gray-100">
                              {cert.name} ({cert.year})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Price and Select */}
                    <div className="md:col-span-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-3">YOUR PRICE AT THIS CLINIC</h3>
                        <div className="mb-2">
                          <div className="text-3xl font-bold text-blue-700">£{totalPrice.toFixed(2)}</div>
                          <div className="text-sm text-green-600">Save {Math.round((1 - (totalPrice / totalGBP)) * 100)}% vs UK prices</div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="text-sm flex items-center justify-between">
                            <span className="text-gray-600">Your treatments:</span>
                            <span className="font-medium">{clinicTreatments.length} items</span>
                          </div>
                          <div className="text-sm flex items-center justify-between">
                            <span className="text-gray-600">Treatment duration:</span>
                            <span className="font-medium">3-5 days</span>
                          </div>
                          <div className="text-sm flex items-center justify-between">
                            <span className="text-gray-600">Accommodation:</span>
                            <span className="font-medium">{clinic.tier === 'premium' ? 'Included' : clinic.tier === 'standard' ? 'Discounted' : 'Available'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleSelectClinic(clinic.id)}
                        >
                          Select This Clinic
                        </Button>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => downloadPdf(clinic.id)}
                          >
                            <FileCheck className="h-4 w-4 mr-1" /> PDF
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => emailQuote(clinic.id)}
                          >
                            <Mail className="h-4 w-4 mr-1" /> Email
                          </Button>
                          
                          <WhatsAppButton 
                            message={`I'm interested in dental treatment at ${clinic.name} - my quote total is £${totalPrice.toFixed(2)}`}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Detailed Treatment Comparison */}
                <div className="p-6">
                  <Tabs defaultValue="treatments">
                    <TabsList className="mb-4">
                      <TabsTrigger value="treatments">Treatments & Pricing</TabsTrigger>
                      <TabsTrigger value="details">Clinic Details</TabsTrigger>
                      <TabsTrigger value="reviews">Patient Reviews</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="treatments" className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Treatment</th>
                              <th className="py-2 px-4 text-center text-sm font-semibold text-gray-700">Qty</th>
                              <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">UK Price</th>
                              <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">{clinic.name} Price</th>
                              <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">You Save</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clinicTreatments.map((treatment, idx) => {
                              // Find corresponding UK price info from original treatments
                              const originalTreatment = treatmentPlan.find(t => t.name === treatment.originalName);
                              if (!originalTreatment) return null;
                              
                              const ukPricePerUnit = originalTreatment.priceGBP;
                              const ukSubtotal = originalTreatment.subtotalGBP;
                              const savings = ukSubtotal - treatment.subtotal;
                              const savingsPercent = Math.round((savings / ukSubtotal) * 100);
                              
                              return (
                                <tr key={idx} className="border-b border-gray-100">
                                  <td className="py-2 px-4 text-sm">
                                    <div className="font-medium">{treatment.treatmentName}</div>
                                    <div className="text-xs text-gray-500">{treatment.category}</div>
                                  </td>
                                  <td className="py-2 px-4 text-sm text-center">{treatment.quantity}</td>
                                  <td className="py-2 px-4 text-sm text-right">
                                    <div>£{ukPricePerUnit.toFixed(2)}/unit</div>
                                    <div className="text-xs text-gray-500">£{ukSubtotal.toFixed(2)} total</div>
                                  </td>
                                  <td className="py-2 px-4 text-sm text-right">
                                    <div className="font-medium text-blue-700">£{treatment.pricePerUnit.toFixed(2)}/unit</div>
                                    <div className="text-xs text-blue-700">£{treatment.subtotal.toFixed(2)} total</div>
                                  </td>
                                  <td className="py-2 px-4 text-sm text-right">
                                    <div className="font-medium text-green-600">£{savings.toFixed(2)}</div>
                                    <div className="text-xs text-green-600">{savingsPercent}% off</div>
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-blue-50">
                              <td colSpan={2} className="py-2 px-4 text-sm font-semibold">Total</td>
                              <td className="py-2 px-4 text-sm text-right font-semibold">£{totalGBP.toFixed(2)}</td>
                              <td className="py-2 px-4 text-sm text-right font-bold text-blue-700">£{totalPrice.toFixed(2)}</td>
                              <td className="py-2 px-4 text-sm text-right font-bold text-green-600">
                                £{(totalGBP - totalPrice).toFixed(2)} ({Math.round((1 - (totalPrice / totalGBP)) * 100)}%)
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* About section */}
                        <div>
                          <h3 className="text-lg font-semibold mb-2">About {clinic.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{clinic.description}</p>
                          
                          <h4 className="font-medium mb-2">Our Dentists</h4>
                          <ul className="space-y-2 mb-4">
                            {clinic.doctors.map((doctor, idx) => (
                              <li key={idx} className="text-sm">
                                <span className="font-medium">{doctor.name}</span>
                                <span className="text-gray-600"> - {doctor.specialty}, {doctor.experience} years exp.</span>
                              </li>
                            ))}
                          </ul>
                          
                          <h4 className="font-medium mb-2">Payment Options</h4>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {clinic.paymentOptions.map((option, idx) => (
                              <Badge key={idx} variant="outline">{option}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* What's included section */}
                        <div>
                          <h3 className="text-lg font-semibold mb-2">What's Included</h3>
                          <ul className="space-y-2 mb-4">
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 shrink-0" />
                              <div>
                                <span className="font-medium">Free consultation</span>
                                <p className="text-sm text-gray-600">Initial exam and treatment planning</p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 shrink-0" />
                              <div>
                                <span className="font-medium">Free panoramic X-ray</span>
                                <p className="text-sm text-gray-600">Comprehensive diagnostic imaging</p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 shrink-0" />
                              <div>
                                <span className="font-medium">{clinic.tier === 'premium' ? 'VIP airport transfer' : 'Airport pickup'}</span>
                                <p className="text-sm text-gray-600">From Istanbul Airport to your accommodation</p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 shrink-0" />
                              <div>
                                <span className="font-medium">{clinic.tier === 'premium' ? 'Luxury accommodation' : clinic.tier === 'standard' ? 'Hotel arrangements' : 'Accommodation assistance'}</span>
                                <p className="text-sm text-gray-600">
                                  {clinic.tier === 'premium' 
                                    ? '5-star hotel stay included in package' 
                                    : clinic.tier === 'standard' 
                                      ? 'Discounted rates at partner hotels' 
                                      : 'Help finding suitable accommodation'}
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="reviews">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Overall Rating</h3>
                            <div className="flex items-center mb-4">
                              <div className="text-3xl font-bold text-blue-700 mr-2">{clinic.ratings.overall}</div>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-5 w-5 ${i < Math.round(clinic.ratings.overall) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <div className="ml-2 text-sm text-gray-600">({clinic.ratings.reviews} reviews)</div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Cleanliness</span>
                                <div className="flex items-center">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3 w-3 ${i < Math.round(clinic.ratings.cleanliness) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                  <span className="ml-1 text-xs">{clinic.ratings.cleanliness}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Staff</span>
                                <div className="flex items-center">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3 w-3 ${i < Math.round(clinic.ratings.staff) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                  <span className="ml-1 text-xs">{clinic.ratings.staff}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Value</span>
                                <div className="flex items-center">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3 w-3 ${i < Math.round(clinic.ratings.value) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                  <span className="ml-1 text-xs">{clinic.ratings.value}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Location</span>
                                <div className="flex items-center">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3 w-3 ${i < Math.round(clinic.ratings.location) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                  <span className="ml-1 text-xs">{clinic.ratings.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold mb-2">Recent Reviews</h3>
                            <div className="space-y-4">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center mb-1">
                                  <div className="font-medium mr-2">Sarah T.</div>
                                  <div className="text-xs text-gray-500">London, UK</div>
                                  <div className="flex ml-auto">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3 w-3 ${i < 5 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm mb-2">
                                  "I couldn't be happier with my experience at this clinic. The dentists were professional and the results exceeded my expectations. The hotel accommodation and transfers made everything so convenient."
                                </p>
                                <div className="text-xs text-gray-500">Visited for: Veneers and teeth whitening</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Bottom Action Bar */}
      <div className="mt-10 border-t pt-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            <p>Need more information or have questions about treatment options?</p>
            <p>Our patient coordinators are here to help.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onBackToInfo}>
              ← Back to Patient Information
            </Button>
            
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <Mail className="h-4 w-4 mr-2" />
              Request Consultation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchedClinicsPage;