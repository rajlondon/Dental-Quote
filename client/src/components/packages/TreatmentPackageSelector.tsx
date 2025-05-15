import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Package as PackageIcon, Check, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { TreatmentPackage } from '@shared/offer-types';
import { formatCurrency } from '@/utils/currency-formatter';

interface TreatmentPackageSelectorProps {
  packages: TreatmentPackage[];
  selectedPackageId: string | null;
  onChange: (packageId: string | null) => void;
  isLoading?: boolean;
}

export function TreatmentPackageSelector({
  packages,
  selectedPackageId,
  onChange,
  isLoading = false
}: TreatmentPackageSelectorProps) {
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);

  const toggleExpand = (packageId: string) => {
    setExpandedPackageId(expandedPackageId === packageId ? null : packageId);
  };

  const handleSelectPackage = (packageId: string) => {
    // Toggle selection
    onChange(selectedPackageId === packageId ? null : packageId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <Alert>
        <AlertDescription>No treatment packages are currently available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <RadioGroup value={selectedPackageId || ''} className="space-y-4" onValueChange={(value) => onChange(value || null)}>
      {packages.map((pkg) => {
        const isSelected = selectedPackageId === pkg.id;
        const isExpanded = expandedPackageId === pkg.id;
        const savings = pkg.savings || 0;
        const savingsPercentage = pkg.price ? Math.round((savings / (pkg.price + savings)) * 100) : 0;

        return (
          <Card 
            key={pkg.id} 
            className={`relative ${isSelected ? 'border-primary' : ''}`}
          >
            {isSelected && (
              <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PackageIcon className="h-5 w-5 text-primary" />
                  {pkg.title}
                </CardTitle>
                {savingsPercentage > 0 && (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Save {savingsPercentage}%
                  </Badge>
                )}
              </div>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-2">
                <RadioGroupItem value={pkg.id} id={`package-${pkg.id}`} className="mr-2" />
                <Label htmlFor={`package-${pkg.id}`} className="font-medium flex-1">
                  Select this package
                </Label>
                <div className="text-right">
                  <div className="text-lg font-semibold">{formatCurrency(pkg.price)}</div>
                  {savings > 0 && (
                    <div className="text-sm text-muted-foreground line-through">
                      {formatCurrency(pkg.price + savings)}
                    </div>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-3">
                  <Separator />
                  <h4 className="font-medium text-sm">Included Treatments</h4>
                  <ul className="space-y-2">
                    {pkg.includedTreatments.map((treatment, index) => (
                      <li key={index} className="flex justify-between text-sm">
                        <span>
                          {treatment.name}
                          {treatment.quantity > 1 && <span> x{treatment.quantity}</span>}
                        </span>
                        <span className="text-muted-foreground">{formatCurrency(treatment.price)}</span>
                      </li>
                    ))}
                  </ul>

                  {pkg.additionalPerks && pkg.additionalPerks.length > 0 && (
                    <>
                      <Separator />
                      <h4 className="font-medium text-sm">Additional Perks</h4>
                      <ul className="space-y-1">
                        {pkg.additionalPerks.map((perk, index) => (
                          <li key={index} className="text-sm flex items-center">
                            <Tag className="h-3 w-3 text-primary mr-2" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => toggleExpand(pkg.id)}>
                {isExpanded ? 'Show less' : 'Show details'}
              </Button>
              <Button 
                variant={isSelected ? "default" : "outline"} 
                size="sm" 
                onClick={() => handleSelectPackage(pkg.id)}
              >
                {isSelected ? 'Selected' : 'Select'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </RadioGroup>
  );
}