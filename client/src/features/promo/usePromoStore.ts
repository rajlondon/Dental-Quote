import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DiscountType, PromoType } from '@shared/schema';

// Interface for promo data
interface PromoData {
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

// Store state interface with additional properties
interface PromoState {
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

export const usePromoStore = create<PromoState>()(
  persist(
    (set, get) => ({
      // Initial state
      activePromoSlug: null,
      promoData: null,
      isLoading: false,
      error: null,
      promoToken: null,
      promoType: null,
      trackedPromo: null,
      
      // Computed property
      get hasActivePromo() {
        return !!get().promoData || !!get().promoToken;
      },
      
      // Actions
      setPromoSlug: (slug: string) => set({
        activePromoSlug: slug
      }),
      
      setPromoData: (data: PromoData) => set({
        promoData: data
      }),
      
      setPromoToken: (token: string | null) => set({
        promoToken: token,
        trackedPromo: token ? 'token' : get().trackedPromo
      }),
      
      setPromoType: (type: PromoType | null) => set({
        promoType: type
      }),
      
      clearPromo: () => set({
        activePromoSlug: null,
        promoData: null,
        promoToken: null,
        promoType: null,
        trackedPromo: null,
        isLoading: false,
        error: null
      }),
      
      setApiState: (status: string, error: string | null, loading: boolean) => set({
        isLoading: loading,
        error
      })
    }),
    {
      name: 'promo-store',
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          const str = sessionStorage.getItem(name); // Use sessionStorage instead of localStorage
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name, value) => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(name, JSON.stringify(value)); // Use sessionStorage for session persistence
          }
        },
        removeItem: (name) => {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(name);
          }
        }
      }
    }
  )
);