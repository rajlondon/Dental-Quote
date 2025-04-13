import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Check, Info, CreditCard, MessageCircle, Mail, Download, ChevronRight, Clock } from 'lucide-react';
import { TreatmentItem as PlanTreatmentItem } from '../components/TreatmentPlanBuilder';
import { type PatientInfo } from '../components/PatientInfoForm';

// Dummy data for clinic matching
interface Clinic {
  id: string;
  name: string;
  imageSrc: string;
  location: string;
  rating: number;
  reviewCount: number;
  priceRangeGBP: [number, number];
  features: string[];
  guaranteePeriod: string;
  amenities: string[];
  description: string;
  totalPriceGBP: number; // This would be calculated based on treatment plan
  includedServices: string[];
  availableFrom: string; // Earliest available appointment
}

interface MatchedClinicsPageProps {
  treatmentItems: PlanTreatmentItem[];
  patientInfo: PatientInfo;
  totalGBP: number;
  onSelectClinic: (clinicId: string) => void;
  onBackToInfo: () => void;
  onQuoteDownload: () => void;
  onEmailQuote: () => void;
}

const MatchedClinicsPage: React.FC<MatchedClinicsPageProps> = ({
  treatmentItems,
  patientInfo,
  totalGBP,
  onSelectClinic,
  onBackToInfo,
  onQuoteDownload,
  onEmailQuote
}) => {
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  
  // Dummy data for clinics - in a real app, this would come from an API call
  const matchedClinics: Clinic[] = [
    {
      id: 'clinic1',
      name: 'Istanbul Dental Care',
      imageSrc: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop',
      location: 'Şişli, Istanbul',
      rating: 4.7,
      reviewCount: 328,
      priceRangeGBP: [totalGBP * 0.8, totalGBP * 0.9],
      features: ['ISO Certified', '24/7 Support', 'English Speaking Staff'],
      guaranteePeriod: '5 years',
      amenities: ['Airport Transfer', 'Hotel Booking Assistance', 'Translation Services'],
      description: 'Istanbul Dental Care offers affordable quality dental treatments with modern facilities and experienced specialists.',
      totalPriceGBP: Math.round(totalGBP * 0.85),
      includedServices: ['Free Panoramic X-Ray', 'Free Consultation', 'Complimentary Airport Transfer'],
      availableFrom: 'May 15, 2025'
    },
    {
      id: 'clinic2',
      name: 'DentGroup Istanbul',
      imageSrc: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1974&auto=format&fit=crop',
      location: 'Kadıköy, Istanbul',
      rating: 4.9,
      reviewCount: 412,
      priceRangeGBP: [totalGBP * 0.95, totalGBP * 1.1],
      features: ['JCI Accredited', 'Premium Materials', 'Multilingual Staff'],
      guaranteePeriod: '10 years',
      amenities: ['VIP Airport Transfer', 'Luxury Hotel Arrangements', '24/7 Personal Assistant'],
      description: 'DentGroup Istanbul provides premium dental services with state-of-the-art technology and internationally trained specialists.',
      totalPriceGBP: Math.round(totalGBP * 1.0),
      includedServices: ['3D Dental Scan', 'Personalized Treatment Planning', 'Luxury Hotel Discount', 'VIP Airport Transfer'],
      availableFrom: 'May 8, 2025'
    },
    {
      id: 'clinic3',
      name: 'Maltepe Dental Clinic',
      imageSrc: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?q=80&w=2069&auto=format&fit=crop',
      location: 'Maltepe, Istanbul',
      rating: 4.8,
      reviewCount: 256,
      priceRangeGBP: [totalGBP * 1.1, totalGBP * 1.25],
      features: ['ISO & JCI Certified', 'Premium German Materials', 'Celebrity Dentists'],
      guaranteePeriod: 'Lifetime',
      amenities: ['Luxury Car Service', '5-Star Hotel Booking', 'Personal Concierge', 'Tourist Attractions Package'],
      description: 'Maltepe Dental Clinic is an exclusive dental center known for serving celebrities and VIPs with the highest quality treatments.',
      totalPriceGBP: Math.round(totalGBP * 1.15),
      includedServices: ['Executive CT Scan', 'Digital Smile Design', '5-Star Hotel Accommodation', 'Luxury Transportation', 'City Tour'],
      availableFrom: 'May 5, 2025'
    }
  ];

  const handleSelectClinic = (clinicId: string) => {
    setSelectedClinicId(clinicId);
  };

  const handleProceedToPayment = () => {
    if (selectedClinicId) {
      onSelectClinic(selectedClinicId);
    }
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-GB', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="space-y-8">
      {/* Clinic Selection Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">Matched Clinics for Your Treatment</h2>
            <p className="text-gray-600">
              We've matched you with {matchedClinics.length} clinics that specialize in 
              {treatmentItems.map(item => item.name).join(', ')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={onEmailQuote} variant="outline" size="sm" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Quote
            </Button>
            <Button onClick={onQuoteDownload} variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md text-sm flex items-center mb-4">
          <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-800">How we match you with clinics</p>
            <p className="text-blue-700 mt-1">
              Our clinics are carefully vetted based on quality certifications, patient reviews, 
              specialist qualifications, and treatment success rates. Each clinic offers different service 
              levels and pricing.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Your Treatment Plan</p>
            <p className="font-medium">
              {treatmentItems.map(item => `${item.name} (${item.quantity})`).join(', ')}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Preferred Travel Month</p>
            <p className="font-medium">{patientInfo.travelMonth || 'Flexible'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Departure City</p>
            <p className="font-medium">{patientInfo.departureCity || 'Not specified'}</p>
          </div>
        </div>
      </div>
      
      {/* Clinic Cards */}
      <div className="space-y-6">
        {matchedClinics.map((clinic) => (
          <Card 
            key={clinic.id} 
            className={`overflow-hidden ${selectedClinicId === clinic.id ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Image Column */}
              <div className="relative">
                <img 
                  src={clinic.imageSrc} 
                  alt={clinic.name} 
                  className="h-full w-full object-cover object-center max-h-[250px] lg:max-h-none"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    Recommended
                  </Badge>
                </div>
              </div>
              
              {/* Content Column */}
              <div className="p-6 lg:col-span-2">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{clinic.name}</h3>
                        <div className="flex items-center text-sm mt-1">
                          <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-gray-600">{clinic.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <span className="text-amber-500 font-semibold mr-1">{clinic.rating}</span>
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span className="text-gray-500 text-sm ml-1">({clinic.reviewCount} reviews)</span>
                        </div>
                        <div className="mt-1">
                          <Badge variant="outline" className="font-normal">
                            {clinic.guaranteePeriod} Guarantee
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mt-3">{clinic.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {clinic.features.map((feature, index) => (
                        <Badge variant="secondary" key={index} className="font-normal">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Pricing Section */}
                  <div className="mt-auto">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-end">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">What's Included</p>
                        <ul className="space-y-1">
                          {clinic.includedServices.map((service, index) => (
                            <li key={index} className="flex items-baseline text-sm">
                              <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                              <span>{service}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center mt-3 text-sm text-blue-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Available from {clinic.availableFrom}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 lg:mt-0 text-right">
                        <div className="mb-2">
                          <p className="text-sm text-gray-500">Total Price</p>
                          <p className="text-2xl font-bold">£{formatCurrency(clinic.totalPriceGBP)}</p>
                          <p className="text-xs text-gray-500">Final price confirmed after consultation</p>
                        </div>
                        
                        <div className="flex gap-2 mt-3 justify-end">
                          {selectedClinicId === clinic.id ? (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => setSelectedClinicId(null)}
                                size="sm"
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleProceedToPayment}
                                className="flex items-center gap-1"
                                size="sm"
                              >
                                Proceed to Payment
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={() => handleSelectClinic(clinic.id)}
                              size="sm"
                            >
                              Select This Clinic
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Deposit Information */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">About Your £200 Refundable Deposit</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
              <span className="text-xs">1</span>
            </div>
            <p className="text-blue-700">
              Your £200 deposit secures your consultation and is fully refundable if you cancel at least 14 days before your scheduled treatment.
            </p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
              <span className="text-xs">2</span>
            </div>
            <p className="text-blue-700">
              If you proceed with treatment, your deposit will be deducted from your final treatment cost.
            </p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
              <span className="text-xs">3</span>
            </div>
            <p className="text-blue-700">
              After payment, you'll gain immediate access to your Patient Portal where you can securely share dental records and communicate with your chosen clinic.
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom Actions */}
      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={onBackToInfo}
          className="flex items-center gap-2"
        >
          Back to Your Information
        </Button>
        
        {selectedClinicId && (
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Ask a Question
            </Button>
            <Button 
              onClick={handleProceedToPayment}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Pay £200 Deposit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchedClinicsPage;