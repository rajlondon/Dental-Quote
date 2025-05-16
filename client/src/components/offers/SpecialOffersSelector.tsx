import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { SpecialOffer } from '../../stores/quoteStore';
import { Badge } from '../ui/badge';

interface SpecialOffersSelectorProps {
  offers: SpecialOffer[];
  selectedOfferId: string | undefined;
  onSelectOffer: (offer: SpecialOffer | null) => void;
  isLoading?: boolean;
}

export function SpecialOffersSelector({
  offers,
  selectedOfferId,
  onSelectOffer,
  isLoading = false
}: SpecialOffersSelectorProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading special offers...</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No special offers available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select a Special Offer</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((offer) => (
          <Card 
            key={offer.id}
            className={`cursor-pointer transition-all ${
              selectedOfferId === offer.id
                ? 'border-primary shadow-md'
                : 'hover:border-muted-foreground'
            }`}
            onClick={() => onSelectOffer(offer)}
          >
            {offer.bannerImage && (
              <div className="relative w-full h-40 overflow-hidden">
                <img 
                  src={offer.bannerImage} 
                  alt={offer.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="text-white">
                    {offer.discountType === 'percentage'
                      ? `${offer.discountValue}% OFF`
                      : `£${offer.discountValue} OFF`}
                  </Badge>
                </div>
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle>{offer.name}</CardTitle>
              <CardDescription>{offer.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-medium">Eligible Treatments:</div>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {offer.applicableTreatments.map((treatment, index) => (
                    <li key={index}>
                      {treatment.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                    </li>
                  ))}
                </ul>
                <div className="text-sm text-muted-foreground mt-2">
                  <span className="font-medium">Terms:</span> {offer.terms}
                </div>
                <div className="text-sm font-medium mt-2">
                  Promo Code: <span className="text-primary">{offer.promoCode}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-2">
              <Button 
                variant={selectedOfferId === offer.id ? "secondary" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectOffer(selectedOfferId === offer.id ? null : offer);
                }}
              >
                {selectedOfferId === offer.id ? "Selected" : "Select"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {selectedOfferId && (
        <div className="mt-4 flex justify-end">
          <Button 
            variant="ghost" 
            onClick={() => onSelectOffer(null)}
          >
            Clear Selection
          </Button>
        </div>
      )}
    </div>
  );
}