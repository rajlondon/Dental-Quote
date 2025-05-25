import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Tag, Calendar, MapPin } from 'lucide-react';
import { useLocation } from 'wouter';

interface SpecialOffer {
  id: string;
  promoCode: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  expiryDate?: string;
  clinicName?: string;
  isActive: boolean;
}

interface TreatmentPackage {
  id: string;
  promoCode: string;
  title: string;
  description: string;
  totalPrice: number;
  originalPrice: number;
  savings: number;
  expiryDate?: string;
  clinicName?: string;
  isActive: boolean;
}

export function FeaturedPromotions() {
  const [, setLocation] = useLocation();

  const { data: specialOffers = [], isLoading: loadingOffers } = useQuery({
    queryKey: ['/api/special-offers/homepage'],
    queryFn: async () => {
      const response = await fetch('/api/special-offers/homepage');
      if (!response.ok) throw new Error('Failed to fetch special offers');
      return response.json();
    },
  });

  const { data: treatmentPackages = [], isLoading: loadingPackages } = useQuery({
    queryKey: ['/api/treatment-packages/featured'],
    queryFn: async () => {
      const response = await fetch('/api/treatment-packages/featured');
      if (!response.ok) throw new Error('Failed to fetch treatment packages');
      return response.json();
    },
  });

  const handlePromoClick = (promoCode: string) => {
    // Store all necessary promo data for seamless flow
    sessionStorage.setItem('selectedPromoCode', promoCode);
    sessionStorage.setItem('pendingPromoCode', promoCode);
    sessionStorage.setItem('autoApplyPromo', 'true');
    sessionStorage.setItem('promoClickSource', 'special-offer');
    
    console.log('Special Offer clicked, stored promo code:', promoCode);
    
    // Navigate directly to quote flow with promo pre-filled
    setLocation('/get-quote?promo=' + encodeURIComponent(promoCode) + '&auto=true');
  };

  const formatDiscount = (offer: SpecialOffer) => {
    if (offer.discountType === 'PERCENTAGE') {
      return `${offer.discountValue}% OFF`;
    } else {
      return `£${offer.discountValue} OFF`;
    }
  };

  const formatExpiryDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  if (loadingOffers && loadingPackages) {
    return (
      <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Special Offers</h2>
            <p className="text-gray-600">Loading exclusive deals...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const allPromotions = [
    ...specialOffers.map((offer: SpecialOffer) => ({ ...offer, type: 'offer' })),
    ...treatmentPackages.map((pkg: TreatmentPackage) => ({ ...pkg, type: 'package' }))
  ].filter((promo: any) => promo.isActive);

  if (allPromotions.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-yellow-500 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Special Offers</h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Click any offer below to start your quote with the promo code automatically applied!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPromotions.slice(0, 6).map((promo: any) => (
            <Card 
              key={promo.id} 
              className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
              onClick={() => handlePromoClick(promo.promo_code || promo.promoCode)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge 
                    variant={promo.type === 'offer' ? 'default' : 'secondary'}
                    className="mb-2"
                  >
                    {promo.type === 'offer' ? 'Special Offer' : 'Treatment Package'}
                  </Badge>
                  {promo.expiryDate && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      Until {formatExpiryDate(promo.expiryDate)}
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2">
                  {promo.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 line-clamp-2">
                  {promo.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Discount/Savings Display */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-600">
                      {promo.type === 'offer' 
                        ? formatDiscount(promo)
                        : `Save £${promo.savings}`
                      }
                    </div>
                    {promo.type === 'package' && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">£{promo.totalPrice}</div>
                        <div className="text-sm text-gray-500 line-through">£{promo.originalPrice}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Promo Code */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 text-primary mr-2" />
                      <span className="font-mono font-bold text-primary">{promo.promoCode}</span>
                    </div>
                  </div>
                  
                  {/* Clinic Name */}
                  {promo.clinicName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {promo.clinicName}
                    </div>
                  )}
                  
                  {/* CTA Button */}
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePromoClick(promo.promoCode);
                    }}
                  >
                    Get Quote with {promo.promoCode}
                  </Button>
                </div>
              </CardContent>
              
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-yellow-400 opacity-20" />
            </Card>
          ))}
        </div>
        
        {allPromotions.length > 6 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/quote')}
              className="bg-white hover:bg-gray-50"
            >
              View All Offers & Get Quote
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedPromotions;