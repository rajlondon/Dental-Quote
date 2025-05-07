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
    console.log("🔍 SpecialOfferHandler checking for offers", {
      isSpecialOfferFlow,
      isPackageFlow,
      isPromoTokenFlow,
      promoToken,
      promoType,
      source,
      treatmentItemsCount: treatmentItems.length,
      hasSpecialOfferItem: treatmentItems.some(item => item.isSpecialOffer || item.isPackage || item.promoToken)
    });

    // Only run logic if we have a special offer type flow but no special offer items
    if (
      (isSpecialOfferFlow || isPackageFlow || isPromoTokenFlow) && 
      !treatmentItems.some(item => item.isSpecialOffer || item.isPackage || item.promoToken)
    ) {
      console.log("🛠️ SpecialOfferHandler adding missing special offer to treatment items");
      
      if (isSpecialOfferFlow && specialOffer) {
        // Create a special offer treatment item
        // Get additional parameters from URL to enhance special offer data
        const urlParams = new URLSearchParams(window.location.search);
        const treatmentNameFromUrl = urlParams.get('treatmentName') || urlParams.get('offerTitle');
        const discountValueFromUrl = urlParams.get('discountValue');
        const discountTypeFromUrl = urlParams.get('discountType');
        
        console.log("📋 Special offer parameters from URL:", {
          treatmentNameFromUrl,
          discountValueFromUrl,
          discountTypeFromUrl
        });
        
        const specialOfferTreatment: TreatmentItem = {
          id: `special_offer_${Date.now()}`,
          category: 'special_offer',
          name: treatmentNameFromUrl || 
                `${specialOffer.title || 'Special Offer'} - ${specialOffer.applicableTreatment || 'Dental Treatment'}`,
          quantity: 1,
          priceGBP: 450, // Base price, will be discounted later
          priceUSD: 580, // Base price, will be discounted later
          subtotalGBP: 450,
          subtotalUSD: 580,
          guarantee: '5-year',
          isSpecialOffer: true,
          specialOffer: {
            id: specialOffer.id,
            title: specialOffer.title,
            // Use URL params if available, otherwise fallback to specialOffer object
            discountType: discountTypeFromUrl as 'percentage' | 'fixed_amount' || specialOffer.discountType,
            discountValue: discountValueFromUrl ? parseFloat(discountValueFromUrl) : specialOffer.discountValue,
            clinicId: specialOffer.clinicId
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