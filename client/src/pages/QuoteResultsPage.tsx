
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Pencil, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Mail,
  Star,
  Award,
  Shield,
  Users,
  ArrowRight,
  Download,
  Share2
} from 'lucide-react';
import { getQuoteData, updateQuoteData } from '@/services/quoteState';
import { useLocation } from 'wouter';
import TreatmentPlanBuilder from '@/components/TreatmentPlanBuilder';
import { PlanTreatmentItem } from '@/components/TreatmentPlanBuilder';
import ClinicTreatmentDisplay from '@/components/ClinicTreatmentDisplay';
import { ClinicInfo } from '@/types/clinic';

interface PromoCodeInfo {
  id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed_amount';
  description: string;
}

const QuoteResultsPage: React.FC = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Simplified state management
  const [showClinics, setShowClinics] = useState(false);
  const [treatmentItems, setTreatmentItems] = useState<PlanTreatmentItem[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<ClinicInfo | null>(null);
  const [hasPromoCode, setHasPromoCode] = useState(false);
  const [promoCodeInfo, setPromoCodeInfo] = useState<PromoCodeInfo | null>(null);

  // Load quote data on mount
  useEffect(() => {
    const quoteData = getQuoteData();
    if (quoteData) {
      // Load existing treatments if available
      if (quoteData.treatments && quoteData.treatments.length > 0) {
        const mappedTreatments: PlanTreatmentItem[] = quoteData.treatments.map((treatment, index) => ({
          id: `treatment-${index}`,
          category: treatment.category || 'General',
          name: treatment.name,
          quantity: treatment.quantity || 1,
          priceGBP: treatment.priceGBP || 0,
          priceUSD: treatment.priceUSD || 0,
          subtotalGBP: (treatment.priceGBP || 0) * (treatment.quantity || 1),
          subtotalUSD: (treatment.priceUSD || 0) * (treatment.quantity || 1),
          guarantee: treatment.guarantee || '1 year'
        }));
        setTreatmentItems(mappedTreatments);
        setShowClinics(mappedTreatments.length > 0);
      }

      // Load promo code info if available
      if (quoteData.promoCode) {
        setHasPromoCode(true);
        setPromoCodeInfo({
          id: 'promo-1',
          code: quoteData.promoCode,
          discount: quoteData.promoDiscount || 0,
          discountType: 'fixed_amount',
          description: `${quoteData.promoDiscount || 0}£ discount applied`
        });
      }
    }
  }, []);

  // Simplified treatment plan change handler
  const handleTreatmentPlanChange = (items: PlanTreatmentItem[]) => {
    setTreatmentItems(items);
    
    // Automatically show clinics when treatments are added
    if (items.length > 0) {
      setShowClinics(true);
      toast({
        title: "Treatments Added!",
        description: "Scroll down to see available clinics for your treatments.",
      });
      
      // Smooth scroll to clinics section after a brief delay
      setTimeout(() => {
        const clinicsSection = document.getElementById('clinics-section');
        if (clinicsSection) {
          clinicsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500);
    } else {
      setShowClinics(false);
    }
  };

  // Simplified clinic selection
  const handleClinicSelect = (clinic: ClinicInfo) => {
    setSelectedClinic(clinic);
    
    toast({
      title: "Clinic Selected",
      description: `You've selected ${clinic.name}. Scroll down to complete your booking.`,
    });
    
    // Scroll to final booking section
    setTimeout(() => {
      const bookingSection = document.getElementById('booking-section');
      if (bookingSection) {
        bookingSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 500);
  };

  const handleEditQuote = () => {
    setLocation('/');
  };

  const handleDownloadPDF = () => {
    toast({
      title: "PDF Download",
      description: "Your quote PDF is being generated...",
    });
  };

  const handleShareQuote = () => {
    toast({
      title: "Share Quote",
      description: "Quote sharing link copied to clipboard!",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Dental Treatment Quote</h1>
          <p className="text-gray-600">Build your treatment plan and compare clinic options</p>
        </div>

        {/* Simplified Progress tracker */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            {/* Promo Code Success Banner */}
            {hasPromoCode && promoCodeInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">
                        🎉 Promo Code Applied Successfully!
                      </h3>
                      <p className="text-green-700">
                        Code "{promoCodeInfo.code}" - You saved £{promoCodeInfo.discount?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Simple Progress Steps */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Pencil className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium">1. Build Treatment Plan</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <div className="flex items-center">
                <div className={`rounded-full p-2 mr-3 ${showClinics ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <MapPin className={`w-5 h-5 ${showClinics ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <span className={`font-medium ${showClinics ? 'text-gray-900' : 'text-gray-400'}`}>
                  2. Select Clinic
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <div className="flex items-center">
                <div className={`rounded-full p-2 mr-3 ${selectedClinic ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Calendar className={`w-5 h-5 ${selectedClinic ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <span className={`font-medium ${selectedClinic ? 'text-gray-900' : 'text-gray-400'}`}>
                  3. Book Appointment
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Always show treatment builder */}
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
            </CardContent>
          </Card>
        </div>

        {/* Show clinic selection when treatments are added */}
        {showClinics && treatmentItems.length > 0 && (
          <div id="clinics-section" className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold">
                  <MapPin className="mr-2 h-5 w-5 text-green-500" />
                  Choose Your Clinic
                </CardTitle>
                <CardDescription>
                  Compare clinics and select the one that best fits your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClinicTreatmentDisplay 
                  treatments={treatmentItems}
                  onClinicSelect={handleClinicSelect}
                  selectedClinic={selectedClinic}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Final booking section */}
        {selectedClinic && (
          <div id="booking-section" className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold">
                  <Calendar className="mr-2 h-5 w-5 text-purple-500" />
                  Complete Your Booking
                </CardTitle>
                <CardDescription>
                  You're almost done! Review your selection and proceed to booking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold mb-4">Booking Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Selected Clinic:</span>
                      <span className="font-medium">{selectedClinic.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of Treatments:</span>
                      <span className="font-medium">{treatmentItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Estimated Cost:</span>
                      <span className="font-medium text-green-600">
                        £{treatmentItems.reduce((sum, item) => sum + item.subtotalGBP, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={() => setLocation('/booking')} 
                    className="flex-1"
                    size="lg"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadPDF}
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleShareQuote}
                    size="lg"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick actions for empty state */}
        {treatmentItems.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-semibold mb-4">Ready to start your dental journey?</h2>
              <p className="text-gray-600 mb-6">
                Add treatments to your plan above to see clinic options and get pricing.
              </p>
              <Button onClick={handleEditQuote} variant="outline">
                <Pencil className="w-4 h-4 mr-2" />
                Start New Quote
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteResultsPage;
