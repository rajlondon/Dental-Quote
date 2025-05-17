import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Treatment } from '@/components/quotes/TreatmentList';
import { quoteIntegrationService } from '@/services/quote-integration-service';

// Portal type enum
export type PortalType = 'patient' | 'clinic' | 'admin';

/**
 * Quote system hook that provides centralized state management
 * and operations for the quote integration system
 */
export const useQuoteSystem = (portalType: PortalType = 'patient') => {
  const { toast } = useToast();
  
  // State management
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount' | null>(null);
  const [discountValue, setDiscountValue] = useState<number | null>(null);
  const [specialOffers, setSpecialOffers] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'GBP' | 'EUR'>('USD');
  
  // Initialize the quote system
  const initialize = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { treatments, subtotal, discountAmount, total, promoCode, discountType, discountValue } = 
        await quoteIntegrationService.initializeQuote();
      
      setTreatments(treatments || []);
      setSubtotal(subtotal || 0);
      setDiscountAmount(discountAmount || 0);
      setTotal(total || 0);
      
      if (promoCode) {
        setPromoCode(promoCode);
        setAppliedPromoCode(promoCode);
        setDiscountType(discountType || null);
        setDiscountValue(discountValue || null);
      }
      
      // Load special offers as well
      loadSpecialOffers();
    } catch (err) {
      setError('Failed to initialize quote system');
      console.error('Error initializing quote system:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get the current quote state from the server
  const refreshQuoteState = useCallback(async () => {
    setLoading(true);
    
    try {
      const { treatments, subtotal, discountAmount, total, promoCode, discountType, discountValue } = 
        await quoteIntegrationService.getQuoteState();
      
      setTreatments(treatments || []);
      setSubtotal(subtotal || 0);
      setDiscountAmount(discountAmount || 0);
      setTotal(total || 0);
      
      if (promoCode) {
        setPromoCode(promoCode);
        setAppliedPromoCode(promoCode);
        setDiscountType(discountType || null);
        setDiscountValue(discountValue || null);
      } else {
        setPromoCode('');
        setAppliedPromoCode(null);
        setDiscountType(null);
        setDiscountValue(null);
      }
    } catch (err) {
      console.error('Error refreshing quote state:', err);
      // Don't set error here to avoid disrupting the UI on background refreshes
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load special offers
  const loadSpecialOffers = useCallback(async () => {
    try {
      const { offers } = await quoteIntegrationService.getSpecialOffers();
      setSpecialOffers(offers || []);
    } catch (err) {
      console.error('Error loading special offers:', err);
    }
  }, []);
  
  // Add a treatment to the quote
  const addTreatment = useCallback(async (treatmentId: string, quantity: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const { treatments, subtotal, discountAmount, total } = 
        await quoteIntegrationService.addTreatment(treatmentId, quantity);
      
      setTreatments(treatments || []);
      setSubtotal(subtotal || 0);
      setDiscountAmount(discountAmount || 0);
      setTotal(total || 0);
      
      toast({
        title: 'Treatment added',
        description: 'The treatment has been added to your quote.',
      });
      
      return true;
    } catch (err) {
      setError('Failed to add treatment');
      console.error('Error adding treatment:', err);
      
      toast({
        title: 'Error',
        description: 'Failed to add treatment to your quote.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Update the quantity of a treatment
  const updateTreatmentQuantity = useCallback(async (treatmentId: string, quantity: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const { treatments, subtotal, discountAmount, total } = 
        await quoteIntegrationService.updateTreatmentQuantity(treatmentId, quantity);
      
      setTreatments(treatments || []);
      setSubtotal(subtotal || 0);
      setDiscountAmount(discountAmount || 0);
      setTotal(total || 0);
      
      return true;
    } catch (err) {
      setError('Failed to update treatment quantity');
      console.error('Error updating treatment quantity:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Remove a treatment from the quote
  const removeTreatment = useCallback(async (treatmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { treatments, subtotal, discountAmount, total } = 
        await quoteIntegrationService.removeTreatment(treatmentId);
      
      setTreatments(treatments || []);
      setSubtotal(subtotal || 0);
      setDiscountAmount(discountAmount || 0);
      setTotal(total || 0);
      
      toast({
        title: 'Treatment removed',
        description: 'The treatment has been removed from your quote.',
      });
      
      return true;
    } catch (err) {
      setError('Failed to remove treatment');
      console.error('Error removing treatment:', err);
      
      toast({
        title: 'Error',
        description: 'Failed to remove treatment from your quote.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Apply a promo code to the quote
  const applyPromoCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { treatments, subtotal, discountAmount, total, discountType, discountValue } = 
        await quoteIntegrationService.applyPromoCode(code);
      
      setTreatments(treatments || []);
      setSubtotal(subtotal || 0);
      setDiscountAmount(discountAmount || 0);
      setTotal(total || 0);
      setAppliedPromoCode(code);
      setDiscountType(discountType || null);
      setDiscountValue(discountValue || null);
      
      toast({
        title: 'Promo code applied',
        description: `Promo code "${code}" has been applied to your quote.`,
      });
      
      return true;
    } catch (err: any) {
      setError('Failed to apply promo code');
      console.error('Error applying promo code:', err);
      
      toast({
        title: 'Invalid promo code',
        description: err.message || 'The promo code could not be applied.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Clear the applied promo code
  const clearPromoCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { treatments, subtotal, discountAmount, total } = 
        await quoteIntegrationService.clearPromoCode();
      
      setTreatments(treatments || []);
      setSubtotal(subtotal || 0);
      setDiscountAmount(discountAmount || 0);
      setTotal(total || 0);
      setPromoCode('');
      setAppliedPromoCode(null);
      setDiscountType(null);
      setDiscountValue(null);
      
      toast({
        title: 'Promo code removed',
        description: 'The promo code has been removed from your quote.',
      });
      
      return true;
    } catch (err) {
      setError('Failed to clear promo code');
      console.error('Error clearing promo code:', err);
      
      toast({
        title: 'Error',
        description: 'Failed to remove the promo code.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Process a special offer selection
  const processSpecialOffer = useCallback(async (offerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { treatments, subtotal, discountAmount, total, promoCode, discountType, discountValue } = 
        await quoteIntegrationService.processSpecialOffer(offerId);
      
      setTreatments(treatments || []);
      setSubtotal(subtotal || 0);
      setDiscountAmount(discountAmount || 0);
      setTotal(total || 0);
      
      if (promoCode) {
        setPromoCode(promoCode);
        setAppliedPromoCode(promoCode);
        setDiscountType(discountType || null);
        setDiscountValue(discountValue || null);
      }
      
      toast({
        title: 'Special offer applied',
        description: 'The special offer has been applied to your quote.',
      });
      
      return true;
    } catch (err) {
      setError('Failed to apply special offer');
      console.error('Error applying special offer:', err);
      
      toast({
        title: 'Error',
        description: 'Failed to apply the special offer.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Save the quote with patient information
  const saveQuote = useCallback(async (patientData: {
    name: string;
    email: string;
    phone?: string;
    notes?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await quoteIntegrationService.saveQuote(patientData);
      
      toast({
        title: 'Quote saved',
        description: 'Your quote has been saved successfully.',
      });
      
      return result;
    } catch (err) {
      setError('Failed to save quote');
      console.error('Error saving quote:', err);
      
      toast({
        title: 'Error',
        description: 'Failed to save your quote.',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Get available treatments for the quote builder
  const getAvailableTreatments = useCallback(async (
    categoryId?: string,
    clinicId?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const { treatments } = await quoteIntegrationService.getAvailableTreatments(
        categoryId, 
        clinicId
      );
      
      return treatments || [];
    } catch (err) {
      setError('Failed to load available treatments');
      console.error('Error loading available treatments:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Change the currency
  const changeCurrency = useCallback((currency: 'USD' | 'GBP' | 'EUR') => {
    setSelectedCurrency(currency);
  }, []);
  
  // Initialize on first load
  useEffect(() => {
    initialize();
    
    // Set up periodic refresh to keep data in sync
    const refreshInterval = setInterval(() => {
      refreshQuoteState();
    }, 60000); // Refresh every minute
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [initialize, refreshQuoteState]);
  
  // Return all the functionality
  return {
    // State
    treatments,
    loading,
    error,
    subtotal,
    discountAmount,
    total,
    promoCode,
    appliedPromoCode,
    discountType,
    discountValue,
    specialOffers,
    selectedCurrency,
    portalType,
    
    // Actions
    initialize,
    refreshQuoteState,
    addTreatment,
    updateTreatmentQuantity,
    removeTreatment,
    applyPromoCode,
    clearPromoCode,
    processSpecialOffer,
    saveQuote,
    getAvailableTreatments,
    changeCurrency,
    
    // Helpers for the UI
    setPromoCode, // To update the promo code input field
  };
};

export default useQuoteSystem;