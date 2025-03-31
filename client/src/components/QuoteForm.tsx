import React, { useState, useRef } from "react";
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
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, loadEmailJSConfig } from '../utils/config';

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
  phone: z.string().min(1, "Phone number is required")
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Please enter a valid phone number"),
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      phone: "",
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
  
  // This function is no longer used since we're now using EmailJS

  // This is no longer needed as we've integrated the email sending directly in the form submission handler
  
  // We directly use import.meta.env.VITE_* variables in our code

  return (
    <section id="quote-form" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display font-bold text-3xl text-neutral-800 mb-4">Get Your Free Dental Treatment Quote</h2>
            <p className="text-neutral-600 mb-6">Tell us about your dental needs, and our team will create a personalized quote with vetted Istanbul dentists that match your requirements.</p>
            
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
                <p>We'll get back to you within 24 hours with your personalized dental treatment options.</p>
              </div>
            ) : (
              <Form {...form}>
                <form 
                  className="space-y-4" 
                  onSubmit={form.handleSubmit(async (data) => {
                    // Set submitting state
                    setIsSubmitting(true);
                    
                    try {
                      // First load the latest EmailJS config from the server
                      await loadEmailJSConfig();
                      
                      // Initialize EmailJS with the public key
                      // For v4.x of @emailjs/browser, we should pass an object with publicKey property
                      emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
                      
                      // Prepare template parameters for EmailJS
                      const templateParams = {
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        treatment: `${data.treatmentType} - ${data.specificTreatment}`,
                        otherTreatment: data.otherTreatment || 'Not specified',
                        budget: data.budget || 'Not specified',
                        dates: data.startDate && data.endDate 
                          ? `${format(data.startDate, 'MMM dd, yyyy')} - ${format(data.endDate, 'MMM dd, yyyy')}` 
                          : 'No dates selected',
                        needsAccommodation: data.needsAccommodation ? "Yes" : "No",
                        notes: data.notes || 'No additional notes',
                        consent: data.consent ? "Yes" : "No"
                      };

                      console.log('Sending email with EmailJS');
                      
                      // Log EmailJS config availability for debugging
                      console.log('EmailJS Config:', {
                        serviceIdAvailable: !!EMAILJS_CONFIG.serviceId,
                        templateIdAvailable: !!EMAILJS_CONFIG.templateId,
                        publicKeyAvailable: !!EMAILJS_CONFIG.publicKey
                      });
                      
                      // Send the email using EmailJS with config values
                      await emailjs.send(
                        EMAILJS_CONFIG.serviceId,
                        EMAILJS_CONFIG.templateId,
                        templateParams
                      );
                      
                      // Handle success
                      setIsSubmitting(false);
                      setIsSubmitted(true);
                      form.reset();
                      toast({
                        title: "Dental quote request submitted",
                        description: "We'll get back to you within 24 hours with your personalized dental treatment options.",
                      });
                    } catch (err) {
                      // Handle errors
                      setIsSubmitting(false);
                      console.error('Email sending failed:', err);
                      toast({
                        title: "Error submitting request",
                        description: "There was an error sending your request. Please try again.",
                        variant: "destructive",
                      });
                    }
                  })}
                >
                  {/* All form fields will be processed via EmailJS */}
                  
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
                          <Input {...field} name="name" />
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
                          <Input type="email" {...field} name="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Phone Number Field */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number <span className="text-accent">*</span></FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+44 123 456 7890" {...field} name="phone" />
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
                          <Input type="number" placeholder="e.g. 3000" {...field} name="budget" />
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
                            name="notes"
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Request My Free Quote"}
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
