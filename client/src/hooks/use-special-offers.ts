import { useState, useEffect, useCallback } from 'react';
import { TreatmentItem } from '@/components/TreatmentPlanBuilder';
import { useToast } from '@/hooks/use-toast';
import specialOffersService, { SpecialOffer } from '@/services/SpecialOffersService';

/**
 * Hook for managing special offers and promotions
 * This centralizes all special offer logic in one place
 */
export function useSpecialOffers() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Parse special offer data from URL params
  const {
    isSpecialOffer,
    offerData,
    isPackage,
    packageData,
    isPromoFlow,
    promoToken,
    promoType
  } = specialOffersService.parseSpecialOfferFromUrl();
  
  // Track whether offers have been processed
  const [offersProcessed, setOffersProcessed] = useState(false);
  
  /**
   * Process special offers and add to treatments if needed
   */
  const processSpecialOffers = useCallback((currentTreatments: TreatmentItem[]): TreatmentItem[] => {
    // Skip if already processed
    if (offersProcessed) return currentTreatments;
    
    setIsLoading(true);
    let updatedTreatments = [...currentTreatments];
    
    try {
      // Check if we need to add a free consultation
      if (specialOffersService.shouldAddFreeConsultation() && 
          !currentTreatments.some(item => item.name?.includes('Consultation'))) {
        const urlParams = new URLSearchParams(window.location.search);
        const offerTitle = urlParams.get('offerTitle') || 'Free Consultation Package';
        const offerId = urlParams.get('offerId') || 'free-consultation';
        const clinicId = urlParams.get('clinicId') || urlParams.get('offerClinic') || '1';
        
        const consultationTreatment = specialOffersService.createConsultationTreatment(
          offerTitle, true, 75, 95, offerId, clinicId
        );
        
        updatedTreatments.push(consultationTreatment);
        
        toast({
          title: "Free Consultation Added",
          description: "Your free consultation has been added to your treatment plan.",
        });
      }
      
      // Check for special offers  
      else if (isSpecialOffer && offerData && 
               !currentTreatments.some(item => item.isSpecialOffer || item.promoToken)) {
        const specialOfferTreatment = specialOffersService.createSpecialOfferTreatment(
          offerData
        );
        
        updatedTreatments.push(specialOfferTreatment);
        
        toast({
          title: "Special Offer Added",
          description: `${offerData.title} has been added to your treatment plan.`,
        });
      }
      
      // Check for packages
      else if (isPackage && packageData && 
               !currentTreatments.some(item => item.isPackage)) {
        const packageTreatment = specialOffersService.createPackageTreatment(
          packageData.title, 1200, 1550, packageData.id
        );
        
        updatedTreatments.push(packageTreatment);
        
        toast({
          title: "Package Added",
          description: `${packageData.title} has been added to your treatment plan.`,
        });
      }
      
      // Check for promo tokens
      else if (isPromoFlow && promoToken &&
               !currentTreatments.some(item => item.promoToken)) {
        const urlParams = new URLSearchParams(window.location.search);
        const promoTitle = urlParams.get('promoTitle') || 'Special Promotion';
        const discountType = urlParams.get('discountType') || 'percentage';
        const discountValue = parseFloat(urlParams.get('discountValue') || '20');
        const clinicId = urlParams.get('clinicId') || '1';
        
        const promoTreatment = specialOffersService.createPromoTokenTreatment(
          promoToken,
          promoType || 'special_offer',
          promoTitle,
          450,
          580,
          discountType as 'percentage' | 'fixed_amount',
          discountValue,
          clinicId
        );
        
        updatedTreatments.push(promoTreatment);
        
        toast({
          title: "Promotion Added",
          description: `Your promotion has been added to your treatment plan.`,
        });
      }
      
      // Mark as processed
      setOffersProcessed(true);
    } catch (error) {
      console.error("Error processing special offers:", error);
    } finally {
      setIsLoading(false);
    }
    
    return updatedTreatments;
  }, [offersProcessed, isSpecialOffer, offerData, isPackage, packageData, isPromoFlow, promoToken, promoType, toast]);
  
  /**
   * Add a specific offer to treatments
   */
  const addSpecialOfferToTreatments = useCallback((
    currentTreatments: TreatmentItem[],
    offer: SpecialOffer
  ): TreatmentItem[] => {
    return specialOffersService.applySpecialOfferToTreatments(currentTreatments, offer);
  }, []);

  /**
   * Check if a TreatmentItem has a special offer
   */
  const hasSpecialOffer = useCallback((treatment: TreatmentItem): boolean => {
    return Boolean(treatment.isSpecialOffer || treatment.specialOffer || 
                  (treatment.promoToken && treatment.promoType === 'special_offer'));
  }, []);
  
  /**
   * Check if a TreatmentItem is part of a package
   */
  const isPackageTreatment = useCallback((treatment: TreatmentItem): boolean => {
    return Boolean(treatment.isPackage || 
                  (treatment.promoToken && treatment.promoType === 'package'));
  }, []);

  return {
    // Flow state
    isSpecialOfferFlow: isSpecialOffer,
    isPackageFlow: isPackage,
    isPromoTokenFlow: isPromoFlow,
    offersProcessed,
    isLoading,
    
    // Data
    specialOffer: offerData,
    packageData,
    promoToken,
    promoType,
    
    // Methods
    processSpecialOffers,
    addSpecialOfferToTreatments,
    hasSpecialOffer,
    isPackageTreatment,
    
    // Factory methods
    createSpecialOfferTreatment: specialOffersService.createSpecialOfferTreatment,
    createConsultationTreatment: specialOffersService.createConsultationTreatment,
    createPackageTreatment: specialOffersService.createPackageTreatment,
    createPromoTokenTreatment: specialOffersService.createPromoTokenTreatment
  };
}