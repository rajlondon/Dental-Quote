import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Sparkles, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { SpecialOffer } from '@shared/offer-types';
import { formatCurrency } from '@/utils/currency-formatter';
import { format } from 'date-fns';

interface SpecialOffersSelectorProps {
  offers: SpecialOffer[];
  selectedOfferId: string | null;
  onChange: (offerId: string | null) => void;
  isLoading?: boolean;
}

export function SpecialOffersSelector({
  offers,
  selectedOfferId,
  onChange,
  isLoading = false
}: SpecialOffersSelectorProps) {
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

  const toggleExpand = (offerId: string) => {
    setExpandedOfferId(expandedOfferId === offerId ? null : offerId);
  };

  const handleSelectOffer = (offerId: string) => {
    // Toggle selection
    onChange(selectedOfferId === offerId ? null : offerId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <Alert>
        <AlertDescription>No special offers are currently available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <RadioGroup value={selectedOfferId || ''} className="space-y-4" onValueChange={(value) => onChange(value || null)}>
      {offers.map((offer) => {
        const isSelected = selectedOfferId === offer.id;
        const isExpanded = expandedOfferId === offer.id;
        const discountValue = offer.discountValue || 0;
        const discountLabel = offer.discountType === 'percentage' 
          ? `${discountValue}% Off` 
          : `${formatCurrency(discountValue)} Off`;

        return (
          <Card 
            key={offer.id} 
            className={`relative ${isSelected ? 'border-primary' : ''}`}
          >
            {isSelected && (
              <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {offer.title}
                </CardTitle>
                <Badge variant="outline" className="bg-primary-50 text-primary border-primary-200">
                  {discountLabel}
                </Badge>
              </div>
              <CardDescription>{offer.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-2">
                <RadioGroupItem value={offer.id} id={`offer-${offer.id}`} className="mr-2" />
                <Label htmlFor={`offer-${offer.id}`} className="font-medium flex-1">
                  Apply this offer
                </Label>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-3">
                  <Separator />

                  {offer.terms && (
                    <>
                      <h4 className="font-medium text-sm">Terms & Conditions</h4>
                      <p className="text-sm text-muted-foreground">{offer.terms}</p>
                    </>
                  )}

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    <span>
                      Valid from {format(new Date(offer.startDate), 'MMM d, yyyy')} to {format(new Date(offer.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {offer.minTreatmentCount && (
                    <p className="text-sm text-muted-foreground">
                      *Requires minimum {offer.minTreatmentCount} eligible treatments
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => toggleExpand(offer.id)}>
                {isExpanded ? 'Show less' : 'Show details'}
              </Button>
              <Button 
                variant={isSelected ? "default" : "outline"} 
                size="sm" 
                onClick={() => handleSelectOffer(offer.id)}
              >
                {isSelected ? 'Applied' : 'Apply'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </RadioGroup>
  );
}