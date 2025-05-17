import React, { createContext, useContext, useState, useEffect } from 'react';
import { TreatmentPackage, Treatment, AdditionalService } from '@/services/treatment-package-service';
import { CurrencyCode } from '@/utils/format-utils';

// Define the shape of our quote state
interface QuoteState {
  treatments: Treatment[];
  promoCode: string | null;
  currentPackage: TreatmentPackage | null;
  additionalServices: AdditionalService[];
  patientInfo: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  step: number;
  currency: CurrencyCode;
}

// Define the context shape
interface PersistentQuoteContextType extends QuoteState {
  updateState: (newState: Partial<QuoteState>) => void;
  resetState: () => void;
}

// Create an initial state
const initialState: QuoteState = {
  treatments: [],
  promoCode: null,
  currentPackage: null,
  additionalServices: [],
  patientInfo: {
    name: '',
    email: '',
    phone: '',
    notes: ''
  },
  step: 1,
  currency: 'USD'
};

// Create context with a default value
const PersistentQuoteContext = createContext<PersistentQuoteContextType | undefined>(undefined);

// Storage key for localStorage/sessionStorage
const STORAGE_KEY = 'mydentalfly_quote_state';

// Provider component
export const PersistentQuoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from storage or use default
  const [state, setState] = useState<QuoteState>(() => {
    if (typeof window === 'undefined') return initialState;

    // Try to load state from localStorage first (for persistence across browser sessions)
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (error) {
        console.error('Error parsing stored quote state:', error);
      }
    }

    // Try to load from sessionStorage (for persistence during the current session)
    const sessionState = sessionStorage.getItem(STORAGE_KEY);
    if (sessionState) {
      try {
        return JSON.parse(sessionState);
      } catch (error) {
        console.error('Error parsing session quote state:', error);
      }
    }

    // Fall back to initial state if no stored state is found
    return initialState;
  });

  // Update state and persist to storage
  const updateState = (newState: Partial<QuoteState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      
      // Save to both localStorage and sessionStorage for maximum resilience
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
        } catch (error) {
          console.error('Error saving quote state to storage:', error);
        }
      }
      
      return updatedState;
    });
  };

  // Reset state to initial values
  const resetState = () => {
    setState(initialState);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing quote state from storage:', error);
      }
    }
  };

  // When state changes, sync to storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Error syncing quote state to storage:', error);
      }
    }
  }, [state]);

  // Create context value
  const contextValue: PersistentQuoteContextType = {
    ...state,
    updateState,
    resetState
  };

  return (
    <PersistentQuoteContext.Provider value={contextValue}>
      {children}
    </PersistentQuoteContext.Provider>
  );
};

// Hook for consuming the context
export const usePersistentQuote = (): PersistentQuoteContextType => {
  const context = useContext(PersistentQuoteContext);
  
  if (context === undefined) {
    throw new Error('usePersistentQuote must be used within a PersistentQuoteProvider');
  }
  
  return context;
};