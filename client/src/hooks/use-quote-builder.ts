import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import debounce from 'lodash/debounce';

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
interface UseQuoteBuilderResult {
  quote: QuoteState;
  treatments: any[];
  packages: any[];
  addons: any[];
  isLoading: boolean;
  isLoadingTreatments: boolean;
  isLoadingPackages: boolean;
  isLoadingAddons: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  error: string | null;
  addTreatment: (treatment: Treatment) => void;
  removeTreatment: (treatment: Treatment) => void;
  addPackage: (pkg: Package) => void;
  removePackage: (pkg: Package) => void;
  addAddon: (addon: Addon) => void;
  removeAddon: (addon: Addon) => void;
  applyPromoCode: (code: string) => Promise<PromoCodeResponse>;
  saveQuote: (additionalData?: any) => Promise<QuoteState>;
  finalizeQuote: () => Promise<QuoteState>;
  resetQuote: () => void;
  setQuoteId: (id: string | number) => void;
}

export function useQuoteBuilder(): UseQuoteBuilderResult {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [quote, setQuote] = useState<QuoteState>(defaultQuote);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteStartTime] = useState<number>(Date.now());

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
  
  // Apply a promo code to the quote with enhanced persistence and error handling
  const applyPromoCode = async (code: string): Promise<PromoCodeResponse> => {
    try {
      // Track promo code attempt
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'promo_code_attempt', {
          event_category: 'promotions',
          event_label: code,
        });
      }
      
      // Validate input
      if (!code || typeof code !== 'string' || code.trim() === '') {
        return { success: false, message: "Please enter a valid promo code" };
      }
      
      const response = await fetch(`/api/promo-codes/validate?code=${encodeURIComponent(code.trim())}`);
      
      // Handle network or server errors
      if (!response.ok) {
        const errorMessage = response.status === 503 
          ? "Service temporarily unavailable. Please try again later."
          : `Server error: ${response.status} ${response.statusText}`;
          
        // Track error
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'promo_code_server_error', {
            event_category: 'error',
            event_label: `${response.status}: ${code}`,
          });
        }
        
        return { success: false, message: errorMessage };
      }
      
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
        
        // Track successful promo code application
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'promo_code_applied', {
            event_category: 'promotions',
            event_label: code,
            value: newDiscount,
          });
        }
        
        // Persist the promo code to the server if we have a quote ID
        if (quote.id) {
          try {
            await apiRequest('PATCH', `/api/quotes/${quote.id}`, { 
              promoCode: code,
              promoCodeId: data.promotion.id,
              promoDiscount: newDiscount,
              discount: updatedQuote.discount,
              total: updatedQuote.total
            });
            
            // Invalidate cache to ensure fresh data
            queryClient.invalidateQueries({ queryKey: ['/api/quotes', quote.id] });
          } catch (persistError) {
            console.error('Error persisting promo code:', persistError);
            // Continue even if persistence fails - user still sees the discount
          }
        }
        
        return { 
          success: true, 
          message: `${data.promotion.title} applied!`,
          discountType: data.promotion.discount_type,
          discountValue: data.promotion.discount_value,
          promoCodeId: data.promotion.id
        };
      } else {
        // Track invalid promo code
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'promo_code_invalid', {
            event_category: 'promotions',
            event_label: code,
          });
        }
        
        return { success: false, message: data.message || "Invalid promo code" };
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      
      // Track exception
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'promo_code_exception', {
          event_category: 'error',
          event_label: `${code}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
      
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
  
  // Save quote mutation with improved error handling
  const saveQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const res = await apiRequest('POST', '/api/quotes', data);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({
            message: `Server error: ${res.status} ${res.statusText}`
          }));
          
          throw new Error(errorData.message || 'Failed to save quote');
        }
        
        return res.json();
      } catch (error) {
        console.error('Error in save quote mutation:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Track successful save
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'quote_saved', {
          event_category: 'quotes',
          event_label: data.id,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
    },
    onError: (error) => {
      // Track error for monitoring
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'quote_save_error', {
          event_category: 'error',
          event_label: error.message,
        });
      }
    }
  });
  
  // Save quote function with additional error handling
  const saveQuote = async (additionalData: any = {}) => {
    try {
      // Add timestamp and client information for debugging
      const quoteData = {
        ...quote,
        clientInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        },
        ...additionalData
      };
      
      const result = await saveQuoteMutation.mutateAsync(quoteData);
      return result;
    } catch (error) {
      console.error('Error saving quote:', error);
      
      // Re-throw for component handling
      throw error;
    }
  };
  
  // Debounced save quote function
  const debouncedSaveQuote = useCallback(
    debounce(async (quoteData: QuoteState) => {
      try {
        if (!quoteData.id) {
          console.log('No quote ID available for saving');
          return;
        }

        console.log('Debounced save for quote:', quoteData.id);
        const response = await apiRequest('PATCH', `/api/quotes/${quoteData.id}`, quoteData);
        
        if (!response.ok) {
          throw new Error('Failed to save quote');
        }
        
        const savedQuote = await response.json();
        return savedQuote;
      } catch (error) {
        console.error('Error saving quote:', error);
        setError(`Failed to save quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }, 1000),
    [setError]
  );

  // Save quote function (non-debounced, for explicit saves)
  const finalizeQuote = async (): Promise<QuoteState> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // First save the quote
      const savedQuote = await saveQuote();
      
      // Then finalize it
      const response = await apiRequest('POST', `/api/quotes/${savedQuote.id}/finalize`, {});
      
      if (!response.ok) {
        throw new Error('Failed to finalize quote');
      }
      
      const finalizedQuote = await response.json();
      
      // Track completion
      trackEvent('quote_completed', 'quotes', `quote_id_${savedQuote.id}`);
      
      // Show success notification
      toast({
        title: 'Quote Finalized',
        description: 'Your quote has been successfully finalized and is ready for review.',
      });
      
      return finalizedQuote;
    } catch (error) {
      console.error('Error finalizing quote:', error);
      setError(`Failed to finalize quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Show error notification
      toast({
        title: 'Error',
        description: `Failed to finalize quote: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set the quote ID (useful for editing existing quotes)
  const setQuoteId = (id: string | number) => {
    setQuote(prev => ({ ...prev, id }));
  };

  // Effect to trigger debounced save when quote changes and is dirty
  useEffect(() => {
    if (quote.id && isDirty) {
      debouncedSaveQuote(quote);
    }
  }, [quote, isDirty, debouncedSaveQuote]);

  // Set quote as dirty when data changes
  useEffect(() => {
    if (quote.id) {
      setIsDirty(true);
    }
  }, [
    quote.treatments, 
    quote.packages, 
    quote.addons, 
    quote.promoCode, 
    quote.appliedOfferId
  ]);

  return {
    quote,
    treatments,
    packages,
    addons,
    isLoading: isLoadingTreatments || isLoadingPackages || isLoadingAddons || promoCodeMutation.isPending || saveQuoteMutation.isPending,
    isLoadingTreatments,
    isLoadingPackages,
    isLoadingAddons,
    isDirty,
    isSubmitting,
    error,
    addTreatment,
    removeTreatment,
    addPackage,
    removePackage,
    addAddon,
    removeAddon,
    applyPromoCode,
    saveQuote,
    finalizeQuote,
    resetQuote,
    setQuoteId
  };
}