/**
 * Types for Special Offers and Treatment Packages
 */

// Special Offer data structure
export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  clinicId: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minTreatmentCount?: number;
  maxDiscountAmount?: number;
  applicableTreatments: string[]; // treatment IDs
  startDate: string;
  endDate: string;
  featuredImage?: string;
  terms?: string;
}

// Treatment Package data structure
export interface TreatmentPackage {
  id: string;
  title: string;
  description: string;
  clinicId: string;
  includedTreatments: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  requiredTreatments?: string[]; // Treatment IDs that must be selected for this package to apply
  price: number; // Package price is less than sum of individual treatments
  savings: number; // Calculated field
  additionalPerks: string[]; // E.g., "Free hotel stay", "Airport transfer"
  featuredImage?: string;
  startDate: string;
  endDate: string;
  name?: string; // Alias for title for consistency with other types
}

// Extended Quote State with offers and packages
export interface ExtendedQuoteState {
  id: string | null;
  treatments: QuoteTreatment[];
  subtotal: number;
  
  // Promo code
  promoCode: string | null;
  promoCodeId: string | null;
  discountType: 'percentage' | 'fixed_amount' | null;
  discountValue: number | null;
  promoDiscount: number;
  
  // Special offers
  appliedOfferId: string | null;
  offerDiscount: number;
  
  // Treatment packages
  appliedPackageId: string | null;
  packageSavings: number;
  
  // Additional perks from packages
  includedPerks: string[];
  
  // Final total after all discounts
  discount: number;
  total: number;
}

// Quote Treatment
export interface QuoteTreatment {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  type: 'treatment';
}