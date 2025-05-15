import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SpecialOffer } from '@shared/offer-types';
import { trackEvent } from '@/lib/analytics';

interface UseSpecialOffersProps {
  quoteId: string | null;
  treatments: { id: string; quantity: number }[];
  subtotal: number;
  updateQuote: (updates: Record<string, any>) => void;
}

export const useSpecialOffers = ({
  quoteId,
  treatments,
  subtotal,
  updateQuote
}: UseSpecialOffersProps) => {
  const { toast } = useToast();
  const [isApplyingOffer, setIsApplyingOffer] = useState(false);
  const [availableOffers, setAvailableOffers] = useState<SpecialOffer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  // Fetch available offers for the current treatments
  const fetchAvailableOffers = async () => {
    if (treatments.length === 0) {
      setAvailableOffers([]);
      return;
    }

    try {
      setIsLoadingOffers(true);
      const treatmentIds = treatments.map(t => t.id);
      
      const response = await fetch('/api/quotes-api/available-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treatmentIds, quoteId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available offers');
      }
      
      const data = await response.json();
      setAvailableOffers(data.offers || []);
      return data.offers;
    } catch (error) {
      console.error("Error fetching available offers:", error);
      toast({
        title: "Error",
        description: "Failed to load available offers. Please try again.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoadingOffers(false);
    }
  };

  // Apply a special offer to the quote
  const applySpecialOffer = async (offerId: string) => {
    if (!quoteId) {
      toast({
        title: "Error",
        description: "Cannot apply offer to an unsaved quote",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsApplyingOffer(true);
      
      // Fetch offer details and validate
      const response = await fetch(`/api/quotes-api/apply-offer/${offerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quoteId,
          treatments,
          subtotal
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply special offer');
      }
      
      const data = await response.json();
      
      // Update quote with offer discount
      updateQuote({
        appliedOfferId: offerId,
        offerDiscount: data.discountAmount || 0
      });
      
      // Track the event
      trackEvent('apply_special_offer', 'quote', offerId);
      
      toast({
        title: "Special Offer Applied",
        description: `You save ${formatCurrency(data.discountAmount)}!`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error("Error applying special offer:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply special offer",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsApplyingOffer(false);
    }
  };
  
  // Remove a special offer from the quote
  const removeSpecialOffer = async () => {
    if (!quoteId) {
      updateQuote({
        appliedOfferId: null,
        offerDiscount: 0
      });
      return true;
    }
    
    try {
      setIsApplyingOffer(true);
      
      const response = await fetch(`/api/quotes-api/remove-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove special offer');
      }
      
      // Update quote state
      updateQuote({
        appliedOfferId: null,
        offerDiscount: 0
      });
      
      toast({
        title: "Special Offer Removed",
        description: "The special offer has been removed from your quote",
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error("Error removing special offer:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove special offer",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsApplyingOffer(false);
    }
  };

  // Format currency helper
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value);
  };

  return {
    availableOffers,
    isLoadingOffers,
    isApplyingOffer,
    fetchAvailableOffers,
    applySpecialOffer,
    removeSpecialOffer
  };
};

export default useSpecialOffers;