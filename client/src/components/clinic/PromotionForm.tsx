import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, addWeeks, isAfter } from 'date-fns';
import { useNavigate, useParams } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Minus, 
  Info, 
  Calendar, 
  Tag,
  Package,
  Percent,
  DollarSign,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Trash2
} from 'lucide-react';

import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Form Schema
const promotionFormSchema = z.object({
  code: z.string().min(4, {
    message: 'Promo code must be at least 4 characters.',
  }).max(20, {
    message: 'Promo code cannot exceed 20 characters.'
  }).regex(/^[A-Z0-9_-]+$/, {
    message: 'Promo code can only contain uppercase letters, numbers, underscores, and hyphens.'
  }),
  title: z.string().min(5, {
    message: 'Title must be at least 5 characters.'
  }).max(100, {
    message: 'Title cannot exceed 100 characters.'
  }),
  description: z.string().min(20, {
    message: 'Description must be at least 20 characters.'
  }).max(1000, {
    message: 'Description cannot exceed 1000 characters.'
  }),
  type: z.enum(['discount', 'package'], {
    message: 'Please select a promotion type.'
  }),
  discountType: z.enum(['percentage', 'fixed_amount']).optional(),
  discountValue: z.number().min(0).optional(),
  applicable_treatments: z.array(z.string()).min(1, {
    message: 'Select at least one applicable treatment.'
  }),
  start_date: z.date({
    required_error: 'Start date is required.'
  }),
  end_date: z.date({
    required_error: 'End date is required.'
  }),
  max_uses: z.number().int().min(0, {
    message: 'Max uses must be 0 or greater.'
  }),
  packageData: z.object({
    name: z.string().min(5, {
      message: 'Package name must be at least 5 characters.'
    }).max(100, {
      message: 'Package name cannot exceed 100 characters.'
    }),
    description: z.string().min(20, {
      message: 'Package description must be at least 20 characters.'
    }).max(500, {
      message: 'Package description cannot exceed 500 characters.'
    }),
    treatments: z.array(z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number().int().min(1)
    })).min(1, {
      message: 'Package must include at least one treatment.'
    }),
    originalPrice: z.number().min(0),
    packagePrice: z.number().min(0),
    attractions: z.array(z.object({
      name: z.string(),
      description: z.string(),
      value: z.number(),
      included: z.boolean()
    })).optional(),
    additionalServices: z.array(z.string()).optional()
  }).optional()
}).refine(data => {
  if (data.type === 'discount') {
    return data.discountType && data.discountValue !== undefined;
  }
  return true;
}, {
  message: 'Discount type and value are required for discount promotions',
  path: ['discountType']
}).refine(data => {
  if (data.type === 'package') {
    return !!data.packageData;
  }
  return true;
}, {
  message: 'Package details are required for package promotions',
  path: ['packageData']
}).refine(data => {
  // Ensure end date is after start date
  return isAfter(data.end_date, data.start_date);
}, {
  message: 'End date must be after start date',
  path: ['end_date']
}).refine(data => {
  if (data.type === 'package' && data.packageData) {
    // Package price must be less than original price
    return data.packageData.packagePrice < data.packageData.originalPrice;
  }
  return true;
}, {
  message: 'Package price must be less than the original price',
  path: ['packageData.packagePrice']
});

// Promotion form default values
const defaultValues = {
  code: '',
  title: '',
  description: '',
  type: 'discount' as const,
  discountType: 'percentage' as const,
  discountValue: 10,
  applicable_treatments: [],
  start_date: addDays(new Date(), 1),
  end_date: addWeeks(new Date(), 2),
  max_uses: 50,
  packageData: {
    name: '',
    description: '',
    treatments: [],
    originalPrice: 0,
    packagePrice: 0,
    attractions: [
      {
        name: 'Free Airport Transfer',
        description: 'Complimentary pickup and drop-off at Istanbul Airport',
        value: 50,
        included: true
      },
      {
        name: 'Istanbul City Tour',
        description: 'Guided tour of Istanbul's historic sites',
        value: 80,
        included: false
      },
      {
        name: 'Bosphorus Cruise',
        description: 'Scenic cruise along the Bosphorus strait',
        value: 60,
        included: false
      },
      {
        name: 'Luxury Hotel Discount',
        description: '15% discount at partner luxury hotels',
        value: 100,
        included: false
      }
    ],
    additionalServices: []
  }
};

// Treatment mockup data (would come from API in production)
const availableTreatments = [
  { id: 'dental-implant', name: 'Dental Implant' },
  { id: 'veneer', name: 'Porcelain Veneer' },
  { id: 'crown', name: 'Dental Crown' },
  { id: 'root-canal', name: 'Root Canal Treatment' },
  { id: 'teeth-whitening', name: 'Teeth Whitening' },
  { id: 'full-mouth', name: 'Full Mouth Rehabilitation' },
  { id: 'hollywood-smile', name: 'Hollywood Smile' },
  { id: 'bridge', name: 'Dental Bridge' },
  { id: 'denture', name: 'Denture' },
  { id: 'braces', name: 'Dental Braces' },
  { id: 'cleaning', name: 'Professional Cleaning' },
  { id: 'filling', name: 'Dental Filling' }
];

// Duration options for the form
const durationOptions = [
  { value: 7, label: '1 Week' },
  { value: 14, label: '2 Weeks' },
  { value: 30, label: '1 Month' },
  { value: 60, label: '2 Months' },
  { value: 90, label: '3 Months' },
  { value: 180, label: '6 Months' },
  { value: 365, label: '1 Year' }
];

// Additional services options
const additionalServiceOptions = [
  'Free Consultation',
  'Complimentary X-Ray',
  'VIP Transfer Service',
  'Free Hotel Stay (2 Nights)',
  'Personalized Treatment Plan',
  'Free Follow-up Visit',
  'Exclusive Patient Coordinator',
  'Emergency Dental Support',
  'International Phone Support'
];

// Type for TreatmentSelect props
interface TreatmentSelectProps {
  treatments: Array<{ id: string; name: string }>;
  onSelect: (selectedId: string) => void;
}

// Treatment selection component
const TreatmentSelect: React.FC<TreatmentSelectProps> = ({ treatments, onSelect }) => {
  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Select treatment" />
      </SelectTrigger>
      <SelectContent>
        {treatments.map((treatment) => (
          <SelectItem key={treatment.id} value={treatment.id}>
            {treatment.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Main PromotionForm component
const PromotionForm: React.FC = () => {
  const { id } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [serviceType, setServiceType] = useState<'discount' | 'package'>('discount');
  const [duration, setDuration] = useState<number>(14); // default 2 weeks
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);
  const [attractionsExpanded, setAttractionsExpanded] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form methods
  const form = useForm<z.infer<typeof promotionFormSchema>>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues,
    mode: 'onChange'
  });

  // Watch form fields for dynamic UI updates
  const watchType = form.watch('type');
  const watchDiscountType = form.watch('discountType');
  const watchDiscountValue = form.watch('discountValue');
  const watchStartDate = form.watch('start_date');
  const watchEndDate = form.watch('end_date');
  const watchMaxUses = form.watch('max_uses');
  const watchPackageData = form.watch('packageData');
  const watchCode = form.watch('code');
  const watchTitle = form.watch('title');
  const watchDescription = form.watch('description');

  // Fetch promotion data for editing if ID is present
  const { data: promotionData, isLoading: isLoadingPromotion } = useQuery({
    queryKey: ['/api/clinic/promotions', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest('GET', `/api/clinic/promotions/${id}`);
      return response.json();
    },
    enabled: !!id,
    refetchOnWindowFocus: false
  });

  // Create promotion mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/clinic/promotions', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Promotion created',
        description: 'Your promotion draft has been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/promotions'] });
      navigate('/clinic/promotions');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create promotion: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update promotion mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/clinic/promotions/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Promotion updated',
        description: 'Your promotion has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/promotions'] });
      navigate('/clinic/promotions');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update promotion: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update end date when start date or duration changes
  useEffect(() => {
    if (watchStartDate && duration > 0) {
      const newEndDate = addDays(new Date(watchStartDate), duration);
      form.setValue('end_date', newEndDate);
    }
  }, [watchStartDate, duration, form]);

  // Set form values when editing an existing promotion
  useEffect(() => {
    if (promotionData?.promotion && id) {
      setIsEditing(true);
      
      const promotion = promotionData.promotion;
      setServiceType(promotion.type);
      
      // Convert applicable treatments to array if needed
      const applicableTreatments = Array.isArray(promotion.applicable_treatments) 
        ? promotion.applicable_treatments 
        : [];
      
      setSelectedTreatments(applicableTreatments);
      
      // Set form values
      form.reset({
        code: promotion.code,
        title: promotion.title,
        description: promotion.description,
        type: promotion.type,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        applicable_treatments: applicableTreatments,
        start_date: new Date(promotion.start_date),
        end_date: new Date(promotion.end_date),
        max_uses: promotion.max_uses,
        packageData: promotion.packageData
      });
      
      // Set additional services if available
      if (promotion.packageData?.additionalServices) {
        setAdditionalServices(promotion.packageData.additionalServices);
      }
      
      // Calculate duration between start and end dates
      const startDate = new Date(promotion.start_date);
      const endDate = new Date(promotion.end_date);
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays);
    }
  }, [promotionData, id, form]);

  // Handle duration change
  const handleDurationChange = (value: string) => {
    const days = parseInt(value);
    setDuration(days);
    if (watchStartDate) {
      const newEndDate = addDays(new Date(watchStartDate), days);
      form.setValue('end_date', newEndDate);
    }
  };

  // Handle promotion type change
  const handleTypeChange = (value: string) => {
    if (value === 'discount' || value === 'package') {
      setServiceType(value);
      form.setValue('type', value);
    }
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof promotionFormSchema>) => {
    // Prepare form data
    const formData = {
      ...data,
      start_date: format(data.start_date, 'yyyy-MM-dd'),
      end_date: format(data.end_date, 'yyyy-MM-dd')
    };
    
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  // Handle adding a treatment to a package
  const handleAddPackageTreatment = (treatmentId: string) => {
    const treatment = availableTreatments.find(t => t.id === treatmentId);
    if (!treatment) return;
    
    const currentPackageData = form.getValues('packageData');
    if (!currentPackageData) return;
    
    // Check if treatment is already in the package
    const existingIndex = currentPackageData.treatments.findIndex(t => t.id === treatmentId);
    
    if (existingIndex >= 0) {
      // Increment quantity if already exists
      const updatedTreatments = [...currentPackageData.treatments];
      updatedTreatments[existingIndex].quantity += 1;
      
      form.setValue('packageData.treatments', updatedTreatments);
    } else {
      // Add new treatment
      const newTreatment = {
        id: treatment.id,
        name: treatment.name,
        quantity: 1
      };
      
      form.setValue('packageData.treatments', [
        ...currentPackageData.treatments,
        newTreatment
      ]);
    }
    
    // Update original price
    calculatePackagePrices();
  };

  // Handle removing a treatment from a package
  const handleRemovePackageTreatment = (treatmentId: string) => {
    const currentPackageData = form.getValues('packageData');
    if (!currentPackageData) return;
    
    // Filter out the treatment
    const updatedTreatments = currentPackageData.treatments.filter(t => t.id !== treatmentId);
    
    form.setValue('packageData.treatments', updatedTreatments);
    
    // Update original price
    calculatePackagePrices();
  };

  // Handle updating treatment quantity
  const handleUpdateTreatmentQuantity = (treatmentId: string, quantity: number) => {
    const currentPackageData = form.getValues('packageData');
    if (!currentPackageData) return;
    
    const updatedTreatments = currentPackageData.treatments.map(t => {
      if (t.id === treatmentId) {
        return { ...t, quantity: Math.max(1, quantity) };
      }
      return t;
    });
    
    form.setValue('packageData.treatments', updatedTreatments);
    
    // Update original price
    calculatePackagePrices();
  };

  // Calculate package prices based on treatments and attractions
  const calculatePackagePrices = () => {
    const currentPackageData = form.getValues('packageData');
    if (!currentPackageData) return;
    
    // This is just a placeholder calculation - in production this would
    // fetch real treatment prices from the API
    const treatmentBasePrices: Record<string, number> = {
      'dental-implant': 500,
      'veneer': 250,
      'crown': 200,
      'root-canal': 300,
      'teeth-whitening': 150,
      'full-mouth': 3000,
      'hollywood-smile': 2500,
      'bridge': 450,
      'denture': 400,
      'braces': 1000,
      'cleaning': 80,
      'filling': 100
    };
    
    // Calculate original price based on treatments
    let originalPrice = 0;
    currentPackageData.treatments.forEach(treatment => {
      const basePrice = treatmentBasePrices[treatment.id] || 100;
      originalPrice += basePrice * treatment.quantity;
    });
    
    // Add included attractions value
    const attractionsValue = currentPackageData.attractions?.reduce((total, attraction) => {
      return total + (attraction.included ? attraction.value : 0);
    }, 0) || 0;
    
    originalPrice += attractionsValue;
    
    // Set the original price
    form.setValue('packageData.originalPrice', originalPrice);
    
    // Calculate package price with 15% discount as default
    const packagePrice = Math.round(originalPrice * 0.85);
    form.setValue('packageData.packagePrice', packagePrice);
  };

  // Handle attraction toggle
  const handleAttractionToggle = (index: number, included: boolean) => {
    const currentPackageData = form.getValues('packageData');
    if (!currentPackageData || !currentPackageData.attractions) return;
    
    const updatedAttractions = [...currentPackageData.attractions];
    updatedAttractions[index].included = included;
    
    form.setValue('packageData.attractions', updatedAttractions);
    
    // Update prices
    calculatePackagePrices();
  };

  // Handle additional service toggle
  const handleServiceToggle = (service: string) => {
    if (additionalServices.includes(service)) {
      setAdditionalServices(additionalServices.filter(s => s !== service));
    } else {
      setAdditionalServices([...additionalServices, service]);
    }
    
    // Update form value
    form.setValue('packageData.additionalServices', 
      additionalServices.includes(service) 
        ? additionalServices.filter(s => s !== service)
        : [...additionalServices, service]
    );
  };

  // Calculate savings percentage
  const calculateSavingsPercentage = () => {
    const packageData = form.getValues('packageData');
    if (!packageData || !packageData.originalPrice || !packageData.packagePrice) return 0;
    
    const savings = packageData.originalPrice - packageData.packagePrice;
    return Math.round((savings / packageData.originalPrice) * 100);
  };

  // Generate promo code
  const generatePromoCode = () => {
    const prefix = watchType === 'discount' ? 'SAVE' : 'PKG';
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    form.setValue('code', `${prefix}${randomStr}`);
  };

  // Step navigation
  const goToNextStep = () => {
    // Validate current step fields
    if (activeStep === 0) {
      const basicInfoValid = form.trigger(['code', 'title', 'description', 'type']);
      if (!basicInfoValid) return;
      
      if (watchType === 'discount') {
        const discountValid = form.trigger(['discountType', 'discountValue']);
        if (!discountValid) return;
      }
    }
    
    setActiveStep(prevStep => Math.min(prevStep + 1, 2));
  };
  
  const goToPrevStep = () => {
    setActiveStep(prevStep => Math.max(prevStep - 1, 0));
  };

  // Define steps based on promotion type
  const steps = [
    { title: 'Basic Info', description: 'Basic promotion details' },
    serviceType === 'discount' 
      ? { title: 'Treatments', description: 'Select applicable treatments' }
      : { title: 'Package', description: 'Define treatment package' },
    { title: 'Schedule', description: 'Set promotion dates' }
  ];

  // Check if form is dirty for exit confirmation
  const handleExit = () => {
    if (form.formState.isDirty) {
      setExitDialogOpen(true);
    } else {
      navigate('/clinic/promotions');
    }
  };
  
  // Render date filter for DatePicker
  const dateFilter = (date: Date) => {
    // Disable dates in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today || date.getDate() === today.getDate();
  };

  if (isLoadingPromotion) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
          <div className="h-64 w-full bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Promotion' : 'Create New Promotion'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? 'Update your promotion details below' 
              : 'Fill out the form below to create a new promotion'}
          </p>
        </div>
        <Button variant="outline" onClick={handleExit}>
          Cancel
        </Button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="relative flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                {/* Connection line */}
                {index > 0 && (
                  <div 
                    className={`absolute left-0 right-0 h-[2px] top-1/2 transform -translate-y-1/2 -z-10 ${
                      index <= activeStep ? 'bg-primary' : 'bg-muted'
                    }`}
                    style={{ 
                      left: `${(index - 1) * 50 + 25}%`, 
                      right: `${100 - (index * 50 + 25)}%` 
                    }}
                  ></div>
                )}
                
                {/* Step circle */}
                <div 
                  className={`flex-shrink-0 relative ${
                    index < activeStep 
                      ? 'bg-primary text-primary-foreground' 
                      : index === activeStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  } h-10 w-10 rounded-full flex items-center justify-center`}
                >
                  {index < activeStep ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
          
          {/* Step titles */}
          <div className="mt-2 flex justify-between">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`text-center w-1/3 ${
                  index === activeStep ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                <div className="text-sm">{step.title}</div>
                <div className="text-xs hidden sm:block">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              {/* Step 1: Basic Info */}
              {activeStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Promo Code</FormLabel>
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Input 
                                  placeholder="SUMMER25" 
                                  {...field} 
                                  className="uppercase"
                                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={generatePromoCode}
                              >
                                Generate
                              </Button>
                            </div>
                            <FormDescription>
                              A unique code patients will enter to access this promotion
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Promotion Type</FormLabel>
                            <Select 
                              onValueChange={(value) => handleTypeChange(value)} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select promotion type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="discount">
                                  <div className="flex items-center">
                                    <Tag className="h-4 w-4 mr-2" />
                                    <span>Discount on Treatments</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="package">
                                  <div className="flex items-center">
                                    <Package className="h-4 w-4 mr-2" />
                                    <span>Treatment Package</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The type of promotion you want to offer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Summer Special Offer" {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear, attention-grabbing title for your promotion
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your promotion in detail..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed information about what the promotion includes and its benefits
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {watchType === 'discount' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="discountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select discount type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="percentage">
                                  <div className="flex items-center">
                                    <Percent className="h-4 w-4 mr-2" />
                                    <span>Percentage Discount</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="fixed_amount">
                                  <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    <span>Fixed Amount Discount</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="discountValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Value</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  placeholder={watchDiscountType === 'percentage' ? '10' : '100'} 
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  min={0}
                                  max={watchDiscountType === 'percentage' ? 100 : undefined}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  {watchDiscountType === 'percentage' ? '%' : '£'}
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              {watchDiscountType === 'percentage' 
                                ? 'Percentage discount to apply (e.g., 10 for 10% off)' 
                                : 'Fixed amount to discount in GBP (e.g., 100 for £100 off)'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 2: Treatments or Package */}
              {activeStep === 1 && watchType === 'discount' && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="applicable_treatments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applicable Treatments</FormLabel>
                        <FormDescription>
                          Select which treatments this discount applies to
                        </FormDescription>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                          {availableTreatments.map((treatment) => (
                            <FormItem
                              key={treatment.id}
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(treatment.id)}
                                  onCheckedChange={(checked) => {
                                    const updatedValue = checked
                                      ? [...field.value, treatment.id]
                                      : field.value?.filter((id) => id !== treatment.id);
                                    field.onChange(updatedValue);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {treatment.name}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* Package content for step 2 */}
              {activeStep === 1 && watchType === 'package' && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="packageData.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Complete Smile Makeover" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for your treatment package
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="packageData.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A comprehensive package including..." 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Brief description of what's included in this package
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <h3 className="text-base font-medium mb-2">Package Treatments</h3>
                    <div className="mb-4">
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label className="text-sm mb-1">Add Treatment</Label>
                          <TreatmentSelect 
                            treatments={availableTreatments}
                            onSelect={handleAddPackageTreatment}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="packageData.treatments"
                      render={({ field }) => (
                        <FormItem>
                          <div className="rounded-md border">
                            {field.value && field.value.length > 0 ? (
                              <div className="divide-y">
                                {field.value.map((treatment, index) => (
                                  <div key={index} className="flex items-center justify-between p-3">
                                    <div className="flex-1">
                                      <h4 className="font-medium">{treatment.name}</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleUpdateTreatmentQuantity(treatment.id, treatment.quantity - 1)}
                                          disabled={treatment.quantity <= 1}
                                        >
                                          <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-8 text-center">{treatment.quantity}</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleUpdateTreatmentQuantity(treatment.id, treatment.quantity + 1)}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => handleRemovePackageTreatment(treatment.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-muted-foreground">
                                No treatments added to this package yet
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Accordion
                    type="single"
                    collapsible
                    value={attractionsExpanded ? 'attractions' : undefined}
                    onValueChange={(value) => setAttractionsExpanded(value === 'attractions')}
                  >
                    <AccordionItem value="attractions">
                      <AccordionTrigger>Tourist Attractions & Benefits</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Select tourist attractions and additional benefits to include in this package
                          </p>
                          
                          <FormField
                            control={form.control}
                            name="packageData.attractions"
                            render={({ field }) => (
                              <FormItem>
                                <div className="space-y-2">
                                  {field.value?.map((attraction, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 rounded-md border">
                                      <Checkbox
                                        checked={attraction.included}
                                        onCheckedChange={(checked) => 
                                          handleAttractionToggle(index, !!checked)
                                        }
                                        id={`attraction-${index}`}
                                      />
                                      <div className="flex-1">
                                        <Label
                                          htmlFor={`attraction-${index}`}
                                          className="text-base font-medium cursor-pointer"
                                        >
                                          {attraction.name}
                                        </Label>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                          {attraction.description}
                                        </p>
                                        <div className="text-sm mt-1">
                                          Value: <span className="font-medium">£{attraction.value}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Additional Services</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {additionalServiceOptions.map((service, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`service-${index}`}
                                    checked={additionalServices.includes(service)}
                                    onCheckedChange={() => handleServiceToggle(service)}
                                  />
                                  <Label
                                    htmlFor={`service-${index}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {service}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="packageData.originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price (£)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              readOnly
                            />
                          </FormControl>
                          <FormDescription>
                            Total value of all included treatments and benefits
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="packageData.packagePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Price (£)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Discounted package price (save {calculateSavingsPercentage()}%)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              
              {/* Step 3: Schedule */}
              {activeStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="w-full pl-3 text-left font-normal"
                                  >
                                    {field.value ? (
                                      format(field.value, 'PPP')
                                    ) : (
                                      <span>Pick a start date</span>
                                    )}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={dateFilter}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              When this promotion becomes active
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <Label>Duration</Label>
                      <Select
                        value={duration.toString()}
                        onValueChange={handleDurationChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        How long this promotion will run
                      </p>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick an end date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                const startDate = form.getValues('start_date');
                                return date < startDate || date < new Date();
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When this promotion expires
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="max_uses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Redemptions</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of times this promotion can be used (0 for unlimited)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center gap-2">
                      <InfoCircle className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Important Note</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your promotion will be reviewed by our team before it becomes active. 
                      We may adjust your suggested dates based on platform scheduling.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between pt-6 border-t">
              {activeStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPrevStep}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExit}
                >
                  Cancel
                </Button>
              )}
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewDialogOpen(true)}
                >
                  Preview
                </Button>
                
                {activeStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={goToNextStep}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {isEditing ? 'Update Promotion' : 'Create Promotion'}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
      
      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Promotion Preview</DialogTitle>
            <DialogDescription>
              Here's how your promotion will appear to patients
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {watchType === 'discount' ? (
                    <Tag className="h-5 w-5 text-primary" />
                  ) : (
                    <Package className="h-5 w-5 text-primary" />
                  )}
                  <CardTitle>{watchTitle || 'Promotion Title'}</CardTitle>
                </div>
                <CardDescription>
                  Promo Code: <span className="font-mono bg-muted p-1 rounded text-sm">{watchCode}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{watchDescription || 'Promotion description will appear here...'}</p>
                
                {watchType === 'discount' && (
                  <div className="rounded-md border p-4 bg-primary/5">
                    <div className="text-xl font-bold text-primary">
                      {watchDiscountType === 'percentage' 
                        ? `${watchDiscountValue || 0}% OFF` 
                        : `£${watchDiscountValue || 0} OFF`}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Valid on: {form.getValues('applicable_treatments')?.length || 0} selected treatments
                      {form.getValues('applicable_treatments')?.length > 0 && (
                        <ul className="mt-1 pl-5 list-disc">
                          {form.getValues('applicable_treatments')?.map((id) => {
                            const treatment = availableTreatments.find(t => t.id === id);
                            return treatment ? (
                              <li key={id}>{treatment.name}</li>
                            ) : null;
                          }).slice(0, 3)}
                          {form.getValues('applicable_treatments')?.length > 3 && (
                            <li>And {form.getValues('applicable_treatments')?.length - 3} more...</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
                
                {watchType === 'package' && watchPackageData && (
                  <div className="rounded-md border p-4 bg-primary/5">
                    <div className="text-xl font-bold">
                      Package: {watchPackageData.name || 'Package Name'}
                    </div>
                    <p className="mt-1 text-sm">{watchPackageData.description || 'Package description'}</p>
                    
                    {watchPackageData.treatments?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium">Included Treatments:</h4>
                        <ul className="mt-1 pl-5 list-disc">
                          {watchPackageData.treatments.map((treatment, index) => (
                            <li key={index}>
                              {treatment.name} {treatment.quantity > 1 ? `(x${treatment.quantity})` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {watchPackageData.attractions?.some(a => a.included) && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium">Included Attractions:</h4>
                        <ul className="mt-1 pl-5 list-disc">
                          {watchPackageData.attractions
                            .filter(a => a.included)
                            .map((attraction, index) => (
                              <li key={index}>{attraction.name}</li>
                            ))}
                        </ul>
                      </div>
                    )}
                    
                    {additionalServices.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium">Additional Services:</h4>
                        <ul className="mt-1 pl-5 list-disc">
                          {additionalServices.map((service, index) => (
                            <li key={index}>{service}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-between items-end">
                      <div>
                        <div className="text-sm line-through text-muted-foreground">
                          Regular Price: £{watchPackageData.originalPrice || 0}
                        </div>
                        <div className="text-lg font-bold text-primary">
                          Package Price: £{watchPackageData.packagePrice || 0}
                        </div>
                      </div>
                      <div className="bg-primary text-primary-foreground text-sm font-bold px-3 py-1.5 rounded-full">
                        Save {calculateSavingsPercentage()}%
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {watchStartDate && watchEndDate ? (
                    <span>
                      Valid from {format(watchStartDate, 'PPP')} to {format(watchEndDate, 'PPP')}
                    </span>
                  ) : (
                    <span>Promotion dates not set</span>
                  )}
                </div>
                
                {watchMaxUses > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Limited to {watchMaxUses} uses
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/20 border-t pt-4">
                <Button className="w-full" disabled>Get This Offer</Button>
              </CardFooter>
            </Card>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Exit confirmation dialog */}
      <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to exit without saving?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExitDialogOpen(false)}
            >
              Continue Editing
            </Button>
            <Button
              variant="destructive"
              onClick={() => navigate('/clinic/promotions')}
            >
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionForm;