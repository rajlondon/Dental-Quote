import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import type { TreatmentPackage } from '../../hooks/use-treatment-packages';
import { Skeleton } from '../ui/skeleton';
import { BadgePercentIcon, PackageIcon, ListChecksIcon } from 'lucide-react';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((item) => (
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
          There are currently no treatment packages available. Please check back later for new options.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Treatment Packages</h3>
        <p className="text-muted-foreground mb-4">
          Choose from our carefully designed treatment packages to save on your dental care.
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((pkg) => {
          const isSelected = pkg.id === selectedPackageId;
          
          // Calculate package total price
          const packageTotal = pkg.treatments.reduce(
            (sum, treatment) => sum + (treatment.price * (treatment.quantity || 1)), 
            0
          );
          
          // Calculate savings
          let savings = 0;
          if (pkg.discountType === 'percentage') {
            savings = packageTotal * (pkg.discount / 100);
          } else {
            savings = pkg.discount;
          }
          
          // Calculate final price
          const finalPrice = packageTotal - savings;
          
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
                <CardTitle className="flex items-center">
                  <PackageIcon className="h-5 w-5 mr-2 text-primary" />
                  {pkg.name}
                </CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-primary">
                    <BadgePercentIcon className="h-5 w-5 mr-2" />
                    <span className="font-semibold">
                      {pkg.discountType === 'percentage'
                        ? `${pkg.discount}% off`
                        : `£${pkg.discount} off`}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Package Value:</span>
                    <span className="font-medium">£{packageTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-green-600">
                    <span>Your Savings:</span>
                    <span className="font-medium">£{savings.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between font-bold">
                    <span>Final Price:</span>
                    <span>£{finalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium flex items-center mb-2">
                      <ListChecksIcon className="h-4 w-4 mr-1" />
                      Included Treatments:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {pkg.treatments.map((treatment) => (
                        <li key={treatment.id} className="flex justify-between">
                          <span>{treatment.name}</span>
                          {treatment.quantity > 1 && (
                            <span className="text-xs bg-secondary px-1 rounded">
                              x{treatment.quantity}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
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