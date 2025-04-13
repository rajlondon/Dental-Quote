import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Check, Star, MapPin, Award, ShieldCheck, Clock, Languages, Phone, Calendar, ChevronRight, MessageCircle, FileCheck, Plane, CreditCard, HeartPulse, Stethoscope, User, Smile, Building2, Home, Sparkles, Zap, Construction, Target, Columns, Gem } from 'lucide-react';
import clinicsData from '@/data/clinics.json';
import { TreatmentItem } from '@/components/TreatmentPlanBuilder';
import WhatsAppButton from '@/components/WhatsAppButton';

interface MatchedClinicsPageProps {
  treatmentItems?: TreatmentItem[];
  patientInfo?: {
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
  };
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
  totalGBP,
  onSelectClinic,
  onBackToInfo,
  onQuoteDownload,
  onEmailQuote
}) => {
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentItem[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  
  // Get treatments from props or localStorage
  useEffect(() => {
    if (treatmentItems.length === 0) {
      const storedTreatments = localStorage.getItem('treatmentPlan');
      if (storedTreatments) {
        try {
          const parsedTreatments = JSON.parse(storedTreatments);
          setTreatmentPlan(parsedTreatments);
        } catch (error) {
          console.error('Error parsing stored treatments:', error);
        }
      }
    } else {
      setTreatmentPlan(treatmentItems);
    }
  }, [treatmentItems]);

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'premium':
        return { label: 'Premium Clinic', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'mid-tier':
        return { label: 'Standard Clinic', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'affordable':
        return { label: 'Budget-Friendly Clinic', color: 'bg-green-100 text-green-800 border-green-200' };
      default:
        return { label: 'Standard Clinic', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  // Match user treatments with clinic pricing
  const getClinicPricing = (clinicId: string, treatments: TreatmentItem[]): { 
    clinicTreatments: ClinicTreatmentPrice[], 
    totalPrice: number 
  } => {
    const clinic = clinicsData.find(c => c.id === clinicId);
    if (!clinic) return { clinicTreatments: [], totalPrice: 0 };

    // Safely get the price modifier with fallback to 1.0
    const priceModifier = (clinic as any).priceModifier || 1.0;
    
    const clinicTreatments: ClinicTreatmentPrice[] = [];
    let totalPrice = 0;

    treatments.forEach(treatment => {
      // Extract the base treatment ID without the timestamp (if ID exists)
      const baseTreatmentId = treatment.id ? treatment.id.split('_').slice(0, 2).join('_') : '';
      const category = treatment.category || 'general'; // Default to 'general' if category is missing
      
      // Find the matching treatment in the clinic data
      let matchingTreatment = null;
      
      // Use type assertion to handle dynamic property access
      const categoryTreatments = (clinic.treatments as any)[category];
      
      if (categoryTreatments) {
        // Try to find by exact name match first
        matchingTreatment = categoryTreatments.find((t: any) => 
          t.name.toLowerCase() === treatment.name.toLowerCase()
        );
        
        // If no exact match, try to find something similar
        if (!matchingTreatment) {
          const keywords = treatment.name.toLowerCase().split(' ');
          for (const t of categoryTreatments) {
            // Check if any of the keywords match
            if (keywords.some(keyword => 
              t.name.toLowerCase().includes(keyword) && 
              keyword.length > 3 // Only match on meaningful keywords
            )) {
              matchingTreatment = t;
              break;
            }
          }
        }
      }

      // Use average price from the clinic or the original price adjusted by modifier
      let pricePerUnit = 0;
      if (matchingTreatment) {
        // Use the average of min and max if available
        if (matchingTreatment.priceGBP.min !== undefined && matchingTreatment.priceGBP.max !== undefined) {
          pricePerUnit = (matchingTreatment.priceGBP.min + matchingTreatment.priceGBP.max) / 2;
        } else {
          pricePerUnit = treatment.priceGBP * priceModifier;
        }
      } else {
        // No matching treatment found, use original price with modifier
        pricePerUnit = treatment.priceGBP * priceModifier;
      }

      // Apply price variance based on clinic tier
      if (clinic.tier === 'premium') {
        // Premium clinics have slightly higher prices
        pricePerUnit = Math.round(pricePerUnit * 1.05);
      } else if (clinic.tier === 'affordable') {
        // Affordable clinics have slightly lower prices
        pricePerUnit = Math.round(pricePerUnit * 0.95);
      }

      // Calculate subtotal
      const subtotal = pricePerUnit * treatment.quantity;
      totalPrice += subtotal;

      // Add to clinic treatments
      clinicTreatments.push({
        treatmentName: treatment.name,
        originalName: matchingTreatment ? matchingTreatment.name : treatment.name,
        quantity: treatment.quantity,
        pricePerUnit: pricePerUnit,
        subtotal: subtotal,
        category: category
      });
    });

    return { 
      clinicTreatments, 
      totalPrice: Math.round(totalPrice) // Round to nearest pound
    };
  };

  const handleRequestQuote = (clinicId: string) => {
    try {
      if (!clinicId) {
        console.error("Invalid clinic ID");
        return;
      }
      
      setIsLoadingQuote(true);
      
      // Store the selected clinic for the next page
      localStorage.setItem('selectedClinic', clinicId);
      
      // Simulate API request delay
      setTimeout(() => {
        try {
          setIsLoadingQuote(false);
          setLocation('/patient-info');
        } catch (error) {
          console.error("Error navigating to patient info page:", error);
          setIsLoadingQuote(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Error processing request quote:", error);
      setIsLoadingQuote(false);
    }
  };

  // Check if we have any treatments to match with clinics
  if (treatmentPlan.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">No Treatments Selected</h1>
          <p className="text-gray-600 mb-8">
            You haven't selected any dental treatments yet. Please build your treatment plan first.
          </p>
          <Button onClick={() => setLocation('/quote')} className="mt-4">
            Build Your Treatment Plan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
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
            <span>Total Estimated Cost:</span>
            <span>£{treatmentPlan.reduce((sum, item) => sum + item.subtotalGBP, 0)}</span>
          </div>
        </div>
      </div>
      
      {/* Clinic Comparison */}
      <div className="space-y-8">
        {clinicsData.map((clinic) => {
          const { clinicTreatments, totalPrice } = getClinicPricing(clinic.id, treatmentPlan);
          const tierInfo = getTierLabel(clinic.tier);
          
          return (
            <Card key={clinic.id} className="overflow-hidden">
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
                            <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                              <span>Treatment</span>
                              <div className="flex gap-8">
                                <span className="w-20 text-right">Price</span>
                                <span className="w-20 text-right">Subtotal</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                              {clinicTreatments.map((treatment, index) => (
                                <div key={index} className="flex justify-between items-center py-1">
                                  <div className="flex-1">
                                    <div className="font-medium">{treatment.treatmentName}</div>
                                    {treatment.quantity > 1 && (
                                      <div className="text-xs text-gray-500">Quantity: {treatment.quantity}</div>
                                    )}
                                  </div>
                                  <div className="flex gap-8">
                                    <div className="w-20 text-right">
                                      <div className="font-medium">£{treatment.pricePerUnit}</div>
                                    </div>
                                    <div className="w-20 text-right">
                                      <div className="font-medium">£{treatment.subtotal}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <Separator />
                            
                            <div className="flex justify-between mt-3 font-bold">
                              <span>Total Quote Price:</span>
                              <span>£{totalPrice}</span>
                            </div>
                            
                            {/* Savings comparison */}
                            <div className="mt-3 bg-green-50 rounded p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-green-700 font-medium text-sm">Savings vs UK prices:</div>
                                  <div className="text-xs text-gray-600">Average UK cost: £{Math.round(totalPrice * 2.5)}</div>
                                </div>
                                <div className="text-green-700 font-bold">Save £{Math.round(totalPrice * 2.5) - totalPrice}</div>
                              </div>
                            </div>
                          </div>
                            
                          <div className="text-xs text-gray-500 mt-2">
                            <p>
                              * This is a personalized quote based on your treatment plan. Final pricing will be confirmed after your free online consultation.
                            </p>
                            {clinic.tier === 'premium' && (
                              <p className="mt-1">
                                ** Premium clinic price includes enhanced materials, luxury amenities, and VIP service.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto space-y-3">
                        {/* Travel info */}
                        <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-3">
                          <Plane className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-sm">Travel & Accommodation</h4>
                            <p className="text-xs text-gray-600 mt-1">
                              Many clinics offer all-inclusive packages with hotel accommodation and airport transfers.
                              We can help arrange your travel logistics - just ask your patient coordinator.
                            </p>
                          </div>
                        </div>

                        {/* Review snippet */}
                        {clinic.featuredReviews && clinic.featuredReviews.length > 0 && (
                          <div className="bg-amber-50 rounded-lg p-3 flex items-start gap-3">
                            <Star className="h-5 w-5 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="flex items-center mb-1">
                                <h4 className="font-medium text-sm">Recent Patient Review</h4>
                                <div className="flex ml-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 italic line-clamp-2">
                                "{clinic.featuredReviews[0].text}"
                              </p>
                              <p className="text-xs font-medium mt-1">
                                - {clinic.featuredReviews[0].author}, {clinic.featuredReviews[0].date}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              try {
                                if (clinic && clinic.id) {
                                  setSelectedClinic(clinic.id);
                                  // Store selected clinic in localStorage for persistence
                                  localStorage.setItem('selectedClinic', clinic.id);
                                }
                              } catch (error) {
                                console.error("Error selecting clinic:", error);
                              }
                            }} 
                            className="text-sm"
                          >
                            View Clinic Details
                          </Button>
                          
                          <Button 
                            onClick={() => handleRequestQuote(clinic.id)} 
                            disabled={isLoadingQuote}
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                          >
                            {isLoadingQuote ? 'Processing...' : 'Request Final Quote'}
                            {!isLoadingQuote && <ArrowRight className="ml-2 h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expanded Clinic Details (conditionally shown) */}
              {selectedClinic === clinic.id && (
                <div className="p-6 bg-gray-50">
                  <Tabs defaultValue="treatments">
                    <TabsList className="mb-6">
                      <TabsTrigger value="treatments">Treatments</TabsTrigger>
                      <TabsTrigger value="doctors">Doctors</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                      <TabsTrigger value="about">About</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="treatments">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Treatment Options</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {clinic.treatments && typeof clinic.treatments === 'object' && 
                            Object.entries(clinic.treatments).map(([category, treatments]: [string, any]) => (
                              <div key={category} className="bg-white rounded-lg p-4 border">
                                <h4 className="font-medium mb-3 capitalize">{category.replace('_', ' & ')}</h4>
                                <div className="space-y-2">
                                  {Array.isArray(treatments) && treatments.map((treatment: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm">
                                      <span>{treatment?.name || 'Treatment'}</span>
                                      <span className="font-medium">
                                        {treatment?.priceGBP && typeof treatment.priceGBP === 'object' ? 
                                          `£${treatment.priceGBP.min} - £${treatment.priceGBP.max}` : 
                                          '£170 - £250'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="doctors">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Our Dental Team</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {clinic.doctors && Array.isArray(clinic.doctors) && clinic.doctors.map((doctor, i) => (
                            <div key={i} className="bg-white rounded-lg overflow-hidden border">
                              <div className="aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                                <div className="text-gray-400 flex flex-col items-center">
                                  <User className="h-16 w-16 mb-2" />
                                  <span className="text-sm">Dr. Profile</span>
                                </div>
                              </div>
                              <div className="p-4">
                                <h4 className="font-semibold mb-1">{doctor?.name || 'Doctor'}</h4>
                                <p className="text-sm text-gray-600 mb-2">{doctor?.specialty || 'Specialist'}</p>
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-blue-500 mr-2" />
                                    <span>{doctor?.experience ? `${doctor.experience} years experience` : '10+ years experience'}</span>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <Award className="h-4 w-4 text-blue-500 mr-2" />
                                    <span>{doctor?.education || 'Medical University'}</span>
                                  </div>
                                  
                                  <div className="flex items-start">
                                    <Languages className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                                    <span>English</span>
                                  </div>
                                  
                                  <div className="flex items-start">
                                    <Stethoscope className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                                    <div>
                                      <span className="block font-medium mb-1">Specializes in:</span>
                                      <div className="flex flex-wrap gap-1">
                                        {doctor?.specialty && (
                                          <Badge variant="outline" className="text-xs font-normal">
                                            {doctor.specialty}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="reviews">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Patient Reviews</h3>
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-5 w-5 ${i < Math.floor(clinic.ratings.overall) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="ml-2 font-bold">{clinic.ratings.overall}</span>
                            <span className="ml-1 text-gray-500">({clinic.ratings.reviews})</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="bg-white rounded-lg p-4 border">
                            <h4 className="font-medium mb-3">Rating Breakdown</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Cleanliness</span>
                                <div className="flex items-center">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(4.8 / 5) * 100}%` }}></div>
                                  </div>
                                  <span className="text-sm font-medium">4.8</span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Communication</span>
                                <div className="flex items-center">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(4.7 / 5) * 100}%` }}></div>
                                  </div>
                                  <span className="text-sm font-medium">4.7</span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Value</span>
                                <div className="flex items-center">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(4.9 / 5) * 100}%` }}></div>
                                  </div>
                                  <span className="text-sm font-medium">4.9</span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Quality</span>
                                <div className="flex items-center">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(4.8 / 5) * 100}%` }}></div>
                                  </div>
                                  <span className="text-sm font-medium">4.8</span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Service</span>
                                <div className="flex items-center">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(4.7 / 5) * 100}%` }}></div>
                                  </div>
                                  <span className="text-sm font-medium">4.7</span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Comfort</span>
                                <div className="flex items-center">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(4.6 / 5) * 100}%` }}></div>
                                  </div>
                                  <span className="text-sm font-medium">4.6</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 border">
                            <h4 className="font-medium mb-3">What Patients Say</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                                <span>"Professional staff and excellent results"</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                                <span>"Very clean and modern facilities"</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                                <span>"Great value compared to UK prices"</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                                <span>"Excellent communication and care"</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                                <span>"Painless procedures and friendly staff"</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium">Recent Reviews</h4>
                          
                          {clinic.featuredReviews && Array.isArray(clinic.featuredReviews) && clinic.featuredReviews.length > 0 ? 
                            clinic.featuredReviews.map((review, i) => (
                              <div key={i} className="bg-white rounded-lg p-4 border">
                                <div className="flex justify-between mb-2">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                      <User className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium">{review?.author || 'Patient'}</div>
                                      <div className="text-xs text-gray-500">{review?.date || 'April 2025'}</div>
                                    </div>
                                  </div>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700">{review?.text || 'Great experience with friendly staff and excellent results.'}</p>
                              </div>
                            )) : 
                            <div className="bg-white rounded-lg p-4 border">
                              <div className="flex justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                    <User className="h-4 w-4 text-gray-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Sarah Johnson</div>
                                    <div className="text-xs text-gray-500">April 2025</div>
                                  </div>
                                </div>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">Excellent experience from start to finish. The clinic was immaculate, staff were very professional, and my results exceeded expectations.</p>
                            </div>
                          }
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="about">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold">About {clinic.name}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white rounded-lg p-4 border">
                            <h4 className="font-medium mb-3">Clinic Information</h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-medium">Location</span>
                                  <p className="text-gray-600">{clinic.location.address}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <Award className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-medium">Certifications</span>
                                  <div className="text-gray-600 mt-1">
                                    {clinic.certifications && Array.isArray(clinic.certifications) && clinic.certifications.length > 0 ? 
                                      clinic.certifications.map((cert, i) => (
                                        <div key={i} className="mb-1">
                                          {cert?.name || 'ISO Certification'} (2023)
                                          <div className="text-xs">International certification</div>
                                        </div>
                                      )) : 
                                      <div className="mb-1">
                                        ISO Certification (2023)
                                        <div className="text-xs">International certification</div>
                                      </div>
                                    }
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <Languages className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-medium">Languages Spoken</span>
                                  <p className="text-gray-600">
                                    English, Turkish
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <CreditCard className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-medium">Payment Options</span>
                                  <p className="text-gray-600">{clinic.paymentOptions && Array.isArray(clinic.paymentOptions) ? clinic.paymentOptions.join(', ') : 'Credit/Debit Card, Cash'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 border">
                            <h4 className="font-medium mb-3">Why Choose Us</h4>
                            <div className="space-y-2 text-sm">
                              {clinic.uniqueSellingPoints && Array.isArray(clinic.uniqueSellingPoints) ? 
                                clinic.uniqueSellingPoints.map((point, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>{point}</span>
                                  </div>
                                )) : 
                                <div className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span>Experienced, international team of dentists</span>
                                </div>
                              }
                            </div>
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
                  </Tabs>
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={() => handleRequestQuote(clinic.id)} 
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    >
                      Request Final Quote
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
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
              Back to Treatment Plan
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