import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import DirectPackageTest from '@/components/quote/DirectPackageTest';

export default function SpecialOfferTestPage() {
  const { toast } = useToast();

  const specialOffers = [
    {
      id: 'offer-001',
      title: 'Premium Implant Package',
      packageId: 'pkg-001',
      promoCode: 'IMPLANTCROWN30',
      description: 'Get premium dental implants with 30% discount on crown work',
      price: 1200
    },
    {
      id: 'offer-002',
      title: 'Luxury Smile Makeover',
      packageId: 'pkg-002',
      promoCode: 'LUXHOTEL20',
      description: '20% off on full smile makeover treatments plus luxury hotel accommodation',
      price: 2500
    },
    {
      id: 'offer-003',
      title: 'Travel & Treatment Bundle',
      packageId: 'pkg-003',
      promoCode: 'LUXTRAVEL',
      description: 'Comprehensive dental treatment with complimentary airport transfers',
      price: 1800
    }
  ];

  const handleBookOffer = (offer: any) => {
    toast({
      title: "Offer Selected",
      description: `You've selected the ${offer.title} package. Redirecting to quote builder...`,
    });
    
    // Simulate delay before redirect
    setTimeout(() => {
      // Build the URL with parameters
      const url = `/quote-builder?packageId=${offer.packageId}&promoCode=${offer.promoCode}&packageName=${encodeURIComponent(offer.title)}`;
      window.location.href = url;
    }, 1500);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Special Offers Test Page</h1>
      
      <p className="text-center text-gray-500 mb-8">
        This page tests the special offer to quote builder flow.
        Click on any "Book This Offer" button to simulate the user flow.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {specialOffers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
              <CardTitle>{offer.title}</CardTitle>
              <CardDescription className="text-white/90">{offer.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4">
                <p className="text-2xl font-bold">${offer.price}</p>
                <p className="text-xs text-gray-500">Starting price</p>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> Includes treatment package
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> Automatic promo code: {offer.promoCode}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> Seamless booking experience
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => handleBookOffer(offer)}
              >
                Book This Offer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold mb-2">Debug Information:</h2>
        <p className="text-sm text-gray-600">
          When you click a "Book This Offer" button, the system will:
        </p>
        <ol className="text-sm text-gray-600 list-decimal ml-5">
          <li>Redirect to the quote builder with packageId and promoCode in URL parameters</li>
          <li>The SpecialOfferHandler component will detect these parameters</li>
          <li>The package treatments will be automatically selected</li>
          <li>The promo code will be applied automatically</li>
        </ol>
      </div>
      
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Direct Package Test</h2>
        <p className="text-center text-gray-500 mb-6">
          This is a simplified test to verify package selection works without any API integration
        </p>
        <DirectPackageTest />
      </div>
    </div>
  );
}