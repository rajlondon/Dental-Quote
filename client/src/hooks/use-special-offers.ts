import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/hooks/use-quote-builder';
import { SpecialOffer } from '@shared/offer-types';

interface Treatment {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  type: 'treatment';
}

/**
 * Hook for managing special offers in the quote builder
 */
export function useSpecialOffers(selectedTreatments: Treatment[] = []) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Fetch available special offers
  const { data: availableOffers = [], isLoading } = useQuery<SpecialOffer[]>({
    queryKey: ['/api/special-offers'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter offers that apply to selected treatments
  const filteredOffers = useCallback(() => {
    if (!selectedTreatments || selectedTreatments.length === 0) return [];
    
    const treatmentIds = selectedTreatments.map(t => t.id);
    
    return availableOffers.filter(offer => {
      // Check if any selected treatment is in the offer's applicable treatments
      return offer.applicableTreatments.some(id => treatmentIds.includes(id));
    });
  }, [availableOffers, selectedTreatments]);

  // Calculate discount when treatments or selected offer changes
  useEffect(() => {
    if (!selectedOffer || !selectedTreatments.length) {
      setDiscountAmount(0);
      return;
    }
    
    // Get subtotal of applicable treatments
    const applicableTreatmentIds = selectedOffer.applicableTreatments;
    const applicableTreatments = selectedTreatments.filter(t => 
      applicableTreatmentIds.includes(t.id)
    );
    
    const applicableSubtotal = applicableTreatments.reduce(
      (sum, treatment) => sum + (treatment.price * (treatment.quantity || 1)), 
      0
    );
    
    // Calculate discount based on type
    let discount = 0;
    if (selectedOffer.discountType === 'percentage') {
      discount = (applicableSubtotal * selectedOffer.discountValue) / 100;
    } else if (selectedOffer.discountType === 'fixed') {
      discount = selectedOffer.discountValue;
    }
    
    // Apply any maximum discount limits (hardcoded for now)
    const maxDiscount = 1000;
    if (discount > maxDiscount) {
      discount = maxDiscount;
    }
    
    setDiscountAmount(discount);
  }, [selectedOffer, selectedTreatments]);

  // Apply offer mutation
  const applyOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const response = await apiRequest('POST', `/api/quotes-api/apply-offer/${offerId}`, {
        treatments: selectedTreatments
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply offer');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Special Offer Applied',
        description: `Discount: ${formatCurrency(data.discount)}`,
      });
      
      // Update cached data
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Select an offer
  const selectOffer = useCallback(async (offerId: string | null) => {
    if (!offerId) {
      setSelectedOffer(null);
      setDiscountAmount(0);
      return;
    }
    
    const offer = availableOffers.find(o => o.id === offerId);
    if (!offer) {
      toast({
        title: 'Error',
        description: 'Selected offer not found',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedOffer(offer);
    
    // Optionally persist via API
    try {
      await applyOfferMutation.mutateAsync(offerId);
    } catch (error) {
      // Error is handled in mutation
    }
  }, [availableOffers, applyOfferMutation, toast]);

  return {
    availableOffers: filteredOffers(),
    selectedOffer,
    discountAmount,
    isLoading,
    selectOffer,
    applyOfferMutation
  };
}