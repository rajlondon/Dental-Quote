import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

// Treatment interface
interface Treatment {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

// Define action types for state changes
const ACTIONS = {
  SET_TREATMENTS: 'set_treatments',
  ADD_TREATMENT: 'add_treatment',
  REMOVE_TREATMENT: 'remove_treatment',
  SET_PROMO_CODE: 'set_promo_code',
  CLEAR_PROMO_CODE: 'clear_promo_code',
  APPLY_PACKAGE_PROMO: 'apply_package_promo',
  UPDATE_TOTALS: 'update_totals',
  SET_LOADING: 'set_loading',
  RESET: 'reset'
};

// Define attraction interface
interface TouristAttraction {
  name: string;
  description: string;
  value: number;
  included: boolean;
}

// Define state interface
interface QuoteState {
  treatments: Treatment[];
  promoCode: string | null;
  discountAmount: number;
  subtotal: number;
  total: number;
  loading: boolean;
  error: Error | null;
  isPackage: boolean;
  packageName: string | null;
  packageDescription: string | null;
  clinicId: string | null;
  attractions: TouristAttraction[];
  additionalServices: string[];
}

// Initial state
const initialState: QuoteState = {
  treatments: [],
  promoCode: null,
  discountAmount: 0,
  subtotal: 0,
  total: 0,
  loading: false,
  error: null,
  isPackage: false,
  packageName: null,
  packageDescription: null,
  clinicId: null,
  attractions: [],
  additionalServices: []
};

// Reducer to handle all state changes
function quoteReducer(state: QuoteState, action: any): QuoteState {
  switch (action.type) {
    case ACTIONS.SET_TREATMENTS:
      return {
        ...state,
        treatments: action.payload
      };
    case ACTIONS.ADD_TREATMENT:
      return {
        ...state,
        treatments: [...state.treatments, action.payload]
      };
    case ACTIONS.REMOVE_TREATMENT:
      return {
        ...state,
        treatments: state.treatments.filter(t => t.id !== action.payload)
      };
    case ACTIONS.SET_PROMO_CODE:
      return {
        ...state,
        promoCode: action.payload.code,
        discountAmount: action.payload.discountAmount,
        loading: false
      };
    case ACTIONS.APPLY_PACKAGE_PROMO:
      return {
        ...state,
        treatments: action.payload.treatments,
        isPackage: true,
        packageName: action.payload.packageName,
        packageDescription: action.payload.packageDescription,
        promoCode: action.payload.code,
        subtotal: action.payload.originalPrice,
        discountAmount: action.payload.savings,
        total: action.payload.packagePrice,
        clinicId: action.payload.clinicId,
        attractions: action.payload.attractions || [],
        additionalServices: action.payload.additionalServices || [],
        loading: false
      };
    case ACTIONS.CLEAR_PROMO_CODE:
      return {
        ...state,
        promoCode: null,
        discountAmount: 0,
        loading: false,
        isPackage: false,
        packageName: null,
        packageDescription: null,
        clinicId: null,
        attractions: [],
        additionalServices: []
      };
    case ACTIONS.UPDATE_TOTALS:
      return {
        ...state,
        subtotal: action.payload.subtotal,
        total: action.payload.total,
        loading: false
      };
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case ACTIONS.RESET:
      return initialState;
    default:
      return state;
  }
}

// Define the context types
interface QuoteContextType {
  treatments: Treatment[];
  promoCode: string | null;
  discountAmount: number;
  subtotal: number;
  total: number;
  loading: boolean;
  error: Error | null;
  isApplyingPromo: boolean;
  isPackage: boolean;
  packageName: string | null;
  packageDescription: string | null;
  clinicId: string | null;
  attractions: TouristAttraction[];
  additionalServices: string[];
  addTreatment: (treatment: Treatment) => void;
  removeTreatment: (treatmentId: string) => void;
  applyPromoCode: (code: string) => void;
  clearPromoCode: () => void;
  saveQuote: () => Promise<any>;
}

// Create the context
export const QuoteContext = createContext<QuoteContextType | null>(null);

// Provider component
export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quoteReducer, initialState);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Calculate totals whenever treatments or discount changes
  useEffect(() => {
    // Skip total recalculation for packages since they have fixed pricing
    if (state.isPackage) return;
    
    const subtotal = state.treatments.reduce((sum: number, t: Treatment) => {
      const quantity = t.quantity || 1;
      return sum + (t.price * quantity);
    }, 0);
    
    const total = Math.max(0, subtotal - state.discountAmount);
    
    dispatch({
      type: ACTIONS.UPDATE_TOTALS,
      payload: { subtotal, total }
    });
  }, [state.treatments, state.discountAmount, state.isPackage]);
  
  // Apply regular promo code mutation
  const applyPromoMutation = useMutation({
    mutationFn: async (code: string) => {
      // Set loading state
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      // Get current treatments to send to API
      const treatmentIds = state.treatments.map(t => t.id);
      
      if (treatmentIds.length === 0) {
        throw new Error('Please select at least one treatment before applying a promo code');
      }
      
      // Call API to validate and calculate discount
      const response = await axios.post('/api/promo-codes/apply', {
        code,
        treatmentIds
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Promo code applied successfully:', data);
      
      // Update state with validated promo code
      dispatch({
        type: ACTIONS.SET_PROMO_CODE,
        payload: {
          code: data.code,
          discountAmount: data.discountAmount || 0
        }
      });
      
      // Show success toast
      toast({
        title: "Promo Code Applied!",
        description: `Successfully applied ${data.code} with a discount of ${new Intl.NumberFormat('en-GB', { 
          style: 'currency', 
          currency: 'GBP' 
        }).format(data.discountAmount)}`,
      });
    },
    onError: (error: any) => {
      console.error('Promo code application failed:', error);
      dispatch({ type: ACTIONS.CLEAR_PROMO_CODE });
      
      // Show error toast
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message || "Failed to apply promo code",
        variant: "destructive"
      });
    }
  });
  
  // Apply package promo code mutation
  const applyPackagePromoMutation = useMutation({
    mutationFn: async (code: string) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const response = await axios.post('/api/promo-codes/apply-package', {
        code
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Package promo code applied successfully:', data);
      
      // Update state with package data
      dispatch({
        type: ACTIONS.APPLY_PACKAGE_PROMO,
        payload: {
          code: data.code,
          treatments: data.treatments,
          packageName: data.packageName,
          packageDescription: data.packageDescription,
          originalPrice: data.originalPrice,
          packagePrice: data.packagePrice,
          savings: data.savings,
          clinicId: data.clinicId,
          attractions: data.attractions || [],
          additionalServices: data.additionalServices || []
        }
      });
      
      // Show success toast
      toast({
        title: "Package Applied!",
        description: `${data.packageName} package has been applied with a savings of ${new Intl.NumberFormat('en-GB', { 
          style: 'currency', 
          currency: 'GBP' 
        }).format(data.savings)}`,
      });
    },
    onError: (error: any) => {
      console.error('Package promo code application failed:', error);
      dispatch({ type: ACTIONS.CLEAR_PROMO_CODE });
      
      // Show error toast
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message || "Failed to apply package code",
        variant: "destructive"
      });
    }
  });
  
  // Clear promo code
  const clearPromoCode = () => {
    dispatch({ type: ACTIONS.CLEAR_PROMO_CODE });
    
    toast({
      title: "Promo Code Removed",
      description: "The promo code has been removed from your quote.",
    });
  };
  
  // Add treatment with validation
  const addTreatment = (treatment: Treatment) => {
    if (!state.treatments.some(t => t.id === treatment.id)) {
      dispatch({ type: ACTIONS.ADD_TREATMENT, payload: treatment });
      
      // Show toast notification
      toast({
        title: "Treatment Added",
        description: `${treatment.name} has been added to your quote.`,
      });
    }
  };
  
  // Remove treatment
  const removeTreatment = (treatmentId: string) => {
    dispatch({ type: ACTIONS.REMOVE_TREATMENT, payload: treatmentId });
  };
  
  // Save quote to server
  const saveQuote = async () => {
    try {
      // If no treatments are selected and not a package, show error
      if (state.treatments.length === 0 && !state.isPackage) {
        toast({
          title: "Error",
          description: "Please select at least one treatment before saving your quote.",
          variant: "destructive"
        });
        return;
      }
      
      // Redirect to results page with clinic information
      if (state.isPackage) {
        // For packages, redirect to results page with the specific clinic
        window.location.href = `/results?package=${encodeURIComponent(state.packageName || '')}` + 
                               `&promo=${encodeURIComponent(state.promoCode || '')}` + 
                               `&total=${state.total}` +
                               `&clinicId=${state.clinicId || ''}`;
        return { success: true, message: "Redirecting to clinic results page" };
      } else {
        // For regular quotes, submit to quotes API
        const quoteData = {
          name: "Guest User", // Adding required field
          email: "guest@example.com", // Adding required field
          treatment: state.treatments.length > 0 ? state.treatments[0].name : "Consultation", // Adding required field
          consent: true, // Adding required field
          treatments: state.treatments.map(t => t.id),
          promoCode: state.promoCode,
          isPackage: state.isPackage,
          packageName: state.packageName,
          subtotal: state.subtotal,
          discount: state.discountAmount,
          total: state.total,
          clinicId: state.clinicId
        };
        
        const response = await axios.post('/api/quotes', quoteData);
        
        toast({
          title: "Quote Saved",
          description: "Your quote has been saved successfully. Redirecting to booking page...",
        });
        
        // Redirect to booking page
        setTimeout(() => {
          window.location.href = `/booking?quoteId=${response.data.id}`;
        }, 1500);
        
        return response.data;
      }
    } catch (error) {
      console.error('Failed to save quote:', error);
      
      toast({
        title: "Error",
        description: "Failed to save quote. Please ensure all required information is provided.",
        variant: "destructive"
      });
      
      throw error;
    }
  };
  
  // Apply a promo code (handles both regular and package codes)
  const applyPromoCode = async (code: string) => {
    if (!code) {
      toast({
        title: "Error",
        description: "Please enter a valid promo code",
        variant: "destructive"
      });
      return;
    }
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      // First check if it's a package code
      try {
        const validationResponse = await axios.post('/api/promo-codes/validate', { code });
        
        if (validationResponse.data.valid) {
          // If it's a package type, use the package endpoint
          if (validationResponse.data.type === 'package') {
            applyPackagePromoMutation.mutate(code);
            return;
          }
        }
      } catch (err) {
        console.log('Error validating promo code type:', err);
        // Continue to try as a regular code
      }
      
      // If not a package or validation failed, try as a regular discount code
      applyPromoMutation.mutate(code);
    } catch (error: any) {
      console.error('Error applying promo code:', error);
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      
      toast({
        title: "Error",
        description: error.message || "Failed to apply promo code",
        variant: "destructive"
      });
    }
  };
  
  return (
    <QuoteContext.Provider
      value={{
        ...state,
        addTreatment,
        removeTreatment,
        applyPromoCode,
        clearPromoCode,
        saveQuote,
        isApplyingPromo: applyPromoMutation.isPending || applyPackagePromoMutation.isPending
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
}

// Custom hook for using the quote context
export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
}

// Helper hook to safely check if quote context is available
export function useOptionalQuote() {
  const context = useContext(QuoteContext);
  return context; // Returns null if not in a QuoteProvider
}