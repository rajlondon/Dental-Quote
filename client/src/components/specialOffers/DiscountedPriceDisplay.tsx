import React from 'react';

interface DiscountedPriceDisplayProps {
  originalPrice?: number;
  discountedPrice: number;
  currency?: string;
  showPercentage?: boolean;
  className?: string;
  isSpecialOffer?: boolean;  // Added to force special offer display
  specialOfferText?: string; // Added for custom text on special offer with 0 discount
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
  className = '',
  isSpecialOffer = false,
  specialOfferText = 'Special Offer Applied'
}) => {
  // Only show original price if it's valid and different from discounted price
  const hasDiscount = originalPrice && originalPrice > discountedPrice;
  
  // Calculate discount percentage
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;
    
  // For special offers with no visible discount, still show it's applied
  const isPromotionalPrice = isSpecialOffer || hasDiscount;
  
  return (
    <div className={`flex flex-col items-end ${className}`}>
      {/* Original price with strikethrough */}
      {hasDiscount && (
        <span className="text-gray-400 line-through text-xs">
          {currency}{originalPrice}
        </span>
      )}
      
      {/* Discounted price */}
      <span className={isPromotionalPrice ? "text-green-600 font-semibold" : "text-gray-600"}>
        {currency}{discountedPrice}
      </span>
      
      {/* Discount percentage or special offer text */}
      {hasDiscount && showPercentage && discountPercentage > 0 && (
        <span className="text-xs text-green-600">
          {discountPercentage}% off
        </span>
      )}
      
      {/* When it's a special offer with no visible discount, still show that it's a special offer */}
      {isSpecialOffer && !hasDiscount && (
        <span className="text-xs text-blue-600 whitespace-nowrap">
          {specialOfferText}
        </span>
      )}
    </div>
  );
};

export default DiscountedPriceDisplay;