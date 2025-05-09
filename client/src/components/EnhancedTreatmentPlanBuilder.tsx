import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Check, Info, Package } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import QuoteTreatmentSelectionPanel from './QuoteTreatmentSelectionPanel';

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

interface EnhancedTreatmentPlanBuilderProps {
  clinicId?: string;
  clinicName?: string;
  initialTreatments?: TreatmentItem[];
  onTreatmentsChange: (treatments: TreatmentItem[]) => void;
  specialOfferId?: string;
  specialOfferData?: {
    id: string;
    title: string;
    discountValue: number;
    discountType: 'percentage' | 'fixed_amount';
    clinicId?: string;
    description?: string;
  };
  packageId?: string;
  packageData?: {
    id: string;
    title: string;
    clinicId?: string;
    description?: string;
    priceGBP?: number;
    priceUSD?: number;
  };
  isReadOnly?: boolean;
}

const EnhancedTreatmentPlanBuilder: React.FC<EnhancedTreatmentPlanBuilderProps> = ({
  clinicId,
  clinicName,
  initialTreatments = [],
  onTreatmentsChange,
  specialOfferId,
  specialOfferData,
  packageId,
  packageData,
  isReadOnly = false
}) => {
  const [treatments, setTreatments] = useState<TreatmentItem[]>(initialTreatments);
  const [subtotalGBP, setSubtotalGBP] = useState(0);
  const [subtotalUSD, setSubtotalUSD] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [totalGBP, setTotalGBP] = useState(0);
  const [totalUSD, setTotalUSD] = useState(0);
  
  // Calculate totals whenever treatments change
  useEffect(() => {
    // Calculate raw subtotal (without considering discounts)
    const newSubtotalGBP = treatments.reduce((sum, item) => sum + item.subtotalGBP, 0);
    const newSubtotalUSD = treatments.reduce((sum, item) => sum + item.subtotalUSD, 0);
    
    setSubtotalGBP(newSubtotalGBP);
    setSubtotalUSD(newSubtotalUSD);
    
    // Calculate discount if special offer exists
    let discountAmount = 0;
    if (specialOfferData) {
      if (specialOfferData.discountType === 'percentage') {
        discountAmount = (newSubtotalGBP * specialOfferData.discountValue) / 100;
      } else {
        discountAmount = specialOfferData.discountValue;
      }
    }
    
    setDiscount(discountAmount);
    
    // Calculate final total
    setTotalGBP(newSubtotalGBP - discountAmount);
    setTotalUSD(newSubtotalUSD - (discountAmount * 1.3)); // Approximate USD conversion
    
    // Call the parent's callback
    onTreatmentsChange(treatments);
  }, [treatments, specialOfferData, onTreatmentsChange]);
  
  // Handle treatments change from the selection panel
  const handleTreatmentsChange = (newTreatments: TreatmentItem[]) => {
    setTreatments(newTreatments);
  };
  
  return (
    <div className="space-y-6">
      {/* Special Offer Notice (if applicable) */}
      {specialOfferData && (
        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700">Special Offer Applied</AlertTitle>
          <AlertDescription className="text-green-600">
            {specialOfferData.title}: {specialOfferData.description || 
              `${specialOfferData.discountValue}${specialOfferData.discountType === 'percentage' ? '%' : '£'} off your treatment`
            }
          </AlertDescription>
        </Alert>
      )}
      
      {/* Package Notice (if applicable) */}
      {packageData && (
        <Alert className="bg-blue-50 border-blue-200">
          <Package className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-700">Treatment Package Selected</AlertTitle>
          <AlertDescription className="text-blue-600">
            {packageData.title}{' '}
            {packageData.description ? `- ${packageData.description}` : ''}
            {packageData.priceGBP ? ` - £${packageData.priceGBP}` : ''}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Clinic Name (if provided) */}
      {clinicName && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-2 py-0.5">
            Clinic
          </Badge>
          <span className="font-medium">{clinicName}</span>
        </div>
      )}
      
      {/* Treatment Selection Panel */}
      <QuoteTreatmentSelectionPanel
        selectedTreatments={treatments}
        onTreatmentsChange={handleTreatmentsChange}
        specialOfferId={specialOfferId}
        isReadOnly={isReadOnly}
      />
      
      {/* Treatment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Treatment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <div className="text-right">
                <div>£{subtotalGBP.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">${subtotalUSD.toFixed(2)}</div>
              </div>
            </div>
            
            {/* Discount (if applicable) */}
            {discount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <div className="flex items-center gap-2">
                  <span>Discount</span>
                  {specialOfferData && (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">
                      {specialOfferData.title}
                    </Badge>
                  )}
                </div>
                <div>-£{discount.toFixed(2)}</div>
              </div>
            )}
            
            <Separator />
            
            {/* Total */}
            <div className="flex justify-between items-center font-semibold">
              <span>Total</span>
              <div className="text-right">
                <div>£{totalGBP.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">${totalUSD.toFixed(2)}</div>
              </div>
            </div>
            
            {/* Benefits List */}
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium mb-3">Benefits Included</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Free online video consultation with your chosen clinic</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Expert-led concierge service to help with travel arrangements</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Treatment guarantees included with all procedures</span>
                </li>
                {specialOfferData && (
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Special offer discount applied to your quote</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTreatmentPlanBuilder;