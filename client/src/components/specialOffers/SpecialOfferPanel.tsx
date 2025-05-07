import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpecialOffer, TreatmentItem, matchTreatmentsToOffers, applySpecialOffer } from '@/services/specialOfferService';
import { Zap, Sparkles, Clock, Info, Check, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface SpecialOfferPanelProps {
  clinicId: number;
  treatments: TreatmentItem[];
  onApplyOffer: (updatedTreatments: TreatmentItem[], savings: number) => void;
  className?: string;
}

export default function SpecialOfferPanel({ 
  clinicId, 
  treatments, 
  onApplyOffer, 
  className = '' 
}: SpecialOfferPanelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [matchedOffers, setMatchedOffers] = useState<SpecialOffer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isApplyingOffer, setIsApplyingOffer] = useState(false);
  const { toast } = useToast();

  // Load matched offers when treatments or clinicId change
  useEffect(() => {
    const loadOffers = async () => {
      if (!clinicId || !treatments || treatments.length === 0) {
        setIsLoading(false);
        setMatchedOffers([]);
        setStatusMessage('No treatments selected yet.');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const result = await matchTreatmentsToOffers(clinicId, treatments);
        setMatchedOffers(result.data.matchedOffers);
        setStatusMessage(result.data.message);
        
      } catch (err) {
        console.error('Failed to match offers:', err);
        setError('Unable to load special offers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOffers();
  }, [clinicId, treatments]);

  // Handle applying a special offer
  const handleApplyOffer = async (offerId: string) => {
    try {
      setIsApplyingOffer(true);
      
      const result = await applySpecialOffer(offerId, treatments);
      
      // Call the callback with discounted treatments
      onApplyOffer(result.data.discountedTreatments, result.data.totalSavings);
      
      toast({
        title: "Special Offer Applied",
        description: result.data.message,
        variant: "default",
      });
      
    } catch (err) {
      console.error('Failed to apply offer:', err);
      toast({
        title: "Failed to Apply Offer",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsApplyingOffer(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className={`w-full border-red-200 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center text-red-500">
            <Info className="mr-2 h-5 w-5" />
            Error Loading Special Offers
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (matchedOffers.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle>Special Offers</CardTitle>
          <CardDescription>
            No special offers available for the selected treatments and clinic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">{statusMessage}</p>
        </CardContent>
      </Card>
    );
  }

  // Render offers
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5 text-yellow-500" />
          Special Offers
        </CardTitle>
        <CardDescription>
          {statusMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {matchedOffers.map(offer => (
          <Card key={offer.id} className={`relative overflow-hidden ${offer.isMatched ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
            {offer.isMatched && (
              <div className="absolute top-0 right-0">
                <Badge variant="outline" className="bg-green-500 text-white border-none m-2">
                  <Check className="mr-1 h-3 w-3" /> Eligible
                </Badge>
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                {offer.title}
              </CardTitle>
              <CardDescription className="flex items-center text-sm">
                {offer.validUntil && (
                  <span className="flex items-center text-amber-600">
                    <Clock className="mr-1 h-3 w-3" />
                    Expires: {new Date(offer.validUntil).toLocaleDateString()}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-2">
              <p className="text-sm mb-2">{offer.description}</p>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300">
                {offer.discountType === 'percentage' 
                  ? `${offer.discountValue}% discount` 
                  : `£${offer.discountValue} off`}
              </Badge>
              <p className="text-sm text-gray-500 mt-2">
                {offer.displayText}
              </p>
            </CardContent>
            <CardFooter>
              {offer.isMatched ? (
                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  onClick={() => handleApplyOffer(offer.id)}
                  disabled={isApplyingOffer}
                >
                  {isApplyingOffer ? 'Applying...' : 'Apply This Offer'}
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  <X className="mr-2 h-4 w-4" />
                  Not Eligible
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}