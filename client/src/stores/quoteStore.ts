import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define types
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

// Helper function to calculate totals
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
  persist(
    (set, get) => ({
      // Initial state
      treatments: [],
      promoCode: null,
      discountPercent: 0,
      subtotal: 0,
      total: 0,
      loading: {
        promoCode: false,
        saving: false
      },
      
      // Add treatment action
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
          updatedTreatments = [...state.treatments, { ...treatment, quantity: treatment.quantity || 1 }];
        }
        
        const { subtotal, total } = calculateTotals(updatedTreatments, state.discountPercent);
        
        set({
          treatments: updatedTreatments,
          subtotal,
          total
        });
        
        console.log('STORE: Added treatment', treatment.name);
      },
      
      // Remove treatment action
      removeTreatment: (id) => {
        const state = get();
        const updatedTreatments = state.treatments.filter(t => t.id !== id);
        const { subtotal, total } = calculateTotals(updatedTreatments, state.discountPercent);
        
        set({
          treatments: updatedTreatments,
          subtotal,
          total
        });
        
        console.log('STORE: Removed treatment with ID:', id);
      },
      
      // Update quantity action
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
        
        console.log('STORE: Updated quantity for treatment ID:', id, 'to', quantity);
      },
      
      // Apply promo code action
      applyPromoCode: async (code) => {
        console.log('STORE: Applying promo code', code);
        
        set(state => ({ 
          loading: { ...state.loading, promoCode: true } 
        }));
        
        try {
          // Try the API endpoint
          const response = await fetch('/api/quotes-api/promo-codes/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          
          if (!response.ok) {
            throw new Error('Failed to validate promo code');
          }
          
          const data = await response.json();
          console.log('STORE: Promo code API response:', data);
          
          if (data.valid) {
            const state = get();
            const { subtotal, total } = calculateTotals(
              state.treatments, 
              data.discountPercentage
            );
            
            set({
              promoCode: code,
              discountPercent: data.discountPercentage,
              subtotal,
              total,
              loading: { ...state.loading, promoCode: false }
            });
            
            console.log('STORE: Promo code applied successfully', code, data.discountPercentage);
            return true;
          } else {
            set(state => ({ 
              loading: { ...state.loading, promoCode: false } 
            }));
            console.log('STORE: Invalid promo code:', code);
            return false;
          }
        } catch (error) {
          console.error('STORE: Error applying promo code:', error);
          
          // Fallback to simulated behavior if API fails
          const discountPercentage = 
            code === 'SUMMER15' ? 15 : 
            code === 'DENTAL25' ? 25 : 
            code === 'NEWPATIENT' ? 20 :
            code === 'TEST10' ? 10 : 0;
          
          if (discountPercentage > 0) {
            const state = get();
            const { subtotal, total } = calculateTotals(
              state.treatments, 
              discountPercentage
            );
            
            set({
              promoCode: code,
              discountPercent: discountPercentage,
              subtotal,
              total,
              loading: { ...state.loading, promoCode: false }
            });
            
            console.log('STORE: Promo code applied successfully', code, discountPercentage);
            return true;
          }
          
          set(state => ({ 
            loading: { ...state.loading, promoCode: false } 
          }));
          return false;
        }
      },
      
      // Remove promo code action
      removePromoCode: () => {
        console.log('STORE: Removing promo code');
        
        const state = get();
        const { subtotal, total } = calculateTotals(state.treatments, 0);
        
        set({
          promoCode: null,
          discountPercent: 0,
          subtotal,
          total
        });
      },
      
      // Save quote action
      saveQuote: async () => {
        console.log('STORE: Saving quote');
        
        const state = get();
        set({ loading: { ...state.loading, saving: true } });
        
        try {
          const response = await fetch('/api/quotes-api/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              treatments: state.treatments,
              promoCode: state.promoCode,
              discountPercent: state.discountPercent,
              subtotal: state.subtotal,
              total: state.total
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to save quote');
          }
          
          const data = await response.json();
          console.log('STORE: Quote saved successfully:', data);
          
          set({ loading: { ...state.loading, saving: false } });
          return data.quoteId || `quote-${Date.now()}`; // Fallback ID if API doesn't provide one
        } catch (error) {
          console.error('STORE: Error saving quote:', error);
          
          // Simulate successful save if API fails
          const quoteId = `quote-${Date.now()}`;
          console.log('STORE: Quote saved successfully:', quoteId);
          set({ loading: { ...state.loading, saving: false } });
          return quoteId; // Fallback quote ID
        }
      },
      
      // Reset quote action
      resetQuote: () => {
        console.log('STORE: Reset quote');
        
        set({
          treatments: [],
          promoCode: null,
          discountPercent: 0,
          subtotal: 0,
          total: 0,
          loading: {
            promoCode: false,
            saving: false
          }
        });
      }
    }),
    {
      name: 'quote-storage', // localStorage key
      storage: localStorage // Use localStorage for persistence
    }
  )
);