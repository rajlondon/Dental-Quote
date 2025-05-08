import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatPrice, calculateDiscountedPrice } from '@/lib/utils/promoUtils';

interface DiscountedPriceProps {
  originalPrice: number;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  currency?: string;
  showBadge?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DiscountedPrice: React.FC<DiscountedPriceProps> = ({
  originalPrice,
  discountType,
  discountValue,
  currency = 'GBP',
  showBadge = true,
  className = '',
  size = 'md',
}) => {
  const discountedPrice = calculateDiscountedPrice(originalPrice, discountType, discountValue);
  const isFree = discountedPrice === 0;
  
  const fontSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  const discountBadge = discountType === 'percentage' 
    ? `${discountValue}% Off` 
    : `${formatPrice(discountValue, currency)} Off`;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isFree ? (
        <span className={`font-semibold text-green-600 ${fontSizes[size]}`}>FREE</span>
      ) : (
        <>
          <span className={`font-semibold ${fontSizes[size]}`}>{formatPrice(discountedPrice, currency)}</span>
          <span className={`line-through text-gray-500 ${fontSizes[size === 'lg' ? 'md' : 'sm']}`}>
            {formatPrice(originalPrice, currency)}
          </span>
        </>
      )}
      
      {showBadge && (
        <Badge className="bg-green-100 text-green-800 border-green-200 ml-1.5">
          {discountBadge}
        </Badge>
      )}
    </div>
  );
};

export default DiscountedPrice;