import React from 'react';
import { CheckCircle } from 'lucide-react';
import { SpecialOffer } from '@shared/offer-types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/hooks/use-quote-builder';

interface SpecialOffersSelectorProps {
  availableOffers: SpecialOffer[];
  onSelectOffer: (offerId: string) => void;
  selectedOfferId: string | null;
  isLoading?: boolean;
}

export const SpecialOffersSelector: React.FC<SpecialOffersSelectorProps> = ({
  availableOffers,
  onSelectOffer,
  selectedOfferId,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="special-offers-container p-4 border rounded-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="special-offers-container">
      <h3 className="text-lg font-semibold mb-4">Available Special Offers</h3>
      
      {availableOffers.length === 0 ? (
        <p className="text-gray-500">No special offers available for selected treatments</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {availableOffers.map(offer => (
            <Card 
              key={offer.id}
              className={`offer-card cursor-pointer transition hover:shadow-md
                ${selectedOfferId === offer.id ? 'border-primary ring-2 ring-primary/50' : 'hover:border-gray-400'}`}
              onClick={() => onSelectOffer(offer.id)}
            >
              <CardContent className="p-4">
                {offer.featuredImage && (
                  <div className="relative w-full h-32 mb-3">
                    <img 
                      src={offer.featuredImage} 
                      alt={offer.title}
                      className="w-full h-full object-cover rounded-md" 
                      onError={(e) => {
                        e.currentTarget.src = '/images/default-offer.jpg';
                      }}
                    />
                  </div>
                )}
                
                <h4 className="font-medium text-lg">{offer.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                
                <div className="flex justify-between items-center mt-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                    {offer.discountType === 'percentage' 
                      ? `${offer.discountValue}% off` 
                      : `${formatCurrency(offer.discountValue)} off`}
                  </Badge>
                  
                  {selectedOfferId === offer.id && (
                    <div className="text-primary flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">Applied</span>
                    </div>
                  )}
                </div>
                
                {offer.terms && (
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-semibold">Terms:</span> {offer.terms}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecialOffersSelector;