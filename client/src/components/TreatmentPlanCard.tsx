import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface TreatmentItem {
  treatmentType: string;
  name: string;
  quantity: number;
  priceGBP: number;
  priceUSD: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
  isBonus?: boolean;
  isLocked?: boolean;
  isSpecialOffer?: boolean;
  packageId?: string;
  specialOffer?: {
    id: string;
    title: string;
    discountType: string;
    discountValue: number;
    clinicId: string;
  };
}

interface TreatmentPlanCardProps {
  clinic?: {
    id: string;
    name: string;
    location: string;
  };
  treatments: TreatmentItem[];
  totalGBP: number;
  totalUSD: number;
  isSelected?: boolean;
  onSelect?: () => void;
  showDetails?: boolean;
}

const TreatmentPlanCard: React.FC<TreatmentPlanCardProps> = ({
  clinic,
  treatments,
  totalGBP,
  totalUSD,
  isSelected = false,
  onSelect,
  showDetails = true
}) => {
  const hasSpecialOffer = treatments.some(t => t.isSpecialOffer);
  
  return (
    <Card className={`transition-all ${isSelected ? 'border-primary shadow-md' : ''}`}>
      <CardHeader className="pb-2">
        {clinic && (
          <div className="flex justify-between items-start mb-2">
            <div>
              <CardTitle>{clinic.name}</CardTitle>
              <CardDescription>{clinic.location}</CardDescription>
            </div>
            {isSelected && (
              <Badge className="bg-primary">Selected</Badge>
            )}
          </div>
        )}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Treatment Plan</h3>
          {hasSpecialOffer && (
            <Badge className="bg-green-600">Special Offer</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {showDetails ? (
          <ul className="space-y-1">
            {treatments.map((treatment, index) => (
              <li key={index} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="mr-2 text-sm">
                    {treatment.quantity} × {treatment.name}
                  </span>
                  {treatment.isSpecialOffer && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                      Offer
                    </Badge>
                  )}
                  {treatment.isBonus && (
                    <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-300">
                      Bonus
                    </Badge>
                  )}
                </div>
                <span className="font-medium">£{treatment.subtotalGBP.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Total {treatments.length} treatment(s)</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col pt-4 border-t">
        <div className="flex justify-between w-full mb-2">
          <span className="font-medium">Total Price:</span>
          <div className="text-right">
            <div className="font-bold">£{totalGBP.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">${totalUSD.toFixed(2)}</div>
          </div>
        </div>
        
        {onSelect && (
          <Button 
            onClick={onSelect} 
            variant={isSelected ? "secondary" : "default"}
            className="mt-2 w-full"
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Selected
              </>
            ) : (
              'Select Plan'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TreatmentPlanCard;