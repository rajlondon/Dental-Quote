import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { TreatmentPackage } from '../../stores/quoteStore';

interface TreatmentPackageSelectorProps {
  packages: TreatmentPackage[];
  selectedPackageId: string | undefined;
  onSelectPackage: (pkg: TreatmentPackage | null) => void;
  isLoading?: boolean;
}

export function TreatmentPackageSelector({
  packages,
  selectedPackageId,
  onSelectPackage,
  isLoading = false
}: TreatmentPackageSelectorProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading treatment packages...</p>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No treatment packages available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select a Treatment Package</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card 
            key={pkg.id}
            className={`cursor-pointer transition-all ${
              selectedPackageId === pkg.id
                ? 'border-primary shadow-md'
                : 'hover:border-muted-foreground'
            }`}
            onClick={() => onSelectPackage(pkg)}
          >
            <CardHeader className="pb-2">
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-medium">Includes:</div>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {pkg.treatments.map((treatment) => (
                    <li key={treatment.id}>
                      {treatment.name} {treatment.quantity > 1 && `(x${treatment.quantity})`}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">£{pkg.price}</span>
                  <span className="text-sm text-muted-foreground line-through">
                    £{pkg.originalPrice}
                  </span>
                </div>
                <div className="text-sm text-green-600">
                  Save £{pkg.originalPrice - pkg.price}
                </div>
              </div>
              <Button 
                variant={selectedPackageId === pkg.id ? "secondary" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPackage(selectedPackageId === pkg.id ? null : pkg);
                }}
              >
                {selectedPackageId === pkg.id ? "Selected" : "Select"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {selectedPackageId && (
        <div className="mt-4 flex justify-end">
          <Button 
            variant="ghost" 
            onClick={() => onSelectPackage(null)}
          >
            Clear Selection
          </Button>
        </div>
      )}
    </div>
  );
}