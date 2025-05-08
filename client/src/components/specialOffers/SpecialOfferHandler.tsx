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
        isLocked: true,
        isBonus: true,
        hasDiscount: true,
        discountPercent: 100,
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
            priceGBP: 0, // Always 0 for free consultation
            priceUSD: 0, // Always 0 for free consultation
            subtotalGBP: 0,
            subtotalUSD: 0,
            guarantee: '30-day',
            isSpecialOffer: true,
            isLocked: true, // Lock this treatment as it's part of a special offer
            basePriceGBP: basePriceGBP, // Store original price for display
            basePriceUSD: basePriceUSD, // Store original price for display
            hasDiscount: true, // Flag for UI rendering
            discountPercent: 100, // 100% discount
            originalPrice: basePriceGBP, // For display purposes
            discountedPrice: 0, // For display purposes
            specialOffer: {
              id: specialOffer.id,
              title: specialOffer.title || 'Free Consultation Package',
              discountType: 'percentage',
              discountValue: 100, // Force 100% discount for free consultation
              clinicId: specialOffer.clinicId || 'dentakay-istanbul' // Use a fallback clinic
            }
          };
          
          console.log("📋 SpecialOfferHandler adding free consultation to treatment items:", consultationTreatment);
          onTreatmentsChange([...treatmentItems, consultationTreatment]);
          
          toast({
            title: "Special Offer Added",
            description: `Your free consultation has been added to your treatment plan.`,
          });
          
          // Early return since we've handled this special case
          return;
        }
        
        // Standard special offer treatment (not free consultation)
        // Use discount values from URL if available, otherwise from specialOffer object
        const discountType = discountTypeFromUrl || specialOffer.discountType;
        const discountValue = discountValueFromUrl ? parseFloat(discountValueFromUrl) : specialOffer.discountValue;
        
        // According to tech spec, special offers should be added as £0.00 bonus line items
        // Create special offer treatment per tech spec as a £0.00 line item
        const specialOfferName = treatmentNameFromUrl || 
          `${specialOffer.title || 'Special Offer'} - ${specialOffer.applicableTreatment || 'Dental Treatment'}`;
        
        // According to tech spec section 6 (PromoEngine.ts)
        // For 'offer' type, we create a bonus line item with unitPriceGbp: 0
        const specialOfferTreatment: TreatmentItem = {
          id: `special_offer_${Date.now()}`,
          category: 'special_offer',
          name: specialOfferName,
          quantity: 1,
          priceGBP: 0,  // Special offers are £0.00 line items per tech spec
          priceUSD: 0,  // Special offers are $0.00 line items per tech spec
          subtotalGBP: 0,
          subtotalUSD: 0,
          guarantee: '5-year',
          isSpecialOffer: true,
          isLocked: true, // Lock this treatment as it's part of a special offer
          isBonus: true,  // Mark as bonus item per tech spec
          basePriceGBP: basePriceGBP, // Store original price for display/reference
          basePriceUSD: basePriceUSD, // Store original price for display/reference
          hasDiscount: true, // Flag for UI rendering
          discountPercent: discountType === 'percentage' ? discountValue : Math.round((discountValue / basePriceGBP) * 100),
          originalPrice: basePriceGBP, // For display purposes
          discountedPrice: 0, // Always 0 for special offers
          specialOffer: {
            id: specialOffer.id,
            title: specialOffer.title,
            // Use URL params if available, otherwise fallback to specialOffer object
            discountType: discountTypeFromUrl as 'percentage' | 'fixed_amount' || specialOffer.discountType,
            discountValue: discountValueFromUrl ? parseFloat(discountValueFromUrl) : specialOffer.discountValue,
            clinicId: specialOffer.clinicId || 'dentakay-istanbul'
          }
        };
        
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
        const discountTypeFromUrl = urlParams.get('discountType') || 'percentage';
        const discountValueFromUrl = urlParams.get('discountValue') || '20';
        
        // Create a promo token treatment item with safe promoType handling
        const safePromoType = promoType === 'package' ? 'package' : 'special_offer';
        
        // Base price for the promo
        const basePriceGBP = 450;
        const basePriceUSD = 580;
        
        let promoTreatment: TreatmentItem;
        
        // For special offers, create a £0.00 line item per tech spec
        if (safePromoType === 'special_offer') {
          promoTreatment = {
            id: `promo_${Date.now()}`,
            category: 'special_offer',
            name: `Special Offer: ${promoTitle}`,
            quantity: 1,
            priceGBP: 0,  // Special offers are £0.00 line items
            priceUSD: 0,  // Special offers are $0.00 line items
            subtotalGBP: 0,
            subtotalUSD: 0,
            guarantee: '5-year',
            isSpecialOffer: true,
            isLocked: true, // Lock this treatment as it's part of a special offer
            isBonus: true,  // Mark as bonus item per tech spec
            hasDiscount: true, // Flag for UI rendering
            discountPercent: parseFloat(discountValueFromUrl), // Use discountValue from URL
            specialOffer: {
              id: promoToken, // Use token as ID
              title: promoTitle,
              discountType: discountTypeFromUrl as 'percentage' | 'fixed_amount',
              discountValue: parseFloat(discountValueFromUrl),
              clinicId: urlParams.get('clinicId') || '1'
            },
            promoToken: promoToken,
            promoType: safePromoType
          };
        } 
        // For packages, create a regular line item (not £0.00)
        else {
          promoTreatment = {
            id: `promo_${Date.now()}`,
            category: 'packages',
            name: `Package: ${promoTitle}`,
            quantity: 1,
            priceGBP: basePriceGBP, 
            priceUSD: basePriceUSD,
            subtotalGBP: basePriceGBP,
            subtotalUSD: basePriceUSD,
            guarantee: '5-year',
            isPackage: true,
            isLocked: true,
            promoToken: promoToken,
            promoType: safePromoType
          };
        }
        
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