import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import { Treatment } from '@/hooks/use-quote-system';
import { formatCurrency } from '@/utils/format-utils';

interface TreatmentListProps {
  treatments: Treatment[];
  onRemoveTreatment?: (treatmentId: string) => void;
  onUpdateQuantity?: (treatmentId: string, quantity: number) => void;
  readOnly?: boolean;
  currency?: string;
}

const TreatmentList: React.FC<TreatmentListProps> = ({
  treatments,
  onRemoveTreatment,
  onUpdateQuantity,
  readOnly = false,
  currency = 'USD'
}) => {
  const handleQuantityDecrease = (treatment: Treatment) => {
    if (treatment.quantity > 1 && onUpdateQuantity) {
      onUpdateQuantity(treatment.id, treatment.quantity - 1);
    }
  };

  const handleQuantityIncrease = (treatment: Treatment) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(treatment.id, treatment.quantity + 1);
    }
  };

  if (!treatments || treatments.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        No treatments added to this quote
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50%]">Treatment</TableHead>
          <TableHead className="text-center">Quantity</TableHead>
          <TableHead className="text-right">Price</TableHead>
          {!readOnly && <TableHead className="w-[100px]"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {treatments.map((treatment) => (
          <TableRow key={treatment.id}>
            <TableCell className="font-medium">
              <div>
                {treatment.name}
                {treatment.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {treatment.description}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">
              {readOnly ? (
                treatment.quantity
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityDecrease(treatment)}
                    disabled={treatment.quantity <= 1}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span className="w-6 text-center">{treatment.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityIncrease(treatment)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(treatment.price * treatment.quantity, currency)}
            </TableCell>
            {!readOnly && (
              <TableCell>
                {onRemoveTreatment && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveTreatment(treatment.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
        <TableRow>
          <TableCell colSpan={!readOnly ? 2 : 1} className="text-right font-medium">
            Subtotal
          </TableCell>
          <TableCell className="text-right font-medium">
            {formatCurrency(
              treatments.reduce((sum, t) => sum + t.price * t.quantity, 0),
              currency
            )}
          </TableCell>
          {!readOnly && <TableCell />}
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default TreatmentList;