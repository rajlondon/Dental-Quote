import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '../lib/queryClient';

// Define treatment type
export interface Treatment {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
  toothData?: any;
}

// Define patient info type
export interface PatientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate: string;
  notes?: string;
}

// Define package type
export type TreatmentPackage = {
  id: string;
  title: string;
  description: string;
  treatments: any[];
  discount: number;
  discountType: 'percentage' | 'fixed';
};

// Define special offer type
export type SpecialOffer = {
  id: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  promoCode?: string;
  applicableTreatment?: string;
};

// Available promo codes and their discounts for client-side validation
const PROMO_CODES: Record<string, { discountPercentage: number, description: string }> = {
  'SUMMER15': { discountPercentage: 15, description: 'Summer Special: 15% off' },
  'DENTAL25': { discountPercentage: 25, description: 'Dental Special: 25% off' },
  'NEWPATIENT': { discountPercentage: 20, description: 'New Patient: 20% off' },
  'TEST10': { discountPercentage: 10, description: 'Test discount: 10% off' },
  'FREECONSULT': { discountPercentage: 100, description: 'Free consultation' },
  'LUXHOTEL20': { discountPercentage: 20, description: 'Luxury hotel offer: 20% off' },
  'IMPLANTCROWN30': { discountPercentage: 30, description: 'Implant + Crown: 30% off' },
  'FREEWHITE': { discountPercentage: 100, description: 'Free Teeth Whitening with Any Treatment' }
};

// Define quote store state and interface
interface QuoteState {
  // State properties
  flowStep: 'quiz' | 'promo' | 'patient-info' | 'review'; // Flow steps instead of numeric index
  treatments: Treatment[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
  discountPercentage: number;
  patientInfo: PatientInfo | null;
  isApplyingPromo: boolean;
  promoError: string | null;
  selectedPackage: TreatmentPackage | null;
  selectedOffer: SpecialOffer | null;
  isSaving: boolean;
  
  // Actions
  setFlowStep: (step: 'quiz' | 'promo' | 'patient-info' | 'review') => void;
  addTreatment: (treatment: Treatment) => void;
  removeTreatment: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearTreatments: () => void;
  applyPromoCode: (code: string) => Promise<{success: boolean, message: string}>;
  clearPromoCode: () => void;
  updatePatientInfo: (info: Partial<PatientInfo>) => void;
  saveQuote: (quoteData: any) => Promise<boolean>;
  selectPackage: (packageData: TreatmentPackage | null) => void;
  selectOffer: (offer: SpecialOffer | null) => void;
  resetQuote: () => void;
  
  // Helper functions
  calculateSubtotal: () => number;
  calculateDiscount: () => number;
  calculateTotal: () => number;
}

// Create quote store with persistence
export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      // Initial state
      flowStep: 'quiz',
      treatments: [],
      subtotal: 0,
      discount: 0,
      total: 0, 
      promoCode: null,
      discountPercentage: 0,
      patientInfo: null,
      isApplyingPromo: false,
      promoError: null,
      selectedPackage: null,
      selectedOffer: null,
      isSaving: false,
      
      // Set the current flow step
      setFlowStep: (step) => {
        set({ flowStep: step });
      },
      
      // Add a treatment
      addTreatment: (treatment) => {
        const { treatments } = get();
        const existingTreatment = treatments.find(t => t.id === treatment.id);
        
        if (existingTreatment) {
          // Update quantity if treatment already exists
          set({
            treatments: treatments.map(t => 
              t.id === treatment.id 
                ? { ...t, quantity: t.quantity + 1 } 
                : t
            )
          });
        } else {
          // Add new treatment
          set({
            treatments: [...treatments, { ...treatment, quantity: treatment.quantity || 1 }]
          });
        }
        
        // Recalculate totals
        set((state) => ({
          subtotal: state.calculateSubtotal(),
          discount: state.calculateDiscount(),
          total: state.calculateTotal()
        }));
      },
      
      // Remove a treatment
      removeTreatment: (id) => {
        const { treatments } = get();
        
        set({ 
          treatments: treatments.filter(t => t.id !== id) 
        });
        
        // Recalculate totals
        set((state) => ({
          subtotal: state.calculateSubtotal(),
          discount: state.calculateDiscount(),
          total: state.calculateTotal()
        }));
      },
      
      // Update treatment quantity
      updateQuantity: (id, quantity) => {
        const { treatments } = get();
        
        set({
          treatments: treatments.map(t => 
            t.id === id ? { ...t, quantity } : t
          )
        });
        
        // Recalculate totals
        set((state) => ({
          subtotal: state.calculateSubtotal(),
          discount: state.calculateDiscount(),
          total: state.calculateTotal()
        }));
      },
      
      // Clear all treatments
      clearTreatments: () => {
        set({
          treatments: [],
          subtotal: 0,
          discount: 0,
          total: 0
        });
      },
      
      // Apply promo code - safely with fallback validation
      applyPromoCode: async (code) => {
        const upperCode = code.toUpperCase();
        
        // Set loading state
        set({ isApplyingPromo: true, promoError: null });
        
        try {
          // First try server validation
          try {
            const response = await apiRequest('POST', '/api/promo-codes/validate', { code: upperCode });
            const result = await response.json();
            
            if (response.ok && result.valid) {
              set(state => ({
                promoCode: upperCode,
                discountPercentage: result.discountPercentage,
                isApplyingPromo: false,
                discount: state.calculateDiscount(),
                total: state.calculateTotal()
              }));
              return { success: true, message: 'Promo code applied successfully!' };
            }
          } catch (error) {
            console.warn("Server validation failed, falling back to client validation");
          }
          
          // Client-side fallback validation
          if (PROMO_CODES[upperCode]) {
            set(state => ({
              promoCode: upperCode,
              discountPercentage: PROMO_CODES[upperCode].discountPercentage,
              isApplyingPromo: false,
              discount: state.calculateDiscount(),
              total: state.calculateTotal()
            }));
            return { success: true, message: 'Promo code applied successfully!' };
          } else {
            set({ 
              isApplyingPromo: false,
              promoError: 'Invalid promo code'
            });
            return { success: false, message: 'Invalid promo code' };
          }
        } catch (error) {
          set({ 
            isApplyingPromo: false,
            promoError: 'Error validating promo code'
          });
          return { success: false, message: 'Error validating promo code' };
        }
      },
      
      // Clear promo code
      clearPromoCode: () => {
        set(state => ({
          promoCode: null,
          discountPercentage: 0,
          promoError: null,
          discount: state.calculateDiscount(),
          total: state.calculateTotal()
        }));
      },
      
      // Update patient info
      updatePatientInfo: (info) => {
        const { patientInfo } = get();
        set({
          patientInfo: { ...patientInfo || {}, ...info } as PatientInfo
        });
      },
      
      // Save the complete quote
      saveQuote: async (quoteData) => {
        set({ isSaving: true });
        
        try {
          const response = await apiRequest('POST', '/api/quotes', quoteData);
          
          if (response.ok) {
            set({ isSaving: false });
            return true;
          } else {
            set({ isSaving: false });
            return false;
          }
        } catch (error) {
          set({ isSaving: false });
          return false;
        }
      },
      
      // Select a treatment package
      selectPackage: (packageData) => {
        if (packageData) {
          // Add package treatments and select the package
          const packageTreatments = packageData.treatments.map(treatment => ({
            ...treatment,
            description: treatment.description || `${treatment.name} (Package: ${packageData.title})`,
          }));
          
          set({
            selectedPackage: packageData,
            treatments: packageTreatments
          });
        } else {
          // Clear package selection
          set({ selectedPackage: null });
        }
        
        // Recalculate totals
        set((state) => ({
          subtotal: state.calculateSubtotal(),
          discount: state.calculateDiscount(),
          total: state.calculateTotal()
        }));
      },
      
      // Select a special offer
      selectOffer: (offer) => {
        set({ selectedOffer: offer });
        
        // Auto-apply promo code if offer includes one
        if (offer && offer.promoCode) {
          get().applyPromoCode(offer.promoCode);
        } else if (!offer) {
          get().clearPromoCode();
        }
        
        // Recalculate totals
        set((state) => ({
          subtotal: state.calculateSubtotal(),
          discount: state.calculateDiscount(),
          total: state.calculateTotal()
        }));
      },
      
      // Reset the entire quote
      resetQuote: () => {
        set({
          flowStep: 'quiz',
          treatments: [],
          subtotal: 0,
          discount: 0,
          total: 0,
          promoCode: null,
          discountPercentage: 0,
          patientInfo: null,
          promoError: null,
          selectedPackage: null,
          selectedOffer: null
        });
      },
      
      // Calculate subtotal
      calculateSubtotal: () => {
        const { treatments } = get();
        return treatments.reduce((total, treatment) => {
          return total + (treatment.price * treatment.quantity);
        }, 0);
      },
      
      // Calculate discount including promos, packages, and offers
      calculateDiscount: () => {
        const { subtotal, promoCode, discountPercentage, selectedPackage, selectedOffer } = get();
        let totalDiscount = 0;
        
        // Promo code discount
        if (promoCode && discountPercentage > 0) {
          totalDiscount += subtotal * (discountPercentage / 100);
        }
        
        // Package discount
        if (selectedPackage) {
          if (selectedPackage.discountType === 'percentage') {
            const packageTotal = selectedPackage.treatments.reduce(
              (sum, treatment) => sum + (treatment.price * (treatment.quantity || 1)), 
              0
            );
            totalDiscount += packageTotal * (selectedPackage.discount / 100);
          } else {
            totalDiscount += selectedPackage.discount;
          }
        }
        
        // Special offer discount
        if (selectedOffer) {
          if (selectedOffer.discountType === 'percentage') {
            totalDiscount += subtotal * (selectedOffer.discountValue / 100);
          } else {
            totalDiscount += selectedOffer.discountValue;
          }
        }
        
        return totalDiscount;
      },
      
      // Calculate total
      calculateTotal: () => {
        const { subtotal } = get();
        const discount = get().calculateDiscount();
        return Math.max(0, subtotal - discount);
      }
    }),
    {
      name: 'dental-quote-storage',
      // Persist all state data
      partialize: (state) => ({
        flowStep: state.flowStep,
        treatments: state.treatments,
        subtotal: state.subtotal,
        discount: state.discount, 
        total: state.total,
        promoCode: state.promoCode,
        discountPercentage: state.discountPercentage,
        patientInfo: state.patientInfo,
        selectedPackage: state.selectedPackage,
        selectedOffer: state.selectedOffer
      }),
      // Custom storage implementation with error handling
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;
            return JSON.parse(str);
          } catch (e) {
            console.error('Error retrieving quote state from localStorage:', e);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            console.error('Error storing quote state to localStorage:', e);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (e) {
            console.error('Error removing quote state from localStorage:', e);
          }
        },
      }
    }
  )
);