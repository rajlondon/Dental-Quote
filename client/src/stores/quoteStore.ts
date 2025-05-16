import { create } from 'zustand';
import { persist, createJSONStorage, PersistStorage } from 'zustand/middleware';

// Treatment interface
export interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

// Patient info interface
export interface PatientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate: string;
  notes: string;
}

// Quote state interface
export interface QuoteState {
  // Treatment data
  treatments: Treatment[];
  
  // Patient info
  patientInfo: PatientInfo | null;
  
  // Pricing
  subtotal: number;
  discountPercent: number;
  total: number;
  
  // Promo code
  promoCode: string;
  
  // Special offer ID (if coming from a special offer)
  specialOfferId: string | null;
  
  // Actions for treatments
  addTreatment: (treatment: Treatment) => void;
  removeTreatment: (id: string) => void;
  updateTreatment: (id: string, treatment: Treatment) => void;
  
  // Actions for patient info
  setPatientInfo: (info: PatientInfo) => void;
  
  // Actions for promo code
  applyPromoCode: (code: string) => boolean;
  
  // Action for setting special offer ID
  setSpecialOfferId: (id: string | null) => void;
  
  // Action to reset the quote
  resetQuote: () => void;
}

// Custom storage handler to fix localStorage JSON parsing issues
const customStorage: PersistStorage<QuoteState> = {
  getItem: (name) => {
    try {
      const value = localStorage.getItem(name);
      if (!value) return null;
      return JSON.parse(value);
    } catch (error) {
      console.error("Error retrieving storage", error);
      return null;
    }
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  }
};

// Default patient info for initialization
const defaultPatientInfo: PatientInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  preferredDate: '',
  notes: ''
};

// Create the store with persistence
export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      // Initial state
      treatments: [],
      patientInfo: null,
      subtotal: 0,
      discountPercent: 0,
      total: 0,
      promoCode: '',
      specialOfferId: null,
      
      // Calculate totals
      calculateTotals: () => {
        const state = get();
        
        const calculatedSubtotal = state.treatments.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        
        const calculatedTotal = state.discountPercent > 0
          ? calculatedSubtotal * (1 - state.discountPercent / 100)
          : calculatedSubtotal;
          
        set({
          subtotal: calculatedSubtotal,
          total: calculatedTotal
        });
      },
      
      // Treatment actions
      addTreatment: (treatment) => {
        const { treatments } = get();
        
        // Check if treatment already exists
        const existingIndex = treatments.findIndex(t => t.id === treatment.id);
        
        if (existingIndex >= 0) {
          // Update existing treatment quantity
          const updated = [...treatments];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + treatment.quantity
          };
          
          set({ treatments: updated });
        } else {
          // Add new treatment
          set({ treatments: [...treatments, treatment] });
        }
        
        // Recalculate totals
        get().calculateTotals();
      },
      
      removeTreatment: (id) => {
        const { treatments } = get();
        set({ treatments: treatments.filter(t => t.id !== id) });
        
        // Recalculate totals
        get().calculateTotals();
      },
      
      updateTreatment: (id, treatment) => {
        const { treatments } = get();
        const updatedTreatments = treatments.map(t => 
          t.id === id ? treatment : t
        );
        
        set({ treatments: updatedTreatments });
        
        // Recalculate totals
        get().calculateTotals();
      },
      
      // Patient info actions
      setPatientInfo: (info) => {
        set({ patientInfo: info });
      },
      
      // Promo code actions
      applyPromoCode: (code) => {
        try {
          const formattedCode = code.trim().toUpperCase();
          
          // If empty code, clear discount
          if (!formattedCode) {
            set({ 
              promoCode: '',
              discountPercent: 0
            });
            
            // Recalculate totals
            get().calculateTotals();
            return true;
          }
          
          // Apply discount based on promo code
          // In a real app, this would validate against a server API
          const discountMap: Record<string, number> = {
            'SUMMER15': 15,
            'DENTAL25': 25,
            'NEWPATIENT': 20,
            'TEST10': 10,
            'LUXHOTEL20': 20,
            'IMPLANTCROWN30': 30,
            'FREECONSULT': 100, // Free consultation
            'FREEWHITE': 100,   // Free whitening
          };
          
          // Check if valid promo code
          if (formattedCode in discountMap) {
            set({ 
              promoCode: formattedCode,
              discountPercent: discountMap[formattedCode]
            });
            
            // Recalculate totals
            get().calculateTotals();
            return true;
          }
          
          return false;
        } catch (error) {
          console.error("Error applying promo code:", error);
          return false;
        }
      },
      
      // Special offer actions
      setSpecialOfferId: (id) => {
        set({ specialOfferId: id });
      },
      
      // Reset quote
      resetQuote: () => {
        set({
          treatments: [],
          patientInfo: null,
          subtotal: 0,
          discountPercent: 0,
          total: 0,
          promoCode: '',
          specialOfferId: null
        });
      }
    }),
    {
      name: 'dental-quote-storage',
      storage: createJSONStorage(() => customStorage),
      // Only persist select properties to avoid issues
      partialize: (state) => ({
        treatments: state.treatments,
        patientInfo: state.patientInfo,
        promoCode: state.promoCode,
        discountPercent: state.discountPercent,
        specialOfferId: state.specialOfferId
      }),
    }
  )
);