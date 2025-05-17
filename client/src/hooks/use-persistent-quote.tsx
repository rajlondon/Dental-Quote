import { useEffect, useState } from 'react';
import { Treatment } from '@/components/quotes/QuoteIntegrationWidget';
import { TreatmentPackage, AdditionalService } from '@/services/treatment-package-service';
import { CurrencyCode } from '@/utils/format-utils';

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

const STORAGE_KEY = 'dental-quote-state';

export const usePersistentQuote = (initialState: Partial<QuoteState> = {}) => {
  // Set up default state
  const defaultState: QuoteState = {
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
    currency: 'USD',
    ...initialState
  };
  
  // Initialize state from localStorage if available
  const [state, setState] = useState<QuoteState>(() => {
    if (typeof window === 'undefined') return defaultState;
    
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      return savedState ? JSON.parse(savedState) : defaultState;
    } catch (error) {
      console.error('Error loading quote state from localStorage:', error);
      return defaultState;
    }
  });
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving quote state to localStorage:', error);
    }
  }, [state]);
  
  // Function to update state with persistence
  const updateState = (updates: Partial<QuoteState>) => {
    setState(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // Function to completely reset the state
  const resetState = () => {
    setState(defaultState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };
  
  return {
    ...state,
    updateState,
    resetState
  };
};