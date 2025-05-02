import { useState, useEffect } from 'react';
import { useLocation } from 'wouter'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBookings } from '@/hooks/use-bookings';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Define the form schema using zod
const FormSchema = z.object({
  clinicId: z.number({
    required_error: 'Please select a clinic',
  }),
  arrivalDate: z.date({
    required_error: 'Arrival date is required',
  }),
  departureDate: z.date({
    required_error: 'Departure date is required',
  }).optional(),
  flightNumber: z.string().optional(),
  accommodationType: z.enum(['hotel', 'airbnb', 'hostel', 'friends_family', 'not_arranged'], {
    required_error: 'Please select an accommodation type',
  }).optional(),
  accommodationDetails: z.string().optional(),
  specialRequests: z.string().optional(),
  depositAmount: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface CreateBookingFormProps {
  predefinedClinicId?: number;
}

export default function CreateBookingForm({ predefinedClinicId }: CreateBookingFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { createBooking, isCreating } = useBookings();
  
  // Mock clinic data - in a real app this would come from an API
  const [clinics, setClinics] = useState([
    { id: 1, name: 'Istanbul Dental Clinic' },
    { id: 2, name: 'AntalyaSmile Dental Center' },
    { id: 3, name: 'Izmir Dental Hospital' },
    { id: 4, name: 'Bodrum Dental Care' },
  ]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      clinicId: predefinedClinicId || undefined,
      flightNumber: '',
      accommodationDetails: '',
      specialRequests: '',
      depositAmount: 0,
    },
  });

  // Submit handler
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: t('auth.not_logged_in'),
        description: t('auth.please_login'),
        variant: 'destructive',
      });
      return;
    }

    // Format dates to ISO strings before sending
    const formattedData = {
      ...data,
      userId: user.id,
      arrivalDate: data.arrivalDate?.toISOString(),
      departureDate: data.departureDate?.toISOString(),
    };

    createBooking(formattedData, {
      onSuccess: (booking) => {
        toast({
          title: t('bookings.create_success_title'),
          description: t('bookings.create_success_message'),
        });
        // Navigate to the booking detail page
        navigate(`/bookings/${booking.id}`);
      },
      onError: (error) => {
        toast({
          title: t('bookings.create_error_title'),
          description: error.message || t('bookings.create_error_message'),
          variant: 'destructive',
        });
      }
    });
  };

  // Load clinics on component mount
  useEffect(() => {
    if (predefinedClinicId) {
      form.setValue('clinicId', predefinedClinicId);
    }

    // In a real app, fetch clinics from API here
    const fetchClinics = async () => {
      setIsLoadingClinics(true);
      try {
        // const response = await apiRequest('GET', '/api/clinics');
        // const data = await response.json();
        // setClinics(data);
        
        // Using mock data for now
        setTimeout(() => {
          setIsLoadingClinics(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching clinics:', error);
        setIsLoadingClinics(false);
      }
    };

    fetchClinics();
  }, [predefinedClinicId, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Clinic Selection */}
        <FormField
          control={form.control}
          name="clinicId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bookings.clinic')}</FormLabel>
              <Select
                disabled={isLoadingClinics || !!predefinedClinicId}
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('bookings.select_clinic')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingClinics ? (
                    <div className="flex justify-center items-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        {t('common.loading')}...
                      </span>
                    </div>
                  ) : (
                    clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id.toString()}>
                        {clinic.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                {t('bookings.clinic_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Travel Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="arrivalDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('bookings.arrival_date')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{t('bookings.pick_date')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  {t('bookings.arrival_date_description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="departureDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('bookings.departure_date')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{t('bookings.pick_date')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => 
                        date < new Date() || 
                        (form.getValues().arrivalDate && date < form.getValues().arrivalDate)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  {t('bookings.departure_date_description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Flight Number */}
        <FormField
          control={form.control}
          name="flightNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bookings.flight_number')}</FormLabel>
              <FormControl>
                <Input placeholder="TK1234" {...field} />
              </FormControl>
              <FormDescription>
                {t('bookings.flight_number_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Accommodation */}
        <FormField
          control={form.control}
          name="accommodationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bookings.accommodation_type')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('bookings.select_accommodation')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="hotel">{t('bookings.accommodation.hotel')}</SelectItem>
                  <SelectItem value="airbnb">{t('bookings.accommodation.airbnb')}</SelectItem>
                  <SelectItem value="hostel">{t('bookings.accommodation.hostel')}</SelectItem>
                  <SelectItem value="friends_family">{t('bookings.accommodation.friends_family')}</SelectItem>
                  <SelectItem value="not_arranged">{t('bookings.accommodation.not_arranged')}</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t('bookings.accommodation_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Accommodation Details - show only if accommodation type is selected */}
        {form.watch('accommodationType') && form.watch('accommodationType') !== 'not_arranged' && (
          <FormField
            control={form.control}
            name="accommodationDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('bookings.accommodation_details')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={
                      form.watch('accommodationType') === 'hotel' 
                        ? t('bookings.hotel_placeholder') 
                        : t('bookings.accommodation_details_placeholder')
                    } 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  {t('bookings.accommodation_details_description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Special Requests */}
        <FormField
          control={form.control}
          name="specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bookings.special_requests')}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('bookings.special_requests_placeholder')} 
                  className="resize-none min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {t('bookings.special_requests_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="w-full md:w-auto" disabled={isCreating}>
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('bookings.create_booking_button')}
        </Button>
      </form>
    </Form>
  );
}