import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

interface TreatmentPlanCardProps {
  treatment: {
    id: string;
    name: string;
    treatmentType: string;
    quantity: number;
    priceGBP: number;
    priceUSD: number;
    guarantee?: string;
    isBonus?: boolean;
    isLocked?: boolean;
    isSpecialOffer?: boolean;
    originalPriceGBP?: number;
    originalPriceUSD?: number;
    discountPercent?: number;
  };
  currency?: 'GBP' | 'USD';
  showDiscount?: boolean;
  onRemove?: (id: string) => void;
  onQuantityChange?: (id: string, quantity: number) => void;
  className?: string;
}

/**
 * A card component for displaying a treatment in the treatment plan
 */
const TreatmentPlanCard: React.FC<TreatmentPlanCardProps> = ({
  treatment,
  currency = 'GBP',
  showDiscount = true,
  onRemove,
  onQuantityChange,
  className = '',
}) => {
  const {
    id,
    name,
    treatmentType,
    quantity,
    priceGBP,
    priceUSD,
    guarantee,
    isBonus,
    isLocked,
    isSpecialOffer,
    originalPriceGBP,
    originalPriceUSD,
    discountPercent,
  } = treatment;

  const price = currency === 'GBP' ? priceGBP : priceUSD;
  const originalPrice = currency === 'GBP' ? originalPriceGBP : originalPriceUSD;
  const subtotal = price * quantity;
  
  const currencySymbol = currency === 'GBP' ? '£' : '$';

  const handleRemove = () => {
    if (onRemove && !isLocked) {
      onRemove(id);
    }
  };

  const handleIncrement = () => {
    if (onQuantityChange && !isLocked) {
      onQuantityChange(id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (onQuantityChange && !isLocked && quantity > 1) {
      onQuantityChange(id, quantity - 1);
    }
  };

  return (
    <Card className={`w-full transition-all duration-200 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-base font-medium">{name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{treatmentType}</p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {isBonus && (
                <Badge variant="secondary" className="text-xs flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Bonus
                </Badge>
              )}
              {isSpecialOffer && (
                <Badge variant="destructive" className="text-xs flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Special Offer
                </Badge>
              )}
              {isLocked && (
                <Badge variant="outline" className="text-xs flex items-center">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Package
                </Badge>
              )}
              {guarantee && (
                <Badge variant="outline" className="text-xs flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {guarantee} Guarantee
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex flex-col items-end">
              {showDiscount && originalPrice && originalPrice > price && (
                <span className="text-sm line-through text-muted-foreground">
                  {currencySymbol}{originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-base font-semibold">
                {currencySymbol}{price.toFixed(2)}
              </span>
              {discountPercent && showDiscount && (
                <Badge variant="outline" className="mt-1 bg-green-50">
                  Save {discountPercent}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {!isLocked && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-sm text-muted-foreground hover:text-destructive"
              >
                Remove
              </button>
            )}
          </div>
          
          <div className="flex items-center">
            <span className="text-sm mr-2">Qty:</span>
            {isLocked ? (
              <span className="px-2 py-1 border rounded-md min-w-[40px] text-center">
                {quantity}
              </span>
            ) : (
              <div className="flex items-center border rounded-md">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
                >
                  -
                </button>
                <span className="px-2 min-w-[20px] text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="px-2 py-1 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            )}
            
            <span className="ml-4 font-semibold">
              {currencySymbol}{subtotal.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreatmentPlanCard;