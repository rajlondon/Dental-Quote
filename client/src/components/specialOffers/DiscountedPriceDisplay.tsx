import React from 'react';

interface DiscountedPriceDisplayProps {
  originalPrice?: number;
  discountedPrice: number;
  currency?: string;
  showPercentage?: boolean;
  className?: string;
}

/**
 * A reusable component to display a discounted price with the original price crossed out
 * and optional discount percentage indicator
 */
const DiscountedPriceDisplay: React.FC<DiscountedPriceDisplayProps> = ({
  originalPrice,
  discountedPrice,
  currency = '£',
  showPercentage = true,
  className = ''
}) => {
  // Only show original price if it's valid and different from discounted price
  const hasDiscount = originalPrice && originalPrice > discountedPrice;
  
  // Calculate discount percentage
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;
  
  return (
    <div className={`flex flex-col items-end ${className}`}>
      {/* Original price with strikethrough */}
      {hasDiscount && (
        <span className="text-gray-400 line-through text-xs">
          {currency}{originalPrice}
        </span>
      )}
      
      {/* Discounted price */}
      <span className={hasDiscount ? "text-green-600 font-semibold" : "text-gray-600"}>
        {currency}{discountedPrice}
      </span>
      
      {/* Discount percentage */}
      {hasDiscount && showPercentage && discountPercentage > 0 && (
        <span className="text-xs text-green-600">
          {discountPercentage}% off
        </span>
      )}
    </div>
  );
};

export default DiscountedPriceDisplay;