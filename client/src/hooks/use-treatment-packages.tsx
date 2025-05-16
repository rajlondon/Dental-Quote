import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Define package treatment type
export interface PackageTreatment {
  id: string;
  name: string;
  price: number;
  description?: string;
  quantity: number;
  category?: string;
}

// Define the package type
export interface TreatmentPackage {
  id: string;
  name: string;
  description: string;
  treatments: PackageTreatment[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  imageUrl?: string;
  cityCode?: string;
  clinicId?: string;
}

export interface UsePackagesResult {
  packages: TreatmentPackage[];
  isLoading: boolean;
  error: Error | null;
  packageSavings: number;
  selectedPackage: TreatmentPackage | null;
  selectPackage: (packageData: TreatmentPackage | null) => void;
  calculatePackageSavings: (packageData: TreatmentPackage) => number;
}

export function useTreatmentPackages(): UsePackagesResult {
  const [selectedPackage, setSelectedPackage] = useState<TreatmentPackage | null>(null);
  const [packageSavings, setPackageSavings] = useState<number>(0);

  // Fetch packages from API
  const { data: packages = [], isLoading, error } = useQuery({
    queryKey: ['/api/v1/packages'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/v1/packages');
      if (!response.ok) {
        throw new Error('Failed to fetch treatment packages');
      }
      return response.json();
    }
  });

  // Calculate savings for a package
  const calculatePackageSavings = (packageData: TreatmentPackage): number => {
    if (!packageData || !packageData.treatments || packageData.treatments.length === 0) {
      return 0;
    }

    // Calculate the total regular price of all treatments
    const totalRegularPrice = packageData.treatments.reduce(
      (sum, treatment) => sum + treatment.price * (treatment.quantity || 1),
      0
    );

    // Calculate the savings based on discount type
    if (packageData.discountType === 'percentage') {
      return totalRegularPrice * (packageData.discount / 100);
    } else {
      // For fixed discount
      return packageData.discount;
    }
  };

  // Handle package selection
  const selectPackage = (packageData: TreatmentPackage | null) => {
    setSelectedPackage(packageData);
    
    if (packageData) {
      const savings = calculatePackageSavings(packageData);
      setPackageSavings(savings);
    } else {
      setPackageSavings(0);
    }
  };

  // Update savings if selected package changes
  useEffect(() => {
    if (selectedPackage) {
      const savings = calculatePackageSavings(selectedPackage);
      setPackageSavings(savings);
    }
  }, [selectedPackage]);

  return {
    packages,
    isLoading,
    error,
    packageSavings,
    selectedPackage,
    selectPackage,
    calculatePackageSavings
  };
}