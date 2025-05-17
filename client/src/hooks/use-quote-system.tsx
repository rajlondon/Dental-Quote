import { useState, useEffect } from 'react';
import { 
  QuoteIntegrationService, 
  Treatment, 
  ValidatePromoCodeResponse
} from '@/services/quote-integration-service';

/**
 * Hook for interacting with the Quote Integration System
 * 
 * This hook provides a unified interface for all quote-related operations
 * including adding/removing treatments, applying promo codes, and validating treatments.
 */
export function useQuoteSystem() {
  // State
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [isLoadingTreatments, setIsLoadingTreatments] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoValidationResult, setPromoValidationResult] = useState<ValidatePromoCodeResponse | null>(null);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount' | undefined>(undefined);
  const [discountValue, setDiscountValue] = useState<number | undefined>(undefined);
  
  // Load available treatments
  useEffect(() => {
    fetchAllTreatments();
  }, []);
  
  // Fetch all available treatments
  const fetchAllTreatments = async () => {
    try {
      setIsLoadingTreatments(true);
      const fetchedTreatments = await QuoteIntegrationService.getTreatments();
      setTreatments(fetchedTreatments);
    } catch (error) {
      console.error('Error fetching treatments:', error);
    } finally {
      setIsLoadingTreatments(false);
    }
  };
  
  // Add a treatment to the quote
  const addTreatment = async (treatmentId: string, quantity: number = 1) => {
    try {
      const response = await QuoteIntegrationService.addTreatment(treatmentId, quantity);
      
      if (response.success) {
        // Find all treatments (including ones not in the current quote)
        const availableTreatments = [...treatments];
        
        // Update quantities based on the response
        const updatedTreatments = availableTreatments.map(treatment => {
          const inQuote = response.treatments.find(t => t.id === treatment.id);
          return inQuote ? { ...treatment, quantity: inQuote.quantity, lineTotal: inQuote.lineTotal } : treatment;
        });
        
        setTreatments(updatedTreatments);
      }
      
      return response;
    } catch (error) {
      console.error('Error adding treatment:', error);
      throw error;
    }
  };
  
  // Remove a treatment from the quote
  const removeTreatment = async (treatmentId: string) => {
    try {
      const response = await QuoteIntegrationService.removeTreatment(treatmentId);
      
      if (response.success) {
        // Find all treatments
        const availableTreatments = [...treatments];
        
        // Update quantities based on the response (set to 0 for removed items)
        const updatedTreatments = availableTreatments.map(treatment => {
          const stillInQuote = response.treatments.find(t => t.id === treatment.id);
          return stillInQuote 
            ? { ...treatment, quantity: stillInQuote.quantity, lineTotal: stillInQuote.lineTotal }
            : { ...treatment, quantity: 0, lineTotal: 0 };
        });
        
        setTreatments(updatedTreatments);
      }
      
      return response;
    } catch (error) {
      console.error('Error removing treatment:', error);
      throw error;
    }
  };
  
  // Update treatment quantity
  const updateTreatmentQuantity = async (treatmentId: string, quantity: number) => {
    try {
      const response = await QuoteIntegrationService.updateTreatmentQuantity(treatmentId, quantity);
      
      if (response.success) {
        // Find all treatments
        const availableTreatments = [...treatments];
        
        // Update quantities based on the response
        const updatedTreatments = availableTreatments.map(treatment => {
          const updatedTreatment = response.treatments.find(t => t.id === treatment.id);
          return updatedTreatment 
            ? { ...treatment, quantity: updatedTreatment.quantity, lineTotal: updatedTreatment.lineTotal }
            : treatment;
        });
        
        setTreatments(updatedTreatments);
      }
      
      return response;
    } catch (error) {
      console.error('Error updating treatment quantity:', error);
      throw error;
    }
  };
  
  // Apply promo code
  const applyPromoCode = async (code: string) => {
    try {
      setIsValidatingPromo(true);
      const response = await QuoteIntegrationService.applyPromoCode(code);
      
      setPromoValidationResult(response);
      
      if (response.isValid) {
        setPromoCode(code);
        
        // Set discount details from response
        setDiscountType(response.discountType);
        setDiscountValue(response.discountValue);
      } else {
        setPromoCode(null);
        setDiscountType(undefined);
        setDiscountValue(undefined);
      }
      
      return response;
    } catch (error) {
      console.error('Error applying promo code:', error);
      setPromoValidationResult({
        isValid: false,
        code,
        message: 'Error validating promo code. Please try again later.'
      });
      throw error;
    } finally {
      setIsValidatingPromo(false);
    }
  };
  
  // Clear promo code
  const clearPromoCode = async () => {
    try {
      const response = await QuoteIntegrationService.clearPromoCode();
      
      if (response.success) {
        setPromoCode(null);
        setPromoValidationResult(null);
        setDiscountType(undefined);
        setDiscountValue(undefined);
      }
      
      return response;
    } catch (error) {
      console.error('Error clearing promo code:', error);
      throw error;
    }
  };
  
  // Reset quote
  const resetQuote = async () => {
    try {
      const response = await QuoteIntegrationService.resetQuote();
      
      if (response.success) {
        // Reset all treatment quantities to 0
        const resetTreatments = treatments.map(treatment => ({
          ...treatment,
          quantity: 0,
          lineTotal: 0
        }));
        
        setTreatments(resetTreatments);
        setPromoCode(null);
        setPromoValidationResult(null);
        setDiscountType(undefined);
        setDiscountValue(undefined);
      }
      
      return response;
    } catch (error) {
      console.error('Error resetting quote:', error);
      throw error;
    }
  };
  
  return {
    // State
    treatments,
    isLoadingTreatments,
    promoCode,
    isValidatingPromo,
    promoValidationResult,
    discountType,
    discountValue,
    
    // Actions
    addTreatment,
    removeTreatment,
    updateTreatmentQuantity,
    applyPromoCode,
    clearPromoCode,
    resetQuote
  };
}