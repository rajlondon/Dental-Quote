import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the possible entry sources as per the design document
export type EntrySource = 'normal' | 'special_offer' | 'package';

// Define the context data structure
interface QuoteFlowContextType {
  source: EntrySource;
  setSource: (source: EntrySource) => void;
  offerId: string | null;
  setOfferId: (id: string | null) => void;
  packageId: string | null;
  setPackageId: (id: string | null) => void;
  clinicId: string | null;
  setClinicId: (id: string | null) => void;
  isSpecialOfferFlow: boolean;
  isPackageFlow: boolean;
  isNormalFlow: boolean;
  resetFlow: () => void;
}

// Create the context with default values
const QuoteFlowContext = createContext<QuoteFlowContextType | undefined>(undefined);

// Create the provider component
export const QuoteFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [source, setSource] = useState<EntrySource>('normal');
  const [offerId, setOfferId] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);

  // Helper properties for easier flow checks
  const isSpecialOfferFlow = source === 'special_offer';
  const isPackageFlow = source === 'package';
  const isNormalFlow = source === 'normal';

  // Reset the flow to default state
  const resetFlow = () => {
    setSource('normal');
    setOfferId(null);
    setPackageId(null);
    setClinicId(null);
  };

  return (
    <QuoteFlowContext.Provider
      value={{
        source,
        setSource,
        offerId,
        setOfferId,
        packageId,
        setPackageId,
        clinicId,
        setClinicId,
        isSpecialOfferFlow,
        isPackageFlow,
        isNormalFlow,
        resetFlow
      }}
    >
      {children}
    </QuoteFlowContext.Provider>
  );
};

// Create a custom hook for using this context
export const useQuoteFlow = (): QuoteFlowContextType => {
  const context = useContext(QuoteFlowContext);
  if (context === undefined) {
    throw new Error('useQuoteFlow must be used within a QuoteFlowProvider');
  }
  return context;
};

// Utility hook to initialize the flow from URL parameters
export const useInitializeQuoteFlow = () => {
  const { setSource, setOfferId, setPackageId, setClinicId } = useQuoteFlow();

  const initializeFromUrlParams = () => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const offerIdParam = urlParams.get('offerId');
    const packageIdParam = urlParams.get('packageId');
    const clinicIdParam = urlParams.get('clinicId');
    const sourceParam = urlParams.get('source');

    console.log('QuoteFlowContext: Initializing from URL params:', {
      offerIdParam,
      packageIdParam,
      clinicIdParam,
      sourceParam,
      urlSearch: window.location.search
    });

    // Special case: sourceParam takes precedence if available
    if (sourceParam === 'package' && packageIdParam) {
      console.log('QuoteFlowContext: Setting package flow from source parameter');
      setSource('package');
      setPackageId(packageIdParam);
      if (clinicIdParam) setClinicId(clinicIdParam);
    } 
    // Special case: sourceParam for special offer
    else if (sourceParam === 'special_offer' && offerIdParam) {
      console.log('QuoteFlowContext: Setting special offer flow from source parameter');
      setSource('special_offer');
      setOfferId(offerIdParam);
      if (clinicIdParam) setClinicId(clinicIdParam);
    }
    // Regular parameter checks
    else if (offerIdParam) {
      console.log('QuoteFlowContext: Setting special offer flow from offerId parameter');
      setSource('special_offer');
      setOfferId(offerIdParam);
      if (clinicIdParam) setClinicId(clinicIdParam);
    } else if (packageIdParam) {
      console.log('QuoteFlowContext: Setting package flow from packageId parameter');
      setSource('package');
      setPackageId(packageIdParam);
      if (clinicIdParam) setClinicId(clinicIdParam);
    } else {
      console.log('QuoteFlowContext: Setting normal flow (no special parameters found)');
      setSource('normal');
    }
    
    // Check session storage as well
    const pendingOffer = sessionStorage.getItem('pendingSpecialOffer');
    const pendingPackage = sessionStorage.getItem('pendingPackage');
    
    console.log('QuoteFlowContext: Session storage check:', {
      pendingOffer: pendingOffer ? 'exists' : 'not found',
      pendingPackage: pendingPackage ? 'exists' : 'not found'
    });
  };

  return { initializeFromUrlParams };
};