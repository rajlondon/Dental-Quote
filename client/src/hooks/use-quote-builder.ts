import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';

// Types for our quote system
export interface Treatment {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  treatments: string[]; // IDs of included treatments
  description?: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  promo_code: string;
  applicable_treatments: string[];
  start_date: string;
  end_date: string;
  terms_conditions: string;
}

export interface Quote {
  id?: string;
  treatments: Treatment[];
  packages: Package[];
  addons: Addon[];
  promoCode: string | null;
  promotion?: Promotion | null;
  subtotal: number;
  discount: number;
  total: number;
  patientId?: string;
  clinicId?: string;
  createdAt?: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
}

/**
 * Calculate discount based on promotion type and value
 */
export const calculateDiscount = (subtotal: number, promotion?: Promotion | null): number => {
  if (!promotion) return 0;
  
  if (promotion.discount_type === 'percentage') {
    return (subtotal * promotion.discount_value) / 100;
  } else {
    // Fixed amount discount
    return Math.min(subtotal, promotion.discount_value); // Don't exceed subtotal
  }
};

/**
 * Calculate totals for a quote
 */
export const calculateTotals = (
  treatments: Treatment[],
  packages: Package[],
  addons: Addon[],
  promotion?: Promotion | null
): { subtotal: number; discount: number; total: number } => {
  // Calculate subtotal
  const treatmentsTotal = treatments.reduce((sum, t) => sum + t.price, 0);
  const packagesTotal = packages.reduce((sum, p) => sum + p.price, 0);
  const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
  
  const subtotal = treatmentsTotal + packagesTotal + addonsTotal;
  
  // Calculate discount
  const discount = calculateDiscount(subtotal, promotion);
  
  // Calculate total
  const total = subtotal - discount;
  
  return { subtotal, discount, total };
};

/**
 * Hook for managing the quote building process
 */
export function useQuoteBuilder(initialQuote?: Partial<Quote>) {
  const { toast } = useToast();
  
  const [quote, setQuote] = useState<Quote>({
    treatments: initialQuote?.treatments || [],
    packages: initialQuote?.packages || [],
    addons: initialQuote?.addons || [],
    promoCode: initialQuote?.promoCode || null,
    promotion: initialQuote?.promotion || null,
    subtotal: initialQuote?.subtotal || 0,
    discount: initialQuote?.discount || 0,
    total: initialQuote?.total || 0,
    patientId: initialQuote?.patientId,
    clinicId: initialQuote?.clinicId,
    status: initialQuote?.status || 'draft'
  });
  
  // Recalculate totals whenever quote items change
  const updateTotals = useCallback(() => {
    const { subtotal, discount, total } = calculateTotals(
      quote.treatments,
      quote.packages,
      quote.addons,
      quote.promotion
    );
    
    setQuote(prev => ({
      ...prev,
      subtotal,
      discount,
      total
    }));
  }, [quote.treatments, quote.packages, quote.addons, quote.promotion]);
  
  // Add a treatment to the quote
  const addTreatment = useCallback((treatment: Treatment) => {
    // Check if treatment already exists
    if (quote.treatments.some(t => t.id === treatment.id)) {
      toast({
        title: 'Treatment already added',
        description: 'This treatment is already in your quote.',
        variant: 'default',
      });
      return;
    }
    
    setQuote(prev => {
      const newTreatments = [...prev.treatments, treatment];
      const { subtotal, discount, total } = calculateTotals(
        newTreatments,
        prev.packages,
        prev.addons,
        prev.promotion
      );
      
      // Track event for analytics
      trackEvent('add_treatment', 'quote', treatment.name);
      
      return {
        ...prev,
        treatments: newTreatments,
        subtotal,
        discount,
        total
      };
    });
  }, [quote.treatments, toast]);
  
  // Remove a treatment from the quote
  const removeTreatment = useCallback((treatmentId: string) => {
    setQuote(prev => {
      const newTreatments = prev.treatments.filter(t => t.id !== treatmentId);
      const { subtotal, discount, total } = calculateTotals(
        newTreatments,
        prev.packages,
        prev.addons,
        prev.promotion
      );
      
      // Track event for analytics
      trackEvent('remove_treatment', 'quote');
      
      return {
        ...prev,
        treatments: newTreatments,
        subtotal,
        discount,
        total
      };
    });
  }, []);
  
  // Add a package to the quote
  const addPackage = useCallback((pkg: Package) => {
    // Check if package already exists
    if (quote.packages.some(p => p.id === pkg.id)) {
      toast({
        title: 'Package already added',
        description: 'This package is already in your quote.',
        variant: 'default',
      });
      return;
    }
    
    setQuote(prev => {
      const newPackages = [...prev.packages, pkg];
      const { subtotal, discount, total } = calculateTotals(
        prev.treatments,
        newPackages,
        prev.addons,
        prev.promotion
      );
      
      // Track event for analytics
      trackEvent('add_package', 'quote', pkg.name);
      
      return {
        ...prev,
        packages: newPackages,
        subtotal,
        discount,
        total
      };
    });
  }, [quote.packages, toast]);
  
  // Remove a package from the quote
  const removePackage = useCallback((packageId: string) => {
    setQuote(prev => {
      const newPackages = prev.packages.filter(p => p.id !== packageId);
      const { subtotal, discount, total } = calculateTotals(
        prev.treatments,
        newPackages,
        prev.addons,
        prev.promotion
      );
      
      // Track event for analytics
      trackEvent('remove_package', 'quote');
      
      return {
        ...prev,
        packages: newPackages,
        subtotal,
        discount,
        total
      };
    });
  }, []);
  
  // Add an addon to the quote
  const addAddon = useCallback((addon: Addon) => {
    // Check if addon already exists
    if (quote.addons.some(a => a.id === addon.id)) {
      toast({
        title: 'Add-on already added',
        description: 'This add-on is already in your quote.',
        variant: 'default',
      });
      return;
    }
    
    setQuote(prev => {
      const newAddons = [...prev.addons, addon];
      const { subtotal, discount, total } = calculateTotals(
        prev.treatments,
        prev.packages,
        newAddons,
        prev.promotion
      );
      
      // Track event for analytics
      trackEvent('add_addon', 'quote', addon.name);
      
      return {
        ...prev,
        addons: newAddons,
        subtotal,
        discount,
        total
      };
    });
  }, [quote.addons, toast]);
  
  // Remove an addon from the quote
  const removeAddon = useCallback((addonId: string) => {
    setQuote(prev => {
      const newAddons = prev.addons.filter(a => a.id !== addonId);
      const { subtotal, discount, total } = calculateTotals(
        prev.treatments,
        prev.packages,
        newAddons,
        prev.promotion
      );
      
      // Track event for analytics
      trackEvent('remove_addon', 'quote');
      
      return {
        ...prev,
        addons: newAddons,
        subtotal,
        discount,
        total
      };
    });
  }, []);
  
  // Apply a promo code to the quote
  const applyPromoCode = useCallback(async (code: string) => {
    try {
      // Track attempt to apply promo code
      trackEvent('apply_promo_attempt', 'quote', code);
      
      const response = await apiRequest('GET', `/api/promo-codes/validate?code=${code}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          message: errorData.message || 'Invalid promo code. Please try again.'
        };
      }
      
      const data = await response.json();
      
      if (data.valid) {
        // Calculate new totals with discount
        setQuote(prev => {
          const { subtotal, discount, total } = calculateTotals(
            prev.treatments,
            prev.packages,
            prev.addons,
            data.promotion
          );
          
          // Track successful promo code application
          trackEvent('apply_promo_success', 'quote', code);
          
          return {
            ...prev,
            promoCode: code,
            promotion: data.promotion,
            discount,
            total
          };
        });
        
        return { success: true, message: `${data.promotion.title} applied!` };
      } else {
        // Track failed promo code application
        trackEvent('apply_promo_invalid', 'quote', code);
        
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      
      // Track error in promo code application
      trackEvent('apply_promo_error', 'quote', code);
      
      return { 
        success: false, 
        message: "Error validating promo code. Please try again." 
      };
    }
  }, []);
  
  // Remove promo code from the quote
  const removePromoCode = useCallback(() => {
    setQuote(prev => {
      // Track promo code removal
      if (prev.promoCode) {
        trackEvent('remove_promo', 'quote', prev.promoCode);
      }
      
      const { subtotal, discount, total } = calculateTotals(
        prev.treatments,
        prev.packages,
        prev.addons,
        null
      );
      
      return {
        ...prev,
        promoCode: null,
        promotion: null,
        discount,
        total
      };
    });
  }, []);
  
  // Save the quote to the server
  const saveQuote = useCallback(async () => {
    try {
      // Track quote save attempt
      trackEvent('save_quote', 'quote');
      
      const response = await apiRequest('POST', '/api/quotes', quote);
      
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: 'Error saving quote',
          description: errorData.message || 'An error occurred while saving your quote.',
          variant: 'destructive',
        });
        return { success: false };
      }
      
      const savedQuote = await response.json();
      
      // Update local quote with server data (including ID)
      setQuote(prev => ({
        ...prev,
        id: savedQuote.id,
        createdAt: savedQuote.createdAt
      }));
      
      toast({
        title: 'Quote saved',
        description: 'Your quote has been saved successfully.',
        variant: 'default',
      });
      
      // Track successful quote save
      trackEvent('save_quote_success', 'quote');
      
      return { success: true, quoteId: savedQuote.id };
    } catch (error) {
      console.error('Error saving quote:', error);
      
      toast({
        title: 'Error saving quote',
        description: 'An error occurred while saving your quote. Please try again.',
        variant: 'destructive',
      });
      
      // Track error in quote save
      trackEvent('save_quote_error', 'quote');
      
      return { success: false };
    }
  }, [quote, toast]);
  
  return {
    quote,
    addTreatment,
    removeTreatment,
    addPackage,
    removePackage,
    addAddon,
    removeAddon,
    applyPromoCode,
    removePromoCode,
    saveQuote,
    updateTotals
  };
}