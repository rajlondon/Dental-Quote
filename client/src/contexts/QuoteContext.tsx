import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Define action types for state changes
const ACTIONS = {
  SET_TREATMENTS: 'set_treatments',
  ADD_TREATMENT: 'add_treatment',
  REMOVE_TREATMENT: 'remove_treatment',
  SET_PROMO_CODE: 'set_promo_code',
  CLEAR_PROMO_CODE: 'clear_promo_code',
  UPDATE_TOTALS: 'update_totals',
  SET_LOADING: 'set_loading',
  RESET: 'reset'
};

// Initial state
const initialState = {
  treatments: [],
  promoCode: null,
  discountAmount: 0,
  subtotal: 0,
  total: 0,
  loading: false,
  error: null
};

// Reducer to handle all state changes
function quoteReducer(state, action) {
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
    case ACTIONS.CLEAR_PROMO_CODE:
      return {
        ...state,
        promoCode: null,
        discountAmount: 0,
        loading: false
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
  treatments: any[];
  promoCode: string | null;
  discountAmount: number;
  subtotal: number;
  total: number;
  loading: boolean;
  error: Error | null;
  isApplyingPromo: boolean;
  addTreatment: (treatment: any) => void;
  removeTreatment: (treatmentId: string) => void;
  applyPromoCode: (code: string) => void;
  clearPromoCode: () => void;
  saveQuote: () => Promise<any>;
}

// Create the context
const QuoteContext = createContext<QuoteContextType | null>(null);

// Provider component
export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quoteReducer, initialState);
  const queryClient = useQueryClient();
  
  // Calculate totals whenever treatments or discount changes
  useEffect(() => {
    const subtotal = state.treatments.reduce((sum, t) => sum + t.price, 0);
    const total = Math.max(0, subtotal - state.discountAmount);
    
    dispatch({
      type: ACTIONS.UPDATE_TOTALS,
      payload: { subtotal, total }
    });
  }, [state.treatments, state.discountAmount]);
  
  // Apply promo code mutation
  const applyPromoMutation = useMutation({
    mutationFn: async (code) => {
      // Set loading state
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      // Get current treatments to send to API
      const treatmentIds = state.treatments.map(t => t.id);
      
      // Call API to validate and calculate discount
      const response = await axios.post('/api/promo-codes/apply', {
        code,
        treatmentIds
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      // Update state with validated promo code
      dispatch({
        type: ACTIONS.SET_PROMO_CODE,
        payload: {
          code: data.code,
          discountAmount: data.discountAmount
        }
      });
      
      // Invalidate quotes cache to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['quote'] });
    },
    onError: (error) => {
      console.error('Promo code application failed:', error);
      dispatch({ type: ACTIONS.CLEAR_PROMO_CODE });
    }
  });
  
  // Clear promo code
  const clearPromoCode = () => {
    dispatch({ type: ACTIONS.CLEAR_PROMO_CODE });
  };
  
  // Add treatment with validation
  const addTreatment = (treatment) => {
    if (!state.treatments.some(t => t.id === treatment.id)) {
      dispatch({ type: ACTIONS.ADD_TREATMENT, payload: treatment });
    }
  };
  
  // Remove treatment
  const removeTreatment = (treatmentId) => {
    dispatch({ type: ACTIONS.REMOVE_TREATMENT, payload: treatmentId });
  };
  
  // Save quote to server
  const saveQuote = async () => {
    try {
      const quoteData = {
        treatments: state.treatments.map(t => t.id),
        promoCode: state.promoCode,
        subtotal: state.subtotal,
        discount: state.discountAmount,
        total: state.total
      };
      
      const response = await axios.post('/api/quotes', quoteData);
      return response.data;
    } catch (error) {
      console.error('Failed to save quote:', error);
      throw error;
    }
  };
  
  return (
    <QuoteContext.Provider
      value={{
        ...state,
        addTreatment,
        removeTreatment,
        applyPromoCode: (code) => applyPromoMutation.mutate(code),
        clearPromoCode,
        saveQuote,
        isApplyingPromo: applyPromoMutation.isPending
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