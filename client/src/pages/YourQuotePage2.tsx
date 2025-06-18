import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ChevronRight, Sparkles, Info } from 'lucide-react';
import TreatmentPlanBuilder, { TreatmentItem as PlanTreatmentItem } from '@/components/TreatmentPlanBuilder';
import TreatmentGuide from '@/components/TreatmentGuide';

const YourQuotePage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Parse URL query parameters
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const selectedCity = searchParams.get('city') || 'Istanbul';
  const selectedOrigin = searchParams.get('origin') || 'UK';
  const initialTreatment = searchParams.get('treatment') || '';

  // Treatment Plan Builder State
  const [treatmentItems, setTreatmentItems] = useState<PlanTreatmentItem[]>([]);

  // Function to handle treatment plan changes
  const handleTreatmentPlanChange = (items: PlanTreatmentItem[]) => {
    setTreatmentItems(items);
  };

  // Function to proceed to clinic matching
  const handleProceedToClinicMatching = () => {
    if (treatmentItems.length === 0) {
      toast({
        title: "No Treatments Selected",
        description: "Please select at least one treatment to continue.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to matched clinics page with treatment data
    const treatmentData = encodeURIComponent(JSON.stringify(treatmentItems));
    setLocation(`/matched-clinics?treatments=${treatmentData}&city=${selectedCity}&origin=${selectedOrigin}`);
  };

  // Calculate totals
  const totalGBP = treatmentItems.reduce((sum, item) => sum + item.subtotalGBP, 0);
  const formatCurrency = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  useEffect(() => {
    document.title = "Build Your Dental Treatment Quote | MyDentalFly";

    // Initialize with a default treatment if one was selected
    if (initialTreatment && initialTreatment !== 'Flexible') {
      const defaultTreatment: PlanTreatmentItem = {
        id: `default_${Date.now()}`,
        category: 'implants',
        name: initialTreatment,
        quantity: 1,
        priceGBP: 450,
        priceUSD: 580,
        subtotalGBP: 450,
        subtotalUSD: 580,
        guarantee: '5-year'
      };
      setTreatmentItems([defaultTreatment]);
    }
  }, [initialTreatment]);

  return (
    <>
      <Navbar />
      <ScrollToTop />

      <main className="min-h-screen bg-gray-50 pt-24 pb-28">
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
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Build Your Treatment Plan</h1>
            <p className="text-gray-600">Choose your treatments below to get a clear quote estimate and find matching clinics in {selectedCity}.</p>
          </div>

          {/* Cost Comparison Summary */}
          {treatmentItems.length > 0 && (
            <div className="mb-8">
              <Card>
                <CardHeader className="border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-50">
                      <Sparkles className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Cost Comparison Summary</CardTitle>
                      <CardDescription>See how much you could save compared to UK dental treatments</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="bg-white border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium text-gray-600">Estimated UK Cost</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">£{formatCurrency(Math.round(totalGBP / 0.35))}</p>
                        <p className="text-sm text-gray-500 mt-1">Estimated UK Cost</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium text-green-700">Estimated {selectedCity} Price</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-green-700">£{formatCurrency(Math.round(totalGBP))}</p>
                        <p className="text-sm text-green-600 mt-1 font-medium">Save up to 65% compared to UK</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <p className="text-blue-700 text-sm">
                        Your final treatment quote will be confirmed by your chosen clinic after they've reviewed your dental information.
                        Payment for treatment is only made in-person, after your consultation and examination at the clinic.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Treatment Guide */}
          <TreatmentGuide />

          {/* Treatment Plan Builder */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Build Your Treatment Plan</CardTitle>
                <CardDescription>Add all the treatments you're interested in to get a comprehensive quote</CardDescription>
              </CardHeader>
              <CardContent>
                <TreatmentPlanBuilder 
                  initialTreatments={treatmentItems}
                  onTreatmentsChange={handleTreatmentPlanChange}
                />

                {treatmentItems.length > 0 && (
                  <div className="mt-6 text-center">
                    <Button 
                      size="lg"
                      onClick={handleProceedToClinicMatching}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                    >
                      Find Matching Clinics
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                    <div className="mt-2 text-center text-sm text-gray-500">
                      See clinics, packages, and complete your booking.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default YourQuotePage;