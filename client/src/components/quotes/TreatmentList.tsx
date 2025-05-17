/**
 * TreatmentList Component
 * 
 * This component displays the list of treatments in a quote
 * and provides functionality for managing treatment quantities
 */
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Trash2 } from 'lucide-react';

export interface Treatment {
  id: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  clinic_ref_code?: string;
}

export interface TreatmentListProps {
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
  // Format currency properly
  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleQuantityChange = (treatmentId: string, newQuantity: number) => {
    if (newQuantity >= 0 && onUpdateQuantity) {
      onUpdateQuantity(treatmentId, newQuantity);
    }
  };

  if (!treatments || treatments.length === 0) {
    return <div className="text-center py-6">No treatments in this quote.</div>;
  }

  return (
    <Table>
      <TableCaption>Treatment details for this quote.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Treatment</TableHead>
          {showClinicReferences && <TableHead>Clinic Reference</TableHead>}
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-center">Quantity</TableHead>
          <TableHead className="text-right">Total</TableHead>
          {editable && <TableHead className="w-[100px]">Actions</TableHead>}
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
                <div className="flex items-center justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(treatment.id, treatment.quantity - 1)}
                    disabled={treatment.quantity <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={treatment.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        handleQuantityChange(treatment.id, value);
                      }
                    }}
                    className="h-8 w-16 mx-2 text-center"
                    min="0"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(treatment.id, treatment.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                treatment.quantity
              )}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(treatment.price * treatment.quantity, treatment.currency)}
            </TableCell>
            {editable && (
              <TableCell>
                {onRemoveTreatment && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onRemoveTreatment(treatment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}