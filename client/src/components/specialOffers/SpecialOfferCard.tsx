import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { CalendarClock, CheckCircle2, InfoIcon, ShoppingBag, Tag } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocation } from 'wouter';
import { formatDate } from '@/lib/utils';

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
    imageUrl?: string; // Changed from bannerImage to match DB field
    treatmentPriceGBP?: number;
    badgeText?: string;
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
  
  if (compact) {
    return (
      <Card className={`overflow-hidden hover:shadow-md transition-shadow ${className}`}>
        <div className="flex">
          {offer.imageUrl && (
            <div className="w-1/3">
              <img 
                src={offer.imageUrl} 
                alt={offer.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className={`${offer.imageUrl ? 'w-2/3' : 'w-full'} p-4`}>
            <h3 className="font-semibold text-lg">{offer.title}</h3>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 mt-1">
              {offer.badgeText || discountLabel}
            </Badge>
            <p className="text-sm mt-2 text-gray-600 line-clamp-2">{offer.description}</p>
            <Button 
              size="sm" 
              className="mt-3" 
              onClick={handleUseOffer}
            >
              Use Offer
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {offer.imageUrl && (
        <div className="h-44 relative overflow-hidden">
          <img 
            src={offer.imageUrl} 
            alt={offer.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-500 text-white font-semibold shadow-sm">
              {offer.badgeText || discountLabel}
            </Badge>
          </div>
        </div>
      )}
      
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
        <p className="text-gray-600 text-sm">{offer.description}</p>
        
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
          Use Offer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SpecialOfferCard;