import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { SpecialOffer } from '../../hooks/use-special-offers';
import { Skeleton } from '../ui/skeleton';
import { CalendarIcon, TagIcon, BadgePercentIcon } from 'lucide-react';

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
  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((item) => (
          <Card key={item} className="overflow-hidden">
            <div className="aspect-video w-full bg-slate-200">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // If no offers available, show message
  if (!offers || offers.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">No Special Offers Available</h3>
        <p className="text-muted-foreground">
          There are currently no special offers available. Please check back later for new promotions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Special Offers</h3>
        <p className="text-muted-foreground mb-4">
          Take advantage of our limited-time dental offers to save on your treatment.
        </p>
        
        {/* Clear selection button if an offer is selected */}
        {selectedOfferId && (
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={() => onSelectOffer(null)}
          >
            Clear Selection
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((offer) => {
          const isSelected = offer.id === selectedOfferId;
          
          // Format expiration date if it exists
          const expiryDate = offer.expiryDate 
            ? new Date(offer.expiryDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })
            : null;
          
          return (
            <Card 
              key={offer.id}
              className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              onClick={() => onSelectOffer(isSelected ? null : offer)}
            >
              {offer.imageUrl && (
                <div className="aspect-video w-full relative overflow-hidden">
                  <img 
                    src={offer.imageUrl} 
                    alt={offer.name} 
                    className="object-cover w-full h-full"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-md text-xs font-medium">
                      Selected
                    </div>
                  )}
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TagIcon className="h-5 w-5 mr-2 text-primary" />
                  {offer.name}
                </CardTitle>
                <CardDescription>{offer.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-primary">
                    <BadgePercentIcon className="h-5 w-5 mr-2" />
                    <span className="font-semibold">
                      {offer.discountType === 'percentage'
                        ? `${offer.discountValue}% off`
                        : `£${offer.discountValue} off`}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground">
                    <span className="font-medium mr-2">Promo Code:</span>
                    <code className="bg-secondary px-2 py-1 rounded text-sm font-bold">
                      {offer.promoCode}
                    </code>
                  </div>
                  
                  {expiryDate && (
                    <div className="flex items-center text-muted-foreground">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>Valid until {expiryDate}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={isSelected ? "secondary" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOffer(isSelected ? null : offer);
                  }}
                >
                  {isSelected ? 'Deselect Offer' : 'Select Offer'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}