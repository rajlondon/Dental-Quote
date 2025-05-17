import { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  MinusCircle,
  PlusCircle,
} from 'lucide-react';
import { Treatment } from '@/services/quote-integration-service';
import { formatCurrency } from '@/utils/format-utils';

interface TreatmentListProps {
  treatments: Treatment[];
  currency?: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  promoCode?: string | null;
  onQuantityChange?: (treatmentId: string, quantity: number) => void;
  onRemoveTreatment?: (treatmentId: string) => void;
}

const TreatmentList: React.FC<TreatmentListProps> = ({
  treatments,
  currency = 'USD',
  discountType,
  discountValue,
  promoCode,
  onQuantityChange,
  onRemoveTreatment,
}) => {
  const [sortField, setSortField] = useState<keyof Treatment>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Calculate totals
  const subtotal = treatments.reduce((sum, treatment) => sum + treatment.lineTotal, 0);
  
  // Calculate discount amount
  let discountAmount = 0;
  if (discountType && discountValue) {
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discountValue / 100);
    } else if (discountType === 'fixed_amount') {
      discountAmount = discountValue;
    }
  }
  
  // Calculate total after discount
  const total = Math.max(0, subtotal - discountAmount);

  // Handle sorting
  const handleSort = (field: keyof Treatment) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sort treatments
  const sortedTreatments = [...treatments].sort((a, b) => {
    // Skip sorting if the field doesn't exist
    if (a[sortField] === undefined || b[sortField] === undefined) {
      return 0;
    }
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }
    
    return 0;
  });
  
  // Handling quantity change
  const handleQuantityChange = (treatmentId: string, newQuantity: number) => {
    // Don't allow negative quantities
    if (newQuantity < 0) return;
    
    // Call the parent handler
    if (onQuantityChange) {
      onQuantityChange(treatmentId, newQuantity);
    }
  };
  
  // Handle direct quantity input
  const handleQuantityInput = (treatmentId: string, value: string) => {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      handleQuantityChange(treatmentId, newQuantity);
    }
  };
  
  // Handle remove treatment
  const handleRemoveTreatment = (treatmentId: string) => {
    if (onRemoveTreatment) {
      onRemoveTreatment(treatmentId);
    }
  };
  
  // Render the sort indicator
  const renderSortIndicator = (field: keyof Treatment) => {
    if (sortField !== field) {
      return null;
    }
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="ml-1 h-4 w-4" /> 
      : <ChevronDown className="ml-1 h-4 w-4" />;
  };
  
  // If no treatments, show empty state
  if (treatments.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No treatments selected</p>
        <p className="text-sm text-muted-foreground mt-1">
          Select treatments from the dropdown to build your quote
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Treatment {renderSortIndicator('name')}
              </div>
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer"
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center justify-end">
                Price {renderSortIndicator('price')}
              </div>
            </TableHead>
            <TableHead className="text-center">Qty</TableHead>
            <TableHead 
              className="text-right cursor-pointer"
              onClick={() => handleSort('lineTotal')}
            >
              <div className="flex items-center justify-end">
                Total {renderSortIndicator('lineTotal')}
              </div>
            </TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTreatments.map((treatment) => (
            <TableRow key={treatment.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{treatment.name}</div>
                  {treatment.description && (
                    <div className="text-sm text-muted-foreground">
                      {treatment.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(treatment.price, currency)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(treatment.id, treatment.quantity - 1)}
                    disabled={treatment.quantity <= 1}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={treatment.quantity}
                    onChange={(e) => handleQuantityInput(treatment.id, e.target.value)}
                    className="h-8 w-16 text-center"
                    min={1}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(treatment.id, treatment.quantity + 1)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(treatment.lineTotal, currency)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveTreatment(treatment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          
          {/* Subtotal row */}
          <TableRow>
            <TableCell colSpan={3} className="text-right font-medium">
              Subtotal
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(subtotal, currency)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
          
          {/* Discount row */}
          {discountAmount > 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-right font-medium text-green-600">
                {promoCode && `Discount (${promoCode})`}
                {!promoCode && discountType === 'percentage' && `Discount (${discountValue}%)`}
                {!promoCode && discountType === 'fixed_amount' && 'Discount'}
              </TableCell>
              <TableCell className="text-right font-medium text-green-600">
                -{formatCurrency(discountAmount, currency)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          )}
          
          {/* Total row */}
          <TableRow>
            <TableCell colSpan={3} className="text-right font-medium text-lg">
              Total
            </TableCell>
            <TableCell className="text-right font-medium text-lg">
              {formatCurrency(total, currency)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default TreatmentList;