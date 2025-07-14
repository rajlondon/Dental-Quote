The code modification ensures that YourQuotePage.tsx has a single default export.
```

```replit_final_file
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { QuoteContext, useOptionalQuote } from '../contexts/QuoteContext';
import { TreatmentPlanBuilder } from '../components/TreatmentPlanBuilder';
import { PromoCodeInput } from '../components/PromoCodeInput';
import { Heart, MapPin, Star, Clock, Award, Shield, Plane, Hotel, Car, Users } from 'lucide-react';
import PriceCalculator from '../components/PriceCalculator';

function YourQuotePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [urlParams] = useState(() => new URLSearchParams(window.location.search));
  const specialOfferId = urlParams.get('offer') || null;

  console.log('Initializing YourQuotePage with URL params:', window.location.search);
  console.log('Special offer ID from URL:', specialOfferId);

  // Check for package promo codes in session storage
  useEffect(() => {
    const pendingPromoCode = sessionStorage.getItem('pendingPromoCode');
    const pendingPackageData = sessionStorage.getItem('pendingPackageData');

    if (pendingPromoCode && pendingPackageData) {
      console.log('Auto-applying package promo code:', pendingPromoCode);

      try {
        const packageData = JSON.parse(pendingPackageData);

        // Store clinic ID if provided
        const clinicId = sessionStorage.getItem('pendingPromoCodeClinicId');
        if (clinicId) {
          console.log('Storing promo code clinic ID:', clinicId);
        }

        // Emit the package event for any listeners
        const packageEvent = new CustomEvent('packagePromoApplied', {
          detail: {
            code: pendingPromoCode,
            packageData: packageData,
            clinicId: clinicId || null,
            directToResults: true
          }
        });
        window.dispatchEvent(packageEvent);
        console.log('🎯 Package promo event received:', [packageEvent.detail]);

        // Clear the session storage
        sessionStorage.removeItem('pendingPromoCode');
        sessionStorage.removeItem('pendingPackageData');
        sessionStorage.removeItem('pendingPromoCodeClinicId');

      } catch (error) {
        console.error('Error processing pending package data:', error);
      }
    } else {
      console.log('No special offer found in URL or sessionStorage');
    }
  }, []);

  // Check for existing treatment plan data
  const [treatmentPlanData, setTreatmentPlanData] = useState(() => {
    try {
      const savedData = localStorage.getItem('treatmentPlanData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log('Loaded treatment plan:', parsed.treatments);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading treatment plan:', error);
    }
    return null;
  });

  const handleGetQuotes = () => {
    // Navigate to results page
    setLocation('/matched-clinics');
  };

  return (
    <QuoteContext>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Treatment Quote
              </h1>
              <p className="text-gray-600">
                Review and customize your dental treatment plan
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Treatment Builder */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-primary" />
                    Build Your Treatment Plan
                  </CardTitle>
                  <CardDescription>
                    Select the treatments you need
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TreatmentPlanBuilder />
                </CardContent>
              </Card>

              {/* Promo Code Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Promo Code</CardTitle>
                  <CardDescription>
                    Have a discount code or package code? Enter it here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PromoCodeInput />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quote Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quote Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <PriceCalculator />
                </CardContent>
              </Card>

              {/* Action Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    onClick={handleGetQuotes}
                    className="w-full" 
                    size="lg"
                  >
                    Get Clinic Quotes
                  </Button>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Compare quotes from top Turkish dental clinics
                  </p>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      <span>100% Secure & Confidential</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Award className="h-4 w-4 mr-2 text-blue-600" />
                      <span>Licensed Dental Professionals</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>4.9/5 Patient Satisfaction</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </QuoteContext>
  );
}

export default YourQuotePage;