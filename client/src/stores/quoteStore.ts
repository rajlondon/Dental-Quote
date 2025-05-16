import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define interfaces
interface Treatment {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface QuoteState {
  treatments: Treatment[];
  promoCode: string | null;
  discountPercent: number;
  subtotal: number;
  total: number;
  loading: {
    treatments: boolean;
    promoCode: boolean;
    saving: boolean;
  };
  
  // Actions
  addTreatment: (treatment: Treatment) => void;
  removeTreatment: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;
  saveQuote: () => Promise<string | null>;
  resetQuote: () => void;
}

// Calculate totals helper
const calculateTotals = (treatments: Treatment[], discountPercent: number) => {
  const subtotal = treatments.reduce(
    (sum, t) => sum + (t.price * (t.quantity || 1)), 
    0
  );
  const total = subtotal * (1 - (discountPercent / 100));
  return { subtotal, total };
};

// Create the store with persistence
export const useQuoteStore = create<QuoteState>()(
  persist<QuoteState>(
    (set, get) => ({
      // Initial state
      treatments: [],
      promoCode: null,
      discountPercent: 0,
      subtotal: 0,
      total: 0,
      loading: {
        treatments: false,
        promoCode: false,
        saving: false
      },
      
      // Actions
      addTreatment: (treatment) => {
        const state = get();
        const existingTreatment = state.treatments.find(t => t.id === treatment.id);
        
        let updatedTreatments;
        if (existingTreatment) {
          // Increase quantity if treatment already exists
          updatedTreatments = state.treatments.map(t => 
            t.id === treatment.id 
              ? { ...t, quantity: (t.quantity || 1) + 1 } 
              : t
          );
        } else {
          // Add new treatment with quantity 1
          updatedTreatments = [...state.treatments, { ...treatment, quantity: 1 }];
        }
        
        const { subtotal, total } = calculateTotals(updatedTreatments, state.discountPercent);
        
        set({
          treatments: updatedTreatments,
          subtotal,
          total
        });
        
        console.log('STORE: Added treatment', treatment.name);
      },
      
      removeTreatment: (id) => {
        const state = get();
        const updatedTreatments = state.treatments.filter(t => t.id !== id);
        const { subtotal, total } = calculateTotals(updatedTreatments, state.discountPercent);
        
        set({
          treatments: updatedTreatments,
          subtotal,
          total
        });
        
        console.log('STORE: Removed treatment', id);
      },
      
      updateQuantity: (id, quantity) => {
        const state = get();
        const updatedTreatments = state.treatments.map(t => 
          t.id === id ? { ...t, quantity } : t
        );
        const { subtotal, total } = calculateTotals(updatedTreatments, state.discountPercent);
        
        set({
          treatments: updatedTreatments,
          subtotal,
          total
        });
        
        console.log('STORE: Updated quantity', id, quantity);
      },
      
      applyPromoCode: async (code) => {
        console.log('STORE: Applying promo code', code);
        set(state => ({ 
          loading: { ...state.loading, promoCode: true } 
        }));
        
        try {
          // For now, use mock validation since we're just testing state persistence
          // In production, this would call the API endpoints
          const validPromoCodes: Record<string, number> = {
            'SUMMER15': 15,
            'DENTAL25': 25,
            'NEWPATIENT': 10,
            'TEST10': 10,
          };
          
          // Wait a moment to simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const upperCode = code.toUpperCase();
          
          if (upperCode in validPromoCodes) {
            const state = get();
            const discountPercent = validPromoCodes[upperCode];
            const { subtotal, total } = calculateTotals(
              state.treatments, 
              discountPercent
            );
            
            set({
              promoCode: upperCode,
              discountPercent,
              subtotal,
              total,
              loading: { ...state.loading, promoCode: false }
            });
            
            console.log('STORE: Promo code applied successfully', upperCode, discountPercent);
            return true;
          } else {
            set(state => ({ 
              loading: { ...state.loading, promoCode: false } 
            }));
            console.log('STORE: Invalid promo code', code);
            return false;
          }
        } catch (error) {
          console.error('STORE: Error applying promo code:', error);
          set(state => ({ 
            loading: { ...state.loading, promoCode: false } 
          }));
          return false;
        }
      },
      
      removePromoCode: () => {
        const state = get();
        const { subtotal, total } = calculateTotals(state.treatments, 0);
        
        set({
          promoCode: null,
          discountPercent: 0,
          subtotal,
          total
        });
        
        console.log('STORE: Removed promo code');
      },
      
      saveQuote: async () => {
        const state = get();
        console.log('STORE: Saving quote', state);
        set({ loading: { ...state.loading, saving: true } });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const quoteId = `quote-${Date.now()}`;
          set({ loading: { ...state.loading, saving: false } });
          
          console.log('STORE: Quote saved successfully', quoteId);
          return quoteId;
        } catch (error) {
          console.error('STORE: Error saving quote:', error);
          set({ loading: { ...state.loading, saving: false } });
          
          return null;
        }
      },
      
      resetQuote: () => {
        set({
          treatments: [],
          promoCode: null,
          discountPercent: 0,
          subtotal: 0,
          total: 0,
          loading: {
            treatments: false,
            promoCode: false,
            saving: false
          }
        });
        
        console.log('STORE: Reset quote');
      }
    }),
    {
      name: 'dental-quote-storage', // localStorage key
      // @ts-ignore - Zustand types are incompatible with actual behavior
      storage: localStorage // Use localStorage for persistence
    }
  )
);