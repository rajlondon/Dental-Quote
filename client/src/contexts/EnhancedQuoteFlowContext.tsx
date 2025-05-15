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

// Define interface for initializing quote flow parameters
export interface InitializeQuoteFlowOptions {
  queryParams?: URLSearchParams;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
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
  initializeQuoteFlow: (options: InitializeQuoteFlowOptions) => void;
  
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
  const initializeQuoteFlow = useCallback((options: InitializeQuoteFlowOptions) => {
    const { 
      queryParams = new URLSearchParams(window.location.search),
      onSuccess,
      onError 
    } = options;
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
      
      // Check for package flow - Either through source param or direct packageId
      const packageId = queryParams.get('packageId');
      if (source === 'package' || packageId) {
        console.log('📦 Package flow detected with ID:', packageId);
        setIsPackageFlow(true);
        
        const packageTitle = queryParams.get('packageTitle');
        const clinicIdFromPackage = queryParams.get('clinicId');
        
        // Log to help troubleshoot package selection
        if (!packageId) {
          console.warn('⚠️ Package flow detected but no packageId provided');
        }
        
        setPackageData({
          id: packageId || 'unknown',
          title: packageTitle || 'Treatment Package',
          clinicId: clinicIdFromPackage,
          // Add timestamp to help track package initialization
          initTimestamp: Date.now()
        });
        
        // Show a toast notification to confirm package detection
        toast({
          title: 'Package Selected',
          description: `Initialized quote with package: ${packageId || 'unknown'}`,
          duration: 3000,
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
      // Safe way to handle the error type - TypeScript doesn't recognize the instanceof guard 
      // in this context, so we use a type assertion
      if (onError) onError(error as Error);
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
      
      // If there's a package, add it to the treatments with enhanced logging
      if (isPackageFlow && packageData && !currentTreatments.some(t => t.isPackage)) {
        console.log('🔍 Processing package data for treatment:', packageData);
        
        // Fetch package details from the API based on ID if available
        try {
          // For demonstration purposes, get some package price data based on the ID
          let packagePrice = 0;
          let packagePriceUSD = 0;
          
          // Map some prices based on our known package IDs
          if (packageData.id === 'pkg-001') {
            packagePrice = 1200;
            packagePriceUSD = 1550;
          } else if (packageData.id === 'pkg-002') {
            packagePrice = 2400;
            packagePriceUSD = 3100;
          } else if (packageData.id === 'pkg-003') {
            packagePrice = 7500;
            packagePriceUSD = 9700;
          } else {
            // Default values for unknown packages
            packagePrice = 1500;
            packagePriceUSD = 1950;
          }
          
          const packageTreatment = specialOffersService.createPackageTreatment(
            packageData.title,
            packagePrice,
            packagePriceUSD,
            packageData.id
          );
          
          console.log('✅ Successfully created package treatment:', packageTreatment);
          return [...currentTreatments, packageTreatment];
        } catch (error) {
          console.error('❌ Error creating package treatment:', error);
          
          // Fallback to ensure a package treatment is added even on error
          const packageTreatment = specialOffersService.createPackageTreatment(
            packageData.title || 'Treatment Package',
            1200, // Default price
            1550, // Default USD price
            packageData.id || 'unknown-package'
          );
          
          return [...currentTreatments, packageTreatment];
        }
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