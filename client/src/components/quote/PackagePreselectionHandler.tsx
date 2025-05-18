import React, { useEffect, useState } from 'react';
import { useFlaskIntegration } from '@/hooks/use-flask-integration';
import { useToast } from '@/hooks/use-toast';

interface PackagePreselectionHandlerProps {
  packageId: string | null;
  onTreatmentsSelected: (treatments: any[]) => void;
  onPackageLoaded: (packageData: any) => void;
}

/**
 * Component that automatically preselects treatments based on a package ID
 * This component doesn't render anything - it just handles the logic
 */
export function PackagePreselectionHandler({
  packageId,
  onTreatmentsSelected,
  onPackageLoaded
}: PackagePreselectionHandlerProps) {
  const { getPackages, getTreatments } = useFlaskIntegration();
  const { toast } = useToast();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Only process the package once to avoid infinite loops
    if (!packageId || hasProcessed) return;

    const loadPackageAndTreatments = async () => {
      try {
        // Step 1: Get all available packages
        const packages = await getPackages();
        
        if (!packages || packages.length === 0) {
          console.error('No packages available');
          return;
        }

        // Step 2: Find the selected package
        const selectedPackage = packages.find((pkg: any) => pkg.id === packageId);
        
        if (!selectedPackage) {
          console.error(`Package with ID ${packageId} not found`);
          return;
        }

        // Step 3: Get all available treatments
        const treatments = await getTreatments();
        
        if (!treatments || treatments.length === 0) {
          console.error('No treatments available');
          return;
        }

        // Match treatments based on package includes
        const packageIncludesLower = selectedPackage.includes.map((item: string) => 
          item.toLowerCase().trim()
        );

        // Filter treatments that are included in the package
        const matchedTreatments = treatments.filter((treatment: any) => {
          const treatmentNameLower = treatment.name.toLowerCase().trim();
          return packageIncludesLower.some((includeItem: string) => 
            includeItem.includes(treatmentNameLower) || treatmentNameLower.includes(includeItem)
          );
        });

        if (matchedTreatments.length > 0) {
          console.log(`✅ Matched ${matchedTreatments.length} treatments from package`);
          onTreatmentsSelected(matchedTreatments);
        } else {
          console.warn('No treatments matched with package includes');
          // If no matches found, select the first few treatments as a fallback
          const fallbackTreatments = treatments.slice(0, 3);
          onTreatmentsSelected(fallbackTreatments);
        }

        // Call onPackageLoaded with the selected package data
        onPackageLoaded(selectedPackage);

        // Show success toast
        toast({
          title: "Package Applied",
          description: `${selectedPackage.title} package has been applied to your quote.`
        });

        // Mark as processed to prevent repeated processing
        setHasProcessed(true);
      } catch (error) {
        console.error('Error processing package:', error);
        toast({
          title: "Error",
          description: "Failed to apply package treatments. Please select treatments manually.",
          variant: "destructive"
        });
      }
    };

    loadPackageAndTreatments();
  }, [packageId, getPackages, getTreatments, onTreatmentsSelected, onPackageLoaded, toast, hasProcessed]);

  // This component doesn't render anything
  return null;
}

export default PackagePreselectionHandler;