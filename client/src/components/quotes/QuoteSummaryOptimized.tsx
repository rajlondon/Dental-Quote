import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tag, FileText, Package, ShoppingBag, Percent, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface QuoteSummaryOptimizedProps {
  quote: {
    treatments: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
    }>;
    packages: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      treatments: Array<{
        id: string;
        name: string;
        price: number;
      }>;
    }>;
    addons: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
    }>;
    subtotal: number;
    discount: number;
    total: number;
    promoCode: string | null;
    promoDiscount?: number;
    offerDiscount?: number;
    appliedOfferId?: string;
  };
  onRemoveTreatment?: (treatment: any) => void;
  onRemovePackage?: (pkg: any) => void;
  onRemoveAddon?: (addon: any) => void;
  currency?: string;
  readonly?: boolean;
  printMode?: boolean;
  showPromoDetails?: boolean;
}

/**
 * Performance-optimized quote summary component using useMemo to prevent unnecessary re-renders
 * This component shows a breakdown of all items in a quote with their prices
 */
const QuoteSummaryOptimized: React.FC<QuoteSummaryOptimizedProps> = React.memo(({
  quote,
  onRemoveTreatment,
  onRemovePackage,
  onRemoveAddon,
  currency = 'GBP',
  readonly = false,
  printMode = false,
  showPromoDetails = false
}) => {
  // Memoize the total items count to prevent unnecessary calculations
  const totalItems = useMemo(() => {
    return quote.treatments.length + quote.packages.length + quote.addons.length;
  }, [quote.treatments.length, quote.packages.length, quote.addons.length]);

  // Memoize the treatment items rendering
  const treatmentItems = useMemo(() => {
    return quote.treatments.map(treatment => (
      <div key={treatment.id} className="flex justify-between items-start py-2">
        <div className="flex-1">
          <div className="flex items-start">
            <Tag className="h-4 w-4 mr-2 mt-1 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium">{treatment.name}</p>
              {treatment.description && (
                <p className="text-sm text-muted-foreground">{treatment.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end ml-4">
          <span className="font-semibold">{formatCurrency(treatment.price, currency)}</span>
          {!readonly && onRemoveTreatment && (
            <button
              onClick={() => onRemoveTreatment(treatment)}
              className="text-xs text-muted-foreground hover:text-destructive mt-1"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    ));
  }, [quote.treatments, currency, readonly, onRemoveTreatment]);

  // Memoize the package items rendering
  const packageItems = useMemo(() => {
    return quote.packages.map(pkg => (
      <div key={pkg.id} className="flex justify-between items-start py-2">
        <div className="flex-1">
          <div className="flex items-start">
            <Package className="h-4 w-4 mr-2 mt-1 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium">{pkg.name}</p>
              {pkg.description && (
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
              )}
              {pkg.treatments && pkg.treatments.length > 0 && (
                <div className="mt-2 ml-2 border-l-2 border-gray-200 pl-2">
                  <p className="text-xs text-muted-foreground mb-1">Includes:</p>
                  {pkg.treatments.map(treatment => (
                    <p key={treatment.id} className="text-xs text-muted-foreground">
                      • {treatment.name}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end ml-4">
          <span className="font-semibold">{formatCurrency(pkg.price, currency)}</span>
          {!readonly && onRemovePackage && (
            <button
              onClick={() => onRemovePackage(pkg)}
              className="text-xs text-muted-foreground hover:text-destructive mt-1"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    ));
  }, [quote.packages, currency, readonly, onRemovePackage]);

  // Memoize the addon items rendering
  const addonItems = useMemo(() => {
    return quote.addons.map(addon => (
      <div key={addon.id} className="flex justify-between items-start py-2">
        <div className="flex-1">
          <div className="flex items-start">
            <ShoppingBag className="h-4 w-4 mr-2 mt-1 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium">{addon.name}</p>
              {addon.description && (
                <p className="text-sm text-muted-foreground">{addon.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end ml-4">
          <span className="font-semibold">{formatCurrency(addon.price, currency)}</span>
          {!readonly && onRemoveAddon && (
            <button
              onClick={() => onRemoveAddon(addon)}
              className="text-xs text-muted-foreground hover:text-destructive mt-1"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    ));
  }, [quote.addons, currency, readonly, onRemoveAddon]);

  // Memoize the discount information
  const discountInfo = useMemo(() => {
    const hasDiscount = quote.discount > 0 || (quote.promoDiscount && quote.promoDiscount > 0) || (quote.offerDiscount && quote.offerDiscount > 0);
    
    if (!hasDiscount) return null;
    
    return (
      <>
        {quote.promoCode && quote.promoDiscount && quote.promoDiscount > 0 && showPromoDetails && (
          <div className="flex justify-between text-sm py-1">
            <div className="flex items-center">
              <Percent className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-muted-foreground">Promo: {quote.promoCode}</span>
            </div>
            <span className="text-green-600">-{formatCurrency(quote.promoDiscount, currency)}</span>
          </div>
        )}
        
        {quote.appliedOfferId && quote.offerDiscount && quote.offerDiscount > 0 && showPromoDetails && (
          <div className="flex justify-between text-sm py-1">
            <div className="flex items-center">
              <Gift className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-muted-foreground">Special Offer</span>
            </div>
            <span className="text-green-600">-{formatCurrency(quote.offerDiscount, currency)}</span>
          </div>
        )}
        
        {(quote.discount > 0 && (!quote.promoDiscount || !quote.offerDiscount)) && (
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-green-600">-{formatCurrency(quote.discount, currency)}</span>
          </div>
        )}
      </>
    );
  }, [
    quote.discount, 
    quote.promoDiscount, 
    quote.offerDiscount, 
    quote.promoCode, 
    quote.appliedOfferId, 
    currency,
    showPromoDetails
  ]);

  // If in print mode, render a simplified version
  if (printMode) {
    return (
      <div className="border rounded-lg p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">Quote Summary</h2>
        
        {totalItems > 0 ? (
          <>
            {quote.treatments.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mb-2">Treatments</h3>
                {quote.treatments.map(treatment => (
                  <div key={treatment.id} className="flex justify-between mb-2">
                    <span>{treatment.name}</span>
                    <span>{formatCurrency(treatment.price, currency)}</span>
                  </div>
                ))}
              </>
            )}
            
            {quote.packages.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mb-2 mt-4">Treatment Packages</h3>
                {quote.packages.map(pkg => (
                  <div key={pkg.id} className="flex justify-between mb-2">
                    <span>{pkg.name}</span>
                    <span>{formatCurrency(pkg.price, currency)}</span>
                  </div>
                ))}
              </>
            )}
            
            {quote.addons.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mb-2 mt-4">Add-ons</h3>
                {quote.addons.map(addon => (
                  <div key={addon.id} className="flex justify-between mb-2">
                    <span>{addon.name}</span>
                    <span>{formatCurrency(addon.price, currency)}</span>
                  </div>
                ))}
              </>
            )}
            
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between mb-1">
                <span>Subtotal</span>
                <span>{formatCurrency(quote.subtotal, currency)}</span>
              </div>
              
              {quote.discount > 0 && (
                <div className="flex justify-between mb-1">
                  <span>Discount</span>
                  <span>-{formatCurrency(quote.discount, currency)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <span>{formatCurrency(quote.total, currency)}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center py-6">No items added to this quote yet.</p>
        )}
      </div>
    );
  }

  // Default interactive view
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          Quote Summary
        </CardTitle>
        <CardDescription>
          {totalItems === 0 ? 'No items added yet' : `${totalItems} item${totalItems !== 1 ? 's' : ''} in this quote`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {totalItems > 0 ? (
          <ScrollArea className="max-h-[400px] pr-4">
            {quote.treatments.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-1 text-primary" />
                  Treatments
                </h3>
                {treatmentItems}
              </div>
            )}
            
            {quote.packages.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <Package className="h-4 w-4 mr-1 text-primary" />
                  Treatment Packages
                </h3>
                {packageItems}
              </div>
            )}
            
            {quote.addons.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <ShoppingBag className="h-4 w-4 mr-1 text-primary" />
                  Add-ons
                </h3>
                {addonItems}
              </div>
            )}
            
            {quote.promoCode && showPromoDetails && (
              <div className="mt-4">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Percent className="h-3 w-3 mr-1" />
                  Promo: {quote.promoCode}
                </Badge>
              </div>
            )}
            
            {quote.appliedOfferId && showPromoDetails && (
              <div className="mt-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Gift className="h-3 w-3 mr-1" />
                  Special Offer Applied
                </Badge>
              </div>
            )}
          </ScrollArea>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p>No items added to this quote yet.</p>
          </div>
        )}
      </CardContent>
      
      {totalItems > 0 && (
        <CardFooter className="flex flex-col pt-0">
          <Separator className="mb-4" />
          <div className="w-full">
            <div className="flex justify-between text-sm py-1">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(quote.subtotal, currency)}</span>
            </div>
            
            {discountInfo}
            
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold py-1">
              <span>Total</span>
              <span>{formatCurrency(quote.total, currency)}</span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
});

// Display name for debugging purposes
QuoteSummaryOptimized.displayName = 'QuoteSummaryOptimized';

export default QuoteSummaryOptimized;