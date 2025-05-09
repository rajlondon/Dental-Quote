import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { usePromoBySlug, useActivePromos } from '@/features/promo/usePromoApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import EnhancedOffersCarousel from '@/components/EnhancedOffersCarousel';

/**
 * Test page to verify promo functionality
 */
export default function PromoTestPage() {
  const [, navigate] = useLocation();
  
  // Get the query parameters from the URL
  const searchParams = new URLSearchParams(window.location.search);
  const promoSlug = searchParams.get('promo');
  
  // Use our hook to fetch the promo data if a slug is provided
  const { data: promoData, isLoading: isPromoLoading, error: promoError } = usePromoBySlug(promoSlug);
  
  // Simulate clicking a promo and then navigating back to test session persistence
  const handleSimulateClick = (slug: string, clinicId?: string) => {
    if (clinicId) {
      sessionStorage.setItem('promoSelectedClinicId', clinicId);
    }
    
    // Navigate to quote page with promo slug
    navigate(`/your-quote?promo=${encodeURIComponent(slug)}`);
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">Promo Test Page</h1>
      </div>
      
      {/* PromoCard carousel section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Available Promotions</h2>
        <EnhancedOffersCarousel />
      </section>
      
      {/* Selected promo details section (when slug is provided) */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Selected Promotion</h2>
        {promoSlug ? (
          <div>
            {isPromoLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-3/4" />
                </CardContent>
              </Card>
            ) : promoError || !promoData?.success ? (
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700">Error Loading Promotion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{promoError?.message || 'Failed to load promotion details'}</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{promoData.data.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{promoData.data.description}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Promotion Details</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Badge>Type: {promoData.data.promoType}</Badge>
                        <Badge>Discount: {promoData.data.discountValue}{promoData.data.discountType === DiscountType.PERCENT ? '%' : ' GBP'}</Badge>
                        <Badge variant="outline">
                          Starts: {new Date(promoData.data.startDate).toLocaleDateString()}
                        </Badge>
                        <Badge variant="outline">
                          Ends: {new Date(promoData.data.endDate).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    
                    {promoData.data.clinics && promoData.data.clinics.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Associated Clinics</h3>
                        <div className="space-y-2">
                          {promoData.data.clinics.map(clinic => (
                            <div key={clinic.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                              <span className="font-medium">{clinic.clinicId}</span>
                              <Button
                                size="sm"
                                onClick={() => handleSimulateClick(promoData.data.slug, clinic.clinicId)}
                              >
                                Apply for this Clinic
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {promoData.data.items && promoData.data.items.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Included Items</h3>
                        <div className="space-y-2">
                          {promoData.data.items.map(item => (
                            <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                              <Badge variant="secondary">{item.itemType}</Badge>
                              <span>{item.itemCode}</span>
                              {item.qty > 1 && (
                                <Badge variant="outline">x{item.qty}</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <p className="text-gray-500 text-center">
                No promotion selected. Please select a promotion from the carousel above.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
      
      {/* Session storage info */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Session Storage</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">promoSelectedClinicId:</span>
                <Badge variant={sessionStorage.getItem('promoSelectedClinicId') ? 'default' : 'outline'}>
                  {sessionStorage.getItem('promoSelectedClinicId') || 'Not set'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">activePromoSlug:</span>
                <Badge variant={sessionStorage.getItem('activePromoSlug') ? 'default' : 'outline'}>
                  {sessionStorage.getItem('activePromoSlug') || 'Not set'}
                </Badge>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  sessionStorage.removeItem('promoSelectedClinicId');
                  sessionStorage.removeItem('activePromoSlug');
                  // Force a re-render
                  window.location.reload();
                }}
              >
                Clear Session Storage
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}