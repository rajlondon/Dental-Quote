import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Phone, Mail, Calendar, Package, TrendingUp, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clinicsData } from '../data/clinicData';
import { getEducationContent } from '../data/treatmentEducation';

interface TreatmentItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

interface ClinicResult {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  contact: {
    phone: string;
    email: string;
  };
  pricing: {
    subtotal: number;
    discount: number;
    total: number;
    ukComparison?: number;
    savings?: number;
    savingsPercentage?: number;
  };
  treatments: TreatmentItem[];
  isSpecialOffer?: boolean;
}

export default function MatchedClinicsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTreatments, setSelectedTreatments] = useState<TreatmentItem[]>([]);
  const [clinicResults, setClinicResults] = useState<ClinicResult[]>([]);
  const [isSpecialOfferFlow, setIsSpecialOfferFlow] = useState(false);
  const [associatedClinicId, setAssociatedClinicId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTreatmentData();
    generateClinicResults();
  }, []);

  const loadTreatmentData = () => {
    // Load treatment data from session storage
    const storedTreatments = sessionStorage.getItem('selectedTreatments');
    const storedIsSpecialOffer = sessionStorage.getItem('isSpecialOfferFlow');
    const storedAssociatedClinicId = sessionStorage.getItem('associatedClinicId');

    if (storedTreatments) {
      setSelectedTreatments(JSON.parse(storedTreatments));
    }

    if (storedIsSpecialOffer) {
      setIsSpecialOfferFlow(JSON.parse(storedIsSpecialOffer));
    }

    if (storedAssociatedClinicId) {
      setAssociatedClinicId(storedAssociatedClinicId);
    }
  };

  const generateClinicResults = () => {
    const storedTreatments = sessionStorage.getItem('selectedTreatments');
    const storedIsSpecialOffer = sessionStorage.getItem('isSpecialOfferFlow');
    const storedAssociatedClinicId = sessionStorage.getItem('associatedClinicId');

    if (!storedTreatments) {
      toast({
        title: "No Treatment Data",
        description: "Please select treatments first.",
        variant: "destructive"
      });
      setLocation('/your-quote');
      return;
    }

    const treatments: TreatmentItem[] = JSON.parse(storedTreatments);
    const isSpecialOffer = storedIsSpecialOffer ? JSON.parse(storedIsSpecialOffer) : false;
    const associatedClinicId = storedAssociatedClinicId;

    // Filter clinics based on flow type
    const targetClinics = isSpecialOffer && associatedClinicId
      ? clinicsData.filter(clinic => clinic.id === associatedClinicId)
      : clinicsData;

    const results: ClinicResult[] = targetClinics.map(clinic => {
      const clinicResult = generateClinicQuote(clinic, treatments, isSpecialOffer);
      return clinicResult;
    });

    setClinicResults(results);
    setIsLoading(false);
  };

  const generateClinicQuote = (clinic: any, treatments: TreatmentItem[], isSpecialOffer: boolean): ClinicResult => {
    let subtotal = 0;
    let ukComparison = 0;

    // Calculate pricing based on flow type
    if (isSpecialOffer) {
      // Special offer flow: Use exact prices from treatment plan
      subtotal = treatments.reduce((sum, treatment) => sum + treatment.total, 0);

      // Calculate UK comparison (roughly 2.5x Turkey prices)
      ukComparison = Math.round(subtotal * 2.5);
    } else {
      // Normal flow: Use clinic-specific pricing within the range
      const clinicPricingFactor = getClinicPricingFactor(clinic.id);

      treatments.forEach(treatment => {
        if (treatment.priceRange) {
          // Use clinic-specific pricing within the range
          const clinicPrice = Math.round(
            treatment.priceRange.min + 
            (treatment.priceRange.max - treatment.priceRange.min) * clinicPricingFactor
          );
          subtotal += clinicPrice * treatment.quantity;
        } else {
          subtotal += treatment.total;
        }
      });

      // Calculate UK comparison
      ukComparison = Math.round(subtotal * 2.5);
    }

    const discount = 0; // Will be calculated if promo codes are applied
    const total = subtotal - discount;
    const savings = ukComparison - total;
    const savingsPercentage = ukComparison > 0 ? Math.round((savings / ukComparison) * 100) : 0;

    return {
      id: clinic.id,
      name: clinic.name,
      location: clinic.location,
      rating: clinic.rating,
      reviewCount: clinic.reviewCount,
      specialties: clinic.specialties,
      contact: clinic.contact,
      pricing: {
        subtotal,
        discount,
        total,
        ukComparison,
        savings,
        savingsPercentage
      },
      treatments: treatments.map(treatment => ({
        ...treatment,
        // Update unit price for normal flow
        unitPrice: isSpecialOffer ? treatment.unitPrice : Math.round(
          treatment.priceRange ? 
            treatment.priceRange.min + (treatment.priceRange.max - treatment.priceRange.min) * getClinicPricingFactor(clinic.id) :
            treatment.unitPrice
        )
      })),
      isSpecialOffer
    };
  };

  const getClinicPricingFactor = (clinicId: string): number => {
    // Different clinics have different pricing within the range
    const factors: Record<string, number> = {
      'dentgroup-istanbul': 0.3,
      'maltepe-dental-clinic': 0.7,
      'istanbul-dental-care': 0.4,
      'beyazada-dental': 0.8,
      'dentspa-clinic': 0.6,
    };

    return factors[clinicId] || 0.5;
  };

  const handleBookConsultation = (clinicId: string) => {
    // Store selected clinic and navigate to booking
    sessionStorage.setItem('selectedClinicId', clinicId);
    setLocation(`/booking?clinicId=${clinicId}`);
  };

  const handleViewClinicDetails = (clinicId: string) => {
    setLocation(`/clinic/${clinicId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (clinicResults.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No Clinics Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find any clinics matching your criteria.
        </p>
        <Button onClick={() => setLocation('/your-quote')}>
          Back to Treatment Selection
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isSpecialOfferFlow ? 'Special Offer Clinic' : 'Matched Clinics'}
        </h1>
        <p className="text-muted-foreground">
          {isSpecialOfferFlow 
            ? 'Your personalized quote from the selected clinic'
            : 'Compare quotes from top-rated Istanbul dental clinics'
          }
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {clinicResults.map((clinic) => (
          <Card key={clinic.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{clinic.name}</CardTitle>
                    {clinic.isSpecialOffer && (
                      <Badge variant="default" className="bg-amber-500">
                        <Package className="h-3 w-3 mr-1" />
                        Special Offer
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{clinic.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{clinic.rating}</span>
                      <span>({clinic.reviewCount} reviews)</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {clinic.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-primary mb-1">
                    £{clinic.pricing.total.toLocaleString()}
                  </div>
                  {!isSpecialOfferFlow && clinic.pricing.ukComparison && (
                    <div className="text-sm text-muted-foreground">
                      UK: £{clinic.pricing.ukComparison.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* UK Comparison (Normal Flow Only) */}
              {!isSpecialOfferFlow && clinic.pricing.ukComparison && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-800">UK vs Istanbul Comparison</div>
                      <div className="text-sm text-green-700">
                        You save £{clinic.pricing.savings?.toLocaleString()} 
                        ({clinic.pricing.savingsPercentage}% off UK prices)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600">UK Price</div>
                      <div className="text-lg font-semibold text-green-800">
                        £{clinic.pricing.ukComparison.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Treatment Breakdown */}
              <div>
                <h3 className="font-semibold mb-3">Treatment Breakdown</h3>
                <div className="space-y-3">
                  {clinic.treatments.map((treatment, index) => {
                    const educationContent = getEducationContent(treatment.id);
                    return (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{treatment.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {treatment.category}
                            </Badge>
                          </div>
                          {educationContent && (
                            <div className="text-xs text-muted-foreground">
                              {educationContent.materials} • {educationContent.warranty}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {treatment.quantity} × £{treatment.unitPrice}
                          </div>
                          <div className="font-medium">
                            £{(treatment.unitPrice * treatment.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>£{clinic.pricing.subtotal.toLocaleString()}</span>
                  </div>

                  {clinic.pricing.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-£{clinic.pricing.discount.toLocaleString()}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>£{clinic.pricing.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>{clinic.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>{clinic.contact.email}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleViewClinicDetails(clinic.id)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => handleBookConsultation(clinic.id)}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Consultation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Back to Treatment Selection */}
      <div className="mt-8 text-center">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/your-quote')}
        >
          Back to Treatment Selection
        </Button>
      </div>
    </div>
  );
}