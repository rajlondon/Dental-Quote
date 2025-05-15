import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/hooks/use-quote-builder';
import { TreatmentPackage } from '@shared/offer-types';

interface Treatment {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  type: 'treatment';
}

/**
 * Hook for managing treatment packages in the quote builder
 */
export function useTreatmentPackages(selectedTreatments: Treatment[] = []) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<TreatmentPackage | null>(null);
  
  // Fetch available treatment packages
  const { data: availablePackages = [], isLoading } = useQuery<TreatmentPackage[]>({
    queryKey: ['/api/treatment-packages'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter and rank packages based on relevance to selected treatments
  const filteredPackages = useCallback(() => {
    if (!selectedTreatments || selectedTreatments.length === 0) {
      // If no treatments selected, return all packages
      return availablePackages;
    }
    
    const treatmentIds = selectedTreatments.map(t => t.id);
    
    // Calculate a relevance score for each package
    const packagesWithRelevance = availablePackages.map(pkg => {
      // Count how many treatments in the package match the selected treatments
      const matchingTreatments = pkg.includedTreatments.filter(item => 
        treatmentIds.includes(item.treatmentId)
      );
      
      const relevanceScore = matchingTreatments.length / pkg.includedTreatments.length;
      
      return {
        package: pkg,
        relevanceScore
      };
    });
    
    // Sort by relevance score (descending)
    packagesWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Return just the packages, now ordered by relevance
    return packagesWithRelevance.map(item => item.package);
  }, [availablePackages, selectedTreatments]);

  // Apply package mutation
  const applyPackageMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const response = await apiRequest('POST', `/api/quotes-api/apply-package/${packageId}`, {
        treatments: selectedTreatments
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply package');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Package Applied',
        description: `You saved ${formatCurrency(data.savings)}`,
      });
      
      // Update cached data
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Select a package
  const selectPackage = useCallback(async (packageId: string | null) => {
    if (!packageId) {
      setSelectedPackage(null);
      return;
    }
    
    const pkg = availablePackages.find(p => p.id === packageId);
    if (!pkg) {
      toast({
        title: 'Error',
        description: 'Selected package not found',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedPackage(pkg);
    
    // Persist via API
    try {
      await applyPackageMutation.mutateAsync(packageId);
    } catch (error) {
      // Error is handled in mutation
    }
  }, [availablePackages, applyPackageMutation, toast]);

  return {
    availablePackages: filteredPackages(),
    selectedPackage,
    isLoading,
    selectPackage,
    applyPackageMutation
  };
}