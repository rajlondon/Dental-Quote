import { useState, useCallback } from 'react';

interface PackageDetails {
  id: string;
  title: string;
  description: string;
  includedTreatments: Array<{
    id: string;
    name: string;
    quantity: number;
    treatmentType: string;
  }>;
  includedExtras: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  priceGBP: number;
  priceUSD: number;
  clinicId?: string;
  originalPriceGBP?: number;
  originalPriceUSD?: number;
  discountPercent?: number;
}

interface TreatmentItem {
  id: string;
  treatmentType: string;
  name: string;
  quantity: number;
  priceGBP: number;
  priceUSD: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
  isBonus?: boolean;
  isLocked?: boolean;
  isSpecialOffer?: boolean;
  packageId?: string;
}

/**
 * A custom hook to detect and handle treatment packages from URL parameters
 * This hook extracts package parameters from the URL and provides
 * methods to apply package treatments to the treatment list
 */
export const usePackageDetection = () => {
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from URL parameters - call this from a component inside Router context
  const initFromSearchParams = useCallback((params: URLSearchParams) => {
    const packageId = params.get('packageId');
    
    if (packageId) {
      fetchPackageDetails(packageId);
    }
  }, []);

  // Fetch package details from API
  const fetchPackageDetails = useCallback(async (packageId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/packages/${packageId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch package details');
      }
      
      const data = await response.json();
      
      if (data && data.success) {
        setPackageDetails(data.package);
      } else {
        throw new Error(data.message || 'Invalid package data');
      }
    } catch (err) {
      console.error('Error fetching package details:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPackageDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear the package selection
  const clearPackage = useCallback(() => {
    setPackageDetails(null);
    setError(null);
  }, []);

  // Convert package to treatment items
  const packageToTreatmentItems = useCallback((): TreatmentItem[] => {
    if (!packageDetails) return [];
    
    // Map included treatments to treatment items
    return packageDetails.includedTreatments.map(treatment => ({
      id: treatment.id,
      treatmentType: treatment.treatmentType,
      name: treatment.name,
      quantity: treatment.quantity,
      priceGBP: packageDetails.priceGBP / packageDetails.includedTreatments.length, // Distribute package price
      priceUSD: packageDetails.priceUSD / packageDetails.includedTreatments.length, // Distribute package price
      subtotalGBP: packageDetails.priceGBP / packageDetails.includedTreatments.length * treatment.quantity,
      subtotalUSD: packageDetails.priceUSD / packageDetails.includedTreatments.length * treatment.quantity,
      guarantee: '5-year', // Default guarantee
      isLocked: true, // Lock treatments as they're part of a package
      packageId: packageDetails.id
    }));
  }, [packageDetails]);

  // Apply package to an existing treatment list (adding or replacing)
  const applyPackageToTreatments = useCallback((treatments: TreatmentItem[]): TreatmentItem[] => {
    if (!packageDetails) return treatments;
    
    // Remove any treatments that match package treatments
    const nonPackageTreatments = treatments.filter(
      treatment => !treatment.packageId || treatment.packageId !== packageDetails.id
    );
    
    // Add package treatments
    return [
      ...nonPackageTreatments,
      ...packageToTreatmentItems()
    ];
  }, [packageDetails, packageToTreatmentItems]);

  // Get savings amount compared to individual treatment prices
  const getPackageSavings = useCallback(() => {
    if (!packageDetails || !packageDetails.originalPriceGBP || !packageDetails.originalPriceUSD) {
      return { GBP: 0, USD: 0 };
    }
    
    return {
      GBP: packageDetails.originalPriceGBP - packageDetails.priceGBP,
      USD: packageDetails.originalPriceUSD - packageDetails.priceUSD
    };
  }, [packageDetails]);

  return {
    packageDetails,
    setPackageDetails,
    isLoading,
    error,
    clearPackage,
    fetchPackageDetails,
    initFromSearchParams,
    applyPackageToTreatments,
    packageToTreatmentItems,
    getPackageSavings,
    hasActivePackage: !!packageDetails
  };
};

export default usePackageDetection;