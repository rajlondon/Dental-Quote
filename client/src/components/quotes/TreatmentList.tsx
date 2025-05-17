import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  formatCurrency, 
  formatTreatmentName, 
  CurrencyCode 
} from '@/utils/format-utils';

export interface Treatment {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  quantity?: number;
}

interface TreatmentListProps {
  treatments: Treatment[];
  onRemove?: (id: string) => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  currency?: CurrencyCode;
  readonly?: boolean;
  showControls?: boolean;
}

const TreatmentList: React.FC<TreatmentListProps> = ({
  treatments,
  onRemove,
  onUpdateQuantity,
  currency = 'USD',
  readonly = false,
  showControls = true
}) => {
  // Calculate subtotal
  const subtotal = treatments.reduce((sum, treatment) => {
    const quantity = treatment.quantity || 1;
    return sum + (treatment.price * quantity);
  }, 0);

  // Handle quantity change
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (onUpdateQuantity && newQuantity >= 0) {
      onUpdateQuantity(id, newQuantity);
    }
  };

  // Handle remove treatment
  const handleRemove = (id: string) => {
    if (onRemove) {
      onRemove(id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Treatment List</CardTitle>
        <CardDescription>Your selected dental treatments</CardDescription>
      </CardHeader>
      <CardContent>
        {treatments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No treatments selected. Add treatments to view your quote.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Treatment</TableHead>
                <TableHead className="text-right">Price</TableHead>
                {showControls && (
                  <>
                    <TableHead className="text-center">Quantity</TableHead>
                    {!readonly && <TableHead className="text-right">Actions</TableHead>}
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatments.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell className="font-medium">
                    {formatTreatmentName(treatment.name)}
                    {treatment.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {treatment.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(treatment.price, currency)}
                  </TableCell>
                  {showControls && (
                    <>
                      <TableCell className="text-center">
                        {readonly ? (
                          treatment.quantity || 1
                        ) : (
                          <div className="flex items-center justify-center">
                            <button
                              disabled={readonly}
                              className="px-2 py-1 rounded-md border"
                              onClick={() => 
                                handleQuantityChange(
                                  treatment.id, 
                                  (treatment.quantity || 1) - 1
                                )
                              }
                            >
                              -
                            </button>
                            <span className="mx-2">{treatment.quantity || 1}</span>
                            <button
                              disabled={readonly}
                              className="px-2 py-1 rounded-md border"
                              onClick={() => 
                                handleQuantityChange(
                                  treatment.id, 
                                  (treatment.quantity || 1) + 1
                                )
                              }
                            >
                              +
                            </button>
                          </div>
                        )}
                      </TableCell>
                      {!readonly && (
                        <TableCell className="text-right">
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemove(treatment.id)}
                          >
                            Remove
                          </button>
                        </TableCell>
                      )}
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="font-semibold">Subtotal</div>
        <div className="font-semibold">
          {formatCurrency(subtotal, currency)}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TreatmentList;