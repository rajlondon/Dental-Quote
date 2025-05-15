import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TreatmentPackage } from '@shared/offer-types';

interface Treatment {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  type: 'treatment';
}

interface UsePackagesResult {
  data: TreatmentPackage[] | undefined;
  isLoading: boolean;
  error: Error | null;
  availablePackages: TreatmentPackage[];
  selectedPackage: TreatmentPackage | null;
  selectPackage: (packageId: string | null) => void;
  packageSavings: number;
  isPackageApplicable: (packageId: string, treatmentIds: string[]) => boolean;
  getIncludedTreatments: (packageId: string) => Treatment[];
  calculatePackageSavings: (packageId: string) => number;
}

/**
 * Hook for managing treatment packages in the quote builder
 */
export function useTreatmentPackages(initialPackageId?: string): UsePackagesResult {
  const [selectedPackage, setSelectedPackage] = useState<TreatmentPackage | null>(null);
  const [packageSavings, setPackageSavings] = useState<number>(0);

  // Fetch all available treatment packages
  const { data, isLoading, error } = useQuery<TreatmentPackage[], Error>({
    queryKey: ['/api/treatment-packages'],
    refetchOnWindowFocus: false,
  });

  // Derived state for available packages
  const availablePackages = data || [];
  
  // Effect to select initial package if provided
  useEffect(() => {
    if (initialPackageId && data && !isLoading) {
      const pkg = data.find(pkg => pkg.id === initialPackageId);
      if (pkg) {
        setSelectedPackage(pkg);
        const savings = calculatePackageSavings(initialPackageId);
        setPackageSavings(savings);
      }
    }
  }, [initialPackageId, data, isLoading]);

  // Function to select a package
  const selectPackage = (packageId: string | null) => {
    if (!packageId) {
      setSelectedPackage(null);
      setPackageSavings(0);
      return;
    }

    const pkg = availablePackages.find(pkg => pkg.id === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
      
      // Update package savings
      const savings = calculatePackageSavings(packageId);
      setPackageSavings(savings);
    } else {
      console.warn(`Package with ID ${packageId} not found`);
    }
  };

  // Check if a package is applicable based on selected treatments
  const isPackageApplicable = (packageId: string, treatmentIds: string[]): boolean => {
    const pkg = availablePackages.find(pkg => pkg.id === packageId);
    if (!pkg || !pkg.requiredTreatments || pkg.requiredTreatments.length === 0) {
      return true;
    }

    // Check if all required treatments are selected
    return pkg.requiredTreatments.every((requiredId: string) => 
      treatmentIds.includes(requiredId)
    );
  };

  // Get all treatments included in a package
  const getIncludedTreatments = (packageId: string): Treatment[] => {
    const pkg = availablePackages.find(pkg => pkg.id === packageId);
    if (!pkg || !pkg.includedTreatments) return [];

    return pkg.includedTreatments.map(treatment => ({
      id: treatment.id || `pkg-treatment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: treatment.name,
      price: treatment.price || 0,
      quantity: treatment.quantity || 1,
      type: 'treatment'
    }));
  };

  // Calculate savings from selecting a package vs. individual treatments
  const calculatePackageSavings = (packageId: string): number => {
    const pkg = availablePackages.find(pkg => pkg.id === packageId);
    if (!pkg || !pkg.includedTreatments) return 0;

    // Calculate total individual price
    const individualPrice = pkg.includedTreatments.reduce(
      (sum, treatment) => sum + (treatment.price || 0) * (treatment.quantity || 1),
      0
    );

    // Calculate package price
    const packagePrice = pkg.price || 0;

    // Calculate savings
    const savings = Math.max(0, individualPrice - packagePrice);
    return savings;
  };

  return {
    data,
    isLoading,
    error,
    availablePackages,
    selectedPackage,
    selectPackage,
    packageSavings,
    isPackageApplicable,
    getIncludedTreatments,
    calculatePackageSavings
  };
}