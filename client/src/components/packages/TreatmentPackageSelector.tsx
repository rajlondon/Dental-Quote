import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { TreatmentPackage } from '../../hooks/use-treatment-packages';
import { Skeleton } from '../ui/skeleton';

interface TreatmentPackageSelectorProps {
  packages: TreatmentPackage[];
  selectedPackageId: string | undefined;
  onSelectPackage: (packageData: TreatmentPackage | null) => void;
  isLoading?: boolean;
}

export function TreatmentPackageSelector({
  packages,
  selectedPackageId,
  onSelectPackage,
  isLoading = false
}: TreatmentPackageSelectorProps) {
  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="overflow-hidden">
            <div className="aspect-video w-full bg-slate-200">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // If no packages available, show message
  if (!packages || packages.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">No Treatment Packages Available</h3>
        <p className="text-muted-foreground">
          There are currently no dental treatment packages available. Please check back later or contact us for custom treatment options.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Select a Treatment Package</h3>
        <p className="text-muted-foreground mb-4">
          Choose from our carefully designed treatment packages to save on combined dental procedures.
        </p>
        
        {/* Clear selection button if a package is selected */}
        {selectedPackageId && (
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={() => onSelectPackage(null)}
          >
            Clear Selection
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => {
          const isSelected = pkg.id === selectedPackageId;
          
          // Calculate total regular price and savings
          const totalRegularPrice = pkg.treatments.reduce(
            (sum, treatment) => sum + (treatment.price * (treatment.quantity || 1)), 
            0
          );
          
          let savingsAmount = 0;
          if (pkg.discountType === 'percentage') {
            savingsAmount = totalRegularPrice * (pkg.discount / 100);
          } else {
            savingsAmount = pkg.discount;
          }
          
          const discountedPrice = totalRegularPrice - savingsAmount;
          
          return (
            <Card 
              key={pkg.id}
              className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              onClick={() => onSelectPackage(isSelected ? null : pkg)}
            >
              {pkg.imageUrl && (
                <div className="aspect-video w-full relative overflow-hidden">
                  <img 
                    src={pkg.imageUrl} 
                    alt={pkg.name} 
                    className="object-cover w-full h-full"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-md text-xs font-medium">
                      Selected
                    </div>
                  )}
                </div>
              )}
              
              <CardHeader>
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Regular Price:</span>
                    <span>£{totalRegularPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Savings:</span>
                    <span>£{savingsAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between font-bold">
                    <span>Package Price:</span>
                    <span>£{discountedPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* List included treatments */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Included Treatments:</h4>
                  <ul className="text-sm space-y-1">
                    {pkg.treatments.map((treatment) => (
                      <li key={treatment.id} className="flex justify-between">
                        <span>
                          {treatment.name} 
                          {treatment.quantity > 1 && <span className="text-muted-foreground"> x{treatment.quantity}</span>}
                        </span>
                        <span>£{treatment.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={isSelected ? "secondary" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPackage(isSelected ? null : pkg);
                  }}
                >
                  {isSelected ? 'Deselect Package' : 'Select Package'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}