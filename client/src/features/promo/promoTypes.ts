import { DiscountType, PromoType } from '@shared/schema';

// Interface for promo data
export interface PromoData {
  id: string;
  slug: string;
  title: string;
  description: string;
  promoType: PromoType;
  discountType: DiscountType;
  discountValue: number;
  heroImageUrl?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  items: Array<{
    id: string;
    itemType: string;
    itemCode: string;
    qty: number;
  }>;
  clinics: Array<{
    id: string;
    clinicId: string;
  }>;
}

// Extended PromoState with new properties
export interface PromoState {
  // Active promo tracking
  activePromoSlug: string | null;
  promoData: PromoData | null;
  
  // API state
  isLoading: boolean;
  error: string | null;
  
  // Promo token specific properties
  promoToken: string | null; 
  setPromoToken: (token: string | null) => void;
  promoType: PromoType | null;
  setPromoType: (type: PromoType | null) => void;
  hasActivePromo: boolean;
  trackedPromo: string | null;
  
  // Actions
  setPromoSlug: (slug: string) => void;
  setPromoData: (data: PromoData) => void;
  clearPromo: () => void;
  setApiState: (status: string, error: string | null, loading: boolean) => void;
}

// API response type for promo data
export interface PromoAPIResponse {
  id: string;
  slug: string;
  name: string;
  title: string; 
  description: string;
  discount_value: number;
  discountValue: number;
  discountType: DiscountType;
  applicable_treatments: string[];
  applicableTreatment: string;
  clinicId: string;
}

// Special offer details type
export interface SpecialOfferDetails {
  id: string;
  title: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed_amount';
  applicableTreatment?: string;
  clinicId?: string;
}

// Extend EntrySource enum to match the string literals used in the app
export enum EntrySource {
  NORMAL = 'normal',
  SPECIAL_OFFER = 'special_offer',
  PACKAGE = 'package', 
  PROMO_TOKEN = 'promo_token'
}