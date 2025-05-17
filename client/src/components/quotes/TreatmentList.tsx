/**
 * TreatmentList Component
 * 
 * This component displays the list of treatments in a quote
 * and provides functionality for managing treatment quantities
 */
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Treatment {
  id: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  clinic_ref_code?: string;
}

interface TreatmentListProps {
  treatments: Treatment[];
  editable?: boolean;
  onUpdateQuantity?: (treatmentId: string, quantity: number) => void;
  onRemoveTreatment?: (treatmentId: string) => void;
  showClinicReferences?: boolean;
}

export function TreatmentList({
  treatments,
  editable = false,
  onUpdateQuantity,
  onRemoveTreatment,
  showClinicReferences = false,
}: TreatmentListProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    treatments.reduce((acc, treatment) => {
      acc[treatment.id] = treatment.quantity;
      return acc;
    }, {} as Record<string, number>)
  );

  const handleQuantityChange = (treatmentId: string, value: string) => {
    const quantity = parseInt(value, 10);
    if (isNaN(quantity) || quantity < 1) return;

    setQuantities((prev) => ({
      ...prev,
      [treatmentId]: quantity,
    }));
  };

  const handleUpdateQuantity = (treatmentId: string) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(treatmentId, quantities[treatmentId]);
    }
  };

  // Calculate the total cost
  const totalCost = treatments.reduce(
    (sum, treatment) => sum + treatment.price * treatment.quantity,
    0
  );

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Treatment</TableHead>
            {showClinicReferences && (
              <TableHead>Clinic Reference</TableHead>
            )}
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-right">Total</TableHead>
            {editable && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {treatments.map((treatment) => (
            <TableRow key={treatment.id}>
              <TableCell className="font-medium">{treatment.name}</TableCell>
              {showClinicReferences && (
                <TableCell>{treatment.clinic_ref_code || 'N/A'}</TableCell>
              )}
              <TableCell className="text-right">
                {formatCurrency(treatment.price, treatment.currency)}
              </TableCell>
              <TableCell className="text-center">
                {editable ? (
                  <div className="flex items-center justify-center gap-2">
                    <Input
                      type="number"
                      value={quantities[treatment.id]}
                      min={1}
                      className="w-16 text-center"
                      onChange={(e) =>
                        handleQuantityChange(treatment.id, e.target.value)
                      }
                    />
                    {quantities[treatment.id] !== treatment.quantity && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(treatment.id)}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                ) : (
                  treatment.quantity
                )}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(
                  treatment.price * treatment.quantity,
                  treatment.currency
                )}
              </TableCell>
              {editable && (
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTreatment && onRemoveTreatment(treatment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={showClinicReferences ? 2 : 1} className="font-bold">
              Total
            </TableCell>
            <TableCell colSpan={2}></TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(totalCost, treatments[0]?.currency || 'USD')}
            </TableCell>
            {editable && <TableCell></TableCell>}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}