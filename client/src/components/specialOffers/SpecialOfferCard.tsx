import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { CalendarClock, CheckCircle2, InfoIcon, ShoppingBag, Tag, Percent, Package } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocation } from 'wouter';
import { formatDate } from '@/lib/utils';
import OfferImagePlaceholder from './OfferImagePlaceholder';

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
    type?: 'offer' | 'package'; // To differentiate offers from packages
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
  
  // Debug logs
  console.log('Rendering SpecialOfferCard with offer:', offer);
  console.log('Has image URL?', !!offer.imageUrl, offer.imageUrl);
  console.log('Offer type:', offer.type || 'default');

  const handleUseOffer = () => {
    if (onClick) {
      onClick(offer.promoCode);
    } else {
      // Default behavior - redirect to quote page with promo code
      setLocation(`/your-quote?promoCode=${offer.promoCode}`);
    }
  };
  
  const discountLabel = offer.discountType === 'percentage' 
    ? `${offer.discountValue}% Off` 
    : `£${offer.discountValue} Off`;
    
  // Avoid duplicate display of title in badge
  const displayBadge = offer.badgeText === offer.title
    ? discountLabel
    : offer.badgeText || discountLabel;
  
  const timeRemaining = () => {
    const endDate = new Date(offer.endDate);
    const today = new Date();
    const diffTime = Math.abs(endDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      return `Valid until ${formatDate(offer.endDate)}`;
    } else if (diffDays > 1) {
      return `${diffDays} days left`;
    } else {
      return 'Last day!';
    }
  };

  // Function to render description with a tooltip for full text
  const renderDescription = (text: string) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm mt-2 text-gray-600 line-clamp-2">
              {text}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const BadgeIcon = offer.type === 'package' ? Package : Percent;
  
  // Force explicit type check for image URL
  const hasValidImage = Boolean(offer.imageUrl && offer.imageUrl.trim() !== '');
  console.log('hasValidImage check result:', hasValidImage);

  if (compact) {
    return (
      <Card className={`overflow-hidden hover:shadow-md transition-shadow ${className}`}>
        <div className="flex">
          <div className="w-1/3" style={{ minHeight: '120px' }}>
            {hasValidImage ? (
              <img 
                src={offer.imageUrl} 
                alt={offer.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <OfferImagePlaceholder 
                title={offer.title} 
                type={offer.type}
                className="h-full"
              />
            )}
          </div>
          <div className="w-2/3 p-4">
            <h3 className="font-semibold text-lg">{offer.title}</h3>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 mt-1">
              <BadgeIcon className="h-3 w-3 mr-1" />
              {displayBadge}
            </Badge>
            {renderDescription(offer.description)}
            <Button 
              size="sm" 
              className="mt-3" 
              onClick={handleUseOffer}
            >
              Apply to Quote
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${className}`} data-testid="offer-card">
      <div className="h-44 relative overflow-hidden">
        {hasValidImage ? (
          <img 
            src={offer.imageUrl} 
            alt={offer.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <OfferImagePlaceholder 
            title={offer.title}
            type={offer.type}
            className="h-full"
          />
        )}
        <div className="absolute top-2 right-2">
          <Badge className="bg-amber-500 text-white font-semibold shadow-sm">
            <BadgeIcon className="h-3 w-3 mr-1" />
            {displayBadge}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-xl">{offer.title}</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-xs flex items-center text-amber-700 bg-amber-50 rounded-full px-2 py-1">
                  <CalendarClock className="h-3 w-3 mr-1" />
                  {timeRemaining()}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Valid from {formatDate(offer.startDate)} to {formatDate(offer.endDate)}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent>
        {renderDescription(offer.description)}
        
        {offer.applicableTreatments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {offer.applicableTreatments.slice(0, 3).map((treatment: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {treatment.replace(/_/g, ' ')}
              </Badge>
            ))}
            {offer.applicableTreatments.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{offer.applicableTreatments.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {offer.treatmentPriceGBP && (
          <div className="mt-3 flex items-center text-sm text-gray-700">
            <ShoppingBag className="h-4 w-4 mr-1" />
            <span>Treatment Value: </span>
            <span className="font-semibold ml-1">£{offer.treatmentPriceGBP}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <InfoIcon className="h-4 w-4 mr-1" />
                Terms
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">{offer.termsAndConditions}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button onClick={handleUseOffer}>
          <Tag className="h-4 w-4 mr-2" />
          Apply to Quote
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SpecialOfferCard;