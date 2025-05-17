import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash, Plus, Minus } from 'lucide-react';
import { Treatment } from '@/hooks/use-quote-system';

interface TreatmentListProps {
  treatments: Treatment[];
  readOnly?: boolean;
  onUpdateQuantity?: (treatmentId: string, quantity: number) => void;
  onRemoveTreatment?: (treatmentId: string) => void;
}

export function TreatmentList({ 
  treatments, 
  readOnly = false,
  onUpdateQuantity,
  onRemoveTreatment
}: TreatmentListProps) {
  
  const handleQuantityChange = (treatmentId: string, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity > 0 && onUpdateQuantity) {
      onUpdateQuantity(treatmentId, quantity);
    }
  };
  
  const handleIncreaseQuantity = (treatment: Treatment) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(treatment.id, (treatment.quantity || 1) + 1);
    }
  };
  
  const handleDecreaseQuantity = (treatment: Treatment) => {
    if (treatment.quantity && treatment.quantity > 1 && onUpdateQuantity) {
      onUpdateQuantity(treatment.id, treatment.quantity - 1);
    }
  };
  
  const handleRemove = (treatmentId: string) => {
    if (onRemoveTreatment) {
      onRemoveTreatment(treatmentId);
    }
  };

  if (!treatments.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No treatments available in this quote.
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Treatment</TableHead>
            <TableHead className="w-[15%] text-right">Price</TableHead>
            <TableHead className="w-[15%] text-center">Quantity</TableHead>
            <TableHead className="w-[15%] text-right">Total</TableHead>
            {!readOnly && <TableHead className="w-[5%]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {treatments.map((treatment) => (
            <TableRow key={treatment.id}>
              <TableCell className="font-medium">
                <div>
                  <p>{treatment.name}</p>
                  {treatment.description && (
                    <p className="text-sm text-muted-foreground mt-1">{treatment.description}</p>
                  )}
                  {treatment.category && (
                    <span className="inline-block px-2 py-1 mt-2 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {treatment.category}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                ${treatment.price?.toFixed(2) || '0.00'}
              </TableCell>
              <TableCell>
                {readOnly ? (
                  <div className="flex justify-center">
                    <span className="inline-block w-10 text-center">
                      {treatment.quantity || 1}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDecreaseQuantity(treatment)}
                      disabled={!treatment.quantity || treatment.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      className="h-8 w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={treatment.quantity || 1}
                      onChange={(e) => handleQuantityChange(treatment.id, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleIncreaseQuantity(treatment)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                ${((treatment.price || 0) * (treatment.quantity || 1)).toFixed(2)}
              </TableCell>
              {!readOnly && (
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={() => handleRemove(treatment.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={2} className="text-right font-medium">
              Total:
            </TableCell>
            <TableCell className="text-center">
              {treatments.reduce((total, t) => total + (t.quantity || 1), 0)}
            </TableCell>
            <TableCell className="text-right font-bold">
              ${treatments.reduce((total, t) => total + ((t.price || 0) * (t.quantity || 1)), 0).toFixed(2)}
            </TableCell>
            {!readOnly && <TableCell></TableCell>}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}