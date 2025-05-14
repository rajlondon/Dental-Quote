import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Package, Percent, Tag, Gift } from 'lucide-react';
import { useLocation } from 'wouter';
import { trackEvent } from '@/lib/analytics';

// More flexible interface to handle different data structures
interface SpecialOfferCardProps {
  offer: {
    id: string;
    title: string;
    description: string;
    // Support both camelCase and snake_case field names
    discountType?: string;
    discount_type?: string;
    discountValue?: number;
    discount_value?: number;
    applicableTreatments?: string[];
    applicable_treatments?: string[];
    startDate?: string;
    start_date?: string;
    endDate?: string;
    end_date?: string;
    promoCode?: string;
    promo_code?: string;
    termsConditions?: string;
    terms_conditions?: string;
    banner_image?: string;
    imageUrl?: string;
    treatmentPriceGBP?: number;
    treatment_price_gbp?: number;
    badgeText?: string;
    type?: 'offer' | 'package';
    clinic_id?: string | number;
    clinicId?: string | number;
  };
  className?: string;
  onClick?: (promoCode: string, offerId: string) => void;
  compact?: boolean;
}

// Helper for logging issues - only in development
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SpecialOfferCard] ${message}`, data);
  }
};

const SpecialOfferCard = React.memo(({ 
  offer, 
  className = '', 
  onClick,
  compact = false
}: SpecialOfferCardProps) => {
  const [, setLocation] = useLocation();
  const [imageError, setImageError] = useState(false);
  
  // Normalize data - handle different property name formats (snake_case vs camelCase)
  const normalizedOffer = useMemo(() => {
    // Convert offer object to have consistent property names
    return {
      id: offer.id,
      title: offer.title,
      description: offer.description,
      discountType: offer.discountType || offer.discount_type || 'fixed_amount',
      discountValue: offer.discountValue || offer.discount_value || 0,
      applicableTreatments: offer.applicableTreatments || offer.applicable_treatments || [],
      startDate: offer.startDate || offer.start_date || new Date().toISOString(),
      endDate: offer.endDate || offer.end_date || new Date().toISOString(),
      promoCode: offer.promoCode || offer.promo_code || '',
      termsConditions: offer.termsConditions || offer.terms_conditions || '',
      imageUrl: offer.banner_image || offer.imageUrl || '',
      treatmentPriceGBP: offer.treatmentPriceGBP || offer.treatment_price_gbp || 0,
      badgeText: offer.badgeText || '',
      type: offer.type || 'offer',
      clinicId: offer.clinic_id || offer.clinicId || ''
    };
  }, [offer]);
  
  // Log component mounting for debugging
  useEffect(() => {
    debugLog('✅ NEW TROUBLESHOOTED OFFER CARD MOUNTED:', offer);
    
    // Track component render in analytics
    trackEvent('special_offer_viewed', 'special_offers', `offer_id_${offer.id}`);
    
    return () => {
      // Clean up any resources
    };
  }, [offer]);

  // Handle clicking on the offer
  const handleUseOffer = () => {
    trackEvent('special_offer_clicked', 'special_offers', `offer_id_${offer.id}`);
    
    if (onClick) {
      onClick(normalizedOffer.promoCode, normalizedOffer.id);
    } else {
      // Default behavior - redirect to quote page with promo code
      setLocation(`/your-quote?promoCode=${normalizedOffer.promoCode}&offerId=${normalizedOffer.id}`);
    }
  };

  // Create appropriate discount label
  const discountLabel = normalizedOffer.discountType === 'percentage' 
    ? `${normalizedOffer.discountValue}% Off` 
    : `£${normalizedOffer.discountValue} Off`;
  
  // Prevent duplicate title in badge
  const displayBadge = normalizedOffer.badgeText === normalizedOffer.title 
    ? discountLabel 
    : (normalizedOffer.badgeText || discountLabel);

  // Custom styles for badges
  const badgeStyle = {
    background: normalizedOffer.type === 'package' ? '#f0e4ff' : '#fff4e6',
    color: normalizedOffer.type === 'package' ? '#7e3af2' : '#ff8a00',
    border: `1px solid ${normalizedOffer.type === 'package' ? '#d4bffc' : '#ffd0a0'}`,
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '6px'
  };

  // Handle image onLoad and onError events
  const handleImageError = () => {
    debugLog("Image failed to load:", normalizedOffer.imageUrl);
    setImageError(true);
  };

  // Check if we have a valid image path (after error handling)
  const hasValidImage = normalizedOffer.imageUrl && 
                        normalizedOffer.imageUrl.trim() !== '' && 
                        !imageError;

  return (
    <Card className={`special-offer-card overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Card Header with badge */}
      <div className="p-4 pb-0 flex justify-between items-start">
        <h3 className="font-semibold text-lg">{normalizedOffer.title}</h3>
        <div style={badgeStyle}>
          {normalizedOffer.type === 'package' ? (
            <><Package className="h-3 w-3 mr-1" /> Package Deal</>
          ) : (
            <><Percent className="h-3 w-3 mr-1" /> {displayBadge}</>
          )}
        </div>
      </div>
      
      {/* Image with actual error handling */}
      {hasValidImage ? (
        <div className="relative my-3 mx-4 h-[120px] rounded-lg overflow-hidden">
          <img 
            src={normalizedOffer.imageUrl}
            alt={normalizedOffer.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
      ) : (
        <div 
          className="offer-image-placeholder mx-4 my-3 rounded-lg flex items-center justify-center"
          style={{
            height: '120px',
            backgroundColor: normalizedOffer.type === 'package' ? '#f5f0ff' : '#fff8f0',
          }}
        >
          {normalizedOffer.type === 'package' ? (
            <Package className="h-10 w-10 text-purple-400" />
          ) : normalizedOffer.discountType === 'percentage' ? (
            <Percent className="h-10 w-10 text-orange-400" />
          ) : (
            <Gift className="h-10 w-10 text-blue-400" />
          )}
        </div>
      )}
      
      {/* Description with guaranteed visibility */}
      <div className="px-4 mb-2">
        <p className="text-sm text-gray-600 line-clamp-2" title={normalizedOffer.description}>
          {normalizedOffer.description}
        </p>
      </div>
      
      {/* Display applicable treatments */}
      {!compact && normalizedOffer.applicableTreatments && normalizedOffer.applicableTreatments.length > 0 && (
        <div className="px-4 mb-3">
          <div className="flex flex-wrap gap-1">
            {normalizedOffer.applicableTreatments.slice(0, 3).map((treatment, index) => (
              <span key={index} className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                <Tag className="h-3 w-3 mr-1 text-gray-500" />
                {typeof treatment === 'string' && 
                  treatment.replace(/_/g, ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            ))}
            {normalizedOffer.applicableTreatments.length > 3 && (
              <span className="text-xs text-muted-foreground px-1">
                +{normalizedOffer.applicableTreatments.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Footer with button */}
      <div className="px-4 pb-4 pt-2 flex justify-between items-center">
        {normalizedOffer.treatmentPriceGBP > 0 && (
          <div className="text-sm font-medium">
            From <span className="text-primary">£{normalizedOffer.treatmentPriceGBP}</span>
          </div>
        )}
        <Button 
          className="offer-button"
          variant="default"
          onClick={handleUseOffer}
          data-testid={`offer-button-${normalizedOffer.id}`}
        >
          Apply to Quote
        </Button>
      </div>
    </Card>
  );
});

// Display name for debugging
SpecialOfferCard.displayName = 'SpecialOfferCard';

export default SpecialOfferCard;