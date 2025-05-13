import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the possible entry sources as per the design document
export type EntrySource = 'normal' | 'special_offer' | 'package' | 'promo_token';

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
  promoToken: string | null;
  setPromoToken: (token: string | null) => void;
  promoType: string | null;
  setPromoType: (type: string | null) => void;
  quoteId: string | null;
  setQuoteId: (id: string | null) => void;
  isSpecialOfferFlow: boolean;
  isPackageFlow: boolean;
  isNormalFlow: boolean;
  isPromoTokenFlow: boolean;
  resetFlow: () => void;
  buildUrl: (path: string) => string; // Helper for appending quoteId to URLs
}

// Create the context with default values
const QuoteFlowContext = createContext<QuoteFlowContextType | undefined>(undefined);

// Create the provider component
export const QuoteFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [source, setSource] = useState<EntrySource>('normal');
  const [offerId, setOfferId] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [promoToken, _setPromoToken] = useState<string | null>(null);
  const [promoType, _setPromoType] = useState<string | null>(null);
  
  // Enhance setPromoToken to automatically set source to promo_token
  const setPromoToken = (token: string | null) => {
    _setPromoToken(token);
    // When setting a promo token, automatically update the source
    if (token) {
      console.log("QuoteFlowContext: Setting promo token and forcing source to 'promo_token'");
      setSource('promo_token');
    }
  };
  
  // Enhance setPromoType to maintain consistency
  const setPromoType = (type: string | null) => {
    _setPromoType(type);
  };
  const [quoteId, setQuoteId] = useState<string | null>(null);

  // Helper properties for easier flow checks
  const isSpecialOfferFlow = source === 'special_offer';
  const isPackageFlow = source === 'package';
  const isNormalFlow = source === 'normal';
  const isPromoTokenFlow = source === 'promo_token';

  // Helper to build URLs with quoteId and promo code when available
  const buildUrl = (path: string): string => {
    // Start with the original path
    let finalUrl = path;
    const hasQueryParams = path.includes('?');
    let separator = hasQueryParams ? '&' : '?';
    
    // Add quoteId parameter if available
    if (quoteId) {
      finalUrl = `${finalUrl}${separator}quoteId=${quoteId}`;
      separator = '&'; // Subsequent params need & separator
    }
    
    // Add promo code parameter if available (preserve from URL)
    const urlParams = new URLSearchParams(window.location.search);
    const promoCode = urlParams.get('code');
    if (promoCode) {
      finalUrl = `${finalUrl}${separator}code=${promoCode}`;
    }
    
    return finalUrl;
  };

  // Reset the flow to default state
  const resetFlow = () => {
    setSource('normal');
    setOfferId(null);
    setPackageId(null);
    setClinicId(null);
    setPromoToken(null);
    setPromoType(null);
    setQuoteId(null);
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
        promoToken,
        setPromoToken,
        promoType,
        setPromoType,
        quoteId,
        setQuoteId,
        isSpecialOfferFlow,
        isPackageFlow,
        isNormalFlow,
        isPromoTokenFlow,
        resetFlow,
        buildUrl
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
  const { 
    setSource, 
    setOfferId, 
    setPackageId, 
    setClinicId,
    setPromoToken,
    setPromoType,
    setQuoteId
  } = useQuoteFlow();

  const initializeFromUrlParams = () => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const offerIdParam = urlParams.get('offerId');
    const packageIdParam = urlParams.get('packageId');
    const clinicIdParam = urlParams.get('clinicId');
    const sourceParam = urlParams.get('source');
    const promoTokenParam = urlParams.get('promoToken');
    const promoTypeParam = urlParams.get('promoType');
    const quoteIdParam = urlParams.get('quoteId');
    const promoCodeParam = urlParams.get('code');

    console.log('QuoteFlowContext: Initializing from URL params:', {
      offerIdParam,
      packageIdParam,
      clinicIdParam,
      sourceParam,
      promoTokenParam,
      promoTypeParam,
      quoteIdParam,
      promoCodeParam,
      urlSearch: window.location.search
    });
    
    // If quoteId is present in URL, preserve it across the flow
    if (quoteIdParam) {
      console.log('QuoteFlowContext: Setting quote ID from URL:', quoteIdParam);
      setQuoteId(quoteIdParam);
    }

    // First check for promo token flow
    if (sourceParam === 'promo_token' && promoTokenParam) {
      console.log('QuoteFlowContext: Setting promo token flow from source parameter');
      setSource('promo_token');
      setPromoToken(promoTokenParam);
      if (promoTypeParam) setPromoType(promoTypeParam);
      
      // Some promo tokens may also include clinic ID
      if (clinicIdParam) setClinicId(clinicIdParam);
      
      // If the promo type indicates what kind of promotion it is, we can also set the specific IDs
      if (promoTypeParam === 'special_offer' && offerIdParam) {
        setOfferId(offerIdParam);
      } else if (promoTypeParam === 'package' && packageIdParam) {
        setPackageId(packageIdParam);
      }
    }
    // Special case: sourceParam takes precedence if available
    else if (sourceParam === 'package' && packageIdParam) {
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
    }
    // Check for standalone promo token without source parameter
    else if (promoTokenParam) {
      console.log('QuoteFlowContext: Setting promo token flow from token parameter');
      setSource('promo_token');
      setPromoToken(promoTokenParam);
      if (promoTypeParam) setPromoType(promoTypeParam);
      if (clinicIdParam) setClinicId(clinicIdParam);
    } else {
      console.log('QuoteFlowContext: Setting normal flow (no special parameters found)');
      setSource('normal');
    }
    
    // Check session storage as well
    const pendingOffer = sessionStorage.getItem('pendingSpecialOffer');
    const pendingPackage = sessionStorage.getItem('pendingPackage');
    const pendingPromoToken = sessionStorage.getItem('pendingPromoToken');
    
    console.log('QuoteFlowContext: Session storage check:', {
      pendingOffer: pendingOffer ? 'exists' : 'not found',
      pendingPackage: pendingPackage ? 'exists' : 'not found',
      pendingPromoToken: pendingPromoToken ? 'exists' : 'not found'
    });

    // If we have a pending promo token in session storage, use it
    if (pendingPromoToken && !promoTokenParam) {
      try {
        const promoData = JSON.parse(pendingPromoToken);
        console.log('QuoteFlowContext: Found pending promo token data:', promoData);
        
        // Extract data from stored promo data
        setSource('promo_token');
        setPromoToken(promoData.token);
        if (promoData.type) setPromoType(promoData.type);
        if (promoData.clinicId) setClinicId(promoData.clinicId);
        
        // Clear the pending token data
        sessionStorage.removeItem('pendingPromoToken');
      } catch (err) {
        console.error('Error parsing pendingPromoToken:', err);
      }
    }
  };

  return { initializeFromUrlParams };
};