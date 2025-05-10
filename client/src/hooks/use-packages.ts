import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface TreatmentPackage {
  id: string;
  title: string;
  description: string;
  clinicId: number;
  priceGBP: string;
  priceUSD: string;
  originalPriceGBP?: string;
  discountPercentage?: string;
  discountPct?: string;
  items?: string[];
  promoCode?: string;
  usedCount?: number;
  maxUses?: number;
  treatments?: {
    treatmentType: string;
    count: number;
    details?: string;
  }[];
  includedServices?: string[];
  imageUrl?: string;
  badgeText?: string;
  displayOnHomepage?: boolean;
  featured?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  isApproved?: boolean;
  approvedAt?: string;
  approvedBy?: number;
  rejectionReason?: string;
  validFrom?: string;
  validUntil?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
}

export function usePackages(clinicId?: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: clinicId ? ['/api/packages', clinicId] : ['/api/packages'],
    queryFn: async () => {
      const endpoint = clinicId 
        ? `/api/packages/clinic/${clinicId}` 
        : '/api/packages';
      
      const response = await apiRequest('GET', endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      
      const data = await response.json();
      return data.packages || [];
    },
    enabled: true,
  });

  return {
    packages: data as TreatmentPackage[],
    isLoading,
    error,
    refetch
  };
}

export function usePackage(packageId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/packages', packageId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/packages/${packageId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch package details');
      }
      
      const data = await response.json();
      return data.package;
    },
    enabled: !!packageId,
  });

  return {
    packageData: data as TreatmentPackage,
    isLoading,
    error
  };
}