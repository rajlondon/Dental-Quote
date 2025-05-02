import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBookings, CreateBookingData } from '@/hooks/use-bookings';
import { useAuth } from '@/hooks/use-auth';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'wouter';

// Create the form schema
const createBookingSchema = z.object({
  userId: z.number().optional(),
  clinicId: z.number().positive({ message: "Please select a clinic" }),
  quoteRequestId: z.number().optional(),
  treatmentPlanId: z.number().optional(),
  stage: z.string().default('deposit'),
  status: z.string().default('pending'),
  depositAmount: z.number().nonnegative().default(0),
  arrivalDate: z.date().optional(),
  departureDate: z.date().optional(),
  flightNumber: z.string().optional(),
  accommodationType: z.string().optional(),
  accommodationDetails: z.string().optional(),
  specialRequests: z.string().optional(),
});

type FormValues = z.infer<typeof createBookingSchema>;

interface CreateBookingFormProps {
  userId?: number;
  clinicId?: number;
  quoteRequestId?: number;
  treatmentPlanId?: number;
  isAdmin?: boolean;
}

export default function CreateBookingForm({
  userId,
  clinicId,
  quoteRequestId,
  treatmentPlanId,
  isAdmin = false,
}: CreateBookingFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useNavigate();
  const { createBooking, isCreating } = useBookings();
  const [selectedClinic, setSelectedClinic] = useState<number | undefined>(clinicId);
  
  // Default values for the form
  const defaultValues: Partial<FormValues> = {
    userId: userId || user?.id,
    clinicId: clinicId,
    quoteRequestId: quoteRequestId,
    treatmentPlanId: treatmentPlanId,
    stage: 'deposit',
    status: 'pending',
    depositAmount: 0
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(createBookingSchema),
    defaultValues,
  });

  const onSubmit = (values: FormValues) => {
    // Format the dates as strings
    const bookingData: CreateBookingData = {
      ...values,
      userId: values.userId || user?.id || 0,
    };
    
    createBooking(bookingData, {
      onSuccess: (booking) => {
        toast({
          title: t('bookings.create_success_title'),
          description: t('bookings.create_success_message'),
        });
        
        // Redirect to the booking details page based on user role
        if (isAdmin) {
          navigate(`/admin/bookings/${booking.id}`);
        } else if (user?.role === 'clinic_staff') {
          navigate(`/clinic/bookings/${booking.id}`);
        } else {
          navigate(`/bookings/${booking.id}`);
        }
      },
      onError: (error) => {
        toast({
          title: t('bookings.create_error_title'),
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* User Selection - Only for admin */}
        {isAdmin && (
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('bookings.user')}</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('bookings.select_user')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* This would be populated with real user data */}
                    <SelectItem value="1">Patient 1</SelectItem>
                    <SelectItem value="2">Patient 2</SelectItem>
                    <SelectItem value="3">Patient 3</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t('bookings.user_description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Clinic Selection */}
        <FormField
          control={form.control}
          name="clinicId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bookings.clinic')}</FormLabel>
              <Select
                onValueChange={(value) => {
                  const clinicId = parseInt(value, 10);
                  field.onChange(clinicId);
                  setSelectedClinic(clinicId);
                }}
                defaultValue={field.value?.toString()}
                disabled={!!clinicId || user?.role === 'clinic_staff'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('bookings.select_clinic')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* This would be populated with real clinic data */}
                  <SelectItem value="1">Istanbul Dental Clinic</SelectItem>
                  <SelectItem value="2">Antalya Smile Center</SelectItem>
                  <SelectItem value="3">Izmir Dental Solutions</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t('bookings.clinic_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Treatment Plan Selection */}
        {treatmentPlanId ? (
          <FormField
            control={form.control}
            name="treatmentPlanId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('bookings.treatment_plan')}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={`Treatment Plan #${treatmentPlanId}`}
                    disabled
                  />
                </FormControl>
                <FormDescription>
                  {t('bookings.treatment_plan_linked')}
                </FormDescription>
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="treatmentPlanId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('bookings.treatment_plan')}</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('bookings.select_treatment_plan')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">{t('common.none')}</SelectItem>
                    {/* This would be populated with real treatment plan data */}
                    <SelectItem value="1">Treatment Plan #1</SelectItem>
                    <SelectItem value="2">Treatment Plan #2</SelectItem>
                    <SelectItem value="3">Treatment Plan #3</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t('bookings.treatment_plan_description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Quote Request Selection */}
        {quoteRequestId ? (
          <FormField
            control={form.control}
            name="quoteRequestId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('bookings.quote_request')}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={`Quote Request #${quoteRequestId}`}
                    disabled
                  />
                </FormControl>
                <FormDescription>
                  {t('bookings.quote_request_linked')}
                </FormDescription>
              </FormItem>
            )}
          />
        ) : null}

        {/* Deposit Amount */}
        <FormField
          control={form.control}
          name="depositAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bookings.deposit_amount')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value?.toString() || '0'}
                />
              </FormControl>
              <FormDescription>
                {t('bookings.deposit_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Arrival Date */}
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
                        <span>{t('bookings.select_date')}</span>
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
                    disabled={(date) =>
                      date < new Date() || (form.watch("departureDate") ? date > form.watch("departureDate")! : false)
                    }
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

        {/* Departure Date */}
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
                        <span>{t('bookings.select_date')}</span>
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
                    disabled={(date) =>
                      date < new Date() || (form.watch("arrivalDate") ? date < form.watch("arrivalDate")! : false)
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

        {/* Flight Number */}
        <FormField
          control={form.control}
          name="flightNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bookings.flight_number')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                {t('bookings.flight_number_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Accommodation Type */}
        <FormField
          control={form.control}
          name="accommodationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bookings.accommodation_type')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('bookings.select_accommodation')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="hotel">{t('bookings.accommodation.hotel')}</SelectItem>
                  <SelectItem value="clinic_provided">{t('bookings.accommodation.clinic_provided')}</SelectItem>
                  <SelectItem value="self_arranged">{t('bookings.accommodation.self_arranged')}</SelectItem>
                  <SelectItem value="none">{t('bookings.accommodation.none')}</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t('bookings.accommodation_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Accommodation Details */}
        <FormField
          control={form.control}
          name="accommodationDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bookings.accommodation_details')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                {t('bookings.accommodation_details_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Special Requests */}
        <FormField
          control={form.control}
          name="specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bookings.special_requests')}</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder={t('bookings.special_requests_placeholder')}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormDescription>
                {t('bookings.special_requests_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => {
            if (isAdmin) {
              navigate('/admin/bookings');
            } else if (user?.role === 'clinic_staff') {
              navigate('/clinic/bookings');
            } else {
              navigate('/bookings');
            }
          }}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('bookings.create_booking')}
          </Button>
        </div>
      </form>
    </Form>
  );
}