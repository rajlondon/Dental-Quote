import { useReducer } from 'react';

// Define Treatment type
interface Treatment {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

// Define Quote State type
interface QuoteState {
  treatments: Treatment[];
  promoCode: string | null;
  discount: number;
  total: number;
}

// Define all possible state update actions
type QuoteAction = 
  | { type: 'ADD_TREATMENT'; treatment: Treatment }
  | { type: 'REMOVE_TREATMENT'; treatmentId: string }
  | { type: 'UPDATE_QUANTITY'; treatmentId: string; quantity: number }
  | { type: 'APPLY_PROMO_CODE'; promoCode: string; discount: number }
  | { type: 'RESET_PROMO_CODE' };

// Initial state
const initialState: QuoteState = {
  treatments: [],
  promoCode: null,
  discount: 0,
  total: 0
};

// Pure reducer function (no side effects)
function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  switch (action.type) {
    case 'ADD_TREATMENT':
      return {
        ...state,
        treatments: [...state.treatments, action.treatment],
        total: calculateTotal(
          [...state.treatments, action.treatment], 
          state.discount
        )
      };
    
    case 'REMOVE_TREATMENT':
      const updatedTreatments = state.treatments.filter(
        t => t.id !== action.treatmentId
      );
      return {
        ...state,
        treatments: updatedTreatments,
        total: calculateTotal(updatedTreatments, state.discount)
      };
    
    case 'UPDATE_QUANTITY':
      const updatedWithQuantity = state.treatments.map(t => 
        t.id === action.treatmentId 
          ? { ...t, quantity: action.quantity } 
          : t
      );
      return {
        ...state,
        treatments: updatedWithQuantity,
        total: calculateTotal(updatedWithQuantity, state.discount)
      };
    
    case 'APPLY_PROMO_CODE':
      return {
        ...state,
        promoCode: action.promoCode,
        discount: action.discount,
        total: calculateTotal(state.treatments, action.discount)
      };
    
    case 'RESET_PROMO_CODE':
      return {
        ...state,
        promoCode: null,
        discount: 0,
        total: calculateTotal(state.treatments, 0)
      };
    
    default:
      return state;
  }
}

// Helper function for total calculation
function calculateTotal(treatments: Treatment[], discount: number): number {
  const subtotal = treatments.reduce(
    (sum, t) => sum + (t.price * (t.quantity || 1)), 
    0
  );
  return Math.max(0, subtotal - (subtotal * (discount / 100)));
}

// Hook to use in components
export function useQuoteReducer() {
  const [state, dispatch] = useReducer(quoteReducer, initialState);
  
  return {
    state,
    addTreatment: (treatment: Treatment) => 
      dispatch({ type: 'ADD_TREATMENT', treatment }),
    removeTreatment: (treatmentId: string) => 
      dispatch({ type: 'REMOVE_TREATMENT', treatmentId }),
    updateQuantity: (treatmentId: string, quantity: number) => 
      dispatch({ type: 'UPDATE_QUANTITY', treatmentId, quantity }),
    applyPromoCode: (promoCode: string, discount: number) => 
      dispatch({ type: 'APPLY_PROMO_CODE', promoCode, discount }),
    resetPromoCode: () => 
      dispatch({ type: 'RESET_PROMO_CODE' })
  };
}