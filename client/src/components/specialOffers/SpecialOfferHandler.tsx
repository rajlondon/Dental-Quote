import React, { useEffect } from 'react';
import { useQuoteFlow } from '@/contexts/QuoteFlowContext';
import { TreatmentItem } from '@/components/TreatmentPlanBuilder';
import { useToast } from '@/hooks/use-toast';

interface SpecialOfferHandlerProps {
  specialOffer?: {
    id: string;
    title: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    clinicId: string;
    applicableTreatment?: string;
  } | null;
  packageData?: {
    id: string;
    title: string;
    clinicId?: string;
  } | null;
  treatmentItems: TreatmentItem[];
  onTreatmentsChange: (treatments: TreatmentItem[]) => void;
}

const SpecialOfferHandler: React.FC<SpecialOfferHandlerProps> = ({
  specialOffer,
  packageData,
  treatmentItems,
  onTreatmentsChange
}) => {
  const { 
    isSpecialOfferFlow, 
    isPackageFlow, 
    isPromoTokenFlow,
    promoToken,
    promoType,
    source
  } = useQuoteFlow();
  const { toast } = useToast();

  // This effect ensures that when the quote flow indicates a special offer,
  // but the treatment items don't reflect it, we add the special offer to the list
  useEffect(() => {
    // Check URL directly for Free Consultation Package
    const urlParams = new URLSearchParams(window.location.search);
    const offerTitle = urlParams.get('offerTitle');
    const isFreeConsultationInUrl = offerTitle?.includes('Consultation') || offerTitle?.includes('consultation');
    
    console.log("⚡ SPECIAL OFFER HANDLER ACTIVATED ⚡");
    console.log("Check for free consultation in URL:", { 
      offerTitle, 
      isFreeConsultationInUrl,
      source: urlParams.get('source'),
      specialOffer: urlParams.get('specialOffer')
    });
    
    // INTERCEPT FREE CONSULTATION: Direct method to handle Free Consultation packages
    if (isFreeConsultationInUrl && !treatmentItems.some(item => item.name?.includes('Consultation'))) {
      console.log("🎯 DIRECT FREE CONSULTATION DETECTION - Creating treatment");
      
      // Create consultation treatment directly from URL params
      const consultationTreatment: TreatmentItem = {
        id: `direct_consultation_${Date.now()}`,
        category: 'consultation',
        name: offerTitle || 'Free Consultation Package',
        quantity: 1,
        priceGBP: 0, // Free = £0
        priceUSD: 0, // Free = $0
        subtotalGBP: 0,
        subtotalUSD: 0,
        guarantee: '30-day',
        isSpecialOffer: true,
        specialOffer: {
          id: urlParams.get('offerId') || 'free-consultation',
          title: offerTitle || 'Free Consultation Package',
          discountType: 'percentage',
          discountValue: 100,
          clinicId: urlParams.get('clinicId') || 'dentakay-istanbul'
        }
      };
      
      console.log("🆓 Adding FREE CONSULTATION to treatment plan:", consultationTreatment);
      onTreatmentsChange([...treatmentItems, consultationTreatment]);
      
      toast({
        title: "Free Consultation Added",
        description: "Your free consultation has been added to your treatment plan.",
      });
      
      // Return early - we've handled this special case
      return;
    }
    
    // Standard flow logging  
    console.log("🔍 SpecialOfferHandler checking for standard offers", {
      isSpecialOfferFlow,
      isPackageFlow,
      isPromoTokenFlow,
      promoToken,
      promoType,
      source,
      treatmentItemsCount: treatmentItems.length,
      hasSpecialOfferItem: treatmentItems.some(item => item.isSpecialOffer || item.isPackage || item.promoToken)
    });

    // Only run standard logic if we have a special offer type flow but no special offer items
    if (
      (isSpecialOfferFlow || isPackageFlow || isPromoTokenFlow) && 
      !treatmentItems.some(item => item.isSpecialOffer || item.isPackage || item.promoToken)
    ) {
      console.log("🛠️ SpecialOfferHandler adding missing special offer to treatment items");
      
      if (isSpecialOfferFlow && specialOffer) {
        // Create a special offer treatment item
        // Get additional parameters from URL to enhance special offer data
        const urlParams = new URLSearchParams(window.location.search);
        
        // Look for all possible parameter name variations
        const treatmentNameFromUrl = urlParams.get('offerTitle') || 
                                    urlParams.get('treatmentName') || 
                                    urlParams.get('promoTitle') ||
                                    urlParams.get('treatment');
                                    
        const discountValueFromUrl = urlParams.get('offerDiscount') || 
                                    urlParams.get('discountValue');
                                    
        const discountTypeFromUrl = urlParams.get('offerDiscountType') || 
                                   urlParams.get('discountType');
        
        console.log("📋 Special offer parameters from URL:", {
          treatmentNameFromUrl,
          discountValueFromUrl,
          discountTypeFromUrl
        });
        
        // Check if this is a Free Consultation Package
        const isFreeConsultation = 
          (treatmentNameFromUrl && (
            treatmentNameFromUrl.includes('Consultation') ||
            treatmentNameFromUrl.includes('consultation') ||
            treatmentNameFromUrl === 'Free Consultation'
          )) ||
          (specialOffer.title && (
            specialOffer.title.includes('Consultation') || 
            specialOffer.title.includes('consultation')
          ));
          
        console.log("🔎 SpecialOfferHandler checking if this is a Free Consultation:", {
          isFreeConsultation,
          treatment: treatmentNameFromUrl,
          title: specialOffer.title
        });
        
        // Set base prices based on offer type
        let basePriceGBP = isFreeConsultation ? 75 : 450;
        let basePriceUSD = isFreeConsultation ? 95 : 580;
        
        // SPECIAL HANDLING FOR FREE CONSULTATION PACKAGE
        if (isFreeConsultation) {
          console.log("🆓 Creating free consultation package item");
          
          // Create the treatment with consultation-specific values
          const consultationTreatment: TreatmentItem = {
            id: `consultation_${Date.now()}`,
            category: 'consultation',
            name: treatmentNameFromUrl || specialOffer.title || 'Free Consultation',
            quantity: 1,
            priceGBP: basePriceGBP,
            priceUSD: basePriceUSD,
            subtotalGBP: basePriceGBP,
            subtotalUSD: basePriceUSD,
            guarantee: '30-day',
            isSpecialOffer: true,
            specialOffer: {
              id: specialOffer.id,
              title: specialOffer.title || 'Free Consultation Package',
              discountType: 'percentage',
              discountValue: 100, // Force 100% discount for free consultation
              clinicId: specialOffer.clinicId || 'dentakay-istanbul' // Use a fallback clinic
            }
          };
          
          // Set price to 0 for free consultation
          consultationTreatment.priceGBP = 0;
          consultationTreatment.priceUSD = 0;
          consultationTreatment.subtotalGBP = 0;
          consultationTreatment.subtotalUSD = 0;
          
          console.log("📋 SpecialOfferHandler adding free consultation to treatment items:", consultationTreatment);
          onTreatmentsChange([...treatmentItems, consultationTreatment]);
          
          toast({
            title: "Free Consultation Added",
            description: `Your free consultation has been added to your treatment plan.`,
          });
          
          // Early return since we've handled this special case
          return;
        }
        
        // Standard special offer treatment (not free consultation)
        const specialOfferTreatment: TreatmentItem = {
          id: `special_offer_${Date.now()}`,
          category: 'special_offer',
          name: treatmentNameFromUrl || 
                `${specialOffer.title || 'Special Offer'} - ${specialOffer.applicableTreatment || 'Dental Treatment'}`,
          quantity: 1,
          priceGBP: basePriceGBP,
          priceUSD: basePriceUSD,
          subtotalGBP: basePriceGBP,
          subtotalUSD: basePriceUSD,
          guarantee: '5-year',
          isSpecialOffer: true,
          specialOffer: {
            id: specialOffer.id,
            title: specialOffer.title,
            // Use URL params if available, otherwise fallback to specialOffer object
            discountType: discountTypeFromUrl as 'percentage' | 'fixed_amount' || specialOffer.discountType,
            discountValue: discountValueFromUrl ? parseFloat(discountValueFromUrl) : specialOffer.discountValue,
            clinicId: specialOffer.clinicId || 'dentakay-istanbul'
          }
        };
        
        // Use discount values from URL if available, otherwise from specialOffer object
        const discountType = discountTypeFromUrl || specialOffer.discountType;
        const discountValue = discountValueFromUrl ? parseFloat(discountValueFromUrl) : specialOffer.discountValue;
        
        // Apply the discount based on type
        if (discountType === 'percentage') {
          const discountMultiplier = (100 - discountValue) / 100;
          specialOfferTreatment.priceGBP = Math.round(specialOfferTreatment.priceGBP * discountMultiplier);
          specialOfferTreatment.priceUSD = Math.round(specialOfferTreatment.priceUSD * discountMultiplier);
          specialOfferTreatment.subtotalGBP = specialOfferTreatment.priceGBP * specialOfferTreatment.quantity;
          specialOfferTreatment.subtotalUSD = specialOfferTreatment.priceUSD * specialOfferTreatment.quantity;
        } else if (discountType === 'fixed_amount' || discountType === 'fixed') {
          specialOfferTreatment.priceGBP = Math.max(0, specialOfferTreatment.priceGBP - discountValue);
          specialOfferTreatment.priceUSD = Math.max(0, specialOfferTreatment.priceUSD - Math.round(discountValue * 1.28)); // Convert GBP to USD
          specialOfferTreatment.subtotalGBP = specialOfferTreatment.priceGBP * specialOfferTreatment.quantity;
          specialOfferTreatment.subtotalUSD = specialOfferTreatment.priceUSD * specialOfferTreatment.quantity;
        }
        
        console.log("📋 Applied discount to special offer:", {
          discountType,
          discountValue,
          originalPriceGBP: 450,
          discountedPriceGBP: specialOfferTreatment.priceGBP
        });
        
        console.log("📋 SpecialOfferHandler adding special offer to treatment items:", specialOfferTreatment);
        onTreatmentsChange([...treatmentItems, specialOfferTreatment]);
        
        toast({
          title: "Special Offer Added",
          description: `${specialOffer.title} has been added to your treatment plan.`,
        });
      } 
      else if (isPackageFlow && packageData) {
        // Create a package treatment item
        const packageTreatment: TreatmentItem = {
          id: `package_${Date.now()}`,
          category: 'packages',
          name: packageData.title || 'Treatment Package',
          quantity: 1,
          priceGBP: 1200, // Default package price, would be fetched from API
          priceUSD: 1550, // Default package price in USD
          subtotalGBP: 1200,
          subtotalUSD: 1550,
          guarantee: '5-year',
          isPackage: true,
          packageId: packageData.id
        };
        
        console.log("📋 SpecialOfferHandler adding package to treatment items:", packageTreatment);
        onTreatmentsChange([...treatmentItems, packageTreatment]);
        
        toast({
          title: "Package Added",
          description: `${packageData.title} has been added to your treatment plan.`,
        });
      }
      else if (isPromoTokenFlow && promoToken) {
        // Use URL search parameters to get additional info
        const urlParams = new URLSearchParams(window.location.search);
        const treatmentName = urlParams.get('treatmentName') || 'Dental Treatment';
        const promoTitle = urlParams.get('promoTitle') || 'Special Promotion';
        
        // Create a promo token treatment item with safe promoType handling
        const safePromoType = promoType === 'package' ? 'package' : 'special_offer';
        
        const promoTreatment: TreatmentItem = {
          id: `promo_${Date.now()}`,
          category: safePromoType === 'package' ? 'packages' : 'special_offer',
          name: `${safePromoType === 'package' ? 'Package: ' : 'Special Offer: '}${promoTitle}`,
          quantity: 1,
          priceGBP: 450, // Base price
          priceUSD: 580, // Base price
          subtotalGBP: 450,
          subtotalUSD: 580,
          guarantee: '5-year',
          isSpecialOffer: safePromoType === 'special_offer',
          isPackage: safePromoType === 'package',
          promoToken: promoToken,
          promoType: safePromoType
        };
        
        console.log("📋 SpecialOfferHandler adding promo token treatment:", promoTreatment);
        onTreatmentsChange([...treatmentItems, promoTreatment]);
        
        toast({
          title: "Promotion Added",
          description: `Your promotion has been added to your treatment plan.`,
        });
      }
    }
  }, [
    isSpecialOfferFlow, 
    isPackageFlow, 
    isPromoTokenFlow, 
    specialOffer, 
    packageData, 
    promoToken,
    promoType,
    treatmentItems,
    onTreatmentsChange
  ]);

  // This component doesn't render anything visible
  return null;
};

export default SpecialOfferHandler;