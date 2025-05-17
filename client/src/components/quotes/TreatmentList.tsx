import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, MinusIcon, Trash2Icon } from 'lucide-react';

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
  if (!treatments || treatments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No treatments added to this quote.</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const handleIncrement = (treatmentId: string, currentQuantity: number) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(treatmentId, currentQuantity + 1);
    }
  };

  const handleDecrement = (treatmentId: string, currentQuantity: number) => {
    if (currentQuantity > 1 && onUpdateQuantity) {
      onUpdateQuantity(treatmentId, currentQuantity - 1);
    }
  };

  const handleRemove = (treatmentId: string) => {
    if (onRemoveTreatment) {
      onRemoveTreatment(treatmentId);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {treatments.map((treatment) => (
        <Card key={treatment.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row justify-between items-start p-4 gap-2">
              <div className="flex-1">
                <div className="flex flex-col">
                  <h3 className="font-medium">{treatment.name}</h3>
                  {showClinicReferences && treatment.clinic_ref_code && (
                    <span className="text-xs text-muted-foreground mt-1">
                      Clinic Reference: {treatment.clinic_ref_code}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {editable ? (
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleDecrement(treatment.id, treatment.quantity)}
                      disabled={treatment.quantity <= 1}
                    >
                      <MinusIcon className="h-3 w-3" />
                    </Button>
                    <span className="mx-2 min-w-[2rem] text-center">{treatment.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleIncrement(treatment.id, treatment.quantity)}
                    >
                      <PlusIcon className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm font-medium">
                    {treatment.quantity > 1 ? `${treatment.quantity} × ` : ''}
                    {formatCurrency(treatment.price, treatment.currency)}
                  </span>
                )}
                
                <div className="min-w-[5rem] text-right">
                  <div className="font-medium">
                    {formatCurrency(treatment.price * treatment.quantity, treatment.currency)}
                  </div>
                  {editable && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(treatment.id)}
                    >
                      <Trash2Icon className="h-3 w-3 mr-1" />
                      <span className="text-xs">Remove</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}