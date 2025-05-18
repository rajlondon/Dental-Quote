import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Define the Flask service URL - default to localhost:8080 if not set
const FLASK_SERVICE_URL = process.env.FLASK_SERVICE_URL || 'http://localhost:8080';

interface UseFlaskIntegrationOptions {
  autoSync?: boolean;
  syncInterval?: number;
  enableNotifications?: boolean;
  handleErrors?: boolean;
}

interface QuoteData {
  id?: string;
  step?: string;
  treatments?: any[];
  patient_info?: any;
  promo_code?: string | null;
  discount_amount?: number;
  total?: number;
  clinic_id?: string | null;
  source?: string;
  status?: string;
  reference?: string;
}

/**
 * Hook to integrate with Flask backend services
 * 
 * This hook provides methods to communicate with the Flask quote builder
 * and synchronize state between React and Flask.
 */
export function useFlaskIntegration(options: UseFlaskIntegrationOptions = {}) {
  const {
    autoSync = true,
    syncInterval = 5000, // 5 seconds
    enableNotifications = true,
    handleErrors = true
  } = options;

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

  // Function to check if Flask service is available
  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${FLASK_SERVICE_URL}/api/special-offers`);
      setIsConnected(true);
      return true;
    } catch (err) {
      console.error('Flask backend connection error:', err);
      setIsConnected(false);
      if (handleErrors) {
        setError(err instanceof Error ? err : new Error('Failed to connect to Flask service'));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleErrors]);

  // Function to get the current quote state from Flask
  const getQuoteState = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${FLASK_SERVICE_URL}/api/bridge/state`);
      if (response.data?.success) {
        setQuoteData(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Error getting quote state from Flask:', err);
      if (handleErrors) {
        setError(err instanceof Error ? err : new Error('Failed to get quote state'));
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleErrors]);

  // Function to synchronize state with Flask
  const syncWithFlask = useCallback(async (data?: any) => {
    try {
      setIsLoading(true);
      const payload = {
        quote: data || quoteData,
        timestamp: new Date().toISOString()
      };
      
      const response = await axios.post(`${FLASK_SERVICE_URL}/api/quote-data-sync`, payload);
      
      if (response.data?.success) {
        setQuoteData(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Error syncing with Flask backend:', err);
      if (handleErrors) {
        setError(err instanceof Error ? err : new Error('Failed to sync with Flask backend'));
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [quoteData, handleErrors]);

  // Function to validate a promo code
  const validatePromoCode = useCallback(async (promoCode: string, quoteTotal: number) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${FLASK_SERVICE_URL}/api/validate-promo`, {
        promoCode,
        quoteTotal
      });
      
      if (response.data?.success) {
        // Update the local quote data with the new promo code info
        if (quoteData) {
          const updatedQuoteData = {
            ...quoteData,
            promo_code: promoCode,
            discount_amount: response.data.data.discount
          };
          setQuoteData(updatedQuoteData);
        }
        return response.data.data;
      }
      return { valid: false, message: response.data?.message || 'Invalid promo code' };
    } catch (err) {
      console.error('Error validating promo code:', err);
      if (handleErrors) {
        setError(err instanceof Error ? err : new Error('Failed to validate promo code'));
      }
      return { valid: false, message: 'Error validating promo code' };
    } finally {
      setIsLoading(false);
    }
  }, [quoteData, handleErrors]);

  // Function to submit patient information
  const savePatientInfo = useCallback(async (patientInfo: any) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${FLASK_SERVICE_URL}/api/save-patient-info`, patientInfo);
      
      if (response.data?.success) {
        // Update the local quote data with the new patient info
        if (quoteData) {
          const updatedQuoteData = {
            ...quoteData,
            patient_info: patientInfo
          };
          setQuoteData(updatedQuoteData);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving patient information:', err);
      if (handleErrors) {
        setError(err instanceof Error ? err : new Error('Failed to save patient information'));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [quoteData, handleErrors]);

  // Function to submit the final quote
  const submitQuote = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${FLASK_SERVICE_URL}/api/submit-quote`);
      
      if (response.data?.success) {
        // Update the local quote data with the submitted status and reference
        if (quoteData) {
          const updatedQuoteData = {
            ...quoteData,
            status: 'submitted',
            reference: response.data.data.reference
          };
          setQuoteData(updatedQuoteData);
        }
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Error submitting quote:', err);
      if (handleErrors) {
        setError(err instanceof Error ? err : new Error('Failed to submit quote'));
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [quoteData, handleErrors]);

  // Function to get treatments from Flask
  const getTreatments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${FLASK_SERVICE_URL}/api/bridge/treatments`);
      
      if (response.data?.success) {
        return response.data.data;
      }
      return { treatments: [], packages: [] };
    } catch (err) {
      console.error('Error getting treatments from Flask:', err);
      if (handleErrors) {
        setError(err instanceof Error ? err : new Error('Failed to get treatments'));
      }
      return { treatments: [], packages: [] };
    } finally {
      setIsLoading(false);
    }
  }, [handleErrors]);

  // Function to get special offers from Flask
  const getSpecialOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${FLASK_SERVICE_URL}/api/special-offers`);
      return response.data || [];
    } catch (err) {
      console.error('Error getting special offers from Flask:', err);
      if (handleErrors) {
        setError(err instanceof Error ? err : new Error('Failed to get special offers'));
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleErrors]);

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Setup auto-sync if enabled
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const setupSync = async () => {
      // Check connection first
      const connected = await checkConnection();
      
      if (connected && autoSync) {
        // Initial sync
        await getQuoteState();
        
        // Setup interval for auto-sync
        interval = setInterval(async () => {
          await syncWithFlask();
        }, syncInterval);
      }
    };
    
    setupSync();
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoSync, syncInterval, checkConnection, getQuoteState, syncWithFlask]);

  return {
    isConnected,
    isLoading,
    error,
    quoteData,
    checkConnection,
    getQuoteState,
    syncWithFlask,
    validatePromoCode,
    savePatientInfo,
    submitQuote,
    getTreatments,
    getSpecialOffers,
    clearError
  };
}