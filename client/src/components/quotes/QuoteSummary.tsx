import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface QuoteSummaryProps {
  quote: any; // Replace with proper type once we have it
}

export function QuoteSummary({ quote }: QuoteSummaryProps) {
  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Quote Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Treatments Section */}
        {quote.treatments && quote.treatments.length > 0 && (
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
                    <TableCell className="text-right">{formatCurrency(treatment.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {/* Packages Section */}
        {quote.packages && quote.packages.length > 0 && (
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
                    <TableCell className="text-right">{formatCurrency(pkg.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add-ons Section */}
        {quote.addons && quote.addons.length > 0 && (
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
                    <TableCell className="text-right">{formatCurrency(addon.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Promo Code Information */}
        {quote.promoCode && (
          <div className="mt-6 bg-muted p-4 rounded-md">
            <h3 className="text-md font-semibold mb-2">Applied Promo Code</h3>
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2">{quote.promoCode}</Badge>
              <span className="text-sm text-gray-500">
                {quote.discountType === 'percentage' 
                  ? `${quote.discountValue}% off` 
                  : `${formatCurrency(quote.discountValue)} off`}
              </span>
            </div>
          </div>
        )}

        {/* Applied Offer Information */}
        {quote.appliedOfferId && (
          <div className="mt-6 bg-muted p-4 rounded-md">
            <h3 className="text-md font-semibold mb-2">Applied Special Offer</h3>
            <div className="flex items-center">
              <Badge className="mr-2">Special Offer</Badge>
              <span className="text-sm text-gray-500">
                Discount: {formatCurrency(quote.offerDiscount || 0)}
              </span>
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div className="mt-8 border-t pt-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-md">Subtotal</span>
            <span className="text-md">{formatCurrency(quote.subtotal)}</span>
          </div>
          {quote.discount > 0 && (
            <div className="flex justify-between items-center py-2 text-green-600">
              <span className="text-md">Discount</span>
              <span className="text-md">-{formatCurrency(quote.discount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-t border-b mt-2 mb-2">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold">{formatCurrency(quote.total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}