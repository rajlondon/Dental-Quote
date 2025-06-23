import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  treatment: z.string().min(1, 'Treatment is required'),
  travelMonth: z.string().min(1, 'Travel month is required'),
  budget: z.string().min(1, 'Budget is required'),
  travelers: z.number().min(1, 'At least 1 traveler required').default(1),
});

type FormValues = z.infer<typeof formSchema>;

export interface QuoteParams {
  treatment: string;
  travelMonth: string;
  budget: string;
  travelers?: number;
}

interface EditQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: QuoteParams;
  onSave: (data: QuoteParams) => void;
}

const TREATMENT_OPTIONS = [
  { value: 'Dental Implants', label: 'Dental Implants' },
  { value: 'Veneers', label: 'Veneers' },
  { value: 'Crowns', label: 'Crowns' },
  { value: 'Hollywood Smile', label: 'Hollywood Smile' },
  { value: 'Teeth Whitening', label: 'Teeth Whitening' },
  { value: 'Orthodontics', label: 'Orthodontics' },
  { value: 'Full Mouth Restoration', label: 'Full Mouth Restoration' },
];

const TRAVEL_MONTH_OPTIONS = [
  { value: 'Flexible', label: 'Flexible' },
  { value: 'January', label: 'January' },
  { value: 'February', label: 'February' },
  { value: 'March', label: 'March' },
  { value: 'April', label: 'April' },
  { value: 'May', label: 'May' },
  { value: 'June', label: 'June' },
  { value: 'July', label: 'July' },
  { value: 'August', label: 'August' },
  { value: 'September', label: 'September' },
  { value: 'October', label: 'October' },
  { value: 'November', label: 'November' },
  { value: 'December', label: 'December' },
];

const BUDGET_OPTIONS = [
  { value: '£1,000 - £3,000', label: '£1,000 - £3,000' },
  { value: '£3,000 - £5,000', label: '£3,000 - £5,000' },
  { value: '£5,000 - £8,000', label: '£5,000 - £8,000' },
  { value: '£8,000 - £12,000', label: '£8,000 - £12,000' },
  { value: '£12,000+', label: '£12,000+' },
];

export default function EditQuoteModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: EditQuoteModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      treatment: initialData.treatment,
      travelMonth: initialData.travelMonth,
      budget: initialData.budget,
      travelers: initialData.travelers || 1,
    },
  });

  const onSubmit = (data: FormValues) => {
    const updatedParams: QuoteParams = {
      treatment: data.treatment,
      travelMonth: data.travelMonth,
      budget: data.budget,
      travelers: data.travelers,
    };
    onSave(updatedParams);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Your Quote</DialogTitle>
          <DialogDescription>
            Update your treatment preferences and travel details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select treatment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TREATMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="travelMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Travel Month</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRAVEL_MONTH_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUDGET_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="travelers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Travelers</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="10" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Update Quote</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}