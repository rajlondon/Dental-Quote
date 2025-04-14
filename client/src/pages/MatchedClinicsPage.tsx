import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Check,
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
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useLocation } from 'wouter';

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
      }
    },
    {
      id: 'beyazada',
      name: 'Beyaz Ada Dental Clinic',
      tier: 'standard',
      description: 'A well-established mid-range clinic offering quality dental treatments at competitive prices. Includes hotel arrangements and airport pickup.',
      priceFactor: 0.35, // 35% of UK price (standard)
      ratings: {
        overall: 4.7,
        reviews: 243,
        cleanliness: 4.8,
        staff: 4.7,
        value: 4.9,
        location: 4.5
      },
      location: {
        area: 'Kadıköy',
        city: 'Istanbul',
        fullAddress: 'Caferağa Mahallesi, Kadıköy, Istanbul'
      },
      features: [
        'Modern clinic facilities',
        'Complimentary airport pickup',
        'Hotel booking assistance',
        'Digital dental technology',
        'Multilingual staff',
        'Free Wi-Fi'
      ],
      certifications: [
        { name: 'Turkish Dental Association', year: 2020 }
      ],
      doctors: [
        { name: 'Dr. Ozan Aydın', specialty: 'Oral Surgery', experience: 8 },
        { name: 'Dr. Seda Yıldız', specialty: 'Orthodontics', experience: 9 }
      ],
      paymentOptions: ['Credit Card', 'Bank Transfer', 'Cash'],
      guarantees: {
        implants: '5 years',
        veneers: '3 years',
        crowns: '3 years',
        fillings: '1 year'
      }
    },
    {
      id: 'maltepe',
      name: 'Maltepe Dental Clinic',
      tier: 'premium',
      description: 'A boutique premium clinic specializing in cosmetic dentistry and full-mouth reconstructions with personalized care and luxury amenities.',
      priceFactor: 0.45, // 45% of UK price (highest premium)
      ratings: {
        overall: 4.8,
        reviews: 156,
        cleanliness: 5.0,
        staff: 4.9,
        value: 4.6,
        location: 4.8
      },
      location: {
        area: 'Maltepe',
        city: 'Istanbul',
        fullAddress: 'Bağlarbaşı Mahallesi, Maltepe, Istanbul'
      },
      features: [
        'Luxury boutique clinic',
        'VIP chauffeur service',
        'Luxury hotel accommodations',
        'CAD/CAM same-day restorations',
        '3D scanning and treatment planning',
        'Sedation dentistry',
        'Spa amenities',
        'Post-treatment follow-up service'
      ],
      certifications: [
        { name: 'ISO 9001', year: 2022 },
        { name: 'International Dental Federation', year: 2021 }
      ],
      doctors: [
        { name: 'Dr. Canan Toprak', specialty: 'Cosmetic Dentistry', experience: 18 },
        { name: 'Dr. Emre Şahin', specialty: 'Implantology', experience: 14 },
        { name: 'Dr. Zeynep Kara', specialty: 'Endodontics', experience: 10 }
      ],
      paymentOptions: ['Credit Card', 'Bank Transfer', 'Cash'],
      guarantees: {
        implants: '15 years',
        veneers: '10 years',
        crowns: '10 years',
        fillings: '3 years'
      }
    },
    {
      id: 'dentalcare',
      name: 'Istanbul Dental Care',
      tier: 'affordable',
      description: 'A budget-friendly clinic offering quality dental treatments at the most affordable prices, ideal for routine procedures and basic cosmetic work.',
      priceFactor: 0.30, // 30% of UK price (affordable)
      ratings: {
        overall: 4.5,
        reviews: 312,
        cleanliness: 4.6,
        staff: 4.5,
        value: 5.0,
        location: 4.3
      },
      location: {
        area: 'Fatih',
        city: 'Istanbul',
        fullAddress: 'Aksaray Mahallesi, Fatih, Istanbul'
      },
      features: [
        'Clean, modern facilities',
        'Airport pickup service',
        'Hotel recommendations',
        'Multilingual coordinators',
        'Free initial consultation',
        'Flexible scheduling'
      ],
      certifications: [
        { name: 'Turkish Dental Association', year: 2019 }
      ],
      doctors: [
        { name: 'Dr. Berk Yılmaz', specialty: 'General Dentistry', experience: 6 },
        { name: 'Dr. Ayşe Çelik', specialty: 'Restorative Dentistry', experience: 8 }
      ],
      paymentOptions: ['Credit Card', 'Cash'],
      guarantees: {
        implants: '3 years',
        veneers: '2 years',
        crowns: '2 years',
        fillings: '1 year'
      }
    }
  ];

  const getClinicPricing = (clinicId: string, treatments: TreatmentItem[]) => {
    const clinic = clinicsData.find(c => c.id === clinicId);
    const priceFactor = clinic?.priceFactor || 0.35; // Default to 35% if clinic not found
    
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
  
  // Calculate UK total
  const ukTotal = treatmentPlan.reduce((sum, item) => sum + item.subtotalGBP, 0);
  
  if (!treatmentPlan.length) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">No Treatment Plan Available</h1>
        <p className="mb-6">Please create a treatment plan first to view matched clinics.</p>
        <Button onClick={() => setLocation('/quote')}>Return to Quote</Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      {/* Quote Progress */}
      <div className="mb-8 bg-gray-50 p-4 rounded-lg border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <div className="relative flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">1</div>
              <div className="ml-3">
                <div className="text-sm text-gray-500">Step 1</div>
                <div className="font-medium">Treatment Plan</div>
              </div>
              <div className="hidden md:block w-8 h-0.5 bg-blue-200 ml-2"></div>
            </div>
            
            <div className="relative flex items-center ml-0 md:ml-2">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">2</div>
              <div className="ml-3">
                <div className="text-sm text-gray-500">Step 2</div>
                <div className="font-medium">Patient Info</div>
              </div>
              <div className="hidden md:block w-8 h-0.5 bg-blue-200 ml-2"></div>
            </div>
            
            <div className="relative flex items-center ml-0 md:ml-2">
              <div className="h-10 w-10 rounded-full bg-blue-500 border-4 border-blue-100 flex items-center justify-center text-white font-semibold">3</div>
              <div className="ml-3">
                <div className="text-sm text-gray-500">Step 3</div>
                <div className="font-medium">Matched Clinics</div>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline"
            className="flex items-center" 
            onClick={() => {
              if (onQuoteDownload) {
                // Select the first clinic if none is selected
                const clinicId = selectedClinic || clinicsData[0]?.id;
                if (clinicId) {
                  const clinic = clinicsData.find(c => c.id === clinicId);
                  const { clinicTreatments, totalPrice } = getClinicPricing(clinicId, treatmentPlan);
                  
                  localStorage.setItem('selectedClinicId', clinicId);
                  localStorage.setItem('selectedClinicData', JSON.stringify({
                    name: clinic?.name,
                    treatments: clinicTreatments,
                    totalPrice: totalPrice
                  }));
                  
                  onQuoteDownload();
                }
              }
            }}
          >
            <FileCheck className="mr-2 h-4 w-4" />
            Download Quote PDF
          </Button>
        </div>
      </div>
    
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Matched Clinics</h1>
            <p className="text-gray-600">
              We've matched your treatment needs with {clinicsData.length} top-rated Istanbul dental clinics
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <WhatsAppButton 
              phoneNumber="447123456789" 
              message="I need help choosing a clinic for my dental treatment in Istanbul." 
              className="w-full md:w-auto" 
            />
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <div className="text-blue-500 mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium mb-1">About Your Matched Clinics</h3>
              <p className="text-sm text-gray-600">
                All clinics are verified, accredited, and experienced with international patients. 
                Your treatment plan has been shared with these clinics, and each has provided a personalized quote.
                Compare prices, reviews, and clinic details before making your decision.
              </p>
            </div>
          </div>
        </div>
        
        {/* Treatment Summary */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <h2 className="font-semibold mb-3">Your Treatment Plan Summary</h2>
          <div className="space-y-1 mb-3">
            {treatmentPlan.map((treatment) => (
              <div key={treatment.id} className="flex justify-between">
                <span className="text-gray-700">
                  {treatment.name} {treatment.quantity > 1 && `x${treatment.quantity}`}
                </span>
                <span className="font-medium">£{treatment.subtotalGBP}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2 border-t font-semibold">
            <span>Estimated Istanbul Price:</span>
            <span>£{Math.round(treatmentPlan.reduce((sum, item) => sum + item.subtotalGBP, 0) * 0.35)}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Hotel stays often included in treatment packages depending on the cost of your treatment.
          </div>
        </div>
      </div>
      
      {/* Clinic Comparison */}
      <div className="space-y-8">
        {clinicsData.map((clinic) => {
          const { clinicTreatments, totalPrice } = getClinicPricing(clinic.id, treatmentPlan);
          const tierInfo = getTierLabel(clinic.tier);
          
          return (
            <Card key={clinic.id} className="overflow-hidden border-2 border-blue-300 hover:border-blue-500 transition-colors shadow-md">
              <div className="border-b">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  {/* Clinic Info */}
                  <div className="md:col-span-1">
                    {clinic.id === 'dentspa' ? (
                      <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center relative border border-amber-200">
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-40 h-40">
                              <div className="absolute inset-4 rounded-full bg-amber-500/10 animate-pulse"></div>
                              <Award className="absolute inset-0 m-auto h-16 w-16 text-amber-600" />
                              <Sparkles className="absolute top-3 right-3 h-6 w-6 text-amber-500" />
                              <Gem className="absolute bottom-6 left-6 h-8 w-8 text-amber-600/70" />
                            </div>
                          </div>
                          <div className="absolute bottom-4 w-full text-center">
                            <span className="text-sm font-bold text-amber-800 bg-white/80 px-3 py-1 rounded-full">{clinic.name}</span>
                            <div className="text-xs text-amber-600 mt-1 font-medium">Premium Clinic Experience</div>
                          </div>
                        </div>
                      </div>
                    ) : clinic.id === 'beyazada' ? (
                      <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative border border-blue-200">
                        <div className="absolute inset-0">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-40 h-40">
                              <div className="absolute inset-8 rounded-full bg-blue-500/10 border-8 border-blue-200/50"></div>
                              <Target className="absolute inset-0 m-auto h-14 w-14 text-blue-500" />
                              <Smile className="absolute top-4 right-4 h-6 w-6 text-blue-500/70" />
                            </div>
                          </div>
                          <div className="absolute bottom-4 w-full text-center">
                            <span className="text-sm font-bold text-blue-700 bg-white/80 px-3 py-1 rounded-full">{clinic.name}</span>
                            <div className="text-xs text-blue-500 mt-1 font-medium">Standard Clinic Experience</div>
                          </div>
                        </div>
                      </div>
                    ) : clinic.id === 'maltepe' ? (
                      <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center relative border border-purple-200">
                        <div className="absolute inset-0">
                          <div className="grid grid-cols-2 h-full">
                            <div className="bg-gradient-to-br from-indigo-100/50 to-indigo-200/30 flex items-center justify-center">
                              <Stethoscope className="h-12 w-12 text-indigo-500" />
                            </div>
                            <div className="bg-gradient-to-tl from-purple-100/50 to-purple-200/30 flex items-center justify-center">
                              <HeartPulse className="h-12 w-12 text-purple-500" />
                            </div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/80 rounded-full p-2">
                              <Award className="h-12 w-12 text-indigo-600" />
                            </div>
                          </div>
                          <div className="absolute bottom-4 w-full text-center">
                            <span className="text-sm font-bold text-indigo-800 bg-white/80 px-3 py-1 rounded-full">{clinic.name}</span>
                            <div className="text-xs text-indigo-600 mt-1 font-medium">Premium Clinic Experience</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center relative border border-green-200">
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="relative w-40 h-40 flex items-center justify-center">
                            <Columns className="h-16 w-16 text-green-500" />
                            <Zap className="absolute top-4 right-4 h-6 w-6 text-green-600" />
                          </div>
                          <div className="absolute bottom-4 w-full text-center">
                            <span className="text-sm font-bold text-green-700 bg-white/80 px-3 py-1 rounded-full">{clinic.name}</span>
                            <div className="text-xs text-green-600 mt-1 font-medium">Affordable Clinic Experience</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
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
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {clinic.description}
                    </p>
                    
                    <div className="space-y-3 mb-4">
                      {clinic.certifications && clinic.certifications.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Award className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-sm font-medium">Certifications</span>
                            <div className="text-xs text-gray-600 flex flex-wrap gap-1 mt-1">
                              {clinic.certifications.map((cert, i) => (
                                <Badge key={i} variant="outline" className="font-normal">
                                  {cert.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {clinic.doctors && clinic.doctors.length > 0 && (
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-sm font-medium">Lead Dentists</span>
                            <div className="text-xs text-gray-600 mt-1">
                              {clinic.doctors.slice(0, 2).map((doctor, i) => (
                                <div key={i} className="mb-1">
                                  {doctor.name} - {doctor.specialty} ({doctor.experience} yrs)
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {clinic.features && clinic.features.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-sm font-medium">Clinic Features</span>
                            <div className="text-xs text-gray-600 mt-1">
                              <div className="grid grid-cols-1 gap-1">
                                {clinic.features.slice(0, 3).map((feature, i) => (
                                  <div key={i} className="flex items-center">
                                    <Check className="h-3 w-3 text-green-500 mr-1 shrink-0" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                                {clinic.features.length > 3 && (
                                  <div className="text-blue-600 text-xs">+{clinic.features.length - 3} more features</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Quote Details */}
                  <div className="md:col-span-2">
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
                          
                          <div className="border-t pt-3 mb-3">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Treatment Total:</span>
                              <span className="font-medium">£{totalPrice}</span>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-3">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium text-blue-700">UK Cost Comparison:</span>
                              <span className="text-sm font-medium text-blue-700">£{ukTotal}</span>
                            </div>
                            <div className="flex justify-between text-green-600 font-medium">
                              <span>Your Savings:</span>
                              <span>£{ukTotal - totalPrice} ({Math.round((ukTotal - totalPrice) / ukTotal * 100)}%)</span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 mb-2">
                            <p>* Final quote will be confirmed after clinic review of your dental records</p>
                            <p>* Hotel stays often included in treatment packages depending on the cost of your treatment</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            className="flex-1 md:flex-none" 
                            onClick={() => {
                              setSelectedClinic(clinic.id);
                              if (onSelectClinic) {
                                onSelectClinic(clinic.id);
                              }
                            }}
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            Select This Clinic
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="flex-1 md:flex-none"
                            onClick={() => {
                              if (onQuoteDownload) {
                                const { clinicTreatments, totalPrice } = getClinicPricing(clinic.id, treatmentPlan);
                                
                                localStorage.setItem('selectedClinicId', clinic.id);
                                localStorage.setItem('selectedClinicData', JSON.stringify({
                                  name: clinic.name,
                                  treatments: clinicTreatments,
                                  totalPrice: totalPrice
                                }));
                                
                                onQuoteDownload();
                              }
                            }}
                          >
                            <FileCheck className="mr-2 h-4 w-4" />
                            Download Quote
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="flex-1 md:flex-none"
                            onClick={() => {
                              if (onEmailQuote) {
                                localStorage.setItem('selectedClinicId', clinic.id);
                                onEmailQuote();
                              }
                            }}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Email Quote
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Detailed Info Tabs */}
              {clinic.ratings && clinic.doctors && (
                <div className="p-6">
                  <Tabs defaultValue="ratings">
                    <TabsList className="mb-4">
                      <TabsTrigger value="ratings">Clinic Ratings</TabsTrigger>
                      <TabsTrigger value="doctors">Doctors & Staff</TabsTrigger>
                      <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="ratings">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Patient Ratings</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Overall</span>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        i < Math.floor(clinic.ratings.overall) 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : i < clinic.ratings.overall 
                                            ? 'text-yellow-500 fill-yellow-500 opacity-50' 
                                            : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm font-medium">{clinic.ratings.overall}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Cleanliness</span>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        i < Math.floor(clinic.ratings.cleanliness) 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : i < clinic.ratings.cleanliness 
                                            ? 'text-yellow-500 fill-yellow-500 opacity-50' 
                                            : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm font-medium">{clinic.ratings.cleanliness}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Staff</span>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        i < Math.floor(clinic.ratings.staff) 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : i < clinic.ratings.staff 
                                            ? 'text-yellow-500 fill-yellow-500 opacity-50' 
                                            : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm font-medium">{clinic.ratings.staff}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Value</span>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        i < Math.floor(clinic.ratings.value) 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : i < clinic.ratings.value 
                                            ? 'text-yellow-500 fill-yellow-500 opacity-50' 
                                            : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm font-medium">{clinic.ratings.value}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Location</span>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        i < Math.floor(clinic.ratings.location) 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : i < clinic.ratings.location 
                                            ? 'text-yellow-500 fill-yellow-500 opacity-50' 
                                            : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm font-medium">{clinic.ratings.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Total Reviews</span>
                              <span className="font-medium">{clinic.ratings.reviews}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Patient Testimonials</h4>
                          <div className="space-y-4">
                            <div className="border-l-4 border-blue-200 pl-3 py-1">
                              <p className="text-sm italic mb-1">
                                "I had a fantastic experience at {clinic.name}. The staff was professional, and my treatment was pain-free. The hotel accommodation was superb!"
                              </p>
                              <div className="text-xs text-gray-500 flex items-center">
                                <div className="flex mr-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                  ))}
                                </div>
                                <span>Rebecca, UK</span>
                              </div>
                            </div>
                            
                            <div className="border-l-4 border-blue-200 pl-3 py-1">
                              <p className="text-sm italic mb-1">
                                "The quality of dental work at {clinic.name} is exceptional and at a fraction of UK prices. I'm so pleased with the results!"
                              </p>
                              <div className="text-xs text-gray-500 flex items-center">
                                <div className="flex mr-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <span>Michael, UK</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="doctors">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Lead Dentists</h4>
                          <div className="space-y-4">
                            {clinic.doctors && Array.isArray(clinic.doctors) ? 
                              clinic.doctors.map((doctor, i) => (
                                <div key={i} className="flex items-start gap-3">
                                  <div className="rounded-full bg-blue-100 p-2">
                                    <User className="h-6 w-6 text-blue-500" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{doctor.name}</div>
                                    <div className="text-sm text-gray-500">{doctor.specialty}</div>
                                    <div className="text-xs text-gray-500">{doctor.experience} years experience</div>
                                  </div>
                                </div>
                              )) : 
                              <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>Experienced, international team of dentists</span>
                              </div>
                            }
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Clinic Features</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {clinic.features && Array.isArray(clinic.features) ? 
                              clinic.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              )) : 
                              <>
                                <div className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span className="text-sm">Digital X-ray equipment</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span className="text-sm">Multilingual staff</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span className="text-sm">Airport transfer service</span>
                                </div>
                              </>
                            }
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="amenities">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Clinic Amenities</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">Free WiFi</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">Refreshments</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">Comfortable waiting area</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">TV entertainment</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">Air conditioning</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">Private consultation rooms</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Treatment Guarantees</h4>
                          <div className="space-y-3">
                            {clinic.guarantees ? (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-sm">Dental Implants</span>
                                  <span className="text-sm font-medium">{clinic.guarantees.implants} guarantee</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Veneers</span>
                                  <span className="text-sm font-medium">{clinic.guarantees.veneers} guarantee</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Crowns</span>
                                  <span className="text-sm font-medium">{clinic.guarantees.crowns} guarantee</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Fillings</span>
                                  <span className="text-sm font-medium">{clinic.guarantees.fillings} guarantee</span>
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-gray-600">
                                All treatments come with a minimum 1-year guarantee. Premium treatments like implants include longer guarantees.
                              </p>
                            )}
                            <div className="text-sm text-gray-600 pt-3 border-t mt-3">
                              <p>A detailed guarantee certificate will be provided with your treatment package.</p>
                            </div>
                          </div>
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
      
      {/* Bottom Action Bar */}
      <div className="mt-10 border-t pt-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            <p>
              Need help choosing the right clinic? Our dental tourism specialists are here to help.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setLocation('/quote')} className="w-full sm:w-auto">
              Back to Quote
            </Button>
            
            <WhatsAppButton 
              phoneNumber="447123456789" 
              message="I need help choosing a clinic for my dental treatment in Istanbul." 
              className="w-full sm:w-auto" 
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default MatchedClinicsPage;