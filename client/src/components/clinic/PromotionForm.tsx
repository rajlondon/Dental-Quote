import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, addWeeks, isAfter } from 'date-fns';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Minus, 
  Info, 
  Calendar, 
  Tag,
  Package,
  Percent,
  X,
  InfoIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';

// Define schema for promotion form validation
const promotionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  code: z.string().min(4, "Promo code must be at least 4 characters long"),
  type: z.enum(["discount", "package"]),
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "ACTIVE", "EXPIRED", "REJECTED"]).default("DRAFT"),
  discount_type: z.enum(["percentage", "fixed"]).optional(),
  discount_value: z.number().min(1).optional(),
  start_date: z.date(),
  end_date: z.date(),
  terms_conditions: z.string().min(10, "Terms & conditions must be at least 10 characters long"),
  packageData: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    packagePrice: z.number().min(0).optional(),
    treatments: z.array(z.string()).optional(),
    accommodationIncluded: z.boolean().optional(),
    accommodationDetails: z.string().optional(),
    transportIncluded: z.boolean().optional(),
    transportDetails: z.string().optional(),
    attractions: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        value: z.number(),
        included: z.boolean()
      })
    ).optional(),
    additionalServices: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        value: z.number()
      })
    ).optional()
  }).optional(),
  clinic_id: z.number().optional()
});

// Define the Props interface for the component
interface PromotionFormProps {
  id?: string;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

// Default form values
const defaultValues = {
  title: '',
  description: '',
  code: '',
  type: 'discount',
  status: 'DRAFT',
  discount_type: 'percentage',
  discount_value: 10,
  start_date: new Date(),
  end_date: addWeeks(new Date(), 4),
  terms_conditions: 'This promotion is subject to availability. Cannot be combined with other offers.',
  packageData: {
    title: '',
    description: '',
    packagePrice: 0,
    treatments: [],
    accommodationIncluded: false,
    accommodationDetails: '',
    transportIncluded: false,
    transportDetails: '',
    attractions: [
      {
        name: 'Free Airport Transfer',
        description: 'Complimentary pickup and drop-off at Istanbul Airport',
        value: 50,
        included: true
      },
      {
        name: 'Istanbul City Tour',
        description: 'Guided tour of Istanbul historic sites',
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
];

export default function PromotionForm({ id, onSubmitSuccess, onCancel }: PromotionFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!!id);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Set up form with validation
  const form = useForm({
    resolver: zodResolver(promotionSchema),
    defaultValues,
    mode: "onChange"
  });

  // Fetch promotion data if editing
  const { isLoading: isLoadingPromotion } = useQuery({
    queryKey: ['/api/promotions', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiRequest('GET', `/api/promotions/${id}`);
      const promotion = await res.json();
      
      if (promotion) {
        // Transform dates from strings to Date objects
        promotion.start_date = new Date(promotion.start_date);
        promotion.end_date = new Date(promotion.end_date);
        
        // Set form values
        form.reset(promotion);
        return promotion;
      }
      return null;
    },
    enabled: !!id,
  });

  // Get current user/clinic info
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/auth/user');
      return res.json();
    },
  });

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof promotionSchema>) => {
      // Add current clinic ID from user data
      if (!data.clinic_id && userData?.user?.clinicId) {
        data.clinic_id = userData.user.clinicId;
      } else if (!data.clinic_id) {
        throw new Error("Unable to determine clinic ID. Please try again.");
      }
      
      // Create or update promotion - use the clinic API endpoint
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = isEditing 
        ? `/api/clinic/promotions/${id}` 
        : '/api/clinic/promotions';
      
      const res = await apiRequest(method, endpoint, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: `Promotion ${isEditing ? 'updated' : 'created'} successfully`,
        description: isEditing 
          ? "Your changes have been saved." 
          : "Your promotion has been submitted for approval.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/promotions'] });
      
      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Watch form values for conditional rendering
  const promotionType = form.watch('type');
  const discountType = form.watch('discount_type');
  const attractions = form.watch('packageData.attractions') || [];
  
  // Helper function to add a new attraction
  const addAttraction = () => {
    const currentAttractions = form.getValues('packageData.attractions') || [];
    form.setValue('packageData.attractions', [
      ...currentAttractions,
      {
        name: '',
        description: '',
        value: 0,
        included: false
      }
    ]);
  };
  
  // Helper function to remove an attraction
  const removeAttraction = (index: number) => {
    const currentAttractions = form.getValues('packageData.attractions') || [];
    form.setValue(
      'packageData.attractions',
      currentAttractions.filter((_, i) => i !== index)
    );
  };
  
  // Helper function to toggle attraction inclusion
  const toggleAttractionInclusion = (index: number) => {
    const currentAttractions = [...(form.getValues('packageData.attractions') || [])];
    if (currentAttractions[index]) {
      currentAttractions[index].included = !currentAttractions[index].included;
      form.setValue('packageData.attractions', currentAttractions);
    }
  };

  // Handle form submission with proper type casting
  const onSubmit = async (formData: any) => {
    setIsLoading(true);
    
    try {
      // Ensure the type is properly set as one of the valid enum values
      const data = {
        ...formData,
        type: formData.type === 'discount' ? 'discount' : 'package',
        status: formData.status || 'DRAFT',
      };
      
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">
                {promotionType === 'discount' ? 'Discount Details' : 'Package Details'}
              </TabsTrigger>
              <TabsTrigger value="terms">Terms & Schedule</TabsTrigger>
            </TabsList>
            
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details of your promotion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Summer Special Offer" {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear, enticing title for your promotion
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your promotion in detail..." 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Explain the benefits of this promotion to potential patients
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Promo Code */}
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promo Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. SUMMER2025" {...field} />
                        </FormControl>
                        <FormDescription>
                          Code patients will enter to redeem this promotion
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Promotion Type */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="discount" id="discount" />
                              <Label htmlFor="discount" className="flex items-center">
                                <Percent className="mr-2 h-4 w-4" />
                                Discount Promotion
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="package" id="package" />
                              <Label htmlFor="package" className="flex items-center">
                                <Package className="mr-2 h-4 w-4" />
                                Treatment Package
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          {promotionType === 'discount' 
                            ? 'Discount applies to selected treatments'
                            : 'Package includes multiple treatments and possibly accommodation/activities'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  {onCancel && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onCancel}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab('details')}
                  >
                    Next
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {promotionType === 'discount' ? 'Discount Details' : 'Package Details'}
                  </CardTitle>
                  <CardDescription>
                    {promotionType === 'discount' 
                      ? 'Configure the discount amount and type'
                      : 'Create a comprehensive treatment package with extras'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {promotionType === 'discount' ? (
                    <>
                      {/* Discount Type */}
                      <FormField
                        control={form.control}
                        name="discount_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="percentage" id="percentage" />
                                  <Label htmlFor="percentage">Percentage Discount (%)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="fixed" id="fixed" />
                                  <Label htmlFor="fixed">Fixed Amount Discount (£)</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormDescription>
                              How the discount will be calculated
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Discount Value */}
                      <FormField
                        control={form.control}
                        name="discount_value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount (£)'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={discountType === 'percentage' ? 1 : 5}
                                max={discountType === 'percentage' ? 100 : undefined}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              {discountType === 'percentage' 
                                ? 'Percentage off the regular price (1-100%)'
                                : 'Fixed amount off the regular price in GBP'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    // Package details fields
                    <>
                      {/* Package Title */}
                      <FormField
                        control={form.control}
                        name="packageData.title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Package Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Complete Smile Makeover Package" {...field} />
                            </FormControl>
                            <FormDescription>
                              A specific name for this treatment package
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Package Description */}
                      <FormField
                        control={form.control}
                        name="packageData.description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Package Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Detailed description of what's included in this package..." 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Package Price */}
                      <FormField
                        control={form.control}
                        name="packageData.packagePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Package Price (£)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              The all-inclusive price for this package in GBP
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Included Treatments */}
                      <FormField
                        control={form.control}
                        name="packageData.treatments"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel>Included Treatments</FormLabel>
                              <FormDescription>
                                Select all treatments included in this package
                              </FormDescription>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {availableTreatments.map((treatment) => (
                                <FormField
                                  key={treatment.id}
                                  control={form.control}
                                  name="packageData.treatments"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={treatment.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={Array.isArray(field.value) && field.value.some(item => item === treatment.id)}
                                            onCheckedChange={(checked) => {
                                              // Ensure field.value is always an array
                                              const current = Array.isArray(field.value) ? [...field.value] : [];
                                              const updated = checked
                                                ? [...current, treatment.id]
                                                : current.filter((value) => value !== treatment.id);
                                              field.onChange(updated);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {treatment.name}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Accommodation */}
                      <FormField
                        control={form.control}
                        name="packageData.accommodationIncluded"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Accommodation Included
                              </FormLabel>
                              <FormDescription>
                                Include hotel accommodation with this package
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {/* Accommodation Details */}
                      {form.watch('packageData.accommodationIncluded') && (
                        <FormField
                          control={form.control}
                          name="packageData.accommodationDetails"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Accommodation Details</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe the included accommodation..." 
                                  className="min-h-[80px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Hotel name, number of nights, room type, etc.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {/* Transportation */}
                      <FormField
                        control={form.control}
                        name="packageData.transportIncluded"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Transportation Included
                              </FormLabel>
                              <FormDescription>
                                Include transportation with this package
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {/* Transportation Details */}
                      {form.watch('packageData.transportIncluded') && (
                        <FormField
                          control={form.control}
                          name="packageData.transportDetails"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Transportation Details</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe the included transportation..." 
                                  className="min-h-[80px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Airport transfers, local transport, etc.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {/* Attractions and Activities */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-base font-medium">Attractions & Activities</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addAttraction}
                            className="h-8"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {attractions.map((attraction, index) => (
                            <Card key={index} className="relative">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 h-6 w-6"
                                onClick={() => removeAttraction(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              
                              <CardContent className="pt-6">
                                <div className="grid gap-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-1">
                                      <Controller
                                        control={form.control}
                                        name={`packageData.attractions.${index}.name`}
                                        render={({ field }) => (
                                          <Input 
                                            placeholder="Attraction name" 
                                            {...field} 
                                          />
                                        )}
                                      />
                                    </div>
                                    <div className="ml-4 mt-1">
                                      <Controller
                                        control={form.control}
                                        name={`packageData.attractions.${index}.included`}
                                        render={({ field }) => (
                                          <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                              toggleAttractionInclusion(index);
                                            }}
                                          />
                                        )}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-3">
                                      <Controller
                                        control={form.control}
                                        name={`packageData.attractions.${index}.description`}
                                        render={({ field }) => (
                                          <Input 
                                            placeholder="Brief description" 
                                            {...field} 
                                          />
                                        )}
                                      />
                                    </div>
                                    <div>
                                      <Controller
                                        control={form.control}
                                        name={`packageData.attractions.${index}.value`}
                                        render={({ field }) => (
                                          <div className="flex items-center">
                                            <span className="mr-2">£</span>
                                            <Input 
                                              type="number" 
                                              min={0}
                                              {...field}
                                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                          </div>
                                        )}
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                {attraction.included && (
                                  <Badge className="mt-2 bg-green-500">Included</Badge>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                          
                          {attractions.length === 0 && (
                            <div className="text-center p-4 border border-dashed rounded-md text-gray-500">
                              No attractions added yet
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab('basic')}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab('terms')}
                  >
                    Next
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Terms Tab */}
            <TabsContent value="terms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Terms & Schedule</CardTitle>
                  <CardDescription>
                    Set when this promotion is active and its terms and conditions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Date */}
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
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
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
                    
                    {/* End Date */}
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
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                disabled={(date) => 
                                  isAfter(
                                    new Date(), 
                                    date
                                  ) || 
                                  // Ensure end date is after start date
                                  !isAfter(date, form.getValues('start_date'))
                                }
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
                  </div>
                  
                  {/* Terms and Conditions */}
                  <FormField
                    control={form.control}
                    name="terms_conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms & Conditions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter the terms and conditions for this promotion..." 
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Any restrictions, eligibility requirements, or other conditions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Status (for drafts/editing) */}
                  {isEditing && (
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DRAFT">Draft</SelectItem>
                              <SelectItem value="PENDING_APPROVAL">Submit for Approval</SelectItem>
                              {/* Admin would typically handle these statuses */}
                              {/* <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="EXPIRED">Expired</SelectItem>
                              <SelectItem value="REJECTED">Rejected</SelectItem> */}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Current status of this promotion
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab('details')}
                  >
                    Previous
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Saving...
                      </>
                    ) : isEditing ? (
                      'Update Promotion'
                    ) : (
                      'Create Promotion'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}