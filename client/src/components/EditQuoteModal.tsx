import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, MapPin, Users } from 'lucide-react';

interface QuoteParams {
  city: string;
  treatment: string;
  origin: string;
  departureDate: string;
  returnDate: string;
  travelDate: string;
  travelMonth: string;
  budget: string;
}

interface FormData {
  city: string;
  departureDate: string;
  returnDate: string;
  travellers: number;
}

interface EditQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: QuoteParams;
  onSave: (data: QuoteParams) => void;
}

export default function EditQuoteModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: EditQuoteModalProps) {
  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      city: initialData.city || 'Istanbul',
      departureDate: initialData.departureDate || '',
      returnDate: initialData.returnDate || '',
      travellers: 1,
    },
  });

  const onSubmit = (data: FormData) => {
    const updatedParams: QuoteParams = {
      ...initialData,
      city: data.city,
      departureDate: data.departureDate,
      returnDate: data.returnDate,
      travelDate: data.departureDate,
    };
    onSave(updatedParams);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Edit Your Travel Details
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              Destination
            </Label>
            <Select
              value={watch('city')}
              onValueChange={(value) => setValue('city', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Istanbul">Istanbul, Turkey</SelectItem>
                <SelectItem value="Antalya">Antalya, Turkey</SelectItem>
                <SelectItem value="Izmir">Izmir, Turkey</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Travel Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureDate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-600" />
                Departure Date
              </Label>
              <Input
                id="departureDate"
                type="date"
                {...register('departureDate', { required: true })}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="returnDate" className="text-sm font-medium text-gray-700">
                Return Date
              </Label>
              <Input
                id="returnDate"
                type="date"
                {...register('returnDate', { required: true })}
                className="w-full"
              />
            </div>
          </div>

          {/* Travellers */}
          <div className="space-y-2">
            <Label htmlFor="travellers" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Number of Travellers
            </Label>
            <Select
              value={watch('travellers')?.toString()}
              onValueChange={(value) => setValue('travellers', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select travellers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Person</SelectItem>
                <SelectItem value="2">2 People</SelectItem>
                <SelectItem value="3">3 People</SelectItem>
                <SelectItem value="4">4 People</SelectItem>
                <SelectItem value="5">5+ People</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Update Details
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}