import React from 'react';
import { CheckCircle } from 'lucide-react';
import { TreatmentPackage } from '@shared/offer-types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/hooks/use-quote-builder';

interface TreatmentPackageSelectorProps {
  availablePackages: TreatmentPackage[];
  onSelectPackage: (packageId: string) => void;
  selectedPackageId: string | null;
  treatmentNames?: Record<string, string>; // Map of treatmentId to name
  isLoading?: boolean;
}

export const TreatmentPackageSelector: React.FC<TreatmentPackageSelectorProps> = ({
  availablePackages,
  onSelectPackage,
  selectedPackageId,
  treatmentNames = {},
  isLoading = false
}) => {
  // Helper function to get treatment name from ID
  const getTreatmentName = (treatmentId: string): string => {
    return treatmentNames[treatmentId] || `Treatment ${treatmentId}`;
  };

  if (isLoading) {
    return (
      <div className="treatment-packages-container p-4 border rounded-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="treatment-packages-container">
      <h3 className="text-lg font-semibold mb-4">Recommended Treatment Packages</h3>
      
      {availablePackages.length === 0 ? (
        <p className="text-gray-500">No packages available for your selected treatments</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {availablePackages.map(pkg => (
            <Card
              key={pkg.id}
              className={`package-card cursor-pointer transition hover:shadow-md
                ${selectedPackageId === pkg.id ? 'border-primary ring-2 ring-primary/50' : 'hover:border-gray-400'}`}
              onClick={() => onSelectPackage(pkg.id)}
            >
              <CardContent className="p-4">
                {pkg.featuredImage && (
                  <div className="relative w-full h-32 mb-3">
                    <img 
                      src={pkg.featuredImage} 
                      alt={pkg.title}
                      className="w-full h-full object-cover rounded-md" 
                      onError={(e) => {
                        e.currentTarget.src = '/images/default-package.jpg';
                      }}
                    />
                  </div>
                )}
                
                <h4 className="font-medium text-lg">{pkg.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {formatCurrency(pkg.packagePrice)}
                  </Badge>
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                    Save {formatCurrency(pkg.savings)}
                  </Badge>
                </div>
                
                <div className="included-treatments text-sm text-gray-700 mb-2">
                  <strong>Includes:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    {pkg.includedTreatments.map((item, idx) => (
                      <li key={idx}>{item.quantity}× {getTreatmentName(item.treatmentId)}</li>
                    ))}
                  </ul>
                </div>
                
                {pkg.additionalPerks.length > 0 && (
                  <div className="perks text-sm text-gray-700">
                    <strong>Additional perks:</strong>
                    <ul className="list-disc pl-5 mt-1">
                      {pkg.additionalPerks.map((perk, idx) => (
                        <li key={idx}>{perk}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedPackageId === pkg.id && (
                  <div className="mt-2 text-primary flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Applied to your quote</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreatmentPackageSelector;