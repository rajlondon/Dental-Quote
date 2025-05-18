import { useEffect, useState } from 'react';
import { useFlaskIntegration } from '@/hooks/use-flask-integration';
import { useToast } from '@/hooks/use-toast';

interface EnhancedPackageHandlerProps {
  packageId: string | null;
  onTreatmentsSelected: (treatments: any[]) => void;
}

/**
 * Component that handles package selection and automatically applies treatments
 * This component doesn't render anything visible
 */
export function EnhancedPackageHandler({
  packageId,
  onTreatmentsSelected
}: EnhancedPackageHandlerProps) {
  const { getPackages, getTreatments, syncWithFlask } = useFlaskIntegration();
  const { toast } = useToast();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Only process the package once to avoid infinite loops
    if (!packageId || hasProcessed) return;

    const loadPackageAndTreatments = async () => {
      try {
        console.log(`📦 Loading package with ID: ${packageId}`);
        
        // Step 1: Get all available packages
        const packages = await getPackages();
        
        if (!packages || !Array.isArray(packages) || packages.length === 0) {
          console.error('No packages available');
          return;
        }

        // Step 2: Find the selected package
        const selectedPackage = packages.find((pkg: any) => pkg.id === packageId);
        
        if (!selectedPackage) {
          console.error(`Package with ID ${packageId} not found`);
          return;
        }

        console.log(`📦 Found package: ${selectedPackage.title}`);

        // Step 3: Get all available treatments
        const treatmentsData = await getTreatments();
        const treatments = treatmentsData?.treatments || [];
        
        if (!treatments || treatments.length === 0) {
          console.error('No treatments available');
          return;
        }

        // Match treatments based on package includes
        const packageIncludesLower = selectedPackage.includes?.map((item: string) => 
          item.toLowerCase().trim()
        ) || [];

        // Filter treatments that are included in the package
        const matchedTreatments = treatments.filter((treatment: any) => {
          const treatmentNameLower = treatment.name.toLowerCase().trim();
          return packageIncludesLower.some((includeItem: string) => 
            includeItem.includes(treatmentNameLower) || treatmentNameLower.includes(includeItem)
          );
        });

        if (matchedTreatments.length > 0) {
          console.log(`✅ Matched ${matchedTreatments.length} treatments from package:`, 
            matchedTreatments.map((t: any) => t.name).join(', '));
          
          // Apply treatments
          onTreatmentsSelected(matchedTreatments);
          
          // Sync with Flask backend
          syncWithFlask({
            package_id: selectedPackage.id,
            package_name: selectedPackage.title,
            treatments: matchedTreatments,
            apply_package: true
          });
        } else {
          console.warn('No treatments matched with package includes');
          // If no matches found, select the first few treatments as a fallback
          const fallbackTreatments = treatments.slice(0, 3);
          onTreatmentsSelected(fallbackTreatments);
          
          syncWithFlask({
            package_id: selectedPackage.id,
            package_name: selectedPackage.title,
            treatments: fallbackTreatments,
            apply_package: true
          });
        }

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
  }, [packageId, getPackages, getTreatments, syncWithFlask, onTreatmentsSelected, toast, hasProcessed]);

  // This component doesn't render anything
  return null;
}

export default EnhancedPackageHandler;