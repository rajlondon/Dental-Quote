import { useEffect, useState } from 'react';
import { usePersistentQuote } from './use-persistent-quote';
import { useClinic } from './use-clinic';
import { useToast } from './use-toast';
import axios from 'axios';

export interface QuoteIntegrationOptions {
  autoSync?: boolean;
  syncInterval?: number;
  preserveClinicContext?: boolean;
}

interface QuoteData {
  id?: string;
  status: 'draft' | 'submitted' | 'accepted' | 'completed';
  totalAmount: number;
  flightCost?: number;
  hotelCost?: number;
  promoCode?: string;
  discount?: number;
}

const defaultOptions: QuoteIntegrationOptions = {
  autoSync: true,
  syncInterval: 30000, // 30 seconds
  preserveClinicContext: true
};

/**
 * Enhanced hook for integrating quote data across the old and new systems
 * 
 * This hook maintains synchronization between:
 * 1. The persistent quote state in localStorage
 * 2. The session-based quote data in the Flask app
 * 3. The clinic context from the clinic portal
 * 4. The promo code from URL parameters or manual entry
 */
export function useQuoteIntegration(options: QuoteIntegrationOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };
  const { toast } = useToast();
  const { 
    treatments, 
    promoCode, 
    currentPackage, 
    additionalServices, 
    clinicPreference,
    updateState,
    resetState 
  } = usePersistentQuote();
  
  const { clinics } = useClinic();
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extract and apply promo code from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlPromoCode = params.get('promo');
      
      if (urlPromoCode && urlPromoCode !== promoCode) {
        console.log(`Promo code detected in URL: ${urlPromoCode}`);
        
        // Apply the promo code
        updateState({
          promoCode: urlPromoCode
        });
        
        toast({
          title: "Promo code applied",
          description: `Applied promo code: ${urlPromoCode}`,
        });
      }
    }
  }, []);

  // Extract and apply clinic ID from URL and session storage
  useEffect(() => {
    if (typeof window !== 'undefined' && mergedOptions.preserveClinicContext) {
      const params = new URLSearchParams(window.location.search);
      const clinicId = params.get('clinic');
      
      if (clinicId && clinicId !== clinicPreference) {
        console.log(`Clinic ID detected in URL: ${clinicId}`);
        // Store in both localStorage (via persistent quote) and sessionStorage
        updateState({
          clinicPreference: clinicId
        });
        sessionStorage.setItem('selected_clinic_id', clinicId);
      } else if (!clinicPreference) {
        // Check session storage as fallback
        const storedClinicId = sessionStorage.getItem('selected_clinic_id') || 
                              sessionStorage.getItem('clinic_id');
        if (storedClinicId) {
          console.log(`Clinic ID detected in session storage: ${storedClinicId}`);
          updateState({
            clinicPreference: storedClinicId
          });
        }
      }
    }
  }, []);

  // Calculate total with all factors included
  const calculateTotal = () => {
    // Base treatment costs
    const treatmentTotal = treatments.reduce((sum, t) => sum + (t.price || 0), 0);
    
    // Package costs if applicable
    const packageTotal = currentPackage ? currentPackage.price : 0;
    
    // Additional services
    const servicesTotal = additionalServices.reduce((sum, s) => sum + (s.price || 0), 0);
    
    // Calculate any discounts from promo code
    let discountAmount = 0;
    if (promoCode && quoteData?.discount) {
      discountAmount = quoteData.discount;
    }
    
    return (treatmentTotal + packageTotal + servicesTotal) - discountAmount;
  };

  // Sync quote data with Flask backend through our bridge API
  const syncWithFlask = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      
      console.log('Syncing quote data with Flask bridge...');
      
      // Send data to our Express-Flask bridge
      const response = await axios.post('/api/quote-sync', {
        quoteId,
        treatments,
        promoCode,
        packageId: currentPackage?.id,
        additionalServices,
        clinicId: clinicPreference,
        calculatedTotal: calculateTotal()
      });
      
      if (response.data.success) {
        const quoteData = response.data.data?.quote_data;
        
        if (quoteData) {
          // Map Flask data structure to our React structure
          setQuoteData({
            id: quoteData.id,
            status: quoteData.status || 'draft',
            totalAmount: quoteData.total || 0,
            discount: quoteData.discount_amount || 0,
            promoCode: quoteData.promo_code || null
          });
          
          setQuoteId(quoteData.id);
          setLastSyncTime(new Date());
          
          // If promo code was applied on server, update local state
          if (quoteData.promo_code && quoteData.promo_code !== promoCode) {
            updateState({
              promoCode: quoteData.promo_code
            });
          }
          
          console.log('Quote synced successfully with Flask backend');
        }
      } else {
        setError(response.data.message || 'Failed to sync quote data');
      }
    } catch (err) {
      console.error('Error syncing with Flask backend:', err);
      setError('Failed to communicate with quote system');
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync on data changes if enabled
  useEffect(() => {
    if (mergedOptions.autoSync) {
      syncWithFlask();
    }
  }, [treatments, promoCode, currentPackage, additionalServices, clinicPreference]);

  // Set up interval sync if enabled
  useEffect(() => {
    if (mergedOptions.autoSync && mergedOptions.syncInterval) {
      const intervalId = setInterval(syncWithFlask, mergedOptions.syncInterval);
      return () => clearInterval(intervalId);
    }
  }, [mergedOptions.syncInterval]);

  // Load existing quote if ID is provided in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlQuoteId = params.get('quoteId');
      
      if (urlQuoteId) {
        setQuoteId(urlQuoteId);
        loadExistingQuote(urlQuoteId);
      }
    }
  }, []);

  // Load an existing quote from the server
  const loadExistingQuote = async (id: string) => {
    try {
      setIsSyncing(true);
      setError(null);
      
      const response = await axios.get(`/api/quotes/${id}`);
      
      if (response.data.success) {
        const quote = response.data.quote;
        
        // Update the persistent quote state with loaded data
        updateState({
          treatments: quote.treatments || [],
          promoCode: quote.promoCode || null,
          currentPackage: quote.package || null,
          additionalServices: quote.additionalServices || [],
          clinicPreference: quote.clinicId || null
        });
        
        setQuoteData(quote);
        setLastSyncTime(new Date());
        
        toast({
          title: "Quote loaded",
          description: `Loaded quote #${id}`,
        });
      } else {
        setError(response.data.message || 'Failed to load quote data');
        
        toast({
          title: "Error loading quote",
          description: response.data.message || 'Failed to load quote data',
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error loading quote:', err);
      setError('Failed to load quote');
      
      toast({
        title: "Error loading quote",
        description: 'Failed to load quote from server',
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Save the current quote state to the server
  const saveQuote = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      
      const response = await axios.post('/api/quotes', {
        id: quoteId,
        treatments,
        promoCode,
        packageId: currentPackage?.id,
        additionalServices,
        clinicId: clinicPreference,
        calculatedTotal: calculateTotal()
      });
      
      if (response.data.success) {
        setQuoteData(response.data.quote);
        setQuoteId(response.data.quote.id);
        setLastSyncTime(new Date());
        
        toast({
          title: "Quote saved",
          description: `Quote #${response.data.quote.id} saved successfully`,
        });
        
        return response.data.quote.id;
      } else {
        setError(response.data.message || 'Failed to save quote data');
        
        toast({
          title: "Error saving quote",
          description: response.data.message || 'Failed to save quote data',
          variant: "destructive"
        });
        
        return null;
      }
    } catch (err) {
      console.error('Error saving quote:', err);
      setError('Failed to save quote');
      
      toast({
        title: "Error saving quote",
        description: 'Failed to save quote to server',
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  // Finalize and submit the quote
  const submitQuote = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      
      // First, ensure quote is saved
      const savedQuoteId = quoteId || await saveQuote();
      
      if (!savedQuoteId) {
        setError('Failed to save quote before submission');
        return null;
      }
      
      const response = await axios.post(`/api/quotes/${savedQuoteId}/submit`, {
        clinicId: clinicPreference,
        total: calculateTotal()
      });
      
      if (response.data.success) {
        if (quoteData) {
          setQuoteData({
            ...quoteData,
            status: 'submitted',
            totalAmount: calculateTotal()
          });
        }
        
        toast({
          title: "Quote submitted",
          description: `Quote #${savedQuoteId} submitted successfully`,
          variant: "success"
        });
        
        // Reset local state after successful submission
        resetState();
        
        return savedQuoteId;
      } else {
        setError(response.data.message || 'Failed to submit quote');
        
        toast({
          title: "Error submitting quote",
          description: response.data.message || 'Failed to submit quote',
          variant: "destructive"
        });
        
        return null;
      }
    } catch (err) {
      console.error('Error submitting quote:', err);
      setError('Failed to submit quote');
      
      toast({
        title: "Error submitting quote",
        description: 'Failed to submit quote to server',
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    // State
    quoteData,
    quoteId,
    isSyncing,
    lastSyncTime,
    error,
    // Calculated
    total: calculateTotal(),
    hasClinic: !!clinicPreference,
    hasPromo: !!promoCode,
    // Actions
    syncWithFlask,
    loadExistingQuote,
    saveQuote,
    submitQuote
  };
}