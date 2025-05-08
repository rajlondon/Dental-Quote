import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Lock, Gift, InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DiscountedPrice from './DiscountedPrice';

interface LockedTreatmentLineProps {
  treatment: {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    base_price_gbp?: number;
    is_locked: boolean;
    is_package?: boolean;
    is_bonus?: boolean;
  };
  className?: string;
}

const LockedTreatmentLine: React.FC<LockedTreatmentLineProps> = ({ treatment, className = '' }) => {
  const isDiscounted = treatment.base_price_gbp && treatment.base_price_gbp > treatment.unit_price;
  const isBonus = treatment.is_bonus || treatment.unit_price === 0;
  
  return (
    <div className={`flex items-center justify-between p-3 border border-gray-200 bg-gray-50 rounded-md ${className}`}>
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          {isBonus ? (
            <Gift className="h-5 w-5 text-amber-500" />
          ) : (
            <Lock className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <div>
          <div className="flex items-center">
            <h4 className="font-medium">{treatment.description}</h4>
            {treatment.is_locked && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="ml-2 cursor-help">
                      <InfoIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      This is a {isBonus ? 'bonus' : 'locked'} treatment part of a promotional package.
                      It cannot be modified or removed.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {treatment.quantity > 1 && (
            <p className="text-sm text-gray-500">Quantity: {treatment.quantity}</p>
          )}
          
          {isBonus && (
            <Badge variant="outline" className="mt-1 bg-amber-50 text-amber-700 border-amber-200">
              Bonus Treatment
            </Badge>
          )}
          
          {treatment.is_package && (
            <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
              Package Item
            </Badge>
          )}
        </div>
      </div>
      
      <div className="text-right">
        {isDiscounted && treatment.base_price_gbp ? (
          <DiscountedPrice
            originalPrice={treatment.base_price_gbp}
            discountType="fixed_amount"
            discountValue={treatment.base_price_gbp - treatment.unit_price}
            size="sm"
          />
        ) : isBonus ? (
          <span className="font-semibold text-green-600">FREE</span>
        ) : (
          <span className="font-medium">£{treatment.unit_price}</span>
        )}
      </div>
    </div>
  );
};

export default LockedTreatmentLine;