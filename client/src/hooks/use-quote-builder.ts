import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Types for quote items
interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'treatment';
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'package';
  treatments: Treatment[];
}

interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'addon';
}

// Quote state interface
interface QuoteState {
  id?: string | number;
  treatments: Treatment[];
  packages: Package[];
  addons: Addon[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
  promoCodeId: string | null;
  discountType: 'percentage' | 'fixed_amount' | null;
  discountValue: number | null;
  offerDiscount?: number;
  promoDiscount?: number;
  appliedOfferId?: string;
}

// Default empty quote
const defaultQuote: QuoteState = {
  treatments: [],
  packages: [],
  addons: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  promoCode: null,
  promoCodeId: null,
  discountType: null,
  discountValue: null,
  offerDiscount: 0,
  promoDiscount: 0
};

// Response type for promo code application
interface PromoCodeResponse {
  success: boolean;
  message: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  promoCodeId?: string;
}

/**
 * Custom hook for building dental treatment quotes with promo code support
 */
export function useQuoteBuilder() {
  const queryClient = useQueryClient();
  const [quote, setQuote] = useState<QuoteState>(defaultQuote);

  // Fetch treatments
  const { 
    data: treatments,
    isLoading: isLoadingTreatments
  } = useQuery({
    queryKey: ['/api/treatments'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/treatments');
      const data = await res.json();
      return data;
    }
  });

  // Fetch treatment packages
  const { 
    data: packages,
    isLoading: isLoadingPackages
  } = useQuery({
    queryKey: ['/api/treatment-packages'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/treatment-packages');
      const data = await res.json();
      return data;
    }
  });

  // Fetch add-ons
  const { 
    data: addons,
    isLoading: isLoadingAddons
  } = useQuery({
    queryKey: ['/api/addons'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/addons');
      const data = await res.json();
      return data;
    }
  });

  // Mutation for applying promo codes
  const promoCodeMutation = useMutation({
    mutationFn: async (code: string): Promise<PromoCodeResponse> => {
      const res = await apiRequest('POST', '/api/validate-promo', { code });
      return res.json();
    }
  });

  // Effect to calculate totals whenever items change
  useEffect(() => {
    // Calculate subtotal
    const treatmentsTotal = quote.treatments.reduce((sum, item) => sum + item.price, 0);
    const packagesTotal = quote.packages.reduce((sum, item) => sum + item.price, 0);
    const addonsTotal = quote.addons.reduce((sum, item) => sum + item.price, 0);
    
    const newSubtotal = treatmentsTotal + packagesTotal + addonsTotal;
    
    // Calculate discount if promo code is applied
    let newDiscount = 0;
    
    if (quote.promoCode && quote.discountType && quote.discountValue) {
      if (quote.discountType === 'percentage') {
        newDiscount = newSubtotal * (quote.discountValue / 100);
      } else if (quote.discountType === 'fixed_amount') {
        newDiscount = Math.min(quote.discountValue, newSubtotal); // Don't apply more discount than subtotal
      }
    }
    
    // Calculate final total
    const newTotal = Math.max(newSubtotal - newDiscount, 0);
    
    // Update quote state with new calculations
    setQuote(prev => ({
      ...prev,
      subtotal: newSubtotal,
      discount: newDiscount,
      total: newTotal
    }));
  }, [quote.treatments, quote.packages, quote.addons, quote.discountType, quote.discountValue]);

  // Add a treatment to the quote
  const addTreatment = (treatment: Treatment) => {
    // Check if treatment is already in the quote
    const exists = quote.treatments.some(item => item.id === treatment.id);
    
    if (!exists) {
      setQuote(prev => ({
        ...prev,
        treatments: [...prev.treatments, treatment]
      }));
    }
  };
  
  // Remove a treatment from the quote
  const removeTreatment = (treatment: Treatment) => {
    setQuote(prev => ({
      ...prev,
      treatments: prev.treatments.filter(item => item.id !== treatment.id)
    }));
  };
  
  // Add a package to the quote
  const addPackage = (pkg: Package) => {
    // Check if package is already in the quote
    const exists = quote.packages.some(item => item.id === pkg.id);
    
    if (!exists) {
      setQuote(prev => ({
        ...prev,
        packages: [...prev.packages, pkg]
      }));
    }
  };
  
  // Remove a package from the quote
  const removePackage = (pkg: Package) => {
    setQuote(prev => ({
      ...prev,
      packages: prev.packages.filter(item => item.id !== pkg.id)
    }));
  };
  
  // Add an addon to the quote
  const addAddon = (addon: Addon) => {
    // Check if addon is already in the quote
    const exists = quote.addons.some(item => item.id === addon.id);
    
    if (!exists) {
      setQuote(prev => ({
        ...prev,
        addons: [...prev.addons, addon]
      }));
    }
  };
  
  // Remove an addon from the quote
  const removeAddon = (addon: Addon) => {
    setQuote(prev => ({
      ...prev,
      addons: prev.addons.filter(item => item.id !== addon.id)
    }));
  };
  
  // Apply a promo code to the quote with enhanced persistence
  const applyPromoCode = async (code: string): Promise<PromoCodeResponse> => {
    try {
      const response = await fetch(`/api/promo-codes/validate?code=${code}`);
      const data = await response.json();
      
      if (data.valid) {
        // Calculate new totals with discount
        let newDiscount = 0;
        if (data.promotion.discount_type === 'percentage') {
          newDiscount = quote.subtotal * (data.promotion.discount_value / 100);
        } else if (data.promotion.discount_type === 'fixed_amount') {
          newDiscount = Math.min(data.promotion.discount_value, quote.subtotal);
        }
        
        const updatedQuote = {
          ...quote,
          promoCode: code,
          promoCodeId: data.promotion.id,
          discountType: data.promotion.discount_type,
          discountValue: data.promotion.discount_value,
          offerDiscount: quote.offerDiscount || 0,
          promoDiscount: newDiscount,
          discount: (quote.offerDiscount || 0) + newDiscount,
          total: quote.subtotal - ((quote.offerDiscount || 0) + newDiscount)
        };
        
        setQuote(updatedQuote);
        
        // Persist the promo code to the server if we have a quote ID
        if (quote.id) {
          await apiRequest('PATCH', `/api/quotes/${quote.id}`, { 
            promoCode: code,
            promoCodeId: data.promotion.id,
            promoDiscount: newDiscount,
            discount: updatedQuote.discount,
            total: updatedQuote.total
          });
          
          // Invalidate cache to ensure fresh data
          queryClient.invalidateQueries({ queryKey: ['/api/quotes', quote.id] });
        }
        
        return { 
          success: true, 
          message: `${data.promotion.title} applied!`,
          discountType: data.promotion.discount_type,
          discountValue: data.promotion.discount_value,
          promoCodeId: data.promotion.id
        };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      return { 
        success: false, 
        message: "Error validating promo code. Please try again." 
      };
    }
  };
  
  // Reset the quote to empty
  const resetQuote = () => {
    setQuote(defaultQuote);
  };
  
  // Save quote mutation
  const saveQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/quotes', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
    }
  });
  
  // Save quote function
  const saveQuote = async (additionalData: any = {}) => {
    const quoteData = {
      ...quote,
      ...additionalData
    };
    
    return saveQuoteMutation.mutateAsync(quoteData);
  };
  
  return {
    quote,
    setQuote, // Expose setQuote to allow direct state updates from other hooks
    treatments,
    packages,
    addons,
    isLoading: isLoadingTreatments || isLoadingPackages || isLoadingAddons || promoCodeMutation.isPending || saveQuoteMutation.isPending,
    addTreatment,
    removeTreatment,
    addPackage,
    removePackage,
    addAddon,
    removeAddon,
    applyPromoCode,
    resetQuote,
    saveQuote
  };
}