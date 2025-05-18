import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFlaskIntegration } from '@/hooks/use-flask-integration';

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
  const { toast } = useToast();
  const { isConnected, getTreatments, getPackages } = useFlaskIntegration();

  useEffect(() => {
    if (!packageId || !isConnected) return;

    const loadPackageAndSelectTreatments = async () => {
      try {
        console.log(`🔍 Loading package details for ID: ${packageId}`);

        // Get all available packages
        const packages = await getPackages();
        if (!packages || packages.length === 0) {
          console.error('❌ No packages available');
          return;
        }

        // Find the selected package
        const selectedPackage = packages.find((pkg: any) => pkg.id === packageId);
        if (!selectedPackage) {
          console.error(`❌ Package with ID ${packageId} not found`);
          return;
        }

        console.log(`✅ Found package: ${selectedPackage.title}`);
        onPackageLoaded(selectedPackage);

        // Get all available treatments
        const treatments = await getTreatments();
        if (!treatments || treatments.length === 0) {
          console.error('❌ No treatments available');
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

          toast({
            title: 'Package Treatments Pre-Selected',
            description: `${matchedTreatments.length} treatments have been automatically selected based on your package.`,
            duration: 5000,
          });
        } else {
          console.warn('⚠️ No matching treatments found for package');
          toast({
            title: 'Package Applied',
            description: 'Please select specific treatments based on your package.',
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('Error pre-selecting package treatments:', error);
      }
    };

    loadPackageAndSelectTreatments();
  }, [packageId, isConnected, getTreatments, getPackages, onTreatmentsSelected, onPackageLoaded, toast]);

  // This component doesn't render anything
  return null;
}

export default PackagePreselectionHandler;