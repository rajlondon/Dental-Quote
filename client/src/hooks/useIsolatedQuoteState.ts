import { useReducer, useCallback } from 'react';

// Define types for a treatment
interface Treatment {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Define the state structure
interface QuoteState {
  treatments: Treatment[];
  promoCode: string | null;
  discountPercent: number;
  subtotal: number;
  total: number;
  loading: {
    promoCode: boolean;
    treatments: boolean;
    saving: boolean;
  };
}

// Define all possible actions
type QuoteAction =
  | { type: 'ADD_TREATMENT'; treatment: Treatment }
  | { type: 'REMOVE_TREATMENT'; id: string }
  | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
  | { type: 'PROMO_CODE_REQUEST' }
  | { type: 'PROMO_CODE_SUCCESS'; code: string; discountPercent: number }
  | { type: 'PROMO_CODE_FAILURE' }
  | { type: 'REMOVE_PROMO_CODE' }
  | { type: 'SAVE_QUOTE_REQUEST' }
  | { type: 'SAVE_QUOTE_SUCCESS'; quoteId: string }
  | { type: 'SAVE_QUOTE_FAILURE' };

// Initial state
const initialState: QuoteState = {
  treatments: [],
  promoCode: null,
  discountPercent: 0,
  subtotal: 0,
  total: 0,
  loading: {
    promoCode: false,
    treatments: false,
    saving: false
  }
};

// Helper for calculating totals
const calculateTotals = (treatments: Treatment[], discountPercent: number) => {
  const subtotal = treatments.reduce(
    (sum, t) => sum + (t.price * (t.quantity || 1)), 
    0
  );
  const total = subtotal * (1 - (discountPercent / 100));
  return { subtotal, total };
};

// Pure reducer function
function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  console.log('Quote reducer action:', action.type, action);
  
  switch (action.type) {
    case 'ADD_TREATMENT': {
      // Check if treatment already exists
      const existingIndex = state.treatments.findIndex(t => t.id === action.treatment.id);
      
      let treatments;
      if (existingIndex >= 0) {
        // Update quantity if already exists
        treatments = state.treatments.map((t, index) => 
          index === existingIndex 
            ? { ...t, quantity: t.quantity + 1 } 
            : t
        );
      } else {
        // Add new treatment
        treatments = [...state.treatments, action.treatment];
      }
      
      const { subtotal, total } = calculateTotals(treatments, state.discountPercent);
      return {
        ...state,
        treatments,
        subtotal,
        total
      };
    }
    
    case 'REMOVE_TREATMENT': {
      const treatments = state.treatments.filter(t => t.id !== action.id);
      const { subtotal, total } = calculateTotals(treatments, state.discountPercent);
      return {
        ...state,
        treatments,
        subtotal,
        total
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const treatments = state.treatments.map(t => 
        t.id === action.id ? { ...t, quantity: action.quantity } : t
      );
      const { subtotal, total } = calculateTotals(treatments, state.discountPercent);
      return {
        ...state,
        treatments,
        subtotal,
        total
      };
    }
    
    case 'PROMO_CODE_REQUEST':
      return {
        ...state,
        loading: { ...state.loading, promoCode: true }
      };
    
    case 'PROMO_CODE_SUCCESS': {
      const { subtotal, total } = calculateTotals(state.treatments, action.discountPercent);
      return {
        ...state,
        promoCode: action.code,
        discountPercent: action.discountPercent,
        subtotal,
        total,
        loading: { ...state.loading, promoCode: false }
      };
    }
    
    case 'PROMO_CODE_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, promoCode: false }
      };
    
    case 'REMOVE_PROMO_CODE': {
      const { subtotal, total } = calculateTotals(state.treatments, 0);
      return {
        ...state,
        promoCode: null,
        discountPercent: 0,
        subtotal,
        total
      };
    }
    
    case 'SAVE_QUOTE_REQUEST':
      return {
        ...state,
        loading: { ...state.loading, saving: true }
      };
    
    case 'SAVE_QUOTE_SUCCESS':
      return {
        ...state,
        loading: { ...state.loading, saving: false }
      };
    
    case 'SAVE_QUOTE_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, saving: false }
      };
    
    default:
      return state;
  }
}

// Mock promo code validation
const validatePromoCode = async (code: string): Promise<{ valid: boolean; discountPercentage: number }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const promoCodes = {
    'SUMMER15': { valid: true, discountPercentage: 15 },
    'DENTAL25': { valid: true, discountPercentage: 25 },
    'NEWPATIENT': { valid: true, discountPercentage: 10 },
    'TEST10': { valid: true, discountPercentage: 10 },
  };
  
  const upperCode = code.toUpperCase();
  
  if (upperCode in promoCodes) {
    return {
      valid: true,
      discountPercentage: promoCodes[upperCode as keyof typeof promoCodes].discountPercentage
    };
  }
  
  return {
    valid: false,
    discountPercentage: 0
  };
};

// The hook
export function useIsolatedQuoteState() {
  const [state, dispatch] = useReducer(quoteReducer, initialState);
  
  // Memoized action creators
  const addTreatment = useCallback((treatment: Treatment) => {
    dispatch({ type: 'ADD_TREATMENT', treatment });
  }, []);
  
  const removeTreatment = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TREATMENT', id });
  }, []);
  
  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
  }, []);
  
  const applyPromoCode = useCallback(async (code: string) => {
    dispatch({ type: 'PROMO_CODE_REQUEST' });
    
    try {
      // Use local validation function instead of API call for now
      const result = await validatePromoCode(code);
      
      if (result.valid) {
        dispatch({ 
          type: 'PROMO_CODE_SUCCESS', 
          code, 
          discountPercent: result.discountPercentage 
        });
        return true;
      } else {
        dispatch({ type: 'PROMO_CODE_FAILURE' });
        return false;
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      dispatch({ type: 'PROMO_CODE_FAILURE' });
      return false;
    }
  }, []);
  
  const removePromoCode = useCallback(() => {
    dispatch({ type: 'REMOVE_PROMO_CODE' });
  }, []);
  
  const saveQuote = useCallback(async () => {
    dispatch({ type: 'SAVE_QUOTE_REQUEST' });
    
    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const quoteId = `quote-${Date.now()}`;
      dispatch({ type: 'SAVE_QUOTE_SUCCESS', quoteId });
      return quoteId;
    } catch (error) {
      console.error('Error saving quote:', error);
      dispatch({ type: 'SAVE_QUOTE_FAILURE' });
      return null;
    }
  }, [state]);
  
  return {
    state,
    addTreatment,
    removeTreatment,
    updateQuantity,
    applyPromoCode,
    removePromoCode,
    saveQuote
  };
}