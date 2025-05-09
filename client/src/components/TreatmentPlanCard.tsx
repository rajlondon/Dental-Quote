import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Smile, Check, Clock, Info } from 'lucide-react';

interface TreatmentItem {
  treatmentType: string;
  name: string;
  quantity: number;
  priceGBP: number;
  priceUSD: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
  isBonus?: boolean;
  isLocked?: boolean;
  isSpecialOffer?: boolean;
  packageId?: string;
  specialOffer?: {
    id: string;
    title: string;
    discountType: string;
    discountValue: number;
    clinicId: string;
  };
}

interface TreatmentPlanCardProps {
  treatments: TreatmentItem[];
  currency?: 'GBP' | 'USD';
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed_amount';
  title?: string;
  description?: string;
  className?: string;
  onEdit?: () => void;
  readOnly?: boolean;
}

const TreatmentPlanCard: React.FC<TreatmentPlanCardProps> = ({
  treatments,
  currency = 'GBP',
  discountAmount = 0,
  discountType = 'percentage',
  title = 'Your Treatment Plan',
  description = 'Summary of your selected dental treatments',
  className = '',
  onEdit,
  readOnly = false
}) => {
  // Calculate totals
  const subtotal = treatments.reduce((sum, item) => 
    sum + (currency === 'GBP' ? item.subtotalGBP : item.subtotalUSD), 0);
  
  const discountValue = discountType === 'percentage' 
    ? (subtotal * discountAmount / 100) 
    : discountAmount;
    
  const total = subtotal - discountValue;
  
  const currencySymbol = currency === 'GBP' ? '£' : '$';
  
  // Count bonus items
  const bonusItemsCount = treatments.filter(t => t.isBonus).length;
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {!readOnly && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit Plan
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {bonusItemsCount > 0 && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md flex items-center gap-2">
            <Smile className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-400">
              Your plan includes {bonusItemsCount} bonus {bonusItemsCount === 1 ? 'item' : 'items'} from special offers!
            </p>
          </div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Treatment</TableHead>
              <TableHead className="w-20 text-right">Qty</TableHead>
              <TableHead className="w-28 text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {treatments.map((treatment, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{treatment.name}</span>
                    <div className="flex gap-1 mt-1">
                      {treatment.isBonus && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Bonus
                        </Badge>
                      )}
                      {treatment.isSpecialOffer && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          Special Offer
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">{treatment.quantity}</TableCell>
                <TableCell className="text-right">
                  {treatment.isBonus ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span>
                      {currencySymbol}{currency === 'GBP' 
                        ? treatment.subtotalGBP.toFixed(2) 
                        : treatment.subtotalUSD.toFixed(2)}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{currencySymbol}{subtotal.toFixed(2)}</span>
          </div>
          
          {discountValue > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                Discount
                {discountType === 'percentage' && (
                  <span className="text-green-600">({discountAmount}%)</span>
                )}
              </span>
              <span className="text-green-600">-{currencySymbol}{discountValue.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total</span>
            <span>{currencySymbol}{total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-green-500" />
            <span>High-quality dental care</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Quick appointment scheduling</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 text-amber-500" />
            <span>Free initial consultation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreatmentPlanCard;