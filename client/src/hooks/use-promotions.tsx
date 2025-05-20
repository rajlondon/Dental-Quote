import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'discount' | 'package';
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  clinicId: string;
  applicable_treatments: string[];
  start_date: string;
  end_date: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'expired';
  created_at: string;
  submitted_at?: string;
  packageData?: {
    name: string;
    description: string;
    treatments: Array<{
      id: string;
      name: string;
      quantity: number;
    }>;
    originalPrice: number;
    packagePrice: number;
  };
}

export function usePromotions(clinicId?: string | number) {
  const { user } = useAuth();
  const effectiveClinicId = clinicId || user?.clinicId;

  return useQuery({
    queryKey: ['/api/clinic-promotions', effectiveClinicId],
    queryFn: async () => {
      if (!effectiveClinicId) {
        return [];
      }
      const res = await apiRequest('GET', `/api/clinic-promotions/${effectiveClinicId}`);
      const data = await res.json();
      return data.promotions || [];
    },
    enabled: !!effectiveClinicId,
  });
}

export function useApprovedPromotions(clinicId?: string | number) {
  const { data: allPromotions = [], isLoading, error } = usePromotions(clinicId);
  
  // Filter to only approved promotions that are not expired
  const approvedPromotions = allPromotions.filter((promo: Promotion) => 
    promo.status === 'approved' && 
    new Date(promo.end_date) > new Date()
  );
  
  return {
    data: approvedPromotions,
    isLoading,
    error
  };
}