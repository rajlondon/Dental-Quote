import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Package, Percent } from 'lucide-react';
import { useLocation } from 'wouter';

interface SpecialOfferCardProps {
  offer: {
    id: string;
    title: string;
    description: string;
    discountType: string;
    discountValue: number;
    applicableTreatments: string[];
    startDate: string;
    endDate: string;
    promoCode: string;
    termsAndConditions: string;
    imageUrl?: string;
    treatmentPriceGBP?: number;
    badgeText?: string;
    type?: 'offer' | 'package';
  };
  className?: string;
  onClick?: (promoCode: string) => void;
  compact?: boolean;
}

const SpecialOfferCard: React.FC<SpecialOfferCardProps> = ({ 
  offer, 
  className = '', 
  onClick,
  compact = false
}) => {
  const [, setLocation] = useLocation();
  const [mounted, setMounted] = useState(false);
  
  // Force component to re-render on mount and log data
  useEffect(() => {
    setMounted(true);
    console.log('SpecialOfferCard mounted with offer:', offer);
    
    // Log DOM state after render
    const timer = setTimeout(() => {
      console.log('DOM after render:', document.querySelector('.special-offer-card'));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [offer]);

  const handleUseOffer = () => {
    if (onClick) {
      onClick(offer.promoCode);
    } else {
      // Default behavior - redirect to quote page with promo code
      setLocation(`/your-quote?promoCode=${offer.promoCode}`);
    }
  };

  // Explicitly check image existence
  const hasImage = offer.imageUrl && offer.imageUrl.trim() !== '';
  
  // Log what's being rendered
  console.log('Rendering with image?', hasImage, offer.imageUrl);
  
  // Create appropriate discount label
  const discountLabel = offer.discountType === 'percentage' 
    ? `${offer.discountValue}% Off` 
    : `£${offer.discountValue} Off`;
  
  // Prevent duplicate title in badge
  const displayBadge = offer.badgeText === offer.title 
    ? discountLabel 
    : (offer.badgeText || discountLabel);

  // Set badge styles based on type
  const badgeStyle = {
    background: offer.type === 'package' ? '#f0e4ff' : '#fff4e6',
    color: offer.type === 'package' ? '#7e3af2' : '#ff8a00',
    border: `1px solid ${offer.type === 'package' ? '#d4bffc' : '#ffd0a0'}`,
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '6px'
  };

  return (
    <Card className={`special-offer-card overflow-hidden hover:shadow-md transition-shadow ${className}`} data-has-image={hasImage}>
      {/* Card Header with badge */}
      <div className="p-4 pb-0 flex justify-between items-start">
        <h3 className="font-semibold text-lg">{offer.title}</h3>
        <div style={badgeStyle}>
          {offer.type === 'package' ? (
            <><Package className="h-3 w-3 mr-1" /> Package Deal</>
          ) : (
            <><Percent className="h-3 w-3 mr-1" /> {displayBadge}</>
          )}
        </div>
      </div>
      
      {/* Image or placeholder */}
      {hasImage ? (
        <div 
          className="offer-image my-3 mx-4"
          style={{ 
            backgroundImage: `url(${offer.imageUrl})`,
            height: '120px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '8px'
          }}
        />
      ) : (
        <div className="offer-image-placeholder mx-4 my-3" style={{
          height: '120px',
          backgroundColor: offer.type === 'package' ? '#f5f0ff' : '#fff8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          borderRadius: '8px'
        }}>
          {offer.type === 'package' ? '🎁' : '💰'}
        </div>
      )}
      
      {/* Description with guaranteed visibility */}
      <div className="px-4 mb-2">
        <p className="text-sm text-gray-600" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          position: 'relative'
        }} title={offer.description}>
          {offer.description}
        </p>
      </div>
      
      {/* Footer with button */}
      <div className="px-4 pb-4 pt-2 flex justify-end">
        <Button 
          className="offer-button"
          variant="default"
          onClick={handleUseOffer}
        >
          Apply to Quote
        </Button>
      </div>
    </Card>
  );
};

export default SpecialOfferCard;