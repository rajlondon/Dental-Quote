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

// Store state interface
interface PromoState {
  // Active promo tracking
  activePromoSlug: string | null;
  promoData: PromoData | null;
  
  // API state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPromoSlug: (slug: string) => void;
  setPromoData: (data: PromoData) => void;
  clearPromo: () => void;
  setApiState: (status: string, error: string | null, loading: boolean) => void;
}

export const usePromoStore = create<PromoState>()(
  persist(
    (set) => ({
      // Initial state
      activePromoSlug: null,
      promoData: null,
      isLoading: false,
      error: null,
      
      // Actions
      setPromoSlug: (slug: string) => set({
        activePromoSlug: slug
      }),
      
      setPromoData: (data: PromoData) => set({
        promoData: data
      }),
      
      clearPromo: () => set({
        activePromoSlug: null,
        promoData: null,
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
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name, value) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem(name, JSON.stringify(value));
          }
        },
        removeItem: (name) => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(name);
          }
        }
      }
    }
  )
);