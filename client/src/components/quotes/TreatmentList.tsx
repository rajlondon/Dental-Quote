/**
 * TreatmentList Component
 * 
 * This component displays the list of treatments in a quote
 * and provides functionality for managing treatment quantities
 */
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react";

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
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No treatments in this quote</p>
      </div>
    );
  }

  // Calculate totals
  const subtotal = treatments.reduce(
    (sum, treatment) => sum + treatment.price * treatment.quantity,
    0
  );

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Treatment</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-right">Total</TableHead>
            {showClinicReferences && <TableHead>Ref Code</TableHead>}
            {editable && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {treatments.map((treatment) => (
            <TableRow key={treatment.id}>
              <TableCell className="font-medium">{treatment.name}</TableCell>
              <TableCell className="text-right">
                {treatment.currency} {treatment.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-center">
                {editable ? (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => 
                        onUpdateQuantity?.(
                          treatment.id,
                          Math.max(1, treatment.quantity - 1)
                        )
                      }
                      disabled={treatment.quantity <= 1}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span>{treatment.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => 
                        onUpdateQuantity?.(
                          treatment.id,
                          treatment.quantity + 1
                        )
                      }
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  treatment.quantity
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                {treatment.currency}{" "}
                {(treatment.price * treatment.quantity).toFixed(2)}
              </TableCell>
              {showClinicReferences && (
                <TableCell>
                  {treatment.clinic_ref_code || "-"}
                </TableCell>
              )}
              {editable && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveTreatment?.(treatment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-end">
        <div className="w-[200px]">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span className="font-medium">
              {treatments[0]?.currency || "$"} {subtotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}