import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash } from 'lucide-react';
import { formatCurrency } from '@/utils/format-utils';

export interface Treatment {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
  imageUrl?: string;
}

interface TreatmentListProps {
  treatments: Treatment[];
  currency?: string;
  onQuantityChange?: (treatmentId: string, newQuantity: number) => void;
  onRemoveTreatment?: (treatmentId: string) => void;
  readOnly?: boolean;
  portalType?: 'patient' | 'admin' | 'clinic';
}

export const TreatmentList: React.FC<TreatmentListProps> = ({
  treatments,
  currency = 'USD',
  onQuantityChange,
  onRemoveTreatment,
  readOnly = false,
  portalType = 'patient'
}) => {
  const handleIncrement = (treatmentId: string, currentQuantity: number) => {
    if (onQuantityChange) {
      onQuantityChange(treatmentId, currentQuantity + 1);
    }
  };

  const handleDecrement = (treatmentId: string, currentQuantity: number) => {
    if (onQuantityChange && currentQuantity > 1) {
      onQuantityChange(treatmentId, currentQuantity - 1);
    }
  };

  const handleQuantityChange = (treatmentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (onQuantityChange) {
      const newQuantity = parseInt(event.target.value);
      if (!isNaN(newQuantity) && newQuantity > 0) {
        onQuantityChange(treatmentId, newQuantity);
      }
    }
  };

  const handleRemove = (treatmentId: string) => {
    if (onRemoveTreatment) {
      onRemoveTreatment(treatmentId);
    }
  };

  if (!treatments || treatments.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No treatments added to this quote.
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Treatment</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-right">Total</TableHead>
            {!readOnly && <TableHead className="w-[80px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {treatments.map((treatment) => (
            <TableRow key={treatment.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{treatment.name}</div>
                  {treatment.description && (
                    <div className="text-sm text-muted-foreground">{treatment.description}</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(treatment.price, currency)}
              </TableCell>
              <TableCell>
                {readOnly ? (
                  <div className="flex justify-center">
                    <span>{treatment.quantity}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDecrement(treatment.id, treatment.quantity)}
                      disabled={treatment.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={treatment.quantity}
                      onChange={(e) => handleQuantityChange(treatment.id, e)}
                      className="h-8 w-14 mx-2 text-center"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleIncrement(treatment.id, treatment.quantity)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(treatment.price * treatment.quantity, currency)}
              </TableCell>
              {!readOnly && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(treatment.id)}
                    title="Remove treatment"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TreatmentList;