import React from 'react';
import { BadgePercent, AlertCircle, Tag, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSpecialOfferTracking } from '@/hooks/use-special-offer-tracking';

interface ActiveOfferBadgeProps {
  className?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ActiveOfferBadge({ 
  className,
  showDetails = false,
  size = 'md'
}: ActiveOfferBadgeProps) {
  const { specialOffer, hasActiveOffer } = useSpecialOfferTracking();
  
  if (!hasActiveOffer || !specialOffer) {
    return null;
  }
  
  // Calculate base size styles
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-sm py-1 px-3',
    lg: 'text-base py-1.5 px-4'
  };
  
  // Format discount message
  const discountMsg = specialOffer.discountType === 'percentage'
    ? `${specialOffer.discountValue}% off`
    : `£${specialOffer.discountValue} off`;
  
  // For compact badge display
  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={cn(
                'bg-green-100 hover:bg-green-200 text-green-800 border border-green-300 gap-1',
                sizeClasses[size],
                className
              )}
            >
              <BadgePercent className={cn('h-3 w-3', size === 'lg' && 'h-4 w-4')} />
              Special Offer Applied
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p><strong>{specialOffer.title}</strong></p>
            <p className="text-xs">{discountMsg} discount applied to eligible treatments</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // For detailed display
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 shadow-sm">
        <div className="flex items-start">
          <div className="mr-3 text-green-600 mt-1">
            <Tag className="h-5 w-5" />
          </div>
          <div className="flex-grow">
            <h4 className="font-medium text-green-700 flex items-center gap-2">
              Special Offer Applied
              <Badge className="bg-green-600">
                {discountMsg}
              </Badge>
            </h4>
            <p className="text-sm text-gray-600 mt-1 mb-0">
              <strong>{specialOffer.title}</strong> - Discount automatically applied to eligible treatments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}