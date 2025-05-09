import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PromoType, DiscountType } from '@shared/schema';

export interface PromoState {
  activePromoSlug: string | null;
  promoData: {
    id: string;
    slug: string;
    title: string;
    description: string;
    promoType: PromoType;
    discountType: DiscountType;
    discountValue: number;
    heroImageUrl?: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    clinicIds: string[];
  } | null;
  isValidated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPromo: (slug: string | null) => void;
  setPromoData: (data: PromoState['promoData']) => void;
  clearPromo: () => void;
  setValidationStatus: (status: boolean) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// Create store with session persistence
export const usePromoStore = create<PromoState>()(
  persist(
    (set) => ({
      activePromoSlug: null,
      promoData: null,
      isValidated: false,
      isLoading: false,
      error: null,
      
      setPromo: (slug) => set({ activePromoSlug: slug, error: null }),
      setPromoData: (data) => set({ promoData: data, error: null }),
      clearPromo: () => set({ 
        activePromoSlug: null, 
        promoData: null, 
        isValidated: false,
        error: null 
      }),
      setValidationStatus: (status) => set({ isValidated: status }),
      setError: (error) => set({ error }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'promo-storage',
      getStorage: () => sessionStorage, // Use sessionStorage for persistence
    }
  )
);

// Helper to hydrate promo from URL or storage
export const hydratePromo = async (slug: string) => {
  const { setPromo, setLoading, setError } = usePromoStore.getState();
  
  try {
    setLoading(true);
    // We'll set the slug immediately, but validation will happen via a React Query hook
    setPromo(slug);
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to hydrate promo');
  } finally {
    setLoading(false);
  }
};

// Helper to get querystring param on initial load
export const checkForPromoInUrl = () => {
  if (typeof window === 'undefined') return;
  
  const params = new URLSearchParams(window.location.search);
  const promoSlug = params.get('promo');
  
  if (promoSlug) {
    hydratePromo(promoSlug);
  }
};