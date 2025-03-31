import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

// Defined specific treatment options for different categories
const dentalTreatments = [
  { value: "dental_veneers", label: "Veneers" },
  { value: "dental_implants", label: "Dental Implants" },
  { value: "dental_crowns", label: "Crowns" },
  { value: "dental_hollywood", label: "Hollywood Smile" },
  { value: "dental_other", label: "Other Dental Work" },
];

const cosmeticTreatments = [
  { value: "cosmetic_botox", label: "Botox" },
  { value: "cosmetic_fillers", label: "Dermal Fillers" },
  { value: "cosmetic_facelift", label: "Facelift" },
  { value: "cosmetic_rhinoplasty", label: "Rhinoplasty (Nose Job)" },
  { value: "cosmetic_liposuction", label: "Liposuction" },
  { value: "cosmetic_other", label: "Other Cosmetic Procedure" },
];

const hairTreatments = [
  { value: "hair_fue", label: "FUE Hair Transplant" },
  { value: "hair_dhi", label: "DHI Hair Transplant" },
  { value: "hair_women", label: "Women's Hair Restoration" },
  { value: "hair_beard", label: "Beard Transplant" },
  { value: "hair_other", label: "Other Hair Procedure" },
];

const formSchema = z.object({
  treatmentType: z.string().min(1, "Treatment type is required"),
  specificTreatment: z.string().min(1, "Specific treatment is required"),
  otherTreatment: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  budget: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  needsAccommodation: z.boolean().default(false),
  notes: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: "You must consent to be contacted",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const QuoteForm: React.FC = () => {
  const [showOtherField, setShowOtherField] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [specificTreatments, setSpecificTreatments] = useState<{ value: string; label: string }[]>([]);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      treatmentType: "",
      specificTreatment: "",
      otherTreatment: "",
      name: "",
      email: "",
      budget: "",
      startDate: undefined,
      endDate: undefined,
      needsAccommodation: false,
      notes: "",
      consent: false,
    },
  });

  const handleTreatmentTypeChange = (value: string) => {
    form.setValue("specificTreatment", "");
    
    switch (value) {
      case "dental":
        setSpecificTreatments(dentalTreatments);
        break;
      case "cosmetic":
        setSpecificTreatments(cosmeticTreatments);
        break;
      case "hair":
        setSpecificTreatments(hairTreatments);
        break;
      default:
        setSpecificTreatments([]);
    }
  };
  
  const handleSpecificTreatmentChange = (value: string) => {
    setShowOtherField(value.includes("_other"));
  };
  
  const submitQuoteRequest = useMutation({
    mutationFn: async (data: FormValues) => {
      // Format the data for the API
      const formattedData = {
        treatment: data.treatmentType,
        specificTreatment: data.specificTreatment,
        otherTreatment: data.otherTreatment,
        name: data.name,
        email: data.email,
        budget: data.budget,
        dates: data.startDate && data.endDate 
          ? `${format(data.startDate, 'MMM dd, yyyy')} - ${format(data.endDate, 'MMM dd, yyyy')}` 
          : '',
        needsAccommodation: data.needsAccommodation,
        notes: data.notes,
        consent: data.consent
      };
      
      const response = await apiRequest("POST", "/api/quote-requests", formattedData);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Quote request submitted",
        description: "We'll get back to you within 24 hours with your personalized treatment options.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error submitting request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    submitQuoteRequest.mutate(data);
  };

  return (
    <section id="quote-form" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display font-bold text-3xl text-neutral-800 mb-4">Get Your Free Quote</h2>
            <p className="text-neutral-600 mb-6">Tell us what you're looking for, and our team will create a personalized quote with vetted options that match your needs.</p>
            
            <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200 mb-6">
              <h3 className="font-display font-semibold text-lg mb-2 text-primary">What to expect after submitting:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="fas fa-clock text-secondary mt-1 mr-3"></i>
                  <span className="text-neutral-700">Response within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-file-medical text-secondary mt-1 mr-3"></i>
                  <span className="text-neutral-700">Three custom-matched provider options</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-tags text-secondary mt-1 mr-3"></i>
                  <span className="text-neutral-700">Clear, all-inclusive pricing</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-comments text-secondary mt-1 mr-3"></i>
                  <span className="text-neutral-700">Follow-up consultation with our team</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-primary/10 p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <i className="fas fa-shield-alt text-primary text-xl mr-3"></i>
                <h3 className="font-display font-semibold text-lg text-primary">Your Privacy Matters</h3>
              </div>
              <p className="text-neutral-700 text-sm">All information you provide is kept strictly confidential and is only shared with medical providers if you choose to proceed.</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border border-neutral-200">
            {isSubmitted ? (
              <div className="p-6 bg-secondary/20 text-secondary-dark rounded-lg text-center">
                <div className="text-5xl mb-4"><i className="fas fa-check-circle"></i></div>
                <h3 className="font-display font-bold text-xl mb-2">Thank You!</h3>
                <p>We'll get back to you within 24 hours with your personalized treatment options.</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Treatment Type Selection */}
                  <FormField
                    control={form.control}
                    name="treatmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment Category <span className="text-accent">*</span></FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleTreatmentTypeChange(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select treatment category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dental">Dental Work</SelectItem>
                            <SelectItem value="cosmetic">Cosmetic Treatments</SelectItem>
                            <SelectItem value="hair">Hair Transplant</SelectItem>
                            <SelectItem value="eye">Laser Eye Surgery</SelectItem>
                            <SelectItem value="wellness">Wellness & Anti-aging</SelectItem>
                            <SelectItem value="multiple">Multiple Treatments</SelectItem>
                            <SelectItem value="other">Other (Please specify)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Specific Treatment Selection - shows when a category is selected */}
                  {specificTreatments.length > 0 && (
                    <FormField
                      control={form.control}
                      name="specificTreatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specific Treatment <span className="text-accent">*</span></FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleSpecificTreatmentChange(value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select specific treatment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {specificTreatments.map((treatment) => (
                                <SelectItem key={treatment.value} value={treatment.value}>
                                  {treatment.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {/* Other Treatment Field */}
                  {showOtherField && (
                    <FormField
                      control={form.control}
                      name="otherTreatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please Specify Treatment</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name <span className="text-accent">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address <span className="text-accent">*</span></FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Budget Field */}
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Budget (€)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 3000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Date Range Selection */}
                  <div className="space-y-2">
                    <FormLabel>Preferred Travel Dates</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "MMM dd, yyyy")
                                    ) : (
                                      <span>From date</span>
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
                                    const today = new Date();
                                    return date < today;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "MMM dd, yyyy")
                                    ) : (
                                      <span>To date</span>
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
                                    const today = new Date();
                                    const startDate = form.getValues("startDate");
                                    if (date < today) {
                                      return true;
                                    }
                                    if (startDate && date < startDate) {
                                      return true;
                                    }
                                    return false;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Accommodation and Transfer Assistance Checkbox */}
                  <FormField
                    control={form.control}
                    name="needsAccommodation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm text-neutral-600">
                            I would like help with hotel accommodation and transfers
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {/* Notes Field */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Details or Questions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us more about what you're looking for..." 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Consent Checkbox */}
                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm text-neutral-600">
                            I consent to being contacted about my inquiry and understand my data will be processed according to the <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                    disabled={submitQuoteRequest.isPending}
                  >
                    {submitQuoteRequest.isPending ? "Submitting..." : "Request My Free Quote"}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteForm;
