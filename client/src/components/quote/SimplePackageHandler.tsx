import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimplePackageHandlerProps {
  onTreatmentsSelected: (treatments: any[]) => void;
}

export function SimplePackageHandler({ onTreatmentsSelected }: SimplePackageHandlerProps) {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [packageApplied, setPackageApplied] = useState(false);
  
  const packageId = searchParams.get('packageId');
  const packageName = searchParams.get('packageName') || 'Treatment Package';

  // Package data (hardcoded for reliability)
  const packageTreatments = {
    'pkg-001': [
      { id: 'treatment-1', name: 'Dental Implant', price: 800 },
      { id: 'treatment-2', name: 'Implant Crown', price: 700 },
      { id: 'treatment-3', name: 'Panoramic X-Ray', price: 50 }
    ],
    'pkg-002': [
      { id: 'treatment-4', name: 'Dental Veneers (6 Units)', price: 2400 },
      { id: 'treatment-5', name: 'Teeth Whitening', price: 350 },
      { id: 'treatment-6', name: 'Cosmetic Consultation', price: 100 }
    ],
    'pkg-003': [
      { id: 'treatment-7', name: 'Full Mouth Restoration', price: 3500 },
      { id: 'treatment-8', name: 'Hotel Accommodation (5 Nights)', price: 750 },
      { id: 'treatment-9', name: 'Airport Transfer', price: 100 }
    ]
  };

  useEffect(() => {
    if (!packageId || packageApplied) return;
    
    const treatments = packageTreatments[packageId as keyof typeof packageTreatments];
    
    if (treatments) {
      console.log(`📦 Applying package ${packageId} with ${treatments.length} treatments`);
      onTreatmentsSelected(treatments);
      setPackageApplied(true);
      
      toast({
        title: "Package Applied",
        description: `${packageName} has been applied to your quote.`
      });
    } else {
      console.error(`Package with ID ${packageId} not found in available packages`);
    }
  }, [packageId, onTreatmentsSelected, packageApplied, packageName, toast]);

  if (!packageId || !packageApplied) return null;

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <AlertTitle className="flex items-center">
        <Package className="h-5 w-5 text-blue-500 mr-2" />
        <span className="text-blue-700">Package Applied: {packageName}</span>
      </AlertTitle>
      <AlertDescription className="text-blue-600">
        Your selected package includes specific treatments that have been automatically added to your quote.
      </AlertDescription>
    </Alert>
  );
}

export default SimplePackageHandler;