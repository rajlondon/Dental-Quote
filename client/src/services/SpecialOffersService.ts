import { TreatmentItem } from '@/components/TreatmentPlanBuilder';

// Define types for various special offer formats
export type SpecialOfferType = 'percentage' | 'fixed_amount' | 'free_item' | 'package';

export interface SpecialOffer {
  id: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  clinicId: string;
  applicableTreatment?: string;
  imageUrl?: string;
}

export interface PromotionalPackage {
  id: string;
  title: string;
  description?: string;
  clinicId: string;
  treatments: TreatmentItem[];
  imageUrl?: string;
}

export interface PromoToken {
  token: string;
  promoType: 'special_offer' | 'package';
  offerId: string;
  clinicId: string;
  metadata?: Record<string, any>;
}

/**
 * Central service for managing special offers, packages, and promotional flows
 */
export class SpecialOffersService {
  /**
   * Creates a special offer treatment item (£0.00 bonus item)
   */
  createSpecialOfferTreatment(
    offer: SpecialOffer, 
    basePriceGBP: number = 450, 
    basePriceUSD: number = 580,
    customName?: string
  ): TreatmentItem {
    return {
      id: `special_offer_${Date.now()}`,
      category: 'special_offer',
      name: customName || `${offer.title || 'Special Offer'} - ${offer.applicableTreatment || 'Dental Treatment'}`,
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
      discountPercent: offer.discountType === 'percentage' 
        ? offer.discountValue 
        : Math.round((offer.discountValue / basePriceGBP) * 100),
      originalPrice: basePriceGBP, // For display purposes
      discountedPrice: 0, // Always 0 for special offers
      specialOffer: {
        id: offer.id,
        title: offer.title,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        clinicId: offer.clinicId
      }
    };
  }

  /**
   * Creates a consultation item (free or paid)
   */
  createConsultationTreatment(
    title: string = 'Free Consultation',
    isFree: boolean = true,
    basePriceGBP: number = 75,
    basePriceUSD: number = 95,
    offerId: string = 'free-consultation',
    clinicId: string = '1'
  ): TreatmentItem {
    return {
      id: `consultation_${Date.now()}`,
      category: 'consultation',
      name: title,
      quantity: 1,
      priceGBP: isFree ? 0 : basePriceGBP, 
      priceUSD: isFree ? 0 : basePriceUSD,
      subtotalGBP: isFree ? 0 : basePriceGBP,
      subtotalUSD: isFree ? 0 : basePriceUSD,
      guarantee: '30-day',
      isSpecialOffer: isFree,
      isLocked: isFree,
      isBonus: isFree,
      basePriceGBP: basePriceGBP,
      basePriceUSD: basePriceUSD,
      hasDiscount: isFree,
      discountPercent: isFree ? 100 : 0,
      originalPrice: basePriceGBP,
      discountedPrice: isFree ? 0 : basePriceGBP,
      specialOffer: isFree ? {
        id: offerId,
        title: title,
        discountType: 'percentage',
        discountValue: 100,
        clinicId: clinicId
      } : undefined
    };
  }

  /**
   * Creates a package treatment item 
   */
  createPackageTreatment(
    title: string = 'Treatment Package',
    priceGBP: number = 1200,
    priceUSD: number = 1550,
    packageId: string = 'default-package'
  ): TreatmentItem {
    return {
      id: `package_${Date.now()}`,
      category: 'packages',
      name: title,
      quantity: 1,
      priceGBP: priceGBP,
      priceUSD: priceUSD,
      subtotalGBP: priceGBP,
      subtotalUSD: priceUSD,
      guarantee: '5-year',
      isPackage: true,
      isLocked: true,
      packageId: packageId
    };
  }

  /**
   * Creates a promo token treatment item
   */
  createPromoTokenTreatment(
    token: string,
    promoType: 'special_offer' | 'package',
    title: string = 'Special Promotion',
    basePriceGBP: number = 450,
    basePriceUSD: number = 580,
    discountType: 'percentage' | 'fixed_amount' = 'percentage',
    discountValue: number = 20,
    clinicId: string = '1'
  ): TreatmentItem {
    if (promoType === 'special_offer') {
      return {
        id: `promo_${Date.now()}`,
        category: 'special_offer',
        name: `Special Offer: ${title}`,
        quantity: 1,
        priceGBP: 0,
        priceUSD: 0,
        subtotalGBP: 0,
        subtotalUSD: 0,
        guarantee: '5-year',
        isSpecialOffer: true,
        isLocked: true,
        isBonus: true,
        hasDiscount: true,
        discountPercent: discountType === 'percentage' 
          ? discountValue
          : Math.round((discountValue / basePriceGBP) * 100),
        basePriceGBP,
        basePriceUSD,
        specialOffer: {
          id: token,
          title,
          discountType,
          discountValue,
          clinicId
        },
        promoToken: token,
        promoType
      };
    } else {
      return {
        id: `promo_${Date.now()}`,
        category: 'packages',
        name: `Package: ${title}`,
        quantity: 1,
        priceGBP: basePriceGBP,
        priceUSD: basePriceUSD,
        subtotalGBP: basePriceGBP,
        subtotalUSD: basePriceUSD,
        guarantee: '5-year',
        isPackage: true,
        isLocked: true,
        promoToken: token,
        promoType
      };
    }
  }

  /**
   * Applies a special offer to a list of treatments
   */
  applySpecialOfferToTreatments(
    treatments: TreatmentItem[],
    offer: SpecialOffer
  ): TreatmentItem[] {
    // Create a clone of the treatments array
    const updatedTreatments = [...treatments];
    
    // First, check if the special offer is already in the treatments
    const hasOffer = treatments.some(t => 
      (t.isSpecialOffer && t.specialOffer?.id === offer.id) ||
      (t.promoToken && t.specialOffer?.id === offer.id)
    );
    
    // If we don't have the offer yet, add it
    if (!hasOffer) {
      const offerTreatment = this.createSpecialOfferTreatment(offer);
      updatedTreatments.push(offerTreatment);
    }
    
    return updatedTreatments;
  }

  /**
   * Parse URL parameters for special offer data
   */
  parseSpecialOfferFromUrl(): {
    isSpecialOffer: boolean;
    offerData?: SpecialOffer;
    isPackage: boolean;
    packageData?: {id: string; title: string; clinicId?: string};
    isPromoFlow: boolean;
    promoToken?: string;
    promoType?: 'special_offer' | 'package';
  } {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for direct special offer
    const offerId = urlParams.get('offerId') || urlParams.get('specialOffer');
    const offerTitle = urlParams.get('offerTitle');
    const clinicId = urlParams.get('clinicId') || urlParams.get('offerClinic') || '1';
    const discountType = urlParams.get('offerDiscountType') || urlParams.get('discountType') || 'percentage';
    const discountValue = urlParams.get('offerDiscount') || urlParams.get('discountValue') || '20';
    const treatment = urlParams.get('treatment') || urlParams.get('treatmentName');
    
    // Check for package flow
    const packageId = urlParams.get('packageId');
    const packageTitle = urlParams.get('packageTitle');
    
    // Check for promo token flow
    const promoToken = urlParams.get('promoToken');
    const promoType = urlParams.get('promoType') as 'special_offer' | 'package' | null;
    
    const isSpecialOffer = !!(offerId || offerTitle);
    const isPackage = !!(packageId || packageTitle);
    const isPromoFlow = !!promoToken;
    
    return {
      isSpecialOffer,
      offerData: isSpecialOffer ? {
        id: offerId || 'direct-special-offer',
        title: offerTitle || 'Special Offer',
        discountType: discountType as 'percentage' | 'fixed_amount',
        discountValue: parseFloat(discountValue),
        clinicId,
        applicableTreatment: treatment
      } : undefined,
      
      isPackage,
      packageData: isPackage ? {
        id: packageId || 'direct-package',
        title: packageTitle || 'Treatment Package',
        clinicId
      } : undefined,
      
      isPromoFlow,
      promoToken,
      promoType: promoType || 'special_offer'
    };
  }

  /**
   * Detect if we need to add a free consultation from URL parameters
   */
  shouldAddFreeConsultation(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    const offerTitle = urlParams.get('offerTitle');
    
    // Check for consultation in offer title
    return !!(offerTitle && 
      (offerTitle.includes('Consultation') || 
       offerTitle.includes('consultation')));
  }
}

// Export a singleton instance
export const specialOffersService = new SpecialOffersService();

export default specialOffersService;