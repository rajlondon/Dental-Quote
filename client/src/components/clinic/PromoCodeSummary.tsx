import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, PercentIcon, PoundSterling } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface PromoCodeSummaryProps {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  subtotal: number;
  discount: number;
  total: number;
  className?: string;
}

/**
 * Component that displays a summary of an applied promotion code
 */
const PromoCodeSummary: React.FC<PromoCodeSummaryProps> = ({
  code,
  discountType,
  discountValue,
  subtotal,
  discount,
  total,
  className = '',
}) => {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-primary" />
            <span className="font-medium text-lg">Promotion Applied</span>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary font-medium">
            {code}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {discountType === 'PERCENT' ? (
            <>
              <PercentIcon className="h-4 w-4" />
              <span>{discountValue}% discount</span>
            </>
          ) : (
            <>
              <PoundSterling className="h-4 w-4" />
              <span>{formatCurrency(discountValue)} fixed discount</span>
            </>
          )}
        </div>
        
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-primary font-medium">
            <span>Discount:</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PromoCodeSummary;