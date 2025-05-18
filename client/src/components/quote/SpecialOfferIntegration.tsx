import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

interface SpecialOfferIntegrationProps {
  packageId: string | null;
  setSelectedTreatments: (treatments: any[]) => void;
}

/**
 * Component that handles the integration between special offers and the quote builder
 * This works with hardcoded package data to ensure proper treatment selection
 */
export default function SpecialOfferIntegration({
  packageId,
  setSelectedTreatments
}: SpecialOfferIntegrationProps) {
  const { toast } = useToast();
  const [isApplied, setIsApplied] = useState(false);
  const [packageInfo, setPackageInfo] = useState<{
    title: string;
    description: string;
    treatments: any[];
  } | null>(null);

  // Define package treatment mapping
  const packages = {
    'pkg-001': {
      title: 'Premium Implant Package',
      description: 'Includes implant placement and crown',
      treatments: [
        { id: 'treatment-1', name: 'Dental Implant', price: 800 },
        { id: 'treatment-2', name: 'Implant Crown', price: 700 },
        { id: 'treatment-3', name: 'Panoramic X-Ray', price: 50 }
      ]
    },
    'pkg-002': {
      title: 'Luxury Smile Makeover',
      description: 'Complete smile transformation with premium services',
      treatments: [
        { id: 'treatment-4', name: 'Dental Veneers (6 Units)', price: 2400 },
        { id: 'treatment-5', name: 'Teeth Whitening', price: 350 },
        { id: 'treatment-6', name: 'Cosmetic Consultation', price: 100 }
      ]
    },
    'pkg-003': {
      title: 'Travel & Treatment Bundle',
      description: 'Includes treatments and luxury hotel accommodation',
      treatments: [
        { id: 'treatment-7', name: 'Full Mouth Restoration', price: 3500 },
        { id: 'treatment-8', name: 'Hotel Accommodation (5 Nights)', price: 750 },
        { id: 'treatment-9', name: 'Airport Transfer', price: 100 }
      ]
    }
  };

  useEffect(() => {
    if (!packageId || isApplied) return;

    // Find the selected package
    const pkg = packages[packageId as keyof typeof packages];
    if (!pkg) {
      console.error(`Package with ID ${packageId} not found in available packages`);
      return;
    }

    // Apply the treatments
    console.log(`📦 Applying treatments from package ${pkg.title}`, pkg.treatments);
    setSelectedTreatments(pkg.treatments);
    setPackageInfo(pkg);
    setIsApplied(true);

    // Show success toast
    toast({
      title: "Package Applied",
      description: `${pkg.title} has been applied to your quote.`
    });

  }, [packageId, setSelectedTreatments, toast, isApplied]);

  if (!packageInfo || !isApplied) return null;

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Package className="h-5 w-5 text-blue-500 mr-2" />
          <AlertTitle className="text-blue-700">{packageInfo.title} Applied</AlertTitle>
        </div>
        <Badge variant="outline" className="bg-blue-100 text-blue-700">
          Special Offer
        </Badge>
      </div>
      <AlertDescription className="text-blue-600">
        {packageInfo.description}. The treatments have been pre-selected for you.
      </AlertDescription>
    </Alert>
  );
}