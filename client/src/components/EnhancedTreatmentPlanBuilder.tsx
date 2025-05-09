import React from 'react';
import { PlusCircle, MinusCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Define necessary interfaces
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

interface SpecialOfferParams {
  id: string;
  title: string;
  clinicId: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed_amount';
  applicableTreatment: string;
}

interface EnhancedTreatmentPlanBuilderProps {
  treatments: TreatmentItem[];
  setTreatments: React.Dispatch<React.SetStateAction<TreatmentItem[]>>;
  specialOffer?: SpecialOfferParams | null;
  promoData?: any;
  isSpecialOfferFlow?: boolean;
  isPromoTokenFlow?: boolean;
}

const EnhancedTreatmentPlanBuilder: React.FC<EnhancedTreatmentPlanBuilderProps> = ({
  treatments,
  setTreatments,
  specialOffer,
  promoData,
  isSpecialOfferFlow,
  isPromoTokenFlow
}) => {
  // Calculate total price
  const totalGBP = treatments.reduce((sum, item) => sum + item.subtotalGBP, 0);
  const totalUSD = treatments.reduce((sum, item) => sum + item.subtotalUSD, 0);
  
  // Calculate discount amount if special offer is applied
  const discountGBP = specialOffer && specialOffer.discountType === 'percentage' 
    ? totalGBP * (specialOffer.discountValue / 100)
    : specialOffer ? specialOffer.discountValue : 0;
  
  // Final price after discount
  const finalPriceGBP = Math.max(0, totalGBP - discountGBP);
  const finalPriceUSD = Math.max(0, totalUSD - (discountGBP * 1.25)); // Approximate USD conversion
  
  // Handler to update treatment quantity
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedTreatments = [...treatments];
    const treatment = updatedTreatments[index];
    
    // If the item is locked (e.g., part of a special offer), don't allow changes
    if (treatment.isLocked) return;
    
    treatment.quantity = newQuantity;
    treatment.subtotalGBP = treatment.priceGBP * newQuantity;
    treatment.subtotalUSD = treatment.priceUSD * newQuantity;
    
    setTreatments(updatedTreatments);
  };
  
  // Handler to remove a treatment
  const removeTreatment = (index: number) => {
    const treatment = treatments[index];
    
    // If the item is locked (e.g., part of a special offer), don't allow removal
    if (treatment.isLocked) return;
    
    const updatedTreatments = treatments.filter((_, i) => i !== index);
    setTreatments(updatedTreatments);
  };
  
  return (
    <div className="space-y-4">
      {/* If special offer is applied, show an alert */}
      {specialOffer && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-700" />
          <AlertDescription className="text-green-700">
            <span className="font-semibold">{specialOffer.title}</span> has been applied to your plan.
            {specialOffer.discountType === 'percentage' 
              ? ` You'll receive ${specialOffer.discountValue}% off.`
              : ` You'll receive £${specialOffer.discountValue} off.`}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Treatment items */}
      {treatments.map((treatment, index) => (
        <Card key={index} className={`${treatment.isBonus ? 'border-green-300 bg-green-50' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{treatment.name}</h4>
                  {treatment.isSpecialOffer && (
                    <Badge className="bg-green-600">Special Offer</Badge>
                  )}
                  {treatment.isBonus && (
                    <Badge className="bg-indigo-600">Bonus</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {treatment.guarantee} guarantee
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {!treatment.isLocked && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(index, treatment.quantity - 1)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center">{treatment.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(index, treatment.quantity + 1)}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                <div className="text-right ml-4">
                  <div className="font-medium">£{treatment.subtotalGBP.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">${treatment.subtotalUSD.toFixed(2)}</div>
                </div>
                
                {!treatment.isLocked && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-2 text-muted-foreground hover:text-destructive"
                    onClick={() => removeTreatment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Summary footer */}
      <Card>
        <CardFooter className="p-4">
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Subtotal:</span>
              <div className="text-right">
                <div>£{totalGBP.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">${totalUSD.toFixed(2)}</div>
              </div>
            </div>
            
            {specialOffer && (
              <div className="flex justify-between items-center mb-2 text-green-700">
                <span>Discount ({specialOffer.title}):</span>
                <div className="text-right">
                  <div>- £{discountGBP.toFixed(2)}</div>
                  <div className="text-sm">- ${(discountGBP * 1.25).toFixed(2)}</div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t border-border font-bold">
              <span>Total:</span>
              <div className="text-right">
                <div>£{finalPriceGBP.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">${finalPriceUSD.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EnhancedTreatmentPlanBuilder;