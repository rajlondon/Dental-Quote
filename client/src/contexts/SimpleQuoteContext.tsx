import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/utils/currency-formatter';

// Interface definitions
export interface Treatment {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity?: number;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  savings: number;
  treatments: Treatment[];
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  promo_code?: string;
  banner_image?: string;
}

export interface QuoteState {
  treatments: Treatment[];
  selectedPackage: Package | null;
  appliedOffer: SpecialOffer | null;
  promoCode: string | null;
  promoDiscount: number;
  totalPrice: number;
  originalPrice: number;
  savings: number;
  quoteId?: string;
}

// Define context type
interface SimpleQuoteContextType {
  quote: QuoteState;
  isLoading: boolean;
  error: string | null;
  treatments: Treatment[];
  packages: Package[];
  specialOffers: SpecialOffer[];
  isTreatmentsLoading: boolean;
  isPackagesLoading: boolean;
  isOffersLoading: boolean;
  
  // Handler functions
  handleSelectTreatment: (treatment: Treatment) => void;
  handleSelectPackage: (pkg: Package) => void;
  handleApplyOffer: (offer: SpecialOffer) => void;
  handleApplyPromoCode: (code: string) => Promise<boolean>;
  handleClearPromoCode: () => void;
  handleReset: () => void;
  handleUpdateQuantity: (treatmentId: string, quantity: number) => void;
  handleSaveQuote: () => Promise<string | null>;
  handleEmailQuote: (email: string) => Promise<boolean>;
  
  // Helper functions
  calculateTotals: () => { subtotal: number; savings: number; total: number };
}

// Create context
const SimpleQuoteContext = createContext<SimpleQuoteContextType | undefined>(undefined);

// Initial quote state
const initialQuoteState: QuoteState = {
  treatments: [],
  selectedPackage: null,
  appliedOffer: null,
  promoCode: null,
  promoDiscount: 0,
  totalPrice: 0,
  originalPrice: 0,
  savings: 0
};

export function SimpleQuoteProvider({ children }: { children: ReactNode }) {
  // State management
  const [quote, setQuote] = useState<QuoteState>(initialQuoteState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Get data from API
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
  const [isTreatmentsLoading, setIsTreatmentsLoading] = useState(true);
  const [isPackagesLoading, setIsPackagesLoading] = useState(true);
  const [isOffersLoading, setIsOffersLoading] = useState(true);

  // Fetch treatments, packages, and offers from API
  React.useEffect(() => {
    // Fetch treatments
    const fetchTreatments = async () => {
      setIsTreatmentsLoading(true);
      try {
        const response = await apiRequest('GET', '/api/treatments');
        const data = await response.json();
        setTreatments(data);
      } catch (err) {
        console.error('Error fetching treatments:', err);
        toast({
          title: 'Error',
          description: 'Failed to load treatments. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsTreatmentsLoading(false);
      }
    };

    // Fetch packages
    const fetchPackages = async () => {
      setIsPackagesLoading(true);
      try {
        const response = await apiRequest('GET', '/api/treatment-packages');
        const data = await response.json();
        setPackages(data);
      } catch (err) {
        console.error('Error fetching packages:', err);
        toast({
          title: 'Error',
          description: 'Failed to load treatment packages. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsPackagesLoading(false);
      }
    };

    // Fetch special offers
    const fetchOffers = async () => {
      setIsOffersLoading(true);
      try {
        const response = await apiRequest('GET', '/api/special-offers');
        const data = await response.json();
        setSpecialOffers(data);
      } catch (err) {
        console.error('Error fetching special offers:', err);
        toast({
          title: 'Error',
          description: 'Failed to load special offers. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsOffersLoading(false);
      }
    };

    fetchTreatments();
    fetchPackages();
    fetchOffers();
  }, [toast]);

  // Calculate totals helper
  const calculateTotals = useCallback(() => {
    let subtotal = 0;
    let savings = 0;
    
    // Add treatments
    if (quote.selectedPackage) {
      subtotal += quote.selectedPackage.price;
      savings += quote.selectedPackage.savings;
    } else {
      quote.treatments.forEach(t => {
        subtotal += t.price * (t.quantity || 1);
      });
    }
    
    // Apply special offer discount
    let offerDiscount = 0;
    if (quote.appliedOffer) {
      if (quote.appliedOffer.discount_type === 'percentage') {
        offerDiscount = subtotal * (quote.appliedOffer.discount_value / 100);
      } else {
        offerDiscount = quote.appliedOffer.discount_value;
      }
      savings += offerDiscount;
    }
    
    // Apply promo code discount
    let promoDiscount = quote.promoDiscount;
    savings += promoDiscount;
    
    // Calculate final total
    const total = Math.max(0, subtotal - offerDiscount - promoDiscount);
    
    return {
      subtotal,
      savings,
      total
    };
  }, [quote]);

  // Update quote totals whenever the quote changes
  React.useEffect(() => {
    const totals = calculateTotals();
    setQuote(prev => ({
      ...prev,
      totalPrice: totals.total,
      originalPrice: totals.subtotal,
      savings: totals.savings
    }));
  }, [
    quote.treatments, 
    quote.selectedPackage, 
    quote.appliedOffer, 
    quote.promoDiscount,
    calculateTotals
  ]);

  // Handler to select/deselect treatment
  const handleSelectTreatment = useCallback((treatment: Treatment) => {
    setQuote(prev => {
      // If we have a package, remove it when selecting individual treatments
      if (prev.selectedPackage) {
        return {
          ...prev,
          selectedPackage: null,
          treatments: [{ ...treatment, quantity: 1 }],
          appliedOffer: null,
          promoCode: null,
          promoDiscount: 0
        };
      }

      // Check if treatment is already selected
      const existingIndex = prev.treatments.findIndex(t => t.id === treatment.id);
      
      if (existingIndex >= 0) {
        // Remove if already selected
        return {
          ...prev,
          treatments: prev.treatments.filter(t => t.id !== treatment.id)
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          treatments: [...prev.treatments, { ...treatment, quantity: 1 }]
        };
      }
    });
  }, []);

  // Handler to update treatment quantity
  const handleUpdateQuantity = useCallback((treatmentId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setQuote(prev => ({
      ...prev,
      treatments: prev.treatments.map(t => 
        t.id === treatmentId ? { ...t, quantity } : t
      )
    }));
  }, []);

  // Handler to select a package
  const handleSelectPackage = useCallback((pkg: Package) => {
    setQuote(prev => ({
      ...prev,
      selectedPackage: pkg,
      treatments: [], // Clear individual treatments when selecting a package
      appliedOffer: null,
      promoCode: null,
      promoDiscount: 0
    }));
  }, []);

  // Handler to apply a special offer
  const handleApplyOffer = useCallback((offer: SpecialOffer) => {
    setQuote(prev => {
      // If the same offer is already applied, remove it
      if (prev.appliedOffer?.id === offer.id) {
        return {
          ...prev,
          appliedOffer: null
        };
      }
      
      // Otherwise apply the new offer
      return {
        ...prev,
        appliedOffer: offer,
        // If the offer has a promo code, apply it too
        promoCode: offer.promo_code || prev.promoCode,
        // Reset promo discount as it will be recalculated
        promoDiscount: 0
      };
    });

    // If the offer has a promo code, apply it via API
    if (offer.promo_code) {
      handleApplyPromoCode(offer.promo_code);
    }
  }, []);

  // Handler to apply a promo code
  const handleApplyPromoCode = useCallback(async (code: string): Promise<boolean> => {
    if (!code.trim()) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create the payload based on current quote state
      const payload = {
        promoCode: code,
        treatments: quote.selectedPackage 
          ? [{ id: quote.selectedPackage.id, isPackage: true }]
          : quote.treatments.map(t => ({ id: t.id, quantity: t.quantity || 1 }))
      };
      
      // Make API call to validate and apply promo code
      const response = await apiRequest('POST', '/api/promo-codes/apply', payload);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply promo code');
      }
      
      // Update the quote with the promo code discount
      setQuote(prev => ({
        ...prev,
        promoCode: code,
        promoDiscount: data.discount || 0
      }));
      
      toast({
        title: 'Promo Code Applied',
        description: `Promo code "${code}" has been applied to your quote.`,
      });
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error applying promo code');
      toast({
        title: 'Error',
        description: err.message || 'Failed to apply the promo code. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [quote.selectedPackage, quote.treatments, toast]);

  // Handler to clear the promo code
  const handleClearPromoCode = useCallback(() => {
    setQuote(prev => ({
      ...prev,
      promoCode: null,
      promoDiscount: 0
    }));
    
    toast({
      title: 'Promo Code Removed',
      description: 'The promo code has been removed from your quote.'
    });
  }, [toast]);

  // Handler to reset the quote
  const handleReset = useCallback(() => {
    setQuote(initialQuoteState);
    setError(null);
    
    toast({
      title: 'Quote Reset',
      description: 'Your quote has been reset.'
    });
  }, [toast]);

  // Handler to save the quote to the backend
  const handleSaveQuote = useCallback(async (): Promise<string | null> => {
    if (quote.treatments.length === 0 && !quote.selectedPackage) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one treatment or package before saving.',
        variant: 'destructive'
      });
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create the quote payload
      const totals = calculateTotals();
      const quoteData = {
        treatments: quote.selectedPackage 
          ? [{ id: quote.selectedPackage.id, isPackage: true, quantity: 1 }]
          : quote.treatments.map(t => ({ id: t.id, quantity: t.quantity || 1 })),
        userId: user?.id,
        promoCode: quote.promoCode || undefined,
        offerId: quote.appliedOffer?.id,
        totalPrice: totals.total,
        originalPrice: totals.subtotal,
        savings: totals.savings
      };
      
      // Make API call to save the quote
      const response = await apiRequest('POST', '/api/quotes', quoteData);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save quote');
      }
      
      // Update the quote ID
      setQuote(prev => ({
        ...prev,
        quoteId: data.id
      }));
      
      toast({
        title: 'Quote Saved',
        description: 'Your quote has been saved successfully.'
      });
      
      // Invalidate quotes cache to ensure fresh data on next load
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      
      return data.id;
    } catch (err: any) {
      setError(err.message || 'Error saving quote');
      toast({
        title: 'Error',
        description: err.message || 'Failed to save your quote. Please try again.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [quote, user, calculateTotals, toast]);

  // Handler to email the quote
  const handleEmailQuote = useCallback(async (email: string): Promise<boolean> => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      return false;
    }
    
    if (quote.treatments.length === 0 && !quote.selectedPackage) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one treatment or package before emailing.',
        variant: 'destructive'
      });
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Save the quote first if it doesn't have an ID
      let quoteId = quote.quoteId;
      if (!quoteId) {
        quoteId = await handleSaveQuote();
        if (!quoteId) throw new Error('Failed to create quote before emailing');
      }
      
      // Make API call to email the quote
      const response = await apiRequest('POST', '/api/quotes/email', {
        quoteId,
        email
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to email quote');
      }
      
      toast({
        title: 'Quote Emailed',
        description: `Your quote has been sent to ${email}.`
      });
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error emailing quote');
      toast({
        title: 'Error',
        description: err.message || 'Failed to email your quote. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [quote, handleSaveQuote, toast]);

  return (
    <SimpleQuoteContext.Provider
      value={{
        quote,
        isLoading,
        error,
        treatments,
        packages,
        specialOffers,
        isTreatmentsLoading,
        isPackagesLoading,
        isOffersLoading,
        handleSelectTreatment,
        handleSelectPackage,
        handleApplyOffer,
        handleApplyPromoCode,
        handleClearPromoCode,
        handleReset,
        handleUpdateQuantity,
        handleSaveQuote,
        handleEmailQuote,
        calculateTotals
      }}
    >
      {children}
    </SimpleQuoteContext.Provider>
  );
}

// Custom hook to use the quote context
export function useSimpleQuote() {
  const context = useContext(SimpleQuoteContext);
  if (context === undefined) {
    throw new Error('useSimpleQuote must be used within a SimpleQuoteProvider');
  }
  return context;
}