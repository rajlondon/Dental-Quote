import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useRobustQuoteStore = create(
  persist(
    (set, get) => ({
      // Core state
      currentStep: 'quiz', // 'quiz', 'promo', 'patient-info', 'review'
      selectedTreatments: [],
      promoCode: '',
      discount: 0,
      patientInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        preferredDate: '',
        notes: ''
      },
      
      // UI state
      isLoading: false,
      error: null,
      
      // Actions with thorough error handling
      setStep: (step) => {
        console.log(`Setting step to: ${step}`);
        // Save current state to localStorage before changing step
        localStorage.setItem('quote-step-backup', JSON.stringify({
          step: get().currentStep,
          treatments: get().selectedTreatments,
          promo: get().promoCode,
          discount: get().discount
        }));
        set({ currentStep: step });
      },
      
      addTreatment: (treatment) => {
        const currentTreatments = get().selectedTreatments;
        console.log(`Adding treatment: ${treatment.name}`);
        set({ 
          selectedTreatments: [...currentTreatments, treatment] 
        });
      },
      
      removeTreatment: (treatmentId) => {
        const currentTreatments = get().selectedTreatments;
        console.log(`Removing treatment: ${treatmentId}`);
        set({ 
          selectedTreatments: currentTreatments.filter(t => t.id !== treatmentId) 
        });
      },
      
      applyPromoCode: async (code) => {
        try {
          console.log(`Applying promo code: ${code}`);
          set({ isLoading: true, error: null });
          
          // Create backup before attempting promo application
          const backup = {
            treatments: get().selectedTreatments,
            step: get().currentStep
          };
          localStorage.setItem('promo-backup', JSON.stringify(backup));
          
          // Simulate API call with timeout
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Hard-coded validation for testing
          const validCodes = {
            'SUMMER15': 15,
            'DENTAL25': 25,
            'NEWPATIENT': 20,
            'TEST10': 10,
            'FREECONSULT': 100,
            'LUXHOTEL20': 20,
            'IMPLANTCROWN30': 30,
            'FREEWHITE': 100
          };
          
          if (validCodes[code]) {
            set({ 
              promoCode: code, 
              discount: validCodes[code],
              isLoading: false 
            });
            return { success: true };
          } else {
            set({ 
              isLoading: false, 
              error: 'Invalid promo code'
            });
            return { success: false, message: 'Invalid promo code' };
          }
        } catch (error) {
          console.error('Error applying promo code:', error);
          
          // Restore from backup on error
          const backup = JSON.parse(localStorage.getItem('promo-backup') || '{}');
          if (backup.treatments) {
            set({ 
              selectedTreatments: backup.treatments,
              currentStep: backup.step,
              isLoading: false,
              error: 'Error applying promo code. Please try again.'
            });
          }
          
          return { 
            success: false, 
            message: 'Error applying promo code. Please try again.'
          };
        }
      },
      
      updatePatientInfo: (info) => {
        set({ patientInfo: { ...get().patientInfo, ...info } });
      },
      
      resetQuote: () => {
        console.log('Resetting quote');
        set({ 
          currentStep: 'quiz',
          selectedTreatments: [],
          promoCode: '',
          discount: 0,
          patientInfo: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            preferredDate: '',
            notes: ''
          },
          error: null
        });
      },
      
      // Recovery method if state gets corrupted
      recoverFromBackup: () => {
        try {
          const backup = JSON.parse(localStorage.getItem('quote-step-backup') || '{}');
          if (backup.treatments && backup.treatments.length > 0) {
            set({
              currentStep: backup.step || 'quiz',
              selectedTreatments: backup.treatments || [],
              promoCode: backup.promo || '',
              discount: backup.discount || 0
            });
            return true;
          }
          return false;
        } catch (e) {
          console.error('Failed to recover from backup', e);
          return false;
        }
      }
    }),
    {
      name: 'robust-quote-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data
      partialize: (state) => ({
        currentStep: state.currentStep,
        selectedTreatments: state.selectedTreatments,
        promoCode: state.promoCode,
        discount: state.discount,
        patientInfo: state.patientInfo
      }),
    }
  )
)