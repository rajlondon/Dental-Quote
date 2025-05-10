import React from 'react';
import { Check, Tag, Percent, AlertCircle } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DiscountType, PromoType } from '@shared/schema';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';

interface PromoCodeSummaryProps {
  promoCode: string;
  promoName: string;
  discountType: DiscountType;
  discountValue: number;
  promoType: PromoType;
  subtotal?: number;
  discountAmount?: number;
  totalAfterDiscount?: number;
  showFullDetails?: boolean;
  className?: string;
}

export function PromoCodeSummary({
  promoCode,
  promoName,
  discountType,
  discountValue,
  promoType,
  subtotal,
  discountAmount,
  totalAfterDiscount,
  showFullDetails = false,
  className
}: PromoCodeSummaryProps) {
  const getDiscountText = () => {
    if (discountType === DiscountType.PERCENTAGE) {
      return `${discountValue}% off`;
    } else {
      return `${formatCurrency(discountValue)} off`;
    }
  };

  const getDiscountIcon = () => {
    if (discountType === DiscountType.PERCENTAGE) {
      return <Percent className="h-4 w-4 mr-1" />;
    } else {
      return <Tag className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <Card className={cn("border-2 border-primary/20", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{promoName}</CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {promoCode}
          </Badge>
        </div>
        <CardDescription className="flex items-center text-primary font-medium mt-1">
          {getDiscountIcon()}
          {getDiscountText()}
        </CardDescription>
      </CardHeader>
      
      {showFullDetails && subtotal !== undefined && discountAmount !== undefined && totalAfterDiscount !== undefined && (
        <CardContent className="pb-2">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between font-medium text-primary">
              <span>Discount:</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t">
              <span>Total after discount:</span>
              <span>{formatCurrency(totalAfterDiscount)}</span>
            </div>
          </div>
        </CardContent>
      )}
      
      <CardFooter className={cn("pt-2", !showFullDetails && "pb-2")}>
        <div className="w-full flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="h-3 w-3 text-primary" />
          <span>Promo code applied successfully</span>
        </div>
      </CardFooter>
    </Card>
  );
}

export function PromoCodeBadge({
  promoCode,
  discountType,
  discountValue,
  className
}: {
  promoCode: string;
  discountType: DiscountType;
  discountValue: number;
  className?: string;
}) {
  const getDiscountText = () => {
    if (discountType === DiscountType.PERCENTAGE) {
      return `${discountValue}%`;
    } else {
      return formatCurrency(discountValue);
    }
  };

  return (
    <Badge variant="outline" className={cn("font-mono flex items-center gap-1", className)}>
      <Tag className="h-3 w-3" />
      <span>
        {promoCode}: {getDiscountText()} off
      </span>
    </Badge>
  );
}

export function PromoCodeInvalidBadge({
  promoCode,
  message,
  className
}: {
  promoCode: string;
  message: string;
  className?: string;
}) {
  return (
    <Badge variant="destructive" className={cn("font-mono flex items-center gap-1", className)}>
      <AlertCircle className="h-3 w-3" />
      <span>
        {promoCode}: {message}
      </span>
    </Badge>
  );
}