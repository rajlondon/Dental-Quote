import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TreatmentItem } from '@/components/TreatmentPlanBuilder';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import specialOffersService from '@/services/SpecialOffersService';

// Types for the quote flow
export type QuoteStep = 'start' | 'info' | 'details' | 'confirm';

export interface PatientData {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  message?: string;
  preferredDate?: string;
  consentToContact?: boolean;
}

export interface ClinicData {
  id: string | number;
  name: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  accreditations?: string[];
  specialties?: string[];
  imageUrl?: string;
  logoUrl?: string;
}

// Context type definition
export interface EnhancedQuoteFlowContextType {
  // State
  currentStep: QuoteStep;
  patientData: PatientData | null;
  treatmentData: TreatmentItem[];
  selectedClinic: ClinicData | null;
  isLoading: boolean;
  isQuoteInitialized: boolean;
  
  // Special offer related
  isSpecialOfferFlow: boolean;
  isPackageFlow: boolean;
  isPromoTokenFlow: boolean;
  specialOffer: any;
  packageData: any;
  
  // Methods
  setPatientData: (data: PatientData) => void;
  setTreatmentData: (treatments: TreatmentItem[]) => void;
  setSelectedClinic: (clinic: ClinicData | null) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: QuoteStep) => void;
  resetQuoteFlow: () => void;
  initializeQuoteFlow: (options: { 
    queryParams?: URLSearchParams, 
    onSuccess?: () => void,
    onError?: (error: Error) => void
  }) => void;
  
  // Special offer methods
  processSpecialOffers: (currentTreatments: TreatmentItem[]) => TreatmentItem[];
}

// Create the context
const EnhancedQuoteFlowContext = createContext<EnhancedQuoteFlowContextType | null>(null);

// Provider component
export const EnhancedQuoteFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Quote flow state
  const [currentStep, setCurrentStep] = useState<QuoteStep>('start');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [treatmentData, setTreatmentData] = useState<TreatmentItem[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<ClinicData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuoteInitialized, setIsQuoteInitialized] = useState<boolean>(false);
  
  // Special offer state
  const [isSpecialOfferFlow, setIsSpecialOfferFlow] = useState<boolean>(false);
  const [isPackageFlow, setIsPackageFlow] = useState<boolean>(false);
  const [isPromoTokenFlow, setIsPromoTokenFlow] = useState<boolean>(false);
  const [specialOffer, setSpecialOffer] = useState<any>(null);
  const [packageData, setPackageData] = useState<any>(null);
  const [promoToken, setPromoToken] = useState<string | null>(null);
  const [promoType, setPromoType] = useState<'special_offer' | 'package' | null>(null);
  
  // Navigation methods
  const goToNextStep = useCallback(() => {
    setCurrentStep((prevStep) => {
      switch (prevStep) {
        case 'start':
          return 'info';
        case 'info':
          return 'details';
        case 'details':
          return 'confirm';
        default:
          return prevStep;
      }
    });
  }, []);
  
  const goToPreviousStep = useCallback(() => {
    setCurrentStep((prevStep) => {
      switch (prevStep) {
        case 'confirm':
          return 'details';
        case 'details':
          return 'info';
        case 'info':
          return 'start';
        default:
          return prevStep;
      }
    });
  }, []);
  
  const goToStep = useCallback((step: QuoteStep) => {
    setCurrentStep(step);
  }, []);
  
  // Reset the quote flow
  const resetQuoteFlow = useCallback(() => {
    setCurrentStep('start');
    setPatientData(null);
    setTreatmentData([]);
    setSelectedClinic(null);
    setIsQuoteInitialized(false);
    setIsSpecialOfferFlow(false);
    setIsPackageFlow(false);
    setIsPromoTokenFlow(false);
    setSpecialOffer(null);
    setPackageData(null);
    setPromoToken(null);
    setPromoType(null);
  }, []);
  
  // Initialize quote flow from URL parameters
  const initializeQuoteFlow = useCallback(({ 
    queryParams = new URLSearchParams(window.location.search),
    onSuccess,
    onError
  }) => {
    setIsLoading(true);
    
    try {
      // Parse step from URL
      const step = queryParams.get('step') as QuoteStep;
      if (step && ['start', 'info', 'details', 'confirm'].includes(step)) {
        setCurrentStep(step);
      }
      
      // Extract clinic data
      const clinicId = queryParams.get('clinicId') || queryParams.get('offerClinic');
      if (clinicId) {
        // Fetch clinic data
        apiRequest('GET', `/api/clinics/${clinicId}`)
          .then(response => response.json())
          .then(clinicData => {
            if (clinicData) {
              setSelectedClinic(clinicData);
            }
          })
          .catch(error => {
            console.error('Error fetching clinic data:', error);
            if (onError) onError(error);
          });
      }
      
      // Check for special offer flow
      const source = queryParams.get('source');
      const offerId = queryParams.get('offerId') || queryParams.get('specialOffer');
      
      if (source === 'special_offer' && offerId) {
        setIsSpecialOfferFlow(true);
        const offerTitle = queryParams.get('offerTitle');
        const discountType = queryParams.get('offerDiscountType') || queryParams.get('discountType') || 'percentage';
        const discountValue = parseFloat(queryParams.get('offerDiscount') || queryParams.get('discountValue') || '0');
        const clinicIdFromOffer = queryParams.get('clinicId') || queryParams.get('offerClinic');
        
        setSpecialOffer({
          id: offerId,
          title: offerTitle || 'Special Offer',
          discountType: discountType as 'percentage' | 'fixed_amount',
          discountValue: discountValue,
          clinicId: clinicIdFromOffer || '1'
        });
      }
      
      // Check for package flow
      if (source === 'package') {
        setIsPackageFlow(true);
        const packageId = queryParams.get('packageId');
        const packageTitle = queryParams.get('packageTitle');
        const clinicIdFromPackage = queryParams.get('clinicId');
        
        setPackageData({
          id: packageId || 'unknown',
          title: packageTitle || 'Treatment Package',
          clinicId: clinicIdFromPackage
        });
      }
      
      // Check for promo token flow
      if (source === 'promo_token') {
        setIsPromoTokenFlow(true);
        const token = queryParams.get('promoToken');
        const type = queryParams.get('promoType') as 'special_offer' | 'package';
        
        if (token) {
          setPromoToken(token);
          setPromoType(type || 'special_offer');
        }
      }
      
      setIsQuoteInitialized(true);
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error initializing quote flow:', error);
      toast({
        title: 'Error',
        description: 'There was an error initializing your quote. Please try again.',
        variant: 'destructive'
      });
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Process special offers
  const processSpecialOffers = useCallback((currentTreatments: TreatmentItem[]): TreatmentItem[] => {
    try {
      // If there's a special offer, add it to the treatments
      if (isSpecialOfferFlow && specialOffer && !currentTreatments.some(t => t.isSpecialOffer)) {
        const offerTreatment = specialOffersService.createSpecialOfferTreatment(specialOffer);
        return [...currentTreatments, offerTreatment];
      }
      
      // If there's a package, add it to the treatments
      if (isPackageFlow && packageData && !currentTreatments.some(t => t.isPackage)) {
        const packageTreatment = specialOffersService.createPackageTreatment(
          packageData.title,
          1200, // Default price
          1550, // Default USD price
          packageData.id
        );
        return [...currentTreatments, packageTreatment];
      }
      
      // If there's a promo token, add the corresponding treatment
      if (isPromoTokenFlow && promoToken && !currentTreatments.some(t => t.promoToken)) {
        const urlParams = new URLSearchParams(window.location.search);
        const promoTitle = urlParams.get('promoTitle') || 'Special Promotion';
        const discountType = urlParams.get('discountType') || 'percentage';
        const discountValue = parseFloat(urlParams.get('discountValue') || '20');
        const clinicId = urlParams.get('clinicId') || '1';
        
        const promoTreatment = specialOffersService.createPromoTokenTreatment(
          promoToken,
          promoType || 'special_offer',
          promoTitle,
          450, // Default base price
          580, // Default base USD price
          discountType as 'percentage' | 'fixed_amount',
          discountValue,
          clinicId
        );
        return [...currentTreatments, promoTreatment];
      }
    } catch (error) {
      console.error('Error processing special offers:', error);
    }
    
    return currentTreatments;
  }, [isSpecialOfferFlow, specialOffer, isPackageFlow, packageData, isPromoTokenFlow, promoToken, promoType]);
  
  // Context value
  const contextValue: EnhancedQuoteFlowContextType = {
    // State
    currentStep,
    patientData,
    treatmentData,
    selectedClinic,
    isLoading,
    isQuoteInitialized,
    
    // Special offer related
    isSpecialOfferFlow,
    isPackageFlow,
    isPromoTokenFlow,
    specialOffer,
    packageData,
    
    // Methods
    setPatientData,
    setTreatmentData,
    setSelectedClinic,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    resetQuoteFlow,
    initializeQuoteFlow,
    
    // Special offer methods
    processSpecialOffers
  };
  
  return (
    <EnhancedQuoteFlowContext.Provider value={contextValue}>
      {children}
    </EnhancedQuoteFlowContext.Provider>
  );
};

// Hook to use the context
export const useEnhancedQuoteFlow = () => {
  const context = useContext(EnhancedQuoteFlowContext);
  if (!context) {
    throw new Error('useEnhancedQuoteFlow must be used within an EnhancedQuoteFlowProvider');
  }
  return context;
};

export default EnhancedQuoteFlowContext;