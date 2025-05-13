import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { trackEvent } from '@/lib/analytics';

// Define the types we need for our hook
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
  treatments: string[];
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
  promo_code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
}

export interface Quote {
  id?: string;
  treatments: Treatment[];
  packages: Package[];
  addons: Addon[];
  promotion: Promotion | null;
  subtotal: number;
  discount: number;
  total: number;
  patientId?: number;
  clinicId?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuoteBuilderOptions {
  treatments?: Treatment[];
  packages?: Package[];
  addons?: Addon[];
  promoCode?: string | null;
}

export interface UseQuoteBuilderResult {
  quote: Quote;
  addTreatment: (treatment: Treatment) => void;
  removeTreatment: (treatmentId: string) => void;
  addPackage: (pkg: Package) => void;
  removePackage: (packageId: string) => void;
  addAddon: (addon: Addon) => void;
  removeAddon: (addonId: string) => void;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;
  saveQuote: () => Promise<{ success: boolean; quoteId?: string; message?: string }>;
  reset: () => void;
}

const calculateSubtotal = (
  treatments: Treatment[], 
  packages: Package[], 
  addons: Addon[]
): number => {
  const treatmentsTotal = treatments.reduce((sum, t) => sum + t.price, 0);
  const packagesTotal = packages.reduce((sum, p) => sum + p.price, 0);
  const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
  
  return treatmentsTotal + packagesTotal + addonsTotal;
};

const calculateDiscount = (
  subtotal: number, 
  promotion: Promotion | null
): number => {
  if (!promotion) return 0;
  
  if (promotion.discount_type === 'percentage') {
    return subtotal * (promotion.discount_value / 100);
  } else {
    // Fixed amount discount, don't exceed subtotal
    return Math.min(promotion.discount_value, subtotal);
  }
};

export const useQuoteBuilder = (options: QuoteBuilderOptions = {}): UseQuoteBuilderResult => {
  const [treatments, setTreatments] = useState<Treatment[]>(options.treatments || []);
  const [packages, setPackages] = useState<Package[]>(options.packages || []);
  const [addons, setAddons] = useState<Addon[]>(options.addons || []);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  
  // Initialize with promo code if provided
  useEffect(() => {
    if (options.promoCode) {
      applyPromoCode(options.promoCode);
    }
  }, []);
  
  // Calculate derived values
  const subtotal = calculateSubtotal(treatments, packages, addons);
  const discount = calculateDiscount(subtotal, promotion);
  const total = Math.max(0, subtotal - discount);
  
  // Build the quote object
  const quote: Quote = {
    treatments,
    packages,
    addons,
    promotion,
    subtotal,
    discount,
    total
  };
  
  /**
   * Add a treatment to the quote
   */
  const addTreatment = (treatment: Treatment) => {
    if (!treatments.some(t => t.id === treatment.id)) {
      setTreatments([...treatments, treatment]);
      trackEvent('add_treatment', 'quote_builder', treatment.id);
    }
  };
  
  /**
   * Remove a treatment from the quote
   */
  const removeTreatment = (treatmentId: string) => {
    setTreatments(treatments.filter(t => t.id !== treatmentId));
    trackEvent('remove_treatment', 'quote_builder', treatmentId);
  };
  
  /**
   * Add a package to the quote
   */
  const addPackage = (pkg: Package) => {
    if (!packages.some(p => p.id === pkg.id)) {
      setPackages([...packages, pkg]);
      trackEvent('add_package', 'quote_builder', pkg.id);
    }
  };
  
  /**
   * Remove a package from the quote
   */
  const removePackage = (packageId: string) => {
    setPackages(packages.filter(p => p.id !== packageId));
    trackEvent('remove_package', 'quote_builder', packageId);
  };
  
  /**
   * Add an addon to the quote
   */
  const addAddon = (addon: Addon) => {
    if (!addons.some(a => a.id === addon.id)) {
      setAddons([...addons, addon]);
      trackEvent('add_addon', 'quote_builder', addon.id);
    }
  };
  
  /**
   * Remove an addon from the quote
   */
  const removeAddon = (addonId: string) => {
    setAddons(addons.filter(a => a.id !== addonId));
    trackEvent('remove_addon', 'quote_builder', addonId);
  };
  
  /**
   * Apply a promotion code to the quote
   */
  const applyPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest('POST', '/api/promo-codes/validate', { code });
      const data = await response.json();
      
      if (data.success && data.promotion) {
        setPromotion(data.promotion);
        trackEvent('apply_promo_code_success', 'quote_builder', code);
        return { 
          success: true, 
          message: `Promotion "${data.promotion.title}" applied successfully!` 
        };
      } else {
        trackEvent('apply_promo_code_fail', 'quote_builder', code);
        return { 
          success: false, 
          message: data.message || 'Invalid promotion code. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      trackEvent('apply_promo_code_error', 'quote_builder', code);
      return { 
        success: false, 
        message: 'An error occurred while applying the promotion code. Please try again.' 
      };
    }
  };
  
  /**
   * Remove the applied promotion code
   */
  const removePromoCode = () => {
    if (promotion) {
      trackEvent('remove_promo_code', 'quote_builder', promotion.promo_code);
      setPromotion(null);
    }
  };
  
  /**
   * Save the quote
   */
  const saveQuote = async (): Promise<{ success: boolean; quoteId?: string; message?: string }> => {
    try {
      // Only include necessary data to save
      const quoteData = {
        treatments: quote.treatments,
        packages: quote.packages,
        addons: quote.addons,
        promoCode: promotion?.promo_code,
        subtotal: quote.subtotal,
        discount: quote.discount,
        total: quote.total
      };
      
      const response = await apiRequest('POST', '/api/quotes', quoteData);
      const data = await response.json();
      
      if (data.success) {
        trackEvent('save_quote_success', 'quote_builder');
        return { 
          success: true, 
          quoteId: data.data.id 
        };
      } else {
        trackEvent('save_quote_fail', 'quote_builder');
        return { 
          success: false, 
          message: data.message || 'Failed to save quote. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      trackEvent('save_quote_error', 'quote_builder');
      return { 
        success: false, 
        message: 'An error occurred while saving the quote. Please try again later.' 
      };
    }
  };
  
  /**
   * Reset the quote to empty state
   */
  const reset = () => {
    setTreatments([]);
    setPackages([]);
    setAddons([]);
    setPromotion(null);
    trackEvent('reset_quote', 'quote_builder');
  };
  
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
    reset
  };
};