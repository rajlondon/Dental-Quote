/**
 * Treatment List Component
 * 
 * This component displays a list of dental treatments with quantities and prices.
 * It can be made editable for admin and patient portals.
 */
import React from 'react';
import { Treatment } from '@/services/quote-integration-service';
import { Button } from '@/components/ui/button';
import { Plus, Minus, X } from 'lucide-react';

interface TreatmentListProps {
  treatments: Treatment[];
  editable?: boolean;
  onUpdateQuantity?: (treatmentId: string, quantity: number) => void;
  onRemoveTreatment?: (treatmentId: string) => void;
}

export function TreatmentList({
  treatments,
  editable = false,
  onUpdateQuantity,
  onRemoveTreatment
}: TreatmentListProps) {
  if (!treatments || treatments.length === 0) {
    return (
      <div className="text-center py-4 border rounded-md">
        <p className="text-muted-foreground">No treatments selected</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted px-4 py-2 font-medium grid grid-cols-12">
        <div className="col-span-6">Treatment</div>
        <div className="col-span-2 text-center">Quantity</div>
        <div className="col-span-3 text-right">Price</div>
        <div className="col-span-1"></div>
      </div>
      
      <div className="divide-y">
        {treatments.map((treatment) => (
          <div key={treatment.id} className="px-4 py-3 grid grid-cols-12 items-center">
            <div className="col-span-6">
              <p className="font-medium">{treatment.name}</p>
              {treatment.description && (
                <p className="text-sm text-muted-foreground">{treatment.description}</p>
              )}
            </div>
            
            <div className="col-span-2 flex items-center justify-center">
              {editable ? (
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                    onClick={() => onUpdateQuantity?.(treatment.id, Math.max(1, treatment.quantity - 1))}
                    disabled={treatment.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="h-8 px-3 flex items-center justify-center border-y">
                    {treatment.quantity}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    onClick={() => onUpdateQuantity?.(treatment.id, treatment.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <span>{treatment.quantity}</span>
              )}
            </div>
            
            <div className="col-span-3 text-right">
              ${(treatment.price * treatment.quantity).toFixed(2)}
              {treatment.quantity > 1 && (
                <p className="text-xs text-muted-foreground">${treatment.price.toFixed(2)} each</p>
              )}
            </div>
            
            <div className="col-span-1 flex justify-end">
              {editable && onRemoveTreatment && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveTreatment(treatment.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}