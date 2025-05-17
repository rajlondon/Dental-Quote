import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, X, Info, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatPrice, formatDiscount, calculateDiscountAmount, calculateTotal } from '@/utils/format-utils';

// Define the Treatment interface
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

// Define the TreatmentListProps interface
interface TreatmentListProps {
  treatments: Treatment[];
  readOnly?: boolean;
  onQuantityChange?: (treatmentId: string, newQuantity: number) => void;
  onRemoveTreatment?: (treatmentId: string) => void;
  selectedCurrency?: 'USD' | 'GBP' | 'EUR';
  showTotals?: boolean;
  appliedPromoCode?: string | null;
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
  discountValue,
}) => {
  // Calculate the subtotal
  const subtotal = treatments.reduce((total, treatment) => {
    return total + treatment.price * treatment.quantity;
  }, 0);
  
  // Calculate the final total
  const total = calculateTotal(subtotal, discountAmount);

  return (
    <div className="space-y-4">
      {treatments.length === 0 ? (
        <div className="p-6 text-center border rounded-lg border-dashed">
          <p className="text-gray-500">No treatments added yet</p>
        </div>
      ) : (
        <>
          {/* Treatment Cards */}
          <div className="space-y-3">
            {treatments.map((treatment) => (
              <Card key={treatment.id} className={treatment.isRecommended ? 'border-primary' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {treatment.name}
                        {treatment.isRecommended && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Star className="ml-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Recommended treatment</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </CardTitle>
                      {treatment.clinicName && (
                        <CardDescription>Provided by {treatment.clinicName}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center">
                      {treatment.description && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground mr-2" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{treatment.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {!readOnly && onRemoveTreatment && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveTreatment(treatment.id)}
                          aria-label="Remove treatment"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {treatment.imageUrl && (
                    <div className="mb-3">
                      <img
                        src={treatment.imageUrl}
                        alt={treatment.name}
                        className="rounded-md object-cover h-24 w-full"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(treatment.price, selectedCurrency)} per unit
                    </div>
                    <div className="flex items-center space-x-1">
                      {!readOnly && onQuantityChange ? (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              if (treatment.quantity > 1) {
                                onQuantityChange(treatment.id, treatment.quantity - 1);
                              }
                            }}
                            disabled={treatment.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{treatment.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onQuantityChange(treatment.id, treatment.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-sm">Quantity: {treatment.quantity}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between w-full">
                    <div className="text-sm font-medium">Subtotal</div>
                    <div className="font-semibold">
                      {formatPrice(treatment.price * treatment.quantity, selectedCurrency)}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Summary Section */}
          {showTotals && (
            <Card>
              <CardHeader>
                <CardTitle>Quote Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal, selectedCurrency)}</span>
                  </div>
                  
                  {appliedPromoCode && (
                    <div className="flex justify-between text-primary">
                      <span className="flex items-center">
                        Discount
                        {discountType && discountValue && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="ml-1">
                                <Info className="h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Promo code: {appliedPromoCode} 
                                  <br />
                                  Discount: {formatDiscount(discountType, discountValue, selectedCurrency)}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </span>
                      <span>-{formatPrice(discountAmount, selectedCurrency)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatPrice(total, selectedCurrency)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default TreatmentList;