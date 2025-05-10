import React from 'react';
import { X, Tag, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistance } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PromoDetails } from '@/hooks/use-apply-code';

interface PromoCodeBadgeProps {
  promo: PromoDetails;
  onDismiss?: () => void;
  isDismissible?: boolean;
}

/**
 * Displays a dismissible badge with promo code information
 */
export function PromoCodeBadge({ promo, onDismiss, isDismissible = true }: PromoCodeBadgeProps) {
  const formatExpiryDate = (endDate: string) => {
    try {
      return formatDistance(new Date(endDate), new Date(), { addSuffix: true });
    } catch (error) {
      return 'expiry date unknown';
    }
  };

  const formattedValue = promo.discount_type === 'PERCENT' 
    ? `${promo.discount_value}% off` 
    : `€${promo.discount_value} off`;

  return (
    <Alert className="bg-primary/5 border-primary/20">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm font-medium text-foreground">
            <span className="font-bold text-primary">{promo.code}</span> – {formattedValue} applied 
            {promo.end_date && (
              <span className="text-muted-foreground ml-1 text-xs">
                (expires <span className="font-medium">{formatExpiryDate(promo.end_date)}</span>)
              </span>
            )}
          </AlertDescription>
        </div>
        
        {isDismissible && onDismiss && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 -mr-2" 
            onClick={onDismiss}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </Alert>
  );
}