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
  
  // City fields for filtering
  cityCode?: string;
  cityName?: string;
}

export interface PackageFilterOptions {
  clinicId?: number;
  cityCode?: string;
}

export function usePackages(options?: PackageFilterOptions | number) {
  // Handle backwards compatibility with existing code that passes clinicId directly
  const filterOptions: PackageFilterOptions = typeof options === 'number' 
    ? { clinicId: options } 
    : options || {};
    
  const { clinicId, cityCode } = filterOptions;
  
  // Build query key based on filter options
  const queryKey = ['/api/packages'];
  if (clinicId) queryKey.push(`clinicId:${clinicId}`);
  if (cityCode) queryKey.push(`cityCode:${cityCode}`);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      let endpoint = '/api/packages';
      
      // Handle clinicId filtering
      if (clinicId) {
        endpoint = `/api/packages/clinic/${clinicId}`;
      }
      
      // Add query parameters for additional filters
      const params = new URLSearchParams();
      if (cityCode) params.append('cityCode', cityCode);
      
      // Append query parameters if any exist
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      const response = await apiRequest('GET', endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      
      const data = await response.json();
      
      // If cityCode is provided, filter packages on the client side as well
      // This is a fallback in case the server doesn't support city filtering yet
      let packages = data.packages || [];
      if (cityCode && Array.isArray(packages)) {
        packages = packages.filter(pkg => 
          !pkg.cityCode || pkg.cityCode === cityCode || pkg.cityCode === 'all'
        );
      }
      
      return packages;
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

export function usePackage(packageId: string, options?: { cityCode?: string }) {
  const cityCode = options?.cityCode;
  
  const queryKey = ['/api/packages', packageId];
  if (cityCode) queryKey.push(`cityCode:${cityCode}`);
  
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      let endpoint = `/api/packages/${packageId}`;
      
      // Add city code as query parameter if provided
      if (cityCode) {
        endpoint += `?cityCode=${cityCode}`;
      }
      
      const response = await apiRequest('GET', endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch package details');
      }
      
      const data = await response.json();
      
      // Ensure the cityCode is included in package data for downstream components
      const packageData = data.package;
      if (packageData && cityCode && !packageData.cityCode) {
        packageData.cityCode = cityCode;
      }
      
      return packageData;
    },
    enabled: !!packageId,
  });

  return {
    packageData: data as TreatmentPackage,
    isLoading,
    error,
    cityCode
  };
}