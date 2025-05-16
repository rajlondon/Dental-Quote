import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  isValidatingPromo: boolean;
  isCompleting: boolean;
  
  // Actions
  addTreatment: (treatment: Treatment) => void;
  removeTreatment: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;
  completeQuote: () => Promise<string | null>;
  resetQuote: () => void;
}

// Mock promo code validation
const validatePromoCode = async (code: string): Promise<{ 
  valid: boolean; 
  discountPercent: number 
}> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const validCodes: Record<string, number> = {
    'SUMMER15': 15,
    'DENTAL25': 25,
    'NEWPATIENT': 10,
    'TEST10': 10,
  };
  
  const upperCode = code.toUpperCase();
  
  if (upperCode in validCodes) {
    return {
      valid: true,
      discountPercent: validCodes[upperCode]
    };
  }
  
  return {
    valid: false,
    discountPercent: 0
  };
};

// Create the store with persistence
export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      // Initial state
      treatments: [],
      promoCode: null,
      discountPercent: 0,
      isValidatingPromo: false,
      isCompleting: false,
      
      // Actions that modify state
      addTreatment: (treatment) => {
        const { treatments } = get();
        const existingIndex = treatments.findIndex(t => t.id === treatment.id);
        
        if (existingIndex >= 0) {
          // If treatment exists, update quantity
          const updatedTreatments = [...treatments];
          updatedTreatments[existingIndex] = {
            ...updatedTreatments[existingIndex],
            quantity: updatedTreatments[existingIndex].quantity + 1
          };
          
          set({ treatments: updatedTreatments });
        } else {
          // Add new treatment
          set({ treatments: [...treatments, { ...treatment, quantity: 1 }] });
        }
        
        console.log('ZUSTAND: Added treatment', treatment.name);
      },
      
      removeTreatment: (id) => {
        const { treatments } = get();
        set({ treatments: treatments.filter(t => t.id !== id) });
        console.log('ZUSTAND: Removed treatment', id);
      },
      
      updateQuantity: (id, quantity) => {
        const { treatments } = get();
        const updatedTreatments = treatments.map(t => 
          t.id === id ? { ...t, quantity } : t
        );
        
        set({ treatments: updatedTreatments });
        console.log('ZUSTAND: Updated quantity', id, quantity);
      },
      
      applyPromoCode: async (code) => {
        console.log('ZUSTAND: Validating promo code', code);
        set({ isValidatingPromo: true });
        
        try {
          const result = await validatePromoCode(code);
          
          if (result.valid) {
            set({ 
              promoCode: code.toUpperCase(), 
              discountPercent: result.discountPercent,
              isValidatingPromo: false
            });
            console.log('ZUSTAND: Applied promo code', code, result.discountPercent);
            return true;
          } else {
            set({ isValidatingPromo: false });
            console.log('ZUSTAND: Invalid promo code', code);
            return false;
          }
        } catch (error) {
          console.error('ZUSTAND: Error validating promo code', error);
          set({ isValidatingPromo: false });
          return false;
        }
      },
      
      removePromoCode: () => {
        set({ promoCode: null, discountPercent: 0 });
        console.log('ZUSTAND: Removed promo code');
      },
      
      completeQuote: async () => {
        console.log('ZUSTAND: Completing quote');
        set({ isCompleting: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const quoteId = `quote-${Date.now()}`;
          set({ isCompleting: false });
          
          console.log('ZUSTAND: Quote completed', quoteId);
          return quoteId;
        } catch (error) {
          console.error('ZUSTAND: Error completing quote', error);
          set({ isCompleting: false });
          return null;
        }
      },
      
      resetQuote: () => {
        set({ 
          treatments: [], 
          promoCode: null, 
          discountPercent: 0,
          isValidatingPromo: false,
          isCompleting: false
        });
        console.log('ZUSTAND: Reset quote');
      }
    }),
    {
      name: 'dental-quote-storage', // unique name for localStorage
      
      // Optionally filter out what gets persisted
      partialize: (state) => ({
        treatments: state.treatments,
        promoCode: state.promoCode,
        discountPercent: state.discountPercent
      })
    }
  )
);

// Helper functions for external use
export const calculateSubtotal = (treatments: Treatment[]): number => {
  return treatments.reduce((sum, t) => sum + (t.price * t.quantity), 0);
};

export const calculateDiscount = (subtotal: number, discountPercent: number): number => {
  return subtotal * (discountPercent / 100);
};

export const calculateTotal = (treatments: Treatment[], discountPercent: number): number => {
  const subtotal = calculateSubtotal(treatments);
  return subtotal - calculateDiscount(subtotal, discountPercent);
};