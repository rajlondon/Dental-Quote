import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { insertBookingSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useBookings } from "@/hooks/use-bookings";
import { useToast } from "@/hooks/use-toast";
// Removed react-i18next
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = insertBookingSchema.extend({
  arrivalDate: z.date().optional(),
  departureDate: z.date().optional(),
  // Add additional client-side validations as needed
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateBookingForm() {
  // Translation removed
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { useCreateBooking } = useBookings();
  const { createBooking, isLoading } = useCreateBooking();
  
  const [step, setStep] = useState<number>(1);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: user?.id,
      clinicId: undefined,
      status: "pending",
      stage: "deposit",
      depositPaid: false,
      depositAmount: 0,
      bookingReference: null,
      flightNumber: null,
      accommodationType: null,
      accommodationDetails: null,
      arrivalDate: undefined,
      departureDate: undefined,
      treatmentPlanId: null,
      treatmentNotes: null,
      patientNotes: null,
      adminNotes: null,
      lastPatientMessageAt: null,
      lastClinicMessageAt: null,
      lastAdminMessageAt: null,
    },
  });
  
  async function onSubmit(data: FormValues) {
    try {
      const booking = await createBooking({
        ...data,
        // Format dates properly for the API
        arrivalDate: data.arrivalDate ? data.arrivalDate.toISOString() : null,
        departureDate: data.departureDate ? data.departureDate.toISOString() : null,
      });
      
      toast({
        title: t("bookings.booking_created"),
        description: t("bookings.booking_created_description"),
        variant: "default",
      });
      
      // Navigate to the new booking's detail page
      setLocation(`/bookings/${booking.id}`);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast({
        title: t("bookings.booking_creation_failed"),
        description: error.message || t("common.something_went_wrong"),
        variant: "destructive",
      });
    }
  }
  
  const nextStep = () => {
    const currentFields = getFieldsForStep(step);
    const isValid = currentFields.every(field => {
      const value = form.getValues(field as any);
      return value !== undefined && value !== "";
    });
    
    if (isValid) {
      setStep(step + 1);
    } else {
      // Trigger validation on the current fields
      form.trigger(currentFields as any);
    }
  };
  
  const prevStep = () => {
    setStep(Math.max(1, step - 1));
  };
  
  // Helper to get which fields should be shown at each step
  const getFieldsForStep = (stepNumber: number): string[] => {
    switch (stepNumber) {
      case 1:
        return ["clinicId"];
      case 2:
        return ["arrivalDate", "departureDate", "flightNumber", "accommodationType", "accommodationDetails"];
      case 3:
        return ["depositPaid", "depositAmount", "patientNotes"];
      default:
        return [];
    }
  };
  
  // Render content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <FormField
              control={form.control}
              name="clinicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bookings.clinic")}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("bookings.select_clinic")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Clinic 1</SelectItem>
                      <SelectItem value="2">Clinic 2</SelectItem>
                      <SelectItem value="3">Clinic 3</SelectItem>
                      {/* Ideally, we'd fetch clinics from the API */}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("bookings.select_clinic_description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      
      case 2:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="arrivalDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("bookings.arrival_date")}</FormLabel>
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
                              <span>{t("bookings.pick_date")}</span>
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
                            date < new Date() || date > new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      {t("bookings.arrival_date_description")}
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
                    <FormLabel>{t("bookings.departure_date")}</FormLabel>
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
                              <span>{t("bookings.pick_date")}</span>
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
                          disabled={(date) => {
                            const arrivalDate = form.getValues("arrivalDate");
                            return (
                              date < new Date() || 
                              (arrivalDate && date < arrivalDate) || 
                              date > new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                            );
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      {t("bookings.departure_date_description")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="flightNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bookings.flight_number")}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    {t("bookings.flight_number_description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accommodationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bookings.accommodation_type")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("bookings.select_accommodation_type")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hotel">{t("bookings.accommodation_types.hotel")}</SelectItem>
                      <SelectItem value="apartment">{t("bookings.accommodation_types.apartment")}</SelectItem>
                      <SelectItem value="airbnb">{t("bookings.accommodation_types.airbnb")}</SelectItem>
                      <SelectItem value="other">{t("bookings.accommodation_types.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("bookings.accommodation_type_description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accommodationDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bookings.accommodation_details")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    {t("bookings.accommodation_details_description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      
      case 3:
        return (
          <>
            <FormField
              control={form.control}
              name="depositPaid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {t("bookings.deposit_paid")}
                    </FormLabel>
                    <FormDescription>
                      {t("bookings.deposit_paid_description")}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {form.watch("depositPaid") && (
              <FormField
                control={form.control}
                name="depositAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("bookings.deposit_amount")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("bookings.deposit_amount_description")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="patientNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bookings.patient_notes")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder={t("bookings.patient_notes_placeholder")}
                      className="min-h-[150px]"
                    />
                  </FormControl>
                  <FormDescription>
                    {t("bookings.patient_notes_description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">{t("bookings.review_clinic")}</h3>
              <p>{t("bookings.clinic_id")}: {form.getValues("clinicId")}</p>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">{t("bookings.review_travel")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("bookings.arrival_date")}</p>
                  <p>{form.getValues("arrivalDate") ? format(form.getValues("arrivalDate"), "PPP") : t("common.not_available")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("bookings.departure_date")}</p>
                  <p>{form.getValues("departureDate") ? format(form.getValues("departureDate"), "PPP") : t("common.not_available")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("bookings.flight_number")}</p>
                  <p>{form.getValues("flightNumber") || t("common.not_available")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("bookings.accommodation_type")}</p>
                  <p>{form.getValues("accommodationType") 
                    ? t(`bookings.accommodation_types.${form.getValues("accommodationType")}`) 
                    : t("common.not_available")}</p>
                </div>
              </div>
              {form.getValues("accommodationDetails") && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">{t("bookings.accommodation_details")}</p>
                  <p className="text-sm">{form.getValues("accommodationDetails")}</p>
                </div>
              )}
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">{t("bookings.review_payment")}</h3>
              <p>
                {form.getValues("depositPaid") 
                  ? `${t("bookings.deposit_paid")}: ${form.getValues("depositAmount")}` 
                  : t("bookings.deposit_not_paid")}
              </p>
            </div>
            
            {form.getValues("patientNotes") && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">{t("bookings.patient_notes")}</h3>
                <p className="text-sm">{form.getValues("patientNotes")}</p>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>
              {step === 4 
                ? t("bookings.review_booking") 
                : t("bookings.create_booking_step", { step, total: 4 })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              disabled={step === 1}
            >
              {t("common.previous")}
            </Button>
            
            <div>
              {step < 4 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                >
                  {t("common.next")}
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("bookings.create_booking")}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}