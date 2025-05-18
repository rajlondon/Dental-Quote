import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFlaskIntegration } from '@/hooks/use-flask-integration';
import { QuoteBuilder } from '@/components/quote/QuoteBuilder';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

export default function QuoteDashboardPage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [specialOffers, setSpecialOffers] = useState<any[]>([]);
  
  // Get URL parameters
  const promoCode = searchParams.get('promo');
  const clinicId = searchParams.get('clinic');
  const offerId = searchParams.get('offer');
  const step = searchParams.get('step') || 'dental-chart';
  
  // Initialize Flask integration hook
  const {
    isConnected,
    error,
    getSpecialOffers,
    checkConnection
  } = useFlaskIntegration({
    autoSync: true,
    handleErrors: true
  });
  
  // Load special offers on mount
  useEffect(() => {
    const loadSpecialOffers = async () => {
      try {
        // First check if Flask backend is available
        await checkConnection();
        
        if (isConnected) {
          const offers = await getSpecialOffers();
          setSpecialOffers(offers);
        }
      } catch (err) {
        console.error('Error fetching special offers:', err);
        toast({
          title: 'Connection Issue',
          description: 'Could not load special offers. Using cached data.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSpecialOffers();
  }, [checkConnection, getSpecialOffers, isConnected, toast]);
  
  // Handle quote completion
  const handleQuoteComplete = (quoteData: any) => {
    toast({
      title: 'Quote Submitted',
      description: `Your quote (Ref: ${quoteData.reference}) has been submitted successfully.`,
      duration: 5000
    });
    
    // Here you could also do things like:
    // - Update user dashboard with new quote
    // - Track analytics events
    // - Redirect to another page
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dental Treatment Quote Builder</h1>
          <p className="text-lg text-gray-600">
            Get instant quotes for your dental treatment in Turkey. Save up to 70% compared to UK, US, and EU prices.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
            <span className="text-lg">Loading quote builder...</span>
          </div>
        ) : error ? (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Connection Error
              </CardTitle>
              <CardDescription>
                We're having trouble connecting to our quote builder service.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Our quote builder is temporarily unavailable. Please try again later or contact our support team for assistance.
              </p>
              <Button 
                variant="secondary" 
                onClick={() => {
                  window.location.reload();
                }}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Main quote builder component */}
            <QuoteBuilder 
              defaultStep={step}
              standalone={true}
              onComplete={handleQuoteComplete}
              clinicId={clinicId || undefined}
              promoCode={promoCode || undefined}
            />
            
            {/* Special offers section */}
            {specialOffers.length > 0 && !offerId && currentStep !== 'confirmation' && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Special Offers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {specialOffers.map((offer) => (
                    <Card key={offer.id} className="overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg">
                      <div className="relative h-48">
                        <img 
                          src={`/api/flask/static/${offer.image_path}`} 
                          alt={offer.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/fallback-offer.jpg';
                          }}
                        />
                        <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 m-3 rounded-full font-semibold text-sm">
                          {offer.discount}
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle>{offer.title}</CardTitle>
                        <CardDescription>{offer.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{offer.price}€</p>
                            <p className="text-gray-500 line-through">{offer.old_price}€</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            // Build URL with offer ID and promo code
                            const url = new URL(window.location.href);
                            url.searchParams.set('offer', offer.id);
                            if (offer.promo_code) {
                              url.searchParams.set('promo', offer.promo_code);
                            }
                            window.location.href = url.toString();
                          }}
                        >
                          View Deal
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Why choose us section */}
            <div className="mt-8 bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose MyDentalFly</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Save Up to 70%</h3>
                  <p className="text-gray-600">Significant savings compared to UK, US, and EU prices while maintaining top quality.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Verified Clinics</h3>
                  <p className="text-gray-600">All clinics are hand-selected and meet our strict quality and safety standards.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">All-Inclusive Packages</h3>
                  <p className="text-gray-600">Treatment, accommodation, and transfers included for a hassle-free experience.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function currentStep() {
  const [searchParams] = useSearchParams();
  return searchParams.get('step') || 'dental-chart';
}