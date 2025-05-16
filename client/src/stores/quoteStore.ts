import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define types for our store
export interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface PatientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate: string;
  notes: string;
}

export interface QuoteState {
  treatments: Treatment[];
  patientInfo: PatientInfo | null;
  promoCode: string | null;
  discountPercentage: number;
  subtotal: number;
  total: number;
  specialOfferId: string | null;
  
  // Actions
  addTreatment: (treatment: Treatment) => void;
  removeTreatment: (id: string) => void;
  updateTreatmentQuantity: (id: string, quantity: number) => void;
  setPatientInfo: (info: PatientInfo) => void;
  applyPromoCode: (code: string, percentage: number) => void;
  clearPromoCode: () => void;
  setSpecialOfferId: (id: string | null) => void;
  resetQuote: () => void;
}

// Helper function to calculate totals
const calculateTotals = (treatments: Treatment[], discountPercentage: number) => {
  const subtotal = treatments.reduce((sum, treatment) => {
    return sum + (treatment.price * treatment.quantity);
  }, 0);
  
  const discount = subtotal * (discountPercentage / 100);
  const total = Math.max(0, subtotal - discount);
  
  return { subtotal, total };
};

// Create the store with persistence
export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      // Initial state
      treatments: [],
      patientInfo: null,
      promoCode: null,
      discountPercentage: 0,
      subtotal: 0,
      total: 0,
      specialOfferId: null,
      
      // Actions
      addTreatment: (treatment) => {
        const treatments = [...get().treatments];
        const existingIndex = treatments.findIndex(t => t.id === treatment.id);
        
        if (existingIndex >= 0) {
          // Update quantity if treatment already exists
          treatments[existingIndex].quantity += treatment.quantity;
        } else {
          // Add new treatment
          treatments.push(treatment);
        }
        
        const { subtotal, total } = calculateTotals(treatments, get().discountPercentage);
        
        set({
          treatments,
          subtotal,
          total
        });
      },
      
      removeTreatment: (id) => {
        const treatments = get().treatments.filter(t => t.id !== id);
        const { subtotal, total } = calculateTotals(treatments, get().discountPercentage);
        
        set({
          treatments,
          subtotal,
          total
        });
      },
      
      updateTreatmentQuantity: (id, quantity) => {
        const treatments = get().treatments.map(treatment => 
          treatment.id === id ? { ...treatment, quantity } : treatment
        );
        
        const { subtotal, total } = calculateTotals(treatments, get().discountPercentage);
        
        set({
          treatments,
          subtotal,
          total
        });
      },
      
      setPatientInfo: (info) => {
        set({ patientInfo: info });
      },
      
      applyPromoCode: (code, percentage) => {
        const { subtotal } = get();
        const total = subtotal * (1 - percentage / 100);
        
        set({
          promoCode: code,
          discountPercentage: percentage,
          total
        });
      },
      
      clearPromoCode: () => {
        const { subtotal } = get();
        
        set({
          promoCode: null,
          discountPercentage: 0,
          total: subtotal
        });
      },
      
      setSpecialOfferId: (id) => {
        set({ specialOfferId: id });
      },
      
      resetQuote: () => {
        set({
          treatments: [],
          patientInfo: null,
          promoCode: null,
          discountPercentage: 0,
          subtotal: 0,
          total: 0,
          specialOfferId: null
        });
      }
    }),
    {
      name: 'dental-quote-storage', // name of the item in local storage
      // Optional configuration to handle storage issues
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Quote state hydrated from storage');
          
          // Recalculate totals after rehydration to ensure consistency
          const { treatments, discountPercentage } = state;
          const { subtotal, total } = calculateTotals(treatments, discountPercentage);
          
          state.subtotal = subtotal;
          state.total = total;
        }
      }
    }
  )
);