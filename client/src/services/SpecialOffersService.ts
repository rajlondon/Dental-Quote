import { TreatmentItem } from "@/components/TreatmentPlanBuilder";

// Types for special offers
export interface SpecialOffer {
  id: string;
  title: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  clinicId: string;
  applicableTreatment?: string;
}

export interface Package {
  id: string;
  title: string;
  price: number;
  priceUSD: number;
  treatments: string[];
  clinicId: string;
}

export interface PromoToken {
  token: string;
  type: 'special_offer' | 'package';
  title: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  clinicId: string;
}

// Special Offers Service - A singleton service for handling special offers
class SpecialOffersService {
  private static instance: SpecialOffersService;
  
  // Private constructor to prevent direct instantiation
  private constructor() {}
  
  // Get the singleton instance
  public static getInstance(): SpecialOffersService {
    if (!SpecialOffersService.instance) {
      SpecialOffersService.instance = new SpecialOffersService();
    }
    return SpecialOffersService.instance;
  }
  
  // Create a treatment item for a special offer
  public createSpecialOfferTreatment(offer: SpecialOffer): TreatmentItem {
    return {
      id: `special-offer-${offer.id}`,
      name: `${offer.title} - ${offer.discountType === 'percentage' ? 
        `${offer.discountValue}% discount` : 
        `£${offer.discountValue} discount`}`,
      category: 'special-offers',
      quantity: 1,
      priceGBP: 0,
      priceUSD: 0,
      subtotalGBP: 0,
      subtotalUSD: 0,
      isSpecialOffer: true,
      isBonus: true,
      isLocked: true,
      specialOffer: {
        id: offer.id,
        title: offer.title,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        clinicId: offer.clinicId
      },
      ukPriceGBP: 0,
      ukPriceUSD: 0
    };
  }
  
  // Create a treatment item for a package
  public createPackageTreatment(
    title: string,
    priceGBP: number,
    priceUSD: number,
    packageId: string
  ): TreatmentItem {
    return {
      id: `package-${packageId}`,
      name: title,
      category: 'packages',
      quantity: 1,
      priceGBP: priceGBP,
      priceUSD: priceUSD,
      subtotalGBP: priceGBP,
      subtotalUSD: priceUSD,
      isPackage: true,
      isLocked: true,
      packageId: packageId,
      ukPriceGBP: priceGBP * 2.857,
      ukPriceUSD: priceUSD * 2.857
    };
  }
  
  // Create a treatment item for a promo token
  public createPromoTokenTreatment(
    token: string,
    type: 'special_offer' | 'package',
    title: string,
    basePrice: number,
    basePriceUSD: number,
    discountType: 'percentage' | 'fixed_amount',
    discountValue: number,
    clinicId: string
  ): TreatmentItem {
    const isDiscount = type === 'special_offer';
    
    if (isDiscount) {
      // For special offers, create a £0 bonus item
      return {
        id: `promo-${token}`,
        name: `${title} - ${discountType === 'percentage' ? 
          `${discountValue}% discount` : 
          `£${discountValue} discount`}`,
        category: 'promotions',
        quantity: 1,
        priceGBP: 0,
        priceUSD: 0,
        subtotalGBP: 0,
        subtotalUSD: 0,
        isBonus: true,
        isLocked: true,
        promoToken: token,
        specialOffer: {
          id: token,
          title,
          discountType,
          discountValue,
          clinicId
        },
        ukPriceGBP: 0,
        ukPriceUSD: 0
      };
    } else {
      // For packages, create a standard package item
      return {
        id: `promo-package-${token}`,
        name: title,
        category: 'packages',
        quantity: 1,
        priceGBP: basePrice,
        priceUSD: basePriceUSD,
        subtotalGBP: basePrice,
        subtotalUSD: basePriceUSD,
        isPackage: true,
        isLocked: true,
        promoToken: token,
        ukPriceGBP: basePrice * 2.857,
        ukPriceUSD: basePriceUSD * 2.857
      };
    }
  }
  
  // Calculate discount based on a special offer
  public calculateDiscount(
    basePrice: number,
    discountType: 'percentage' | 'fixed_amount',
    discountValue: number
  ): number {
    if (discountType === 'percentage') {
      return basePrice * (discountValue / 100);
    } else {
      return Math.min(basePrice, discountValue);
    }
  }
  
  // Get special offer data from URL parameters
  public getSpecialOfferFromUrl(): SpecialOffer | undefined {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    
    if (source === 'special_offer') {
      const offerId = urlParams.get('offerId') || urlParams.get('specialOffer');
      if (!offerId) return undefined;
      
      const offerTitle = urlParams.get('offerTitle') || 'Special Offer';
      const discountType = (urlParams.get('offerDiscountType') || urlParams.get('discountType') || 'percentage') as 'percentage' | 'fixed_amount';
      const discountValue = parseFloat(urlParams.get('offerDiscount') || urlParams.get('discountValue') || '0');
      const clinicId = urlParams.get('clinicId') || urlParams.get('offerClinic') || '1';
      const applicableTreatmentParam = urlParams.get('applicableTreatment');
      const applicableTreatment = applicableTreatmentParam === null ? undefined : applicableTreatmentParam;
      
      return {
        id: offerId,
        title: offerTitle,
        discountType,
        discountValue,
        clinicId,
        applicableTreatment: applicableTreatment || undefined
      };
    }
    
    return undefined;
  }
  
  // Get package data from URL parameters
  public getPackageFromUrl(): Package | undefined {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    
    if (source === 'package') {
      const packageId = urlParams.get('packageId');
      if (!packageId) return undefined;
      
      const packageTitle = urlParams.get('packageTitle') || 'Treatment Package';
      const price = parseFloat(urlParams.get('packagePrice') || '1200');
      const priceUSD = parseFloat(urlParams.get('packagePriceUSD') || '1560');
      const clinicId = urlParams.get('clinicId') || '1';
      
      return {
        id: packageId,
        title: packageTitle,
        price,
        priceUSD,
        treatments: [],
        clinicId
      };
    }
    
    return undefined;
  }
  
  // Get promo token data from URL parameters
  public getPromoTokenFromUrl(): PromoToken | undefined {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    
    if (source === 'promo_token') {
      const token = urlParams.get('promoToken');
      if (!token) return undefined;
      
      const type = (urlParams.get('promoType') || 'special_offer') as 'special_offer' | 'package';
      const title = urlParams.get('promoTitle') || 'Special Promotion';
      const discountType = (urlParams.get('discountType') || 'percentage') as 'percentage' | 'fixed_amount';
      const discountValue = parseFloat(urlParams.get('discountValue') || '20');
      const clinicId = urlParams.get('clinicId') || '1';
      
      return {
        token,
        type,
        title,
        discountType,
        discountValue,
        clinicId
      };
    }
    
    return undefined;
  }
  
  // Process treatments for special offers, packages, etc.
  public processTreatments(treatments: TreatmentItem[], options: {
    specialOffer?: SpecialOffer,
    package?: Package,
    promoToken?: PromoToken
  }): TreatmentItem[] {
    const { specialOffer, package: packageData, promoToken } = options;
    const result = [...treatments];
    
    // Handle special offer
    if (specialOffer && !treatments.some(t => t.specialOffer?.id === specialOffer.id)) {
      result.push(this.createSpecialOfferTreatment(specialOffer));
    }
    
    // Handle package
    if (packageData && !treatments.some(t => t.packageId === packageData.id)) {
      result.push(this.createPackageTreatment(
        packageData.title,
        packageData.price,
        packageData.priceUSD,
        packageData.id
      ));
    }
    
    // Handle promo token
    if (promoToken && !treatments.some(t => t.promoToken === promoToken.token)) {
      // Base price for promo packages (if needed)
      const basePrice = 1200;
      const basePriceUSD = 1560;
      
      result.push(this.createPromoTokenTreatment(
        promoToken.token,
        promoToken.type,
        promoToken.title,
        basePrice,
        basePriceUSD,
        promoToken.discountType,
        promoToken.discountValue,
        promoToken.clinicId
      ));
    }
    
    return result;
  }
}

// Export a singleton instance
const specialOffersService = SpecialOffersService.getInstance();
export default specialOffersService;