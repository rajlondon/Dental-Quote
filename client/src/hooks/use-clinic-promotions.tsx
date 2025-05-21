import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'discount' | 'package';
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  clinicId: number;
  applicable_treatments: string[];
  start_date: string;
  end_date: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'EXPIRED' | 'REJECTED';
  created_at: string;
  submitted_at?: string;
  packageData?: {
    title?: string;
    description?: string;
    packagePrice?: number;
    treatments?: string[];
    originalPrice?: number;
    accommodationIncluded?: boolean;
    accommodationDetails?: string;
    transportIncluded?: boolean;
    transportDetails?: string;
    attractions?: Array<{
      name: string;
      description: string;
      value: number;
      included: boolean;
    }>;
  };
}

/**
 * Hook to fetch all promotions for a specific clinic
 */
export function useClinicPromotions(clinicId?: number) {
  const { user } = useAuth();
  const effectiveClinicId = clinicId || user?.clinicId;

  return useQuery({
    queryKey: ['/api/clinic-promotions', effectiveClinicId],
    queryFn: async () => {
      if (!effectiveClinicId) {
        return [];
      }
      const res = await apiRequest('GET', `/api/clinic/promotions?clinicId=${effectiveClinicId}`);
      const data = await res.json();
      return data.promotions || [];
    },
    enabled: !!effectiveClinicId,
  });
}

/**
 * Hook to fetch only active promotions for a specific clinic
 */
export function useActiveClinicPromotions(clinicId?: number) {
  const { data: allPromotions = [], isLoading, error } = useClinicPromotions(clinicId);
  
  // Filter to only active promotions that are not expired
  const activePromotions = allPromotions.filter((promo: Promotion) => 
    promo.status === 'ACTIVE' && 
    new Date(promo.end_date) > new Date()
  );
  
  return {
    data: activePromotions,
    isLoading,
    error
  };
}

/**
 * Hook to fetch a specific promotion by ID
 */
export function usePromotion(promotionId?: string) {
  return useQuery({
    queryKey: ['/api/promotions', promotionId],
    queryFn: async () => {
      if (!promotionId) return null;
      const res = await apiRequest('GET', `/api/promotions/${promotionId}`);
      return res.json();
    },
    enabled: !!promotionId,
  });
}

/**
 * Calculate the discount amount based on promotion details
 */
export function calculatePromotionDiscount(promotion: Promotion, originalAmount: number): number {
  if (!promotion) return 0;
  
  if (promotion.type === 'discount' && promotion.discount_value) {
    if (promotion.discount_type === 'percentage') {
      return (originalAmount * promotion.discount_value) / 100;
    } else {
      return promotion.discount_value;
    }
  } else if (promotion.type === 'package' && promotion.packageData?.originalPrice && promotion.packageData?.packagePrice) {
    return promotion.packageData.originalPrice - promotion.packageData.packagePrice;
  }
  
  return 0;
}

/**
 * Check if a promotion is expiring soon
 * @param promotion The promotion to check
 * @param daysThreshold Number of days to consider as "soon" (default: 7)
 * @returns Object with expiration status and days remaining
 */
export function checkPromotionExpiration(promotion: Promotion, daysThreshold: number = 7) {
  if (!promotion || !promotion.end_date) {
    return { isExpiringSoon: false, daysRemaining: 0 };
  }
  
  const endDate = new Date(promotion.end_date);
  const today = new Date();
  
  // Set both dates to midnight for accurate day calculation
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const differenceMs = endDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
  
  return {
    isExpiringSoon: daysRemaining <= daysThreshold && daysRemaining >= 0,
    isExpired: daysRemaining < 0,
    daysRemaining: daysRemaining
  };
}