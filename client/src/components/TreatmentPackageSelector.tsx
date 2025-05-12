import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TreatmentPackage } from '../../../shared/schema';
import { useSpecialOffers } from '@/hooks/use-special-offers';
import { Check, X, AlertCircle, InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TreatmentPackageSelectorProps {
  clinicId: number;
  onPackageSelected: (packageId: string | null) => void;
  selectedPackageId?: string | null;
}

export const TreatmentPackageSelector: React.FC<TreatmentPackageSelectorProps> = ({
  clinicId,
  onPackageSelected,
  selectedPackageId = null
}) => {
  const { getAvailablePackages, calculatePackageSavings } = useSpecialOffers();
  const [availablePackages, setAvailablePackages] = useState<TreatmentPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(selectedPackageId);

  // Load available packages on component mount
  useEffect(() => {
    const packages = getAvailablePackages(clinicId);
    setAvailablePackages(packages);
  }, [clinicId, getAvailablePackages]);

  const handlePackageSelection = (packageId: string) => {
    if (selectedPackage === packageId) {
      // Deselect if already selected
      setSelectedPackage(null);
      onPackageSelected(null);
    } else {
      setSelectedPackage(packageId);
      onPackageSelected(packageId);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  // Don't render anything if no packages are available
  if (availablePackages.length === 0) {
    return null;
  }

  return (
    <div className="treatment-package-selector mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Treatment Packages</h3>
        <p className="text-muted-foreground text-sm">
          Select a package to get a bundle of treatments at a discounted price
        </p>
      </div>

      <RadioGroup
        value={selectedPackage || ""}
        onValueChange={handlePackageSelection}
        className="space-y-4"
      >
        {availablePackages.map((pkg) => {
          const { original, discounted, savings } = calculatePackageSavings(pkg.id);
          const savingsPercentage = original > 0 ? Math.round((savings / original) * 100) : 0;
          
          return (
            <Card
              key={pkg.id}
              className={`border-2 transition-all ${
                selectedPackage === pkg.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/20 hover:border-muted-foreground/30'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-semibold">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Save {savingsPercentage}%
                    </Badge>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <InfoIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="max-w-xs">
                            This package includes all treatments listed below at a discounted package price.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Treatment list - this would come from the package data */}
                <ul className="space-y-1.5 text-sm">
                  {['Teeth Whitening', 'Dental Cleaning', 'Dental Checkup'].map((treatment, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      <span>{treatment}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4 border-t pt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Regular Price:</span>
                    <span className="line-through opacity-70">{formatCurrency(original)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Package Price:</span>
                    <span className="text-primary">{formatCurrency(discounted)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 mt-1">
                    <span>Your Savings:</span>
                    <span>{formatCurrency(savings)}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0 flex justify-between">
                <div className="flex items-center">
                  <RadioGroupItem value={pkg.id} id={`pkg-${pkg.id}`} className="mr-2" />
                  <Label htmlFor={`pkg-${pkg.id}`} className="cursor-pointer">
                    Select Package
                  </Label>
                </div>
                
                <Button 
                  variant={selectedPackage === pkg.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePackageSelection(pkg.id)}
                >
                  {selectedPackage === pkg.id ? "Selected" : "Select"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default TreatmentPackageSelector;