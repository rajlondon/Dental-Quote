import React from 'react';
import { usePromoStore } from '@/features/promo/usePromoStore';
import { usePromoBySlug } from '@/features/promo/usePromoApi';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Percent, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { DiscountType, PromoType } from '@shared/schema';

export function PromoRibbon() {
  const { activePromoSlug, promoData, clearPromo } = usePromoStore();
  
  // Fetch promo data if we have a slug but not the data
  const { isLoading, error } = usePromoBySlug(
    activePromoSlug && !promoData ? activePromoSlug : null
  );
  
  if (isLoading) {
    return (
      <Alert className="bg-gray-100 border-none">
        <AlertTitle className="flex items-center gap-2">
          <span className="animate-pulse">Loading promotion details...</span>
        </AlertTitle>
      </Alert>
    );
  }
  
  if (error || !promoData) {
    return null;
  }
  
  const discountLabel = promoData.discountType === DiscountType.PERCENT
    ? `${promoData.discountValue}%`
    : formatCurrency(promoData.discountValue);
    
  const promoTypeIcon = promoData.promoType === PromoType.PACKAGE
    ? <Tag className="h-4 w-4" />
    : <Percent className="h-4 w-4" />;
    
  const handleRemovePromo = () => {
    if (window.confirm('Are you sure you want to remove this promotion? The discount will no longer apply.')) {
      clearPromo();
      
      // Remove the promo from URL without navigation
      const url = new URL(window.location.href);
      url.searchParams.delete('promo');
      window.history.replaceState({}, '', url.toString());
    }
  };
  
  return (
    <Alert className="bg-primary/10 border-primary mb-6">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          {promoTypeIcon}
          <div>
            <AlertTitle className="text-primary font-medium">
              {promoData.title}
            </AlertTitle>
            <AlertDescription className="text-sm">
              {promoData.promoType === PromoType.PACKAGE 
                ? "You're building a package with special pricing"
                : "Special offer applied to your quote"}
              {' '}
              <Badge variant="outline" className="ml-1 bg-primary/20 hover:bg-primary/30">
                Save {discountLabel}
              </Badge>
            </AlertDescription>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRemovePromo}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          title="Remove promotion"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}