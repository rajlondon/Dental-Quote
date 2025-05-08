import React from 'react';
import DiscountedPriceDisplay from './DiscountedPriceDisplay';

interface TreatmentLinePriceProps {
  price: number | undefined;
  basePriceGBP?: number | undefined;
  unitPriceGBP?: number | undefined;
  isSpecialOffer?: boolean;
  hasSpecialOffer?: boolean;
}

/**
 * Component that handles displaying the price for a treatment line
 * Properly handles the cases where price might be undefined
 */
const TreatmentLinePrice: React.FC<TreatmentLinePriceProps> = ({
  price = 0,
  basePriceGBP,
  unitPriceGBP,
  isSpecialOffer = false,
  hasSpecialOffer = false
}) => {
  // If this is a special offer with different prices
  if ((isSpecialOffer || hasSpecialOffer) && basePriceGBP && basePriceGBP !== price) {
    return (
      <DiscountedPriceDisplay 
        originalPrice={basePriceGBP}
        discountedPrice={price}
        showPercentage={true}
      />
    );
  }
  
  // Regular price without special formatting
  return (
    <span className="text-gray-600">
      £{price}
    </span>
  );
};

export default TreatmentLinePrice;