import { create } from 'zustand'

// Completely isolated store with no middleware
export const useStandaloneQuoteStore = create((set, get) => ({
  // Core state
  treatments: [],
  promoCode: null,
  promoDiscount: 0,
  currentView: 'treatments', // 'treatments', 'summary'
  
  // Actions
  addTreatment: (treatment) => {
    const currentTreatments = get().treatments;
    
    // Create a backup first
    localStorage.setItem('treatments-backup', JSON.stringify(currentTreatments));
    
    // Then update state
    set({ 
      treatments: [...currentTreatments, treatment]
    });
    
    // And save to localStorage as secondary backup
    setTimeout(() => {
      localStorage.setItem('treatments-current', 
        JSON.stringify([...currentTreatments, treatment])
      );
    }, 50);
  },
  
  removeTreatment: (id) => {
    const currentTreatments = get().treatments;
    
    // Create a backup first
    localStorage.setItem('treatments-backup', JSON.stringify(currentTreatments));
    
    // Then update state
    set({
      treatments: currentTreatments.filter(t => t.id !== id)
    });
    
    // And save to localStorage as secondary backup
    setTimeout(() => {
      localStorage.setItem('treatments-current', 
        JSON.stringify(currentTreatments.filter(t => t.id !== id))
      );
    }, 50);
  },
  
  applyPromoCode: (code) => {
    // Create backup before promo application
    localStorage.setItem('pre-promo-state', JSON.stringify({
      treatments: get().treatments,
      view: get().currentView
    }));
    
    // Map of valid promo codes to discount percentages
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
      // Update state with promo code
      set({
        promoCode: code,
        promoDiscount: validCodes[code]
      });
      
      // Create a backup after applying
      setTimeout(() => {
        localStorage.setItem('post-promo-state', JSON.stringify({
          treatments: get().treatments,
          promoCode: code,
          promoDiscount: validCodes[code],
          view: get().currentView
        }));
      }, 50);
      
      return true;
    }
    
    return false;
  },
  
  removePromoCode: () => {
    set({
      promoCode: null,
      promoDiscount: 0
    });
    
    setTimeout(() => {
      localStorage.setItem('post-promo-state', JSON.stringify({
        treatments: get().treatments,
        promoCode: null,
        promoDiscount: 0,
        view: get().currentView
      }));
    }, 50);
  },
  
  setView: (view) => {
    set({ currentView: view });
    
    // Save view state to localStorage
    localStorage.setItem('current-view', view);
  },
  
  // Recovery methods
  recoverFromBackup: () => {
    try {
      // Try to recover from the most recent backup
      const postPromoState = JSON.parse(localStorage.getItem('post-promo-state') || '{}');
      
      if (postPromoState.treatments && postPromoState.treatments.length > 0) {
        set({
          treatments: postPromoState.treatments,
          promoCode: postPromoState.promoCode || null,
          promoDiscount: postPromoState.promoDiscount || 0,
          currentView: postPromoState.view || 'treatments'
        });
        return true;
      }
      
      // If that fails, try the pre-promo backup
      const prePromoState = JSON.parse(localStorage.getItem('pre-promo-state') || '{}');
      if (prePromoState.treatments && prePromoState.treatments.length > 0) {
        set({
          treatments: prePromoState.treatments,
          currentView: prePromoState.view || 'treatments'
        });
        return true;
      }
      
      // If that fails too, try the treatments backup
      const treatmentsBackup = JSON.parse(localStorage.getItem('treatments-backup') || '[]');
      if (treatmentsBackup.length > 0) {
        set({ treatments: treatmentsBackup });
        return true;
      }
      
      // Final fallback
      const treatmentsCurrent = JSON.parse(localStorage.getItem('treatments-current') || '[]');
      if (treatmentsCurrent.length > 0) {
        set({ treatments: treatmentsCurrent });
        return true;
      }
      
      return false;
    } catch (e) {
      console.error('Failed to recover from backup', e);
      return false;
    }
  }
}))