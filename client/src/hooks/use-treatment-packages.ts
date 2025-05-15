import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TreatmentPackage } from '@shared/offer-types';
import { trackEvent } from '@/lib/analytics';

interface UseTreatmentPackagesProps {
  quoteId: string | null;
  treatments: { id: string; quantity: number }[];
  updateQuote: (updates: Record<string, any>) => void;
}

export const useTreatmentPackages = ({
  quoteId,
  treatments,
  updateQuote
}: UseTreatmentPackagesProps) => {
  const { toast } = useToast();
  const [isApplyingPackage, setIsApplyingPackage] = useState(false);
  const [availablePackages, setAvailablePackages] = useState<TreatmentPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  // Fetch available packages for the current treatments
  const fetchAvailablePackages = async () => {
    if (treatments.length === 0) {
      setAvailablePackages([]);
      return;
    }

    try {
      setIsLoadingPackages(true);
      const treatmentIds = treatments.map(t => t.id);
      
      const response = await fetch('/api/quotes-api/available-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treatmentIds, quoteId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available packages');
      }
      
      const data = await response.json();
      setAvailablePackages(data.packages || []);
      return data.packages;
    } catch (error) {
      console.error("Error fetching available packages:", error);
      toast({
        title: "Error",
        description: "Failed to load available packages. Please try again.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoadingPackages(false);
    }
  };

  // Apply a treatment package to the quote
  const applyTreatmentPackage = async (packageId: string) => {
    try {
      setIsApplyingPackage(true);
      
      // Fetch package details
      const response = await fetch(`/api/quotes-api/apply-package/${packageId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quoteId, 
          currentTreatments: treatments 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply treatment package');
      }
      
      const data = await response.json();
      
      // Update the quote state with packaged treatments
      updateQuote({
        treatments: data.packagedTreatments,
        subtotal: data.packagePrice,
        appliedPackageId: packageId,
        packageSavings: data.savings,
        includedPerks: data.additionalPerks || []
      });
      
      // Track the event
      trackEvent('apply_treatment_package', 'quote', packageId);
      
      toast({
        title: "Package Applied",
        description: `Package applied! You save ${formatCurrency(data.savings)}`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error("Error applying treatment package:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply treatment package",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsApplyingPackage(false);
    }
  };
  
  // Remove a treatment package from the quote
  const removeTreatmentPackage = async () => {
    if (!quoteId) {
      updateQuote({
        appliedPackageId: null,
        packageSavings: 0,
        includedPerks: []
      });
      return true;
    }
    
    try {
      setIsApplyingPackage(true);
      
      const response = await fetch(`/api/quotes-api/remove-package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove package');
      }
      
      const data = await response.json();
      
      // Restore the original treatments
      updateQuote({
        treatments: data.originalTreatments || [],
        subtotal: data.originalSubtotal || 0,
        appliedPackageId: null,
        packageSavings: 0,
        includedPerks: []
      });
      
      toast({
        title: "Package Removed",
        description: "The treatment package has been removed from your quote",
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error("Error removing treatment package:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove treatment package",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsApplyingPackage(false);
    }
  };

  // Format currency helper
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value);
  };

  return {
    availablePackages,
    isLoadingPackages,
    isApplyingPackage,
    fetchAvailablePackages,
    applyTreatmentPackage,
    removeTreatmentPackage
  };
};

export default useTreatmentPackages;