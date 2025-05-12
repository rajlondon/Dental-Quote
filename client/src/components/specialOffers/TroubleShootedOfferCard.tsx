import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';

console.log('COMPONENT_ID: TroubleShootedOfferCard LOADED - ' + new Date().toISOString());

export interface OfferData {
  id: string;
  title?: string;
  name?: string;
  description: string;
  discount_type?: string;
  discount_value?: number;
  banner_image?: string;
  imageUrl?: string;
  treatment_price_gbp?: number;
  treatmentPriceGBP?: number;
  promo_code?: string;
  promoCode?: string;
  type?: 'offer' | 'package';
}

interface TroubleShootedOfferCardProps {
  offer: OfferData;
  onClick?: (promoCode: string) => void;
}

const TroubleShootedOfferCard: React.FC<TroubleShootedOfferCardProps> = ({ offer, onClick }) => {
  // Debug logging
  useEffect(() => {
    console.log('✅ NEW TROUBLESHOOTED OFFER CARD MOUNTED:', offer);
  }, [offer]);
  
  // Extract fields with fallbacks for different naming conventions
  const title = offer.title || offer.name || 'Unnamed Offer';
  const description = offer.description || '';
  const discountValue = offer.discount_value || 0;
  const imageUrl = offer.banner_image || offer.imageUrl;
  const price = offer.treatment_price_gbp || offer.treatmentPriceGBP;
  const promoCode = offer.promo_code || offer.promoCode;
  
  // Handle click
  const handleUseOffer = () => {
    console.log('TroubleShootedOfferCard clicked for:', title);
    if (onClick && promoCode) {
      onClick(promoCode);
    }
  };
  
  return (
    <div className="troubleshooted-offer-card relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all hover:shadow-lg">
      <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-2 py-1 rounded-bl-lg">
        {offer.type || 'offer'}
      </div>
      
      {/* Image section */}
      <div className="h-40 w-full bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="h-full w-full object-cover"
            onError={(e) => {
              console.error(`Image failed to load: ${imageUrl}`);
              e.currentTarget.src = 'https://via.placeholder.com/400x200?text=MyDentalFly+Offer';
            }} 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-5xl">🦷</span>
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        {/* Pricing section */}
        <div className="flex items-center justify-between mb-4">
          {price && (
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Regular price</span>
              <span className="text-lg font-bold">£{price}</span>
            </div>
          )}
          
          {discountValue > 0 && (
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500">Discount</span>
              <span className="text-lg font-bold text-green-600">
                {offer.discount_type === 'percentage' ? `${discountValue}%` : `£${discountValue}`}
              </span>
            </div>
          )}
        </div>
        
        {/* Action button */}
        <Button 
          onClick={handleUseOffer}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          Apply to Quote
        </Button>
        
        {/* Debug timestamp */}
        <div className="mt-2 text-right text-xs text-gray-400">
          ID: {offer.id.substring(0, 8)}...
        </div>
      </div>
    </div>
  );
};

export default TroubleShootedOfferCard;