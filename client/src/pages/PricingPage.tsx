import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
// Removed react-i18next
import PriceCalculator from '@/components/PriceCalculator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';

interface URLParams {
  city?: string;
  treatment?: string;
  promo?: string;
  package?: string;
  from?: string;
}

const PricingPage: React.FC = () => {
  // Translation removed
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [urlParams, setUrlParams] = useState<URLParams>({});
  const [selectedCity, setSelectedCity] = useState('istanbul');

  useEffect(() => {
    // Parse URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const params: URLParams = {
      city: searchParams.get('city') || 'istanbul',
      treatment: searchParams.get('treatment') || '',
      promo: searchParams.get('promo') || '',
      package: searchParams.get('package') || '',
      from: searchParams.get('from') || ''
    };

    setUrlParams(params);
    setSelectedCity(params.city || 'istanbul');

    // Handle promo code from URL or session
    const promoCode = params.promo || sessionStorage.getItem('pendingPromoCode');
    if (promoCode) {
      toast({
        title: "Promo Code Applied",
        description: `Promo code "${promoCode}" is ready to be applied to your quote.`,
      });
    }

    // Handle package data from session
    const packageData = sessionStorage.getItem('pendingPackageData');
    if (packageData) {
      try {
        const pkg = JSON.parse(packageData);
        toast({
          title: "Package Selected",
          description: `${pkg.name} package has been pre-selected for you.`,
        });
      } catch (error) {
        console.error('Error parsing package data:', error);
      }
    }

    // Set page title based on source
    const sourceDescriptions = {
      'search': 'Treatment Search Results',
      'offer': 'Special Offer Treatment Selection',
      'package': 'Package Treatment Selection',
      'email': 'Email Promotion Treatment Selection',
      'social': 'Social Media Promotion Treatment Selection'
    };

    const pageTitle = sourceDescriptions[params.from as keyof typeof sourceDescriptions] || 'Treatment Selection';
    document.title = `${pageTitle} | MyDentalFly`;
  }, [toast]);

  const getCityDisplayName = (cityCode: string) => {
    const cityMap: { [key: string]: string } = {
      'istanbul': 'Istanbul, Turkey',
      'ankara': 'Ankara, Turkey',
      'izmir': 'Izmir, Turkey',
      'antalya': 'Antalya, Turkey'
    };
    return cityMap[cityCode] || 'Istanbul, Turkey';
  };

  const getSourceDescription = () => {
    switch (urlParams.from) {
      case 'search':
        return 'Based on your search criteria';
      case 'offer':
        return 'Special offer applied';
      case 'package':
        return 'Package pre-selected';
      case 'email':
        return 'From your email promotion';
      case 'social':
        return 'From social media promotion';
      default:
        return 'Get your personalized quote';
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        {/* Header Section */}
        <div className="bg-white border-b border-neutral-200 py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/')}
                className="flex items-center text-neutral-600 hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>

              <div className="flex items-center text-sm text-neutral-600">
                <MapPin className="w-4 h-4 mr-1" />
                {getCityDisplayName(selectedCity)}
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                Select Your Dental Treatments
              </h1>
              <p className="text-lg text-neutral-600 mb-2">
                {getSourceDescription()}
              </p>
              <p className="text-sm text-neutral-500">
                Prices shown are for {getCityDisplayName(selectedCity)} • Instant quotes • No hidden fees
              </p>
            </div>
          </div>
        </div>

        {/* City Selection Bar */}
        <div className="bg-blue-50 border-b border-blue-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-6">
              <span className="text-sm font-medium text-blue-800">Choose your destination:</span>
              {['istanbul', 'ankara', 'izmir', 'antalya'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    // Update URL without page reload
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('city', city);
                    window.history.replaceState({}, '', newUrl.toString());
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCity === city
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {getCityDisplayName(city).split(',')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white py-4 border-b border-neutral-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-8">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                <span className="ml-3 text-sm font-medium text-blue-600">Select Treatments</span>
              </div>
              <div className="w-12 h-0.5 bg-neutral-200"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full border-2 border-neutral-300 text-neutral-400 flex items-center justify-center text-sm font-bold">2</div>
                <span className="ml-3 text-sm text-neutral-400">View Clinics</span>
              </div>
              <div className="w-12 h-0.5 bg-neutral-200"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full border-2 border-neutral-300 text-neutral-400 flex items-center justify-center text-sm font-bold">3</div>
                <span className="ml-3 text-sm text-neutral-400">Patient Portal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Price Calculator */}
        <div className="container mx-auto px-4 py-8">
          <PriceCalculator 
            selectedCity={selectedCity}
            preselectedTreatment={urlParams.treatment}
            promoCode={urlParams.promo}
            packageData={urlParams.package}
            onQuoteComplete={(quoteData) => {
              // Store quote data and redirect to clinic results
              localStorage.setItem('quoteData', JSON.stringify({
                ...quoteData,
                selectedCity,
                sourceFlow: urlParams.from
              }));

              // Check if promo code restricts to specific clinic
              const pendingPromoCode = sessionStorage.getItem('pendingPromoCode');
              if (pendingPromoCode) {
                // Go to filtered clinic results
                setLocation(`/matched-clinics?promo=${encodeURIComponent(pendingPromoCode)}&city=${selectedCity}`);
              } else {
                // Go to all clinic results
                setLocation(`/matched-clinics?city=${selectedCity}`);
              }
            }}
          />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PricingPage;