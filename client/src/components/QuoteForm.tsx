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
// Removed react-i18next
import { useLocation } from "wouter";

// Defined specific dental treatment options
const dentalTreatments = [
  { value: "dental_veneers", label: "veneers" },
  { value: "dental_implants", label: "implants" },
  { value: "dental_crowns", label: "crowns" },
  { value: "dental_hollywood", label: "hollywood" },
  { value: "dental_whitening", label: "whitening" },
  { value: "dental_bridges", label: "bridges" },
  { value: "dental_root_canal", label: "root_canal" },
  { value: "dental_other", label: "other" },
];

const formSchema = z.object({
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  treatmentType: z.string().min(1, "Treatment type is required"),
  specificTreatment: z.string().min(1, "Specific treatment is required"),
  otherTreatment: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required")
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Please enter a valid phone number"),
  budget: z.string().optional(),
  budgetPriority: z.enum(["low", "medium", "high"]).optional(),
  priority: z.enum(["cost", "quality", "location"]).optional(),
  holidayInterest: z.boolean().default(false),
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
  // Translation removed
  const [location, setLocation] = useLocation();
  const [showOtherField, setShowOtherField] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specificTreatments, setSpecificTreatments] = useState<{ value: string; label: string }[]>(dentalTreatments);
  const [selectedCountry, setSelectedCountry] = useState<string>("turkey");
  const [availableCities, setAvailableCities] = useState<{ value: string; label: string; disabled?: boolean }[]>([
    { value: "istanbul", label: "Istanbul" },
    { value: "izmir", label: "Izmir", disabled: true },
    { value: "antalya", label: "Antalya", disabled: true },
    { value: "dalaman", label: "Dalaman", disabled: true },
  ]);
  const { toast } = useToast();
  
  // Check for active special offer in sessionStorage
  const [hasActiveOffer, setHasActiveOffer] = useState<boolean>(false);
  const [activeOfferData, setActiveOfferData] = useState<any>(null);

  // Check for activeSpecialOffer on component mount
  React.useEffect(() => {
    try {
      const offerJson = sessionStorage.getItem('activeSpecialOffer');
      if (offerJson) {
        const offerData = JSON.parse(offerJson);
        console.log("Found active special offer in sessionStorage:", offerData);
        setHasActiveOffer(true);
        setActiveOfferData(offerData);
        
        // Show toast notification about special offer
        toast({
          title: "Special Offer Applied",
          description: `${offerData.title} will be applied to your quote results.`,
        });
      }
    } catch (error) {
      console.error("Error checking for active special offer:", error);
    }
  }, []);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: "turkey",
      city: "istanbul",
      treatmentType: "dental",
      specificTreatment: "",
      otherTreatment: "",
      name: "",
      email: "",
      phone: "",
      budget: "",
      budgetPriority: undefined,
      priority: undefined,
      holidayInterest: false,
      startDate: undefined,
      endDate: undefined,
      needsAccommodation: false,
      notes: "",
      consent: false,
    },
  });

  const handleTreatmentTypeChange = (value: string) => {
    form.setValue("specificTreatment", "");
    
    if (value === "dental") {
      setSpecificTreatments(dentalTreatments);
    } else {
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
    <section id="quote-form" className="py-16 bg-white relative z-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 relative">
          {/* Add a highlight effect around the form */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl blur-lg -z-10 animate-pulse"></div>
          <div>
            <h2 className="font-display font-bold text-4xl text-primary mb-4 relative">
              {t('form.title')}
              <span className="absolute -top-3 -right-3 bg-secondary/20 text-secondary-foreground text-xs px-2 py-1 rounded-full rotate-3">
                FREE
              </span>
            </h2>
            <p className="text-neutral-600 mb-6 text-lg">
              {t('form.description')}
            </p>
            
            {/* Display active special offer banner if one exists */}
            {hasActiveOffer && activeOfferData && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-blue-500/10 rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 -ml-6 -mb-6 bg-blue-500/10 rounded-full"></div>
                
                <div className="flex items-start">
                  <div className="mr-3 text-blue-500 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                      <path d="M12 3l1.87 6.63L20 12l-6.13 2.37L12 21l-1.87-6.63L4 12l6.13-2.37L12 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-700 text-base">Special Offer Applied</h3>
                    <p className="text-blue-600 text-sm">{activeOfferData.title}</p>
                    <div className="flex items-center mt-1 text-xs text-blue-600">
                      <span className="font-medium mr-2">
                        {activeOfferData.discountType === 'percentage' 
                          ? `${activeOfferData.discountValue}% OFF` 
                          : `£${activeOfferData.discountValue} OFF`}
                      </span>
                      <span className="text-blue-500 opacity-70">• Will be applied to your results</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200 mb-6">
              <h3 className="font-display font-semibold text-lg mb-2 text-primary">{t('form.expectations.title')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="fas fa-clock text-secondary mt-1 mr-3"></i>
                  <span className="text-neutral-700">{t('form.expectations.response')}</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-file-medical text-secondary mt-1 mr-3"></i>
                  <span className="text-neutral-700">{t('form.expectations.options')}</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-tags text-secondary mt-1 mr-3"></i>
                  <span className="text-neutral-700">{t('form.expectations.pricing')}</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-comments text-secondary mt-1 mr-3"></i>
                  <span className="text-neutral-700">{t('form.expectations.consultation')}</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-primary/10 p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <i className="fas fa-shield-alt text-primary text-xl mr-3"></i>
                <h3 className="font-display font-semibold text-lg text-primary">{t('form.privacy.title')}</h3>
              </div>
              <p className="text-neutral-700 text-sm">{t('form.privacy.description')}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border border-neutral-200">
            {isSubmitted ? (
              <div className="p-6 bg-secondary/20 text-secondary-dark rounded-lg text-center">
                <div className="text-5xl mb-4"><i className="fas fa-check-circle"></i></div>
                <h3 className="font-display font-bold text-xl mb-2">{t('form.success.title')}</h3>
                <p>{t('form.success.message')}</p>
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
                        country: data.country,
                        city: data.city,
                        treatment: `${data.treatmentType} - ${data.specificTreatment}`,
                        otherTreatment: data.otherTreatment || 'Not specified',
                        budget: data.budget || 'Not specified',
                        budgetPriority: data.budgetPriority || 'Not specified',
                        priority: data.priority || 'Not specified',
                        holidayInterest: data.holidayInterest ? "Yes" : "No",
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
                      
                      // Extract treatment name for the URL
                      const treatmentValue = data.specificTreatment.replace('dental_', '');
                      const treatmentLabel = t(`form.treatments.${treatmentValue}`);
                      
                      // Create base query parameters
                      const params: Record<string, string> = {
                        treatment: treatmentLabel,
                        country: data.country,
                        city: data.city,
                        travelMonth: data.startDate ? format(data.startDate, 'MMMM yyyy') : 'Flexible',
                        budget: data.budget ? `£${data.budget} - £${parseInt(data.budget) + 1000}` : 'Flexible',
                        name: data.name,
                        email: data.email,
                        phone: data.phone
                      };
                      
                      // Add special offer parameters if one is active
                      if (hasActiveOffer && activeOfferData) {
                        params.specialOffer = activeOfferData.id;
                        params.offerTitle = activeOfferData.title;
                        params.offerClinic = activeOfferData.clinicId;
                        params.offerDiscount = activeOfferData.discountValue.toString();
                        params.offerDiscountType = activeOfferData.discountType;
                        if (activeOfferData.applicableTreatment) {
                          params.applicableTreatment = activeOfferData.applicableTreatment;
                        }
                        console.log("Adding special offer parameters to quote URL:", activeOfferData);
                        
                        // Clear the special offer from sessionStorage to prevent reuse
                        sessionStorage.removeItem('activeSpecialOffer');
                      }
                      
                      // Convert to URLSearchParams
                      const queryParams = new URLSearchParams(params).toString();
                      
                      // Log the queryParams for debugging
                      console.log("Form submitted with parameters:", params);
                      
                      // Show success toast
                      toast({
                        title: "Quote Generated!",
                        description: hasActiveOffer 
                          ? "We're showing you clinics with your special offer!" 
                          : "We're taking you to your personalized dental clinic options",
                      });
                      
                      // Reset form after successful submission
                      form.reset();
                      
                      // Redirect to the quote page
                      setLocation(`/your-quote?${queryParams}`);
                    } catch (err) {
                      // Handle errors
                      setIsSubmitting(false);
                      console.error('Email sending failed:', err);
                      toast({
                        title: t('form.error.title'),
                        description: t('form.error.message'),
                        variant: "destructive",
                      });
                    }
                  })}
                >
                  {/* All form fields will be processed via EmailJS */}
                  
                  {/* Country Selection */}
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country <span className="text-accent">*</span></FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCountry(value);
                            // Reset city when country changes
                            form.setValue("city", "");
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="turkey">Turkey</SelectItem>
                            <SelectItem value="thailand" disabled>Thailand (Coming Soon)</SelectItem>
                            <SelectItem value="mexico" disabled>Mexico (Coming Soon)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* City Selection - Only shown when a country is selected */}
                  {selectedCountry && (
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City <span className="text-accent">*</span></FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {selectedCountry === "turkey" && availableCities.map((city) => (
                                <SelectItem 
                                  key={city.value} 
                                  value={city.value}
                                  disabled={city.disabled}
                                >
                                  {city.label} {city.disabled && "(Coming Soon)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {/* Display only Dental Treatment Category */}
                  <div className="mb-4">
                    <FormLabel className="block mb-2">{t('form.treatmentCategory')}</FormLabel>
                    <div className="py-2 px-3 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-800">
                      {t('form.dentalWork')}
                    </div>
                  </div>
                  
                  {/* Specific Treatment Selection - shows when a category is selected */}
                  {specificTreatments.length > 0 && (
                    <FormField
                      control={form.control}
                      name="specificTreatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.treatment')} <span className="text-accent">*</span></FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleSpecificTreatmentChange(value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('form.selectTreatment')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {specificTreatments.map((treatment) => (
                                <SelectItem key={treatment.value} value={treatment.value}>
                                  {t(`form.treatments.${treatment.value.replace('dental_', '')}`)}
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
                          <FormLabel>{t('form.otherTreatment')}</FormLabel>
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
                        <FormLabel>{t('form.name')} <span className="text-accent">*</span></FormLabel>
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
                        <FormLabel>{t('form.email')} <span className="text-accent">*</span></FormLabel>
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
                        <FormLabel>{t('form.phone')} <span className="text-accent">*</span></FormLabel>
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
                        <FormLabel>{t('form.budget')}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 3000" {...field} name="budget" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Patient Preferences Section */}
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800">Help us find your perfect clinic</h3>
                    <p className="text-sm text-blue-600">These preferences help us recommend the best clinics for you</p>
                    
                    <FormField
                      control={form.control}
                      name="budgetPriority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Range</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your budget preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">💰 Budget-friendly (Under £2000)</SelectItem>
                              <SelectItem value="medium">🎯 Mid-range (£2000-3000)</SelectItem>
                              <SelectItem value="high">👑 Premium (£3000+)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What's most important to you?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cost">💸 Best price</SelectItem>
                              <SelectItem value="quality">🏆 Highest quality</SelectItem>
                              <SelectItem value="location">🌅 Great location</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="holidayInterest"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-blue-700">
                              🏖️ I'm interested in combining my treatment with a Turkish holiday
                            </FormLabel>
                            <p className="text-xs text-blue-600">We'll recommend clinics near tourist areas and beaches</p>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Date Range Selection */}
                  <div className="space-y-2">
                    <FormLabel>{t('form.dates')}</FormLabel>
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
                                      <span>{t('form.fromDate')}</span>
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
                                      <span>{t('form.toDate')}</span>
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
                            {t('form.accommodation')}
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
                        <FormLabel>{t('form.notes')}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t('form.notesPlaceholder')}
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
                            {t('form.consent')}
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {/* Primary CTA Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-700 text-white py-6 text-lg font-semibold shadow-lg relative overflow-hidden group"
                    disabled={isSubmitting}
                  >
                    <span className="absolute inset-0 w-0 bg-white/10 transition-all duration-500 ease-out group-hover:w-full"></span>
                    <span className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('form.submitting')}
                        </>
                      ) : (
                        <>
                          Calculate My Quote
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </span>
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
