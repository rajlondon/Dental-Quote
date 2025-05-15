import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Define proper types for the quote components
interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'treatment';
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'package';
  treatments: Treatment[];
}

interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'addon';
}

interface QuoteState {
  id?: string | number;
  treatments: Treatment[];
  packages: Package[];
  addons: Addon[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
  promoCodeId: string | null;
  discountType: 'percentage' | 'fixed_amount' | null;
  discountValue: number | null;
  offerDiscount?: number;
  promoDiscount?: number;
  appliedOfferId?: string;
  appliedPackageId?: string;
  packageSavings?: number;
  includedPerks?: string[];
}

interface QuoteSummaryProps {
  quote: QuoteState;
}

// Use React.memo to prevent unnecessary re-renders
export const QuoteSummary = React.memo(({ quote }: QuoteSummaryProps) => {
  // Memoize expensive calculations
  const formattedPrices = useMemo(() => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    
    return {
      subtotal: formatter.format(quote.subtotal),
      discount: formatter.format(quote.discount),
      total: formatter.format(quote.total),
      offerDiscount: formatter.format(quote.offerDiscount || 0),
      promoDiscount: formatter.format(quote.promoDiscount || 0),
      packageSavings: formatter.format(quote.packageSavings || 0),
      formatPrice: (amount: number) => formatter.format(amount)
    };
  }, [
    quote.subtotal, 
    quote.discount, 
    quote.total, 
    quote.offerDiscount, 
    quote.promoDiscount,
    quote.packageSavings
  ]);
  
  // Helper function that uses the memoized formatter
  const formatCurrency = (amount: number): string => {
    return formattedPrices.formatPrice(amount);
  };
  
  // Memoize treatments section to prevent unnecessary re-renders
  const treatmentsSection = useMemo(() => {
    if (!quote.treatments || quote.treatments.length === 0) {
      return null;
    }
    
    return (
      <>
        <h3 className="text-lg font-semibold mb-2">Treatments</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.treatments.map((treatment: any) => (
              <TableRow key={treatment.id}>
                <TableCell className="font-medium">{treatment.name}</TableCell>
                <TableCell>{treatment.description}</TableCell>
                <TableCell className="text-right">{formattedPrices.formatPrice(treatment.price)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    );
  }, [quote.treatments, formattedPrices]);
  
  // Memoize packages section to prevent unnecessary re-renders
  const packagesSection = useMemo(() => {
    if (!quote.packages || quote.packages.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Packages</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package</TableHead>
              <TableHead>Includes</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.packages.map((pkg: any) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.name}</TableCell>
                <TableCell>
                  <ul className="list-disc pl-5 text-sm">
                    {pkg.treatments && pkg.treatments.map((treatment: any, index: number) => (
                      <li key={index}>{treatment.name}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell className="text-right">{formattedPrices.formatPrice(pkg.price)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }, [quote.packages, formattedPrices]);
  
  // Memoize addons section to prevent unnecessary re-renders
  const addonsSection = useMemo(() => {
    if (!quote.addons || quote.addons.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Add-ons</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.addons.map((addon: any) => (
              <TableRow key={addon.id}>
                <TableCell className="font-medium">{addon.name}</TableCell>
                <TableCell>{addon.description}</TableCell>
                <TableCell className="text-right">{formattedPrices.formatPrice(addon.price)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }, [quote.addons, formattedPrices]);

  // Memoize promo code information
  const promoCodeInfo = useMemo(() => {
    if (!quote.promoCode) return null;
    
    return (
      <div className="mt-6 bg-muted p-4 rounded-md">
        <h3 className="text-md font-semibold mb-2">Applied Promo Code</h3>
        <div className="flex items-center">
          <Badge variant="outline" className="mr-2">{quote.promoCode}</Badge>
          <span className="text-sm text-gray-500">
            {quote.discountType === 'percentage' 
              ? `${quote.discountValue}% off` 
              : `${formatCurrency(quote.discountValue || 0)} off`}
          </span>
        </div>
      </div>
    );
  }, [quote.promoCode, quote.discountType, quote.discountValue, formatCurrency]);
  
  // Memoize special offer information
  const specialOfferInfo = useMemo(() => {
    if (!quote.appliedOfferId) return null;
    
    return (
      <div className="mt-6 bg-yellow-50 p-4 rounded-md border border-yellow-100">
        <h3 className="text-md font-semibold mb-2">Applied Special Offer</h3>
        <div className="flex items-center">
          <Badge className="mr-2 bg-yellow-200 text-yellow-800 hover:bg-yellow-300">Special Offer</Badge>
          <span className="text-sm text-yellow-800">
            Discount: {formatCurrency(quote.offerDiscount || 0)}
          </span>
        </div>
      </div>
    );
  }, [quote.appliedOfferId, quote.offerDiscount, formatCurrency]);

  // Memoize treatment package information
  const treatmentPackageInfo = useMemo(() => {
    if (!quote.appliedPackageId) return null;
    
    return (
      <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-100">
        <h3 className="text-md font-semibold mb-2">Applied Treatment Package</h3>
        <div className="flex items-center mb-2">
          <Badge className="mr-2 bg-blue-200 text-blue-800 hover:bg-blue-300">Package</Badge>
          <span className="text-sm text-blue-800">
            Savings: {formattedPrices.packageSavings}
          </span>
        </div>
        
        {quote.includedPerks && quote.includedPerks.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-1">Package Perks:</h4>
            <ul className="list-disc pl-5 text-sm text-blue-700">
              {quote.includedPerks.map((perk, index) => (
                <li key={index}>{perk}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }, [quote.appliedPackageId, quote.packageSavings, quote.includedPerks, formattedPrices.packageSavings]);
  
  // Memoize price summary section
  const priceSummary = useMemo(() => {
    return (
      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between items-center py-2">
          <span className="text-md">Subtotal</span>
          <span className="text-md">{formattedPrices.subtotal}</span>
        </div>
        {/* Detailed discount breakdown */}
        {(quote.promoDiscount || 0) > 0 && (
          <div className="flex justify-between items-center py-2 text-green-600 bg-green-50 p-2 rounded-md">
            <span className="text-md">Promo Discount {quote.promoCode && `(${quote.promoCode})`}</span>
            <span className="text-md font-semibold">-{formattedPrices.promoDiscount}</span>
          </div>
        )}
        {(quote.offerDiscount || 0) > 0 && (
          <div className="flex justify-between items-center py-2 text-green-600 bg-green-50 p-2 rounded-md my-1">
            <span className="text-md">Special Offer Discount</span>
            <span className="text-md font-semibold">-{formattedPrices.offerDiscount}</span>
          </div>
        )}
        
        {(quote.packageSavings || 0) > 0 && (
          <div className="flex justify-between items-center py-2 text-blue-600 bg-blue-50 p-2 rounded-md my-1">
            <span className="text-md">Package Savings</span>
            <span className="text-md font-semibold">-{formattedPrices.packageSavings}</span>
          </div>
        )}
        {quote.discount > 0 && !(quote.promoDiscount || 0) && !(quote.offerDiscount || 0) && (
          <div className="flex justify-between items-center py-2 text-green-600">
            <span className="text-md">Discount</span>
            <span className="text-md">-{formattedPrices.discount}</span>
          </div>
        )}
        <div className="flex justify-between items-center py-2 border-t border-b mt-2 mb-2">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">{formattedPrices.total}</span>
        </div>
      </div>
    );
  }, [
    formattedPrices, 
    quote.promoDiscount, 
    quote.offerDiscount, 
    quote.discount, 
    quote.promoCode
  ]);
  
  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Quote Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Render memoized sections */}
        {treatmentsSection}
        {packagesSection}
        {addonsSection}
        {promoCodeInfo}
        {specialOfferInfo}
        {treatmentPackageInfo}
        {priceSummary}
      </CardContent>
    </Card>
  );
});