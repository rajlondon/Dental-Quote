import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  applicable_treatments: string[];
  clinic_id: string;
  promo_code: string;
  terms_conditions: string;
  banner_image?: string;
}

interface UseSpecialOffersResult {
  specialOfferId: string | null;
  specialOffer: SpecialOffer | null;
  isLoading: boolean;
  error: string | null;
  applySpecialOfferToQuote: (quote: any) => any;
  clearSpecialOffer: () => void;
}

/**
 * Custom hook to handle special offers in quotes
 * 
 * This hook manages fetching special offer details and applying them to quotes
 * 
 * @param initialOfferId - The initial special offer ID (if any)
 * @returns Object with special offer state and methods
 */
export function useSpecialOffersInQuote(initialOfferId?: string): UseSpecialOffersResult {
  const [specialOfferId, setSpecialOfferId] = useState<string | null>(initialOfferId || null);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  // Fetch special offer details if an ID is provided
  const {
    data: specialOffer,
    isLoading,
    isError,
    error: queryError
  } = useQuery({
    queryKey: ['/api/special-offers', specialOfferId],
    queryFn: async () => {
      if (!specialOfferId) return null;
      
      try {
        // First try to get a specific offer by ID
        const response = await apiRequest('GET', `/api/special-offers/${specialOfferId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch special offer details');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching special offer:', error);
        trackEvent('special_offer_fetch_error', 'error', error instanceof Error ? error.message : 'unknown');
        throw error;
      }
    },
    enabled: !!specialOfferId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update error state when query fails
  useEffect(() => {
    if (isError && queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Failed to fetch special offer');
      
      // Show error toast
      toast({
        title: 'Error Loading Special Offer',
        description: queryError instanceof Error ? queryError.message : 'Failed to fetch special offer',
        variant: 'destructive',
      });
    } else {
      setError(null);
    }
  }, [isError, queryError, toast]);

  // Show toast when special offer is successfully loaded
  useEffect(() => {
    if (specialOffer && !isLoading && !isError) {
      toast({
        title: 'Special Offer Applied',
        description: specialOffer.title,
      });
      
      // Track offer application
      trackEvent('special_offer_applied', 'offers', specialOffer.id);
    }
  }, [specialOffer, isLoading, isError, toast]);

  /**
   * Apply special offer discount to a quote
   * 
   * @param quote - The quote to apply the special offer to
   * @returns The updated quote with special offer applied
   */
  const applySpecialOfferToQuote = (quote: any): any => {
    if (!specialOffer) return quote;
    
    try {
      // Create a copy of the quote to avoid mutating the original
      const updatedQuote = { ...quote };
      let appliedDiscount = 0;
      
      // Check if any treatments in the quote match the special offer's applicable treatments
      const hasMatchingTreatments = updatedQuote.treatments.some((treatment: any) => 
        specialOffer.applicable_treatments.includes(treatment.id)
      );
      
      if (!hasMatchingTreatments) {
        // If no matching treatments, check packages for matching treatments
        const hasMatchingPackages = updatedQuote.packages.some((pkg: any) => 
          pkg.treatments.some((treatment: any) => 
            specialOffer.applicable_treatments.includes(treatment.id)
          )
        );
        
        if (!hasMatchingPackages) {
          return quote; // No matching treatments or packages, return original quote
        }
      }
      
      // Calculate the discount based on the special offer type
      if (specialOffer.discount_type === 'percentage') {
        // Apply percentage discount to the subtotal
        appliedDiscount = (updatedQuote.subtotal * specialOffer.discount_value) / 100;
      } else if (specialOffer.discount_type === 'fixed_amount') {
        // Apply fixed amount discount
        appliedDiscount = specialOffer.discount_value;
      }
      
      // Cap the discount to the subtotal
      appliedDiscount = Math.min(appliedDiscount, updatedQuote.subtotal);
      
      // Update the quote with the special offer discount
      updatedQuote.offerDiscount = appliedDiscount;
      updatedQuote.appliedOfferId = specialOffer.id;
      
      // Recalculate the total by subtracting the new offer discount and existing discounts
      const totalDiscount = (updatedQuote.discount || 0) + (updatedQuote.promoDiscount || 0) + appliedDiscount;
      updatedQuote.total = Math.max(0, updatedQuote.subtotal - totalDiscount);
      
      // Track successful offer application
      trackEvent('special_offer_discount_applied', 'offers', `${specialOffer.id}_${appliedDiscount}`);
      
      return updatedQuote;
    } catch (error) {
      console.error('Error applying special offer to quote:', error);
      
      // Track error
      trackEvent('special_offer_application_error', 'error', error instanceof Error ? error.message : 'unknown');
      
      // Return original quote on error
      return quote;
    }
  };

  /**
   * Clear the current special offer
   */
  const clearSpecialOffer = () => {
    setSpecialOfferId(null);
    trackEvent('special_offer_cleared', 'offers');
  };

  return {
    specialOfferId,
    specialOffer,
    isLoading,
    error,
    applySpecialOfferToQuote,
    clearSpecialOffer
  };
}

export default useSpecialOffersInQuote;