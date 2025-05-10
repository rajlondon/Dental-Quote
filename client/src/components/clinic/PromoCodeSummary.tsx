import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Tag, X } from "lucide-react";
import { formatCurrency, formatDiscount, formatDate } from "@/lib/format";
import { PromoDetails, QuoteDetails, useApplyCode } from "@/hooks/use-apply-code";

interface PromoCodeSummaryProps {
  promo: PromoDetails;
  quote: QuoteDetails;
  onRemove?: () => void;
}

/**
 * Component to display promo code details and summary of applied discount
 */
export const PromoCodeSummary = ({ promo, quote, onRemove }: PromoCodeSummaryProps) => {
  const { removePromoCode, isRemoving } = useApplyCode();

  // Handle removing the promo code
  const handleRemove = () => {
    if (isRemoving) return;
    
    removePromoCode(
      { quoteId: quote.id },
      {
        onSuccess: () => {
          if (onRemove) onRemove();
        },
      }
    );
  };

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {promo.title}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Code: <span className="font-medium text-primary">{promo.code}</span>
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span className="sr-only">Remove promo code</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Discount:</span>
            <span className="font-medium">
              {formatDiscount(promo.discount_value, promo.discount_type)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>{formatCurrency(quote.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Savings:</span>
            <span className="font-medium text-green-600">-{formatCurrency(quote.discount)}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t">
            <span className="font-medium">Final Price:</span>
            <span className="font-semibold">{formatCurrency(quote.total_price)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
            <span>Valid until:</span>
            <span>{formatDate(promo.end_date)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};