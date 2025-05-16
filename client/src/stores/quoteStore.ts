import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '../lib/queryClient';
import type { TreatmentPackage } from '../hooks/use-treatment-packages';
import type { SpecialOffer } from '../hooks/use-special-offers';

// Treatment type
export interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category?: string;
  toothData?: any;
}

// Patient info type
export interface PatientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate: string;
  notes?: string;
}

// Loading state type
export interface LoadingState {
  treatments: boolean;
  promoCode: boolean;
  saveQuote: boolean;
}

// Error state type
export interface ErrorState {
  treatments: string | null;
  promoCode: string | null;
  saveQuote: string | null;
}

// Success state type
export interface SuccessState {
  treatments: boolean;
  promoCode: boolean;
  saveQuote: boolean;
}

// Quote store state
export interface QuoteState {
  treatments: Treatment[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
  discountPercentage: number;
  patientInfo: PatientInfo | null;
  loading: LoadingState;
  error: ErrorState;
  success: SuccessState;
  currentStep: number;
  selectedPackage: TreatmentPackage | null;
  selectedOffer: SpecialOffer | null;
  addTreatment: (treatment: Treatment) => void;
  removeTreatment: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearTreatments: () => void;
  applyPromoCode: (code: string) => Promise<boolean>;
  clearPromoCode: () => void;
  updatePatientInfo: (info: Partial<PatientInfo>) => void;
  clearPatientInfo: () => void;
  setCurrentStep: (step: number) => void;
  resetQuote: () => void;
  calculateSubtotal: () => number;
  calculateDiscount: () => number;
  calculateTotal: () => number;
  saveQuote: (quoteData: any) => Promise<boolean>;
  selectPackage: (packageData: TreatmentPackage | null) => void;
  selectOffer: (offer: SpecialOffer | null) => void;
}

// Available promo codes and their discounts
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

// Create quote store
export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      // Initial state
      treatments: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      promoCode: null,
      discountPercentage: 0,
      patientInfo: null,
      loading: {
        treatments: false,
        promoCode: false,
        saveQuote: false
      },
      error: {
        treatments: null,
        promoCode: null,
        saveQuote: null
      },
      success: {
        treatments: false,
        promoCode: false,
        saveQuote: false
      },
      currentStep: 1,
      selectedPackage: null,
      selectedOffer: null,

      // Add a treatment
      addTreatment: (treatment: Treatment) => {
        const { treatments } = get();
        const existingTreatment = treatments.find(t => t.id === treatment.id);

        // If treatment already exists, increment quantity
        if (existingTreatment) {
          set({
            treatments: treatments.map(t => {
              if (t.id === treatment.id) {
                return { ...t, quantity: t.quantity + 1 };
              }
              return t;
            })
          });
        } else {
          // Otherwise add new treatment
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
      removeTreatment: (id: string) => {
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
      updateQuantity: (id: string, quantity: number) => {
        const { treatments } = get();
        set({
          treatments: treatments.map(t => {
            if (t.id === id) {
              return { ...t, quantity };
            }
            return t;
          })
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

      // Apply promo code
      applyPromoCode: async (code: string) => {
        const upperCode = code.toUpperCase();
        
        // Update loading state
        set(state => ({
          loading: { ...state.loading, promoCode: true },
          error: { ...state.error, promoCode: null }
        }));

        try {
          // In a real implementation, this would validate with an API
          // For now, we'll check against our predefined codes
          
          // First, try to get from server
          try {
            const response = await apiRequest('POST', '/api/promo-codes/validate', { code: upperCode });
            const result = await response.json();
            
            if (response.ok && result.valid) {
              set(state => ({
                promoCode: upperCode,
                discountPercentage: result.discountPercentage,
                loading: { ...state.loading, promoCode: false },
                success: { ...state.success, promoCode: true },
                discount: state.calculateDiscount(),
                total: state.calculateTotal()
              }));
              return true;
            }
          } catch (error) {
            console.warn("Could not validate promo code with API, falling back to local validation", error);
          }
          
          // Fallback to local validation if API failed
          if (PROMO_CODES[upperCode]) {
            set(state => ({
              promoCode: upperCode,
              discountPercentage: PROMO_CODES[upperCode].discountPercentage,
              loading: { ...state.loading, promoCode: false },
              success: { ...state.success, promoCode: true },
              discount: state.calculateDiscount(),
              total: state.calculateTotal()
            }));
            return true;
          } else {
            set(state => ({
              loading: { ...state.loading, promoCode: false },
              error: { ...state.error, promoCode: 'Invalid promo code' }
            }));
            return false;
          }
        } catch (error) {
          set(state => ({
            loading: { ...state.loading, promoCode: false },
            error: { ...state.error, promoCode: 'Error validating promo code' }
          }));
          return false;
        }
      },

      // Clear promo code
      clearPromoCode: () => {
        set(state => ({
          promoCode: null,
          discountPercentage: 0,
          discount: state.calculateDiscount(),
          total: state.calculateTotal()
        }));
      },

      // Update patient info
      updatePatientInfo: (info: Partial<PatientInfo>) => {
        const { patientInfo } = get();
        set({
          patientInfo: { ...patientInfo || {}, ...info } as PatientInfo
        });
      },

      // Clear patient info
      clearPatientInfo: () => {
        set({
          patientInfo: null
        });
      },

      // Set current step
      setCurrentStep: (step: number) => {
        set({
          currentStep: step
        });
      },

      // Reset quote
      resetQuote: () => {
        set({
          treatments: [],
          subtotal: 0,
          discount: 0,
          total: 0,
          promoCode: null,
          discountPercentage: 0,
          patientInfo: null,
          currentStep: 1,
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

      // Calculate discount
      calculateDiscount: () => {
        const { subtotal, promoCode, discountPercentage, selectedPackage, selectedOffer } = get();
        let totalDiscount = 0;
        
        // Promo code discount
        if (promoCode && discountPercentage > 0) {
          totalDiscount += subtotal * (discountPercentage / 100);
        }
        
        // Package savings
        if (selectedPackage) {
          if (selectedPackage.discountType === 'percentage') {
            // Calculate total price of all treatments in the package
            const packageTotal = selectedPackage.treatments.reduce(
              (sum, treatment) => sum + (treatment.price * (treatment.quantity || 1)), 
              0
            );
            totalDiscount += packageTotal * (selectedPackage.discount / 100);
          } else {
            // Fixed discount
            totalDiscount += selectedPackage.discount;
          }
        }
        
        // Special offer discount
        if (selectedOffer) {
          if (selectedOffer.discountType === 'percentage') {
            totalDiscount += subtotal * (selectedOffer.discountValue / 100);
          } else {
            // Fixed discount
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
      },

      // Save quote
      saveQuote: async (quoteData: any) => {
        set(state => ({
          loading: { ...state.loading, saveQuote: true },
          error: { ...state.error, saveQuote: null }
        }));

        try {
          // In a real implementation, this would save to an API
          const response = await apiRequest('POST', '/api/quotes', quoteData);
          
          if (response.ok) {
            set(state => ({
              loading: { ...state.loading, saveQuote: false },
              success: { ...state.success, saveQuote: true }
            }));
            return true;
          } else {
            set(state => ({
              loading: { ...state.loading, saveQuote: false },
              error: { ...state.error, saveQuote: 'Failed to save quote' }
            }));
            return false;
          }
        } catch (error) {
          set(state => ({
            loading: { ...state.loading, saveQuote: false },
            error: { ...state.error, saveQuote: 'Error saving quote' }
          }));
          return false;
        }
      },

      // Select a treatment package
      selectPackage: (packageData: TreatmentPackage | null) => {
        set(state => {
          // Clear previous selected package
          const newState: Partial<QuoteState> = { selectedPackage: null };
          
          // If a package is selected, add its treatments
          if (packageData) {
            // Add the package
            newState.selectedPackage = packageData;
            
            // Clear any existing treatments and add package treatments
            newState.treatments = packageData.treatments.map(treatment => ({
              ...treatment,
              description: treatment.description || `${treatment.name} (Package: ${packageData.name})`,
            }));
          }
          
          return newState;
        });
        
        // Recalculate totals
        set((state) => ({
          subtotal: state.calculateSubtotal(),
          discount: state.calculateDiscount(),
          total: state.calculateTotal()
        }));
      },

      // Select a special offer
      selectOffer: (offer: SpecialOffer | null) => {
        set({ selectedOffer: offer });
        
        // If there's a promo code in the offer, apply it
        if (offer && offer.promoCode) {
          get().applyPromoCode(offer.promoCode);
        } else if (!offer) {
          // Clear promo code if offer is deselected
          get().clearPromoCode();
        }
        
        // Recalculate totals
        set((state) => ({
          subtotal: state.calculateSubtotal(),
          discount: state.calculateDiscount(),
          total: state.calculateTotal()
        }));
      }
    }),
    {
      name: 'dental-quote-storage',
      // Only persist essential data
      partialize: (state) => ({
        treatments: state.treatments,
        promoCode: state.promoCode,
        discountPercentage: state.discountPercentage,
        patientInfo: state.patientInfo,
        currentStep: state.currentStep,
        selectedPackage: state.selectedPackage,
        selectedOffer: state.selectedOffer
      })
    }
  )
);