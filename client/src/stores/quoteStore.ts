import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define types for our store
export interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category?: string;
  toothData?: any; // For dental chart integration
}

export interface PatientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate: string;
  notes: string;
}

export interface TreatmentPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  treatments: Treatment[];
}

export interface SpecialOffer {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  applicableTreatments: string[];
  promoCode: string;
  terms: string;
  bannerImage?: string;
}

interface LoadingState {
  saveQuote: boolean;
  promoCode: boolean;
  treatments: boolean;
}

interface ErrorState {
  saveQuote: string | null;
  promoCode: string | null;
  treatments: string | null;
}

export interface QuoteState {
  // Data states
  treatments: Treatment[];
  patientInfo: PatientInfo | null;
  promoCode: string | null;
  discountPercentage: number;
  subtotal: number;
  discount: number;
  total: number;
  specialOfferId: string | null;
  selectedPackage: TreatmentPackage | null;
  selectedOffer: SpecialOffer | null;
  currentStep: number;
  
  // UI states
  loading: LoadingState;
  error: ErrorState;
  success: {
    saveQuote: boolean;
  };
  
  // Actions
  addTreatment: (treatment: Treatment) => void;
  removeTreatment: (id: string) => void;
  updateTreatmentQuantity: (id: string, quantity: number) => void;
  updateQuantity: (id: string, quantity: number) => void; // Alias for compatibility
  setPatientInfo: (info: PatientInfo) => void;
  updatePatientInfo: (info: PatientInfo) => void; // Alias for compatibility
  applyPromoCode: (code: string, percentage?: number) => void;
  clearPromoCode: () => void;
  removePromoCode: () => void; // Alias for compatibility
  setSpecialOfferId: (id: string | null) => void;
  selectPackage: (pkg: TreatmentPackage | null) => void;
  selectOffer: (offer: SpecialOffer | null) => void;
  setCurrentStep: (step: number) => void;
  saveQuote: (quoteData?: any) => Promise<boolean>;
  resetQuote: () => void;
}

// Helper function to calculate totals
const calculateTotals = (
  treatments: Treatment[], 
  discountPercentage: number, 
  packageDiscount: number = 0, 
  offerDiscount: number = 0
) => {
  const subtotal = treatments.reduce((sum, treatment) => {
    return sum + (treatment.price * treatment.quantity);
  }, 0);
  
  const promoDiscount = subtotal * (discountPercentage / 100);
  const totalDiscount = promoDiscount + packageDiscount + offerDiscount;
  const total = Math.max(0, subtotal - totalDiscount);
  
  return { subtotal, discount: totalDiscount, total };
};

// Calculate package savings
const calculatePackageSavings = (pkg: TreatmentPackage | null): number => {
  if (!pkg) return 0;
  return pkg.originalPrice - pkg.price;
};

// Calculate offer discount
const calculateOfferDiscount = (
  offer: SpecialOffer | null, 
  treatments: Treatment[]
): number => {
  if (!offer) return 0;
  
  // Filter treatments that are applicable to the offer
  const applicableTreatments = treatments.filter(
    treatment => treatment.category && offer.applicableTreatments.includes(treatment.category)
  );
  
  // Calculate the value of applicable treatments
  const applicableValue = applicableTreatments.reduce(
    (sum, treatment) => sum + (treatment.price * treatment.quantity), 
    0
  );
  
  // Calculate discount based on type
  if (offer.discountType === 'percentage') {
    return applicableValue * (offer.discountValue / 100);
  } else {
    // Fixed amount discount
    return Math.min(applicableValue, offer.discountValue);
  }
};

// Mock API call for promo code validation - in production this would call the backend
const validatePromoCode = async (code: string): Promise<{ valid: boolean; percentage: number }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Pre-defined promo codes for testing
  const validCodes: Record<string, number> = {
    'SUMMER15': 15,
    'DENTAL25': 25,
    'NEWPATIENT': 20,
    'TEST10': 10,
    'FREECONSULT': 100,  // 100% off consultation
    'LUXHOTEL20': 20,
    'IMPLANTCROWN30': 30,
    'FREEWHITE': 100     // 100% off whitening
  };
  
  const upperCode = code.toUpperCase();
  if (validCodes[upperCode]) {
    return { valid: true, percentage: validCodes[upperCode] };
  }
  
  return { valid: false, percentage: 0 };
};

// Mock API call for saving a quote - in production this would call the backend
const saveQuoteToServer = async (quoteData: any): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success (95% of the time)
  return Math.random() > 0.05;
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
      discount: 0,
      total: 0,
      specialOfferId: null,
      selectedPackage: null,
      selectedOffer: null,
      currentStep: 1,
      
      // UI states
      loading: {
        saveQuote: false,
        promoCode: false,
        treatments: false
      },
      error: {
        saveQuote: null,
        promoCode: null,
        treatments: null
      },
      success: {
        saveQuote: false
      },
      
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
        
        // Calculate discounts and totals
        const { selectedPackage, selectedOffer, discountPercentage } = get();
        const packageSavings = calculatePackageSavings(selectedPackage);
        const offerDiscount = calculateOfferDiscount(selectedOffer, treatments);
        
        const { subtotal, discount, total } = calculateTotals(
          treatments, 
          discountPercentage, 
          packageSavings, 
          offerDiscount
        );
        
        set({
          treatments,
          subtotal,
          discount,
          total
        });
      },
      
      removeTreatment: (id) => {
        const treatments = get().treatments.filter(t => t.id !== id);
        
        // Calculate discounts and totals
        const { selectedPackage, selectedOffer, discountPercentage } = get();
        const packageSavings = calculatePackageSavings(selectedPackage);
        const offerDiscount = calculateOfferDiscount(selectedOffer, treatments);
        
        const { subtotal, discount, total } = calculateTotals(
          treatments, 
          discountPercentage, 
          packageSavings, 
          offerDiscount
        );
        
        set({
          treatments,
          subtotal,
          discount,
          total
        });
      },
      
      updateTreatmentQuantity: (id, quantity) => {
        const treatments = get().treatments.map(treatment => 
          treatment.id === id ? { ...treatment, quantity } : treatment
        );
        
        // Calculate discounts and totals
        const { selectedPackage, selectedOffer, discountPercentage } = get();
        const packageSavings = calculatePackageSavings(selectedPackage);
        const offerDiscount = calculateOfferDiscount(selectedOffer, treatments);
        
        const { subtotal, discount, total } = calculateTotals(
          treatments, 
          discountPercentage, 
          packageSavings, 
          offerDiscount
        );
        
        set({
          treatments,
          subtotal,
          discount,
          total
        });
      },
      
      // Alias for compatibility
      updateQuantity: (id, quantity) => {
        get().updateTreatmentQuantity(id, quantity);
      },
      
      setPatientInfo: (info) => {
        set({ patientInfo: info });
      },
      
      // Alias for compatibility
      updatePatientInfo: (info) => {
        get().setPatientInfo(info);
      },
      
      applyPromoCode: async (code, percentage) => {
        const upperCode = code.toUpperCase();
        
        set(state => ({
          loading: { ...state.loading, promoCode: true },
          error: { ...state.error, promoCode: null }
        }));
        
        try {
          // If percentage is provided, use it directly (for testing)
          if (percentage !== undefined) {
            // Apply directly
            const { treatments, selectedPackage, selectedOffer } = get();
            const packageSavings = calculatePackageSavings(selectedPackage);
            const offerDiscount = calculateOfferDiscount(selectedOffer, treatments);
            
            const { subtotal, discount, total } = calculateTotals(
              treatments, 
              percentage, 
              packageSavings, 
              offerDiscount
            );
            
            set({
              promoCode: upperCode,
              discountPercentage: percentage,
              discount,
              total,
              loading: { ...get().loading, promoCode: false }
            });
            
            return;
          }
          
          // Otherwise validate the code first
          const result = await validatePromoCode(upperCode);
          
          if (result.valid) {
            // Calculate new totals with the promo discount
            const { treatments, selectedPackage, selectedOffer } = get();
            const packageSavings = calculatePackageSavings(selectedPackage);
            const offerDiscount = calculateOfferDiscount(selectedOffer, treatments);
            
            const { subtotal, discount, total } = calculateTotals(
              treatments, 
              result.percentage, 
              packageSavings, 
              offerDiscount
            );
            
            set({
              promoCode: upperCode,
              discountPercentage: result.percentage,
              discount,
              total,
              loading: { ...get().loading, promoCode: false }
            });
          } else {
            set({
              loading: { ...get().loading, promoCode: false },
              error: { ...get().error, promoCode: 'Invalid promo code' }
            });
          }
        } catch (error) {
          set({
            loading: { ...get().loading, promoCode: false },
            error: { ...get().error, promoCode: 'Error applying promo code' }
          });
        }
      },
      
      clearPromoCode: () => {
        // Recalculate totals without promo discount
        const { treatments, selectedPackage, selectedOffer } = get();
        const packageSavings = calculatePackageSavings(selectedPackage);
        const offerDiscount = calculateOfferDiscount(selectedOffer, treatments);
        
        const { subtotal, discount, total } = calculateTotals(
          treatments, 
          0, 
          packageSavings, 
          offerDiscount
        );
        
        set({
          promoCode: null,
          discountPercentage: 0,
          discount,
          total
        });
      },
      
      // Alias for compatibility
      removePromoCode: () => {
        get().clearPromoCode();
      },
      
      setSpecialOfferId: (id) => {
        set({ specialOfferId: id });
      },
      
      selectPackage: (pkg) => {
        // When selecting a package, update the treatments based on the package
        if (pkg) {
          // Replace treatments with package treatments
          const { discountPercentage, selectedOffer } = get();
          const packageSavings = calculatePackageSavings(pkg);
          const offerDiscount = calculateOfferDiscount(selectedOffer, pkg.treatments);
          
          const { subtotal, discount, total } = calculateTotals(
            pkg.treatments, 
            discountPercentage, 
            packageSavings, 
            offerDiscount
          );
          
          set({
            selectedPackage: pkg,
            treatments: [...pkg.treatments],
            subtotal,
            discount,
            total
          });
        } else {
          // Clear package selection
          set({ selectedPackage: null });
        }
      },
      
      selectOffer: (offer) => {
        // When selecting an offer, recalculate the discount
        const { treatments, selectedPackage, discountPercentage } = get();
        const packageSavings = calculatePackageSavings(selectedPackage);
        const offerDiscount = calculateOfferDiscount(offer, treatments);
        
        const { subtotal, discount, total } = calculateTotals(
          treatments, 
          discountPercentage, 
          packageSavings, 
          offerDiscount
        );
        
        set({
          selectedOffer: offer,
          discount,
          total
        });
      },
      
      setCurrentStep: (step) => {
        set({ currentStep: step });
      },
      
      saveQuote: async (quoteData) => {
        set(state => ({
          loading: { ...state.loading, saveQuote: true },
          error: { ...state.error, saveQuote: null },
          success: { ...state.success, saveQuote: false }
        }));
        
        try {
          // Prepare data to save
          const data = quoteData || {
            treatments: get().treatments,
            patientInfo: get().patientInfo,
            promoCode: get().promoCode,
            discountPercentage: get().discountPercentage,
            subtotal: get().subtotal,
            discount: get().discount,
            total: get().total,
            specialOffer: get().selectedOffer,
            package: get().selectedPackage
          };
          
          // Call API to save quote
          const success = await saveQuoteToServer(data);
          
          if (success) {
            set({
              loading: { ...get().loading, saveQuote: false },
              success: { ...get().success, saveQuote: true }
            });
            return true;
          } else {
            set({
              loading: { ...get().loading, saveQuote: false },
              error: { ...get().error, saveQuote: 'Failed to save quote' }
            });
            return false;
          }
        } catch (error) {
          set({
            loading: { ...get().loading, saveQuote: false },
            error: { ...get().error, saveQuote: 'Error saving quote' }
          });
          return false;
        }
      },
      
      resetQuote: () => {
        set({
          treatments: [],
          patientInfo: null,
          promoCode: null,
          discountPercentage: 0,
          subtotal: 0,
          discount: 0,
          total: 0,
          specialOfferId: null,
          selectedPackage: null,
          selectedOffer: null,
          currentStep: 1,
          loading: {
            saveQuote: false,
            promoCode: false,
            treatments: false
          },
          error: {
            saveQuote: null,
            promoCode: null,
            treatments: null
          },
          success: {
            saveQuote: false
          }
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
          const { 
            treatments, 
            discountPercentage, 
            selectedPackage, 
            selectedOffer 
          } = state;
          
          const packageSavings = calculatePackageSavings(selectedPackage);
          const offerDiscount = calculateOfferDiscount(selectedOffer, treatments);
          
          const { subtotal, discount, total } = calculateTotals(
            treatments, 
            discountPercentage, 
            packageSavings, 
            offerDiscount
          );
          
          state.subtotal = subtotal;
          state.discount = discount;
          state.total = total;
        }
      }
    }
  )
);