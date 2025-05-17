import { useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, Tag } from 'lucide-react';
import { 
  formatCurrency, 
  formatPercentage, 
  calculateDiscountAmount 
} from '@/utils/format-utils';

// Treatment interfaces
export interface Treatment {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  currency?: string;
}

export interface TreatmentLineItem extends Treatment {
  quantity: number;
  lineTotal: number;
}

// Props definition
interface TreatmentListProps {
  treatments: TreatmentLineItem[];
  currency?: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  promoCode?: string;
  isReadOnly?: boolean;
  showControls?: boolean;
  onQuantityChange?: (treatmentId: string, newQuantity: number) => void;
  onRemoveTreatment?: (treatmentId: string) => void;
}

/**
 * A component that displays a list of treatments with quantity controls
 * and optional discount information
 */
const TreatmentList: React.FC<TreatmentListProps> = ({
  treatments,
  currency = 'USD',
  discountType,
  discountValue = 0,
  promoCode,
  isReadOnly = false,
  showControls = true,
  onQuantityChange,
  onRemoveTreatment
}) => {
  // Calculate subtotal
  const subtotal = treatments.reduce((sum, treatment) => sum + treatment.lineTotal, 0);
  
  // Calculate discount amount
  const discountAmount = discountType && discountValue 
    ? calculateDiscountAmount(subtotal, discountType, discountValue)
    : 0;
  
  // Calculate total
  const total = subtotal - discountAmount;

  // Handle quantity change
  const handleQuantityChange = (treatmentId: string, newQuantity: number) => {
    if (isReadOnly) return;
    if (newQuantity < 0) newQuantity = 0;
    if (onQuantityChange) {
      onQuantityChange(treatmentId, newQuantity);
    }
  };

  // Handle remove treatment
  const handleRemoveTreatment = (treatmentId: string) => {
    if (isReadOnly) return;
    if (onRemoveTreatment) {
      onRemoveTreatment(treatmentId);
    }
  };

  return (
    <div className="space-y-4">
      {treatments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No treatments added yet
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Treatment</TableHead>
                {showControls && !isReadOnly && <TableHead>Quantity</TableHead>}
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatments.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell className="font-medium">
                    {treatment.name}
                    {treatment.description && (
                      <p className="text-sm text-muted-foreground">{treatment.description}</p>
                    )}
                  </TableCell>
                  
                  {showControls && !isReadOnly ? (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(treatment.id, treatment.quantity - 1)}
                          disabled={treatment.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <Input
                          type="number"
                          value={treatment.quantity}
                          onChange={(e) => handleQuantityChange(treatment.id, parseInt(e.target.value) || 0)}
                          className="w-14 h-8 text-center"
                          min={1}
                        />
                        
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(treatment.id, treatment.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveTreatment(treatment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  ) : (
                    treatment.quantity > 1 && (
                      <TableCell className="font-medium">
                        {formatCurrency(treatment.price, currency)} × {treatment.quantity}
                      </TableCell>
                    )
                  )}
                  
                  <TableCell>
                    {formatCurrency(treatment.price, currency)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {formatCurrency(treatment.lineTotal, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Discount
                  {promoCode && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {promoCode}
                    </Badge>
                  )}
                  {discountType === 'percentage' && (
                    <span className="text-xs ml-1">
                      ({formatPercentage(discountValue)})
                    </span>
                  )}
                </span>
                <span className="text-destructive">
                  -{formatCurrency(discountAmount, currency)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between font-semibold border-t border-border pt-2">
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TreatmentList;