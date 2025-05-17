import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Treatment {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  quantity: number;
}

interface TreatmentListProps {
  treatments: Treatment[];
  editable?: boolean;
  onUpdateQuantity?: (treatmentId: string, quantity: number) => void;
  onRemoveTreatment?: (treatmentId: string) => void;
}

export const TreatmentList: React.FC<TreatmentListProps> = ({
  treatments,
  editable = false,
  onUpdateQuantity,
  onRemoveTreatment,
}) => {
  if (!treatments || treatments.length === 0) {
    return (
      <div className="text-center p-6 bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No treatments added to this quote.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Treatment</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-right">Total</TableHead>
            {editable && <TableHead className="w-[100px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {treatments.map((treatment) => {
            const treatmentTotal = treatment.price * treatment.quantity;
            return (
              <TableRow key={treatment.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{treatment.name}</div>
                    {treatment.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {treatment.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {treatment.category && (
                    <Badge variant="outline" className="font-normal">
                      {treatment.category}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">${treatment.price.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  {editable ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => 
                          onUpdateQuantity && 
                          treatment.quantity > 1 && 
                          onUpdateQuantity(treatment.id, treatment.quantity - 1)
                        }
                        disabled={!onUpdateQuantity || treatment.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center">{treatment.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => 
                          onUpdateQuantity && 
                          onUpdateQuantity(treatment.id, treatment.quantity + 1)
                        }
                        disabled={!onUpdateQuantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    treatment.quantity
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${treatmentTotal.toFixed(2)}
                </TableCell>
                {editable && (
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => onRemoveTreatment && onRemoveTreatment(treatment.id)}
                      disabled={!onRemoveTreatment}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell colSpan={editable ? 4 : 3} className="font-bold text-right">
              Total
            </TableCell>
            <TableCell className="text-right font-bold">
              $
              {treatments
                .reduce((sum, treatment) => sum + treatment.price * treatment.quantity, 0)
                .toFixed(2)}
            </TableCell>
            {editable && <TableCell></TableCell>}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};