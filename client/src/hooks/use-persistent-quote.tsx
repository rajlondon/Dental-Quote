import React, { createContext, useContext, useEffect, useState } from 'react';
import { Treatment, TreatmentPackage, AdditionalService } from '@/types/treatment-types';
import { CurrencyCode } from '@/types/general-types';

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

interface PersistentQuoteContextType extends QuoteState {
  updateState: (newState: Partial<QuoteState>) => void;
  resetState: () => void;
}

const STORAGE_KEY = 'myDentalFly_quoteState';

const initialState: QuoteState = {
  treatments: [],
  promoCode: null,
  currentPackage: null,
  additionalServices: [],
  patientInfo: {
    name: '',
    email: '',
    phone: '',
    notes: '',
  },
  step: 1,
  currency: 'USD',
};

const PersistentQuoteContext = createContext<PersistentQuoteContextType | null>(null);

export const PersistentQuoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<QuoteState>(initialState);
  
  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setState(parsedState);
      } catch (error) {
        console.error('Failed to parse saved quote state:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  
  const updateState = (newState: Partial<QuoteState>) => {
    setState((prevState) => ({
      ...prevState,
      ...newState,
    }));
  };
  
  const resetState = () => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  };
  
  const contextValue: PersistentQuoteContextType = {
    ...state,
    updateState,
    resetState,
  };
  
  return (
    <PersistentQuoteContext.Provider value={contextValue}>
      {children}
    </PersistentQuoteContext.Provider>
  );
};

export const usePersistentQuote = (): PersistentQuoteContextType => {
  const context = useContext(PersistentQuoteContext);
  if (!context) {
    throw new Error('usePersistentQuote must be used within a PersistentQuoteProvider');
  }
  return context;
};