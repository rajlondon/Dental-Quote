import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define types
export interface QuoteParams {
  treatment: string;
  travelMonth: string;
  budget: string;
}

interface EditQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialParams: QuoteParams;
  onSave: (params: QuoteParams) => void;
}

// List of treatment options
const TREATMENT_OPTIONS = [
  'Dental Implants',
  'Veneers',
  'Crowns',
  'Teeth Whitening',
  'Dental Bridge',
  'All-on-4 Implants',
  'Dental Bonding',
  'Root Canal Treatment',
  'Full Mouth Reconstruction',
  'Smile Makeover',
  'Gum Contouring',
  'Other'
];

// Budget range options
const BUDGET_OPTIONS = [
  '£1,000 - £2,000',
  '£2,000 - £3,000',
  '£3,000 - £5,000',
  '£5,000 - £10,000',
  '£10,000+'
];

const EditQuoteModal: React.FC<EditQuoteModalProps> = ({ 
  isOpen, 
  onClose, 
  initialParams, 
  onSave 
}) => {
  const [params, setParams] = useState<QuoteParams>(initialParams);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialParams.travelMonth !== 'Flexible' 
      ? new Date(initialParams.travelMonth) 
      : undefined
  );

  const handleSave = () => {
    onSave(params);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[485px]">
        <DialogHeader>
          <DialogTitle>Edit Your Quote</DialogTitle>
          <DialogDescription>
            Update your treatment preferences and we'll recalculate your options.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Treatment Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="treatment" className="text-right text-sm font-medium">
              Treatment
            </label>
            <div className="col-span-3">
              <Select
                value={params.treatment}
                onValueChange={(value) => setParams({ ...params, treatment: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment" />
                </SelectTrigger>
                <SelectContent>
                  {TREATMENT_OPTIONS.map((treatment) => (
                    <SelectItem key={treatment} value={treatment}>
                      {treatment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Travel Month Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="travelMonth" className="text-right text-sm font-medium">
              Travel Month
            </label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'MMMM yyyy') : 'Flexible'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) {
                        setParams({ ...params, travelMonth: format(date, 'MMMM yyyy') });
                      } else {
                        setParams({ ...params, travelMonth: 'Flexible' });
                      }
                    }}
                    initialFocus
                    disabled={(date) => {
                      const today = new Date();
                      return date < today;
                    }}
                  />
                  <div className="p-3 border-t border-border">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setSelectedDate(undefined);
                        setParams({ ...params, travelMonth: 'Flexible' });
                      }}
                    >
                      Set as Flexible
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Budget Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="budget" className="text-right text-sm font-medium">
              Budget
            </label>
            <div className="col-span-3">
              <Select
                value={params.budget}
                onValueChange={(value) => setParams({ ...params, budget: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Flexible">Flexible</SelectItem>
                  {BUDGET_OPTIONS.map((budget) => (
                    <SelectItem key={budget} value={budget}>
                      {budget}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Update Quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuoteModal;