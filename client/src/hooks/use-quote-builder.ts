import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import debounce from 'lodash/debounce';

// Utility formatter for consistent currency formatting
export const formatCurrency = (amount: number): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return formatter.format(amount);
};

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
  promoDiscount: 0,
  appliedOfferId: undefined
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
  isApplyingPromo: boolean;
  error: string | null;
  addTreatment: (treatment: Treatment) => void;
  removeTreatment: (treatment: Treatment) => void;
  addPackage: (pkg: Package) => void;
  removePackage: (pkg: Package) => void;
  addAddon: (addon: Addon) => void;
  removeAddon: (addon: Addon) => void;
  applyPromoCode: (code: string) => Promise<PromoCodeResponse>;
  removePromoCode: () => Promise<boolean>;
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
  const [isApplyingPromo, setIsApplyingPromo] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteStartTime] = useState<number>(Date.now());

  // Fetch treatments
  // Check if we're in test mode for endpoints
  const isTestMode = typeof window !== 'undefined' && 
    (window.location.pathname.includes('quote-test') || window.location.pathname.includes('test-dashboard'));

  // Use appropriate endpoints based on test mode
  const treatmentsEndpoint = isTestMode ? '/api/test-promo-codes/treatments' : '/api/treatments';
  
  // Log endpoints being used
  useEffect(() => {
    if (isTestMode) {
      console.log('[QuoteBuilder] Using test mode endpoints');
    }
  }, [isTestMode]);
  
  const { 
    data: treatments,
    isLoading: isLoadingTreatments
  } = useQuery({
    queryKey: [treatmentsEndpoint],
    queryFn: async () => {
      console.log(`[QuoteBuilder] Fetching treatments from: ${treatmentsEndpoint}`);
      const res = await apiRequest('GET', treatmentsEndpoint);
      const data = await res.json();
      return data;
    }
  });

  // Set package and addon endpoints based on test mode
  const packagesEndpoint = isTestMode ? '/api/test-packages' : '/api/treatment-packages';
  const addonsEndpoint = isTestMode ? '/api/test-promo-codes/addons' : '/api/addons';
  
  // Fetch treatment packages
  const { 
    data: packages,
    isLoading: isLoadingPackages
  } = useQuery({
    queryKey: [packagesEndpoint],
    queryFn: async () => {
      try {
        console.log(`[QuoteBuilder] Fetching packages from: ${packagesEndpoint}`);
        const res = await apiRequest('GET', packagesEndpoint);
        if (!res.ok) {
          console.error('Failed to fetch packages:', res.statusText);
          return [];
        }
        const data = await res.json();
        console.log('Successfully loaded packages:', data);
        return data;
      } catch (error) {
        console.error('Error fetching treatment packages:', error);
        return [];
      }
    }
  });

  // Fetch add-ons
  const { 
    data: addons,
    isLoading: isLoadingAddons
  } = useQuery({
    queryKey: [addonsEndpoint],
    queryFn: async () => {
      console.log(`[QuoteBuilder] Fetching addons from: ${addonsEndpoint}`);
      const res = await apiRequest('GET', addonsEndpoint);
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

  // Memoized calculation of subtotal
  const subtotal = useMemo(() => {
    // Calculate subtotal from all items
    const treatmentsTotal = quote.treatments.reduce((sum, item) => sum + item.price, 0);
    const packagesTotal = quote.packages.reduce((sum, item) => sum + (item.price || 0), 0);
    const addonsTotal = quote.addons.reduce((sum, item) => sum + item.price, 0);
    
    return treatmentsTotal + packagesTotal + addonsTotal;
  }, [quote.treatments, quote.packages, quote.addons]);
  
  // Memoized calculation of discount
  const discount = useMemo(() => {
    // Calculate discount if promo code is applied
    if (!quote.promoCode || !quote.discountType || !quote.discountValue) {
      return 0;
    }
    
    if (quote.discountType === 'percentage') {
      return subtotal * (quote.discountValue / 100);
    } else if (quote.discountType === 'fixed_amount') {
      return Math.min(quote.discountValue, subtotal); // Don't apply more discount than subtotal
    }
    
    return 0;
  }, [subtotal, quote.promoCode, quote.discountType, quote.discountValue]);
  
  // Memoized calculation of total
  const total = useMemo(() => {
    let offerDiscount = quote.offerDiscount || 0;
    let promoDiscount = quote.promoCode ? discount : 0;
    
    // Ensure discount doesn't exceed subtotal
    const totalDiscount = Math.min(offerDiscount + promoDiscount, subtotal);
    
    // Calculate final total (never negative)
    return Math.max(subtotal - totalDiscount, 0);
  }, [subtotal, discount, quote.offerDiscount, quote.promoCode]);
  
  // Update quote with calculated values when they change
  useEffect(() => {
    setQuote(prev => ({
      ...prev,
      subtotal,
      promoDiscount: quote.promoCode ? discount : 0,
      discount: total < subtotal ? subtotal - total : 0,
      total
    }));
  }, [subtotal, discount, total, quote.promoCode]);

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
    console.log('[QuoteBuilder] Starting promo code application for:', code);
    
    // Always set loading state at the beginning of the function, outside of try/catch
    setIsApplyingPromo(true);
    
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
      
      // Try the new dedicated /apply endpoint first
      try {
        console.log('[QuoteBuilder] Trying new promo code apply endpoint');
        
        // Calculate current items for API
        const items = [...quote.treatments, ...quote.packages, ...quote.addons].map(item => ({
          id: item.id,
          quantity: (item as any).quantity || 1,
          isPackage: item.type === 'package'
        }));
        
        // Call the new API endpoint
        const applyResponse = await apiRequest('POST', '/api/promo-codes/apply', {
          promoCode: code.trim(),
          treatments: items,
          subtotal: quote.subtotal
        });
        
        if (applyResponse.ok) {
          const data = await applyResponse.json();
          console.log('[QuoteBuilder] Successfully applied promo code with new endpoint:', data);
          
          // Important: Use functional update to ensure we're working with the latest state
          setQuote(prevQuote => ({
            ...prevQuote,
            promoCode: code.trim(),
            promoDiscount: data.discount || 0,
            discountType: data.discountType,
            discountValue: data.discountValue
          }));
          
          // Track successful application
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'promo_code_applied', {
              event_category: 'promotions',
              event_label: code,
              value: data.discount || 0
            });
          }
          
          return { 
            success: true, 
            message: "Promo code applied successfully",
            discountType: data.discountType,
            discountValue: data.discountValue
          };
        }
      } catch (newApiError) {
        console.log('[QuoteBuilder] New promo API error, falling back to legacy endpoint:', newApiError);
      }
      
      // Check if we're in test mode
      const isTestMode = window.location.pathname.includes('quote-test') || window.location.pathname.includes('test-dashboard');
      
      // Use test API endpoint if in test mode (legacy path)
      const apiEndpoint = isTestMode 
        ? `/api/test-promo-codes/${encodeURIComponent(code.trim())}/validate` 
        : `/api/promo-codes/${encodeURIComponent(code.trim())}/validate`;
        
      console.log(`[QuoteBuilder] Using legacy promo code validation endpoint: ${apiEndpoint}`);
      
      // Prepare request with current quote data for proper validation
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subtotal: quote.subtotal,
          treatments: quote.treatments 
        })
      });
      
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
      console.log('[QuoteBuilder] Promo code validation response:', data);
      
      if (data.success) {
        // Use functional update to ensure we have the latest state
        setQuote(prevQuote => {
          // Log for debugging
          console.log('[QuoteBuilder] Current quote state before applying promo:', { 
            subtotal: prevQuote.subtotal,
            offerDiscount: prevQuote.offerDiscount || 0,
            selectedTreatments: prevQuote.treatments.length,
            selectedPackages: prevQuote.packages.length,
            total: prevQuote.total
          });
          
          // Calculate the subtotal first - it might be missing
          let calculatedSubtotal = 0;
          
          // Add up treatment prices
          prevQuote.treatments.forEach(treatment => {
            if (treatment.price) {
              calculatedSubtotal += treatment.price * ((treatment as any).quantity || 1);
            }
          });
          
          // Add up package prices
          prevQuote.packages.forEach(pkg => {
            if (pkg.price) {
              calculatedSubtotal += pkg.price * ((pkg as any).quantity || 1);
            }
          });
          
          // Add up addon prices
          prevQuote.addons.forEach(addon => {
            if (addon.price) {
              calculatedSubtotal += addon.price * ((addon as any).quantity || 1);
            }
          });
          
          // Use the calculated subtotal if the quote subtotal is 0 or undefined
          const effectiveSubtotal = prevQuote.subtotal || calculatedSubtotal;
          console.log('[QuoteBuilder] Calculated subtotal:', calculatedSubtotal, 'Quote subtotal:', prevQuote.subtotal, 'Using:', effectiveSubtotal);
          
          // Calculate the effective subtotal (may include special offer discounts)
          const subtotalForDiscount = effectiveSubtotal - (prevQuote.offerDiscount || 0);
          
          // Calculate new totals with discount
          let calculatedDiscount = 0;
          if (data.data.discount_type === 'percentage') {
            calculatedDiscount = effectiveSubtotal * (data.data.discount_value / 100);
            console.log(`[QuoteBuilder] Applying ${data.data.discount_value}% discount on ${effectiveSubtotal} = ${calculatedDiscount}`);
          } else if (data.data.discount_type === 'fixed_amount') {
            calculatedDiscount = Math.min(data.data.discount_value, effectiveSubtotal);
            console.log(`[QuoteBuilder] Applying fixed discount of ${data.data.discount_value} (capped to ${effectiveSubtotal}) = ${calculatedDiscount}`);
          }
          
          // Ensure discount is a valid number
          if (isNaN(calculatedDiscount) || !isFinite(calculatedDiscount)) {
            console.error('[QuoteBuilder] Invalid discount value calculated:', calculatedDiscount);
            calculatedDiscount = 0;
          } else {
            // Round to 2 decimal places for currency
            calculatedDiscount = Math.round(calculatedDiscount * 100) / 100;
            console.log('[QuoteBuilder] Final normalized discount amount:', calculatedDiscount);
          }
          
          // Ensure discount doesn't exceed subtotal
          calculatedDiscount = Math.min(calculatedDiscount, effectiveSubtotal);
          
          // Calculate total discount (combining offer discount and promo discount)
          const offerDiscount = prevQuote.offerDiscount || 0;
          const totalDiscount = offerDiscount + calculatedDiscount;
          
          // Calculate new total with rounding to ensure consistent currency values
          let newTotal = Math.max(0, effectiveSubtotal - totalDiscount);
          newTotal = Math.round(newTotal * 100) / 100; // Round to 2 decimal places
          
          console.log('[QuoteBuilder] Discount calculation:', {
            effectiveSubtotal,
            discountType: data.data.discount_type,
            discountValue: data.data.discount_value,
            calculatedDiscount,
            offerDiscount,
            totalDiscount,
            newTotal
          });
          
          // Create updated quote object with all fields consistently set
          const updatedQuote = {
            ...prevQuote,
            subtotal: effectiveSubtotal, // Ensure subtotal is set
            promoCode: code,
            promoCodeId: data.data.id,
            discountType: data.data.discount_type,
            discountValue: data.data.discount_value,
            offerDiscount: offerDiscount,
            promoDiscount: calculatedDiscount,
            discount: totalDiscount,
            total: newTotal
          };
          
          console.log('[QuoteBuilder] Updated quote with discount:', {
            subtotal: updatedQuote.subtotal,
            promoDiscount: updatedQuote.promoDiscount,
            offerDiscount: updatedQuote.offerDiscount,
            totalDiscount: updatedQuote.discount,
            newTotal: updatedQuote.total
          });
          
          return updatedQuote;
        });
        
        // Add a delayed log to verify the quote state after React updates
        setTimeout(() => {
          console.log('[QuoteBuilder] State after update:', {
            subtotal: quote.subtotal,
            promoDiscount: quote.promoDiscount,
            total: quote.total
          });
          
          // Show success toast AFTER state update completes
          toast({
            title: "Promo Code Applied Successfully",
            description: `${data.data.discount_type === 'percentage' 
              ? `${data.data.discount_value}% discount (${formatCurrency(data.data.discount_value)})` 
              : `${formatCurrency(data.data.discount_value)} discount`} has been applied to your quote.`,
            variant: "default",
          });
          
          // Track the successful application
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'promo_code_applied', {
              event_category: 'promotions',
              event_label: code,
              value: data.data.discount_value
            });
          }
        }, 100);
        
        // Persist the promo code to the server if we have a quote ID
        if (quote.id) {
          try {
            await apiRequest('PATCH', `/api/quotes/${quote.id}`, { 
              promoCode: code,
              promoCodeId: data.data.id,
              promoDiscount: data.data.discount_value,
              discount: data.data.discount_value,
              total: quote.subtotal - data.data.discount_value
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
          message: `${data.data.title} applied!`,
          discountType: data.data.discount_type,
          discountValue: data.data.discount_value,
          promoCodeId: data.data.id
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
    } finally {
      // Always reset loading state when done, regardless of success or failure
      setIsApplyingPromo(false);
      console.log('[QuoteBuilder] Promo code application completed, loading state reset');
    }
  };
  
  // Remove promo code from the quote
  const removePromoCode = async (): Promise<boolean> => {
    try {
      // Use functional update to ensure we have the latest state
      setQuote(prevQuote => {
        // Calculate new total without promo discount
        const newTotal = prevQuote.subtotal - (prevQuote.offerDiscount || 0);
        
        // Return quote without promo code
        return {
          ...prevQuote,
          promoCode: null,
          promoCodeId: null,
          discountType: null,
          discountValue: null,
          promoDiscount: 0,
          discount: prevQuote.offerDiscount || 0,
          total: newTotal
        };
      });
      
      // Track promo code removal if analytics is available
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'promo_code_removed', {
          event_category: 'promotions',
          event_label: quote.promoCode || 'unknown'
        });
      }
      
      // If we have a quote ID, update it on the server
      if (quote.id) {
        try {
          await apiRequest('PATCH', `/api/quotes/${quote.id}`, {
            promoCode: null,
            promoCodeId: null,
            promoDiscount: 0,
            discount: quote.offerDiscount || 0,
            total: quote.subtotal - (quote.offerDiscount || 0)
          });
          
          // Invalidate cache to ensure fresh data
          queryClient.invalidateQueries({ queryKey: ['/api/quotes', quote.id] });
        } catch (persistError) {
          console.error('Error persisting promo code removal:', persistError);
          // Continue even if persistence fails - user still sees the discount removed
        }
      }
      
      // Show toast with success message
      toast({
        title: 'Promo Code Removed',
        description: 'The promo code has been removed from your quote.',
        variant: 'default'
      });
      
      return true;
    } catch (error) {
      console.error('Error removing promo code:', error);
      
      toast({
        title: 'Error',
        description: 'Could not remove promo code. Please try again.',
        variant: 'destructive'
      });
      
      return false;
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
    isApplyingPromo,
    error,
    addTreatment,
    removeTreatment,
    addPackage,
    removePackage,
    addAddon,
    removeAddon,
    applyPromoCode,
    removePromoCode,
    saveQuote,
    finalizeQuote,
    resetQuote,
    setQuoteId
  };
}