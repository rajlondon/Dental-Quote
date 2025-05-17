import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash, Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format-utils';

export interface Treatment {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
  clinicId?: string;
  clinicName?: string;
  isRecommended?: boolean;
  discountedPrice?: number;
  imageUrl?: string;
}

interface TreatmentListProps {
  treatments: Treatment[];
  readOnly?: boolean;
  onQuantityChange?: (treatmentId: string, newQuantity: number) => void;
  onRemoveTreatment?: (treatmentId: string) => void;
  selectedCurrency?: 'USD' | 'GBP' | 'EUR';
  showTotals?: boolean;
  appliedPromoCode?: string;
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
}

const TreatmentList: React.FC<TreatmentListProps> = ({
  treatments,
  readOnly = false,
  onQuantityChange,
  onRemoveTreatment,
  selectedCurrency = 'USD',
  showTotals = true,
  appliedPromoCode,
  discountAmount = 0,
  discountType,
  discountValue = 0,
}) => {
  // Calculate the subtotal
  const subtotal = treatments.reduce((total, treatment) => {
    const treatmentTotal = treatment.discountedPrice 
      ? treatment.discountedPrice * treatment.quantity 
      : treatment.price * treatment.quantity;
    return total + treatmentTotal;
  }, 0);

  // Calculate total after applying discount
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {treatments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No treatments selected. Please add treatments to your quote.
            </CardContent>
          </Card>
        ) : (
          treatments.map((treatment) => {
            const treatmentTotal = treatment.discountedPrice 
              ? treatment.discountedPrice * treatment.quantity 
              : treatment.price * treatment.quantity;
              
            return (
              <Card key={treatment.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-medium">{treatment.name}</h3>
                        {treatment.isRecommended && (
                          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      
                      {treatment.description && (
                        <p className="text-sm text-muted-foreground mt-1">{treatment.description}</p>
                      )}
                      
                      {treatment.clinicName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Clinic: {treatment.clinicName}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(treatmentTotal, selectedCurrency)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {treatment.discountedPrice ? (
                          <>
                            <span className="line-through mr-1">
                              {formatCurrency(treatment.price, selectedCurrency)}
                            </span>
                            {formatCurrency(treatment.discountedPrice, selectedCurrency)}
                          </>
                        ) : (
                          formatCurrency(treatment.price, selectedCurrency)
                        )}
                        {treatment.quantity > 1 && ` × ${treatment.quantity}`}
                      </div>
                    </div>
                  </div>
                  
                  {!readOnly && (
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveTreatment && onRemoveTreatment(treatment.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => 
                            onQuantityChange && 
                            treatment.quantity > 1 && 
                            onQuantityChange(treatment.id, treatment.quantity - 1)
                          }
                          disabled={treatment.quantity <= 1 || readOnly}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="w-8 text-center">{treatment.quantity}</span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => 
                            onQuantityChange && 
                            onQuantityChange(treatment.id, treatment.quantity + 1)
                          }
                          disabled={readOnly}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      
      {showTotals && treatments.length > 0 && (
        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal, selectedCurrency)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center">
                Discount: 
                {appliedPromoCode && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {appliedPromoCode}
                  </Badge>
                )}
                {discountType && discountValue > 0 && (
                  <span className="text-xs ml-1 text-muted-foreground">
                    ({discountType === 'percentage' ? `${discountValue}%` : formatCurrency(discountValue, selectedCurrency)})
                  </span>
                )}
              </span>
              <span className="font-medium text-green-600">-{formatCurrency(discountAmount, selectedCurrency)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
            <span>Total:</span>
            <span>{formatCurrency(total, selectedCurrency)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentList;