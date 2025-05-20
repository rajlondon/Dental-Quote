import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';

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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Calendar as CalendarIcon, Plus, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';

// Type for promotion status
type PromoStatusType = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'EXPIRED';

// Type for package treatments
interface PackageTreatment {
  id: string;
  name: string;
  quantity: number;
}

// Type for tourist attractions
interface TouristAttraction {
  name: string;
  description: string;
  value: number;
  included: boolean;
}

// Type for promotion
interface Promotion {
  id?: string;
  code: string;
  title: string;
  description: string;
  type: 'discount' | 'package';
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  applicable_treatments: string[];
  start_date: string;
  end_date: string;
  max_uses: number;
  status?: PromoStatusType;
  packageData?: {
    name: string;
    description: string;
    treatments: PackageTreatment[];
    originalPrice: number;
    packagePrice: number;
    attractions?: TouristAttraction[];
    additionalServices?: string[];
  };
}

// Form validation schema
const promotionFormSchema = z.object({
  code: z.string().min(4, 'Code must be at least 4 characters').max(20, 'Code cannot exceed 20 characters'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description cannot exceed 1000 characters'),
  type: z.enum(['discount', 'package']),
  discountType: z.enum(['percentage', 'fixed_amount']).optional(),
  discountValue: z.number().min(0).optional(),
  applicable_treatments: z.array(z.string()).min(1, 'At least one applicable treatment must be selected'),
  start_date: z.string(),
  end_date: z.string(),
  max_uses: z.number().int().min(0),
  packageData: z.object({
    name: z.string().min(5, 'Package name must be at least 5 characters'),
    description: z.string().min(20, 'Package description must be at least 20 characters'),
    treatments: z.array(z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      quantity: z.number().int().min(1)
    })).min(1, 'At least one treatment must be included'),
    originalPrice: z.number().min(0),
    packagePrice: z.number().min(0),
    attractions: z.array(z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      value: z.number().min(0),
      included: z.boolean()
    })).optional(),
    additionalServices: z.array(z.string()).optional()
  }).optional()
}).refine(data => {
  // If type is package, packageData is required
  if (data.type === 'package' && !data.packageData) {
    return false;
  }
  // If type is discount, discountType and discountValue are required
  if (data.type === 'discount' && (!data.discountType || data.discountValue === undefined)) {
    return false;
  }
  return true;
}, {
  message: "Package data is required for package type promotions, or discount details for discount type",
  path: ["type"]
});

interface PromotionFormProps {
  initialData?: Promotion;
  isEdit?: boolean;
  isRejected?: boolean;
}

// Sample treatments - in a real implementation, you would fetch these from your API
const availableTreatments = [
  { id: 'dental-implants', name: 'Dental Implants' },
  { id: 'veneers', name: 'Veneers' },
  { id: 'crowns', name: 'Crowns' },
  { id: 'whitening', name: 'Teeth Whitening' },
  { id: 'cleaning', name: 'Dental Cleaning' },
  { id: 'root-canal', name: 'Root Canal' },
  { id: 'dentures', name: 'Dentures' },
  { id: 'orthodontics', name: 'Orthodontics' },
  { id: 'checkup', name: 'Checkup' },
];

const PromotionForm: React.FC<PromotionFormProps> = ({ initialData, isEdit = false, isRejected = false }) => {
  const [activeTab, setActiveTab] = useState('details');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  // Default values for the form
  const defaultValues: Partial<Promotion> = initialData || {
    code: '',
    title: '',
    description: '',
    type: 'discount',
    discountType: 'percentage',
    discountValue: 10,
    applicable_treatments: [],
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
    max_uses: 100,
    packageData: {
      name: '',
      description: '',
      treatments: [{ id: '', name: '', quantity: 1 }],
      originalPrice: 0,
      packagePrice: 0,
      attractions: [],
      additionalServices: []
    }
  };

  // Define form
  const form = useForm<Promotion>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Get form values
  const promotionType = form.watch('type');
  const packageTreatments = form.watch('packageData.treatments') || [];
  const packageAttractions = form.watch('packageData.attractions') || [];
  const packageAdditionalServices = form.watch('packageData.additionalServices') || [];

  // Create promotion mutation
  const createMutation = useMutation({
    mutationFn: async (data: Promotion) => {
      return await apiRequest('POST', '/clinic/promotions', data);
    },
    onSuccess: () => {
      toast({
        title: 'Promotion created',
        description: 'Your promotion draft has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/promotions'] });
      navigate('/clinic/promotions');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create promotion',
        description: error.message || 'An error occurred while creating the promotion.',
        variant: 'destructive',
      });
    },
  });

  // Update promotion mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Promotion }) => {
      return await apiRequest('PUT', `/clinic/promotions/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Promotion updated',
        description: 'Your promotion has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/promotions'] });
      navigate('/clinic/promotions');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update promotion',
        description: error.message || 'An error occurred while updating the promotion.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: Promotion) => {
    if (isEdit && initialData?.id) {
      updateMutation.mutate({ id: initialData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Add a treatment to the package
  const addTreatment = () => {
    const currentTreatments = form.getValues('packageData.treatments') || [];
    form.setValue('packageData.treatments', [
      ...currentTreatments,
      { id: '', name: '', quantity: 1 }
    ]);
  };

  // Remove a treatment from the package
  const removeTreatment = (index: number) => {
    const currentTreatments = form.getValues('packageData.treatments') || [];
    form.setValue(
      'packageData.treatments',
      currentTreatments.filter((_, i) => i !== index)
    );
  };

  // Add a tourist attraction to the package
  const addAttraction = () => {
    const currentAttractions = form.getValues('packageData.attractions') || [];
    form.setValue('packageData.attractions', [
      ...currentAttractions,
      { name: '', description: '', value: 0, included: true }
    ]);
  };

  // Remove a tourist attraction from the package
  const removeAttraction = (index: number) => {
    const currentAttractions = form.getValues('packageData.attractions') || [];
    form.setValue(
      'packageData.attractions',
      currentAttractions.filter((_, i) => i !== index)
    );
  };

  // Add an additional service to the package
  const addAdditionalService = () => {
    const currentServices = form.getValues('packageData.additionalServices') || [];
    form.setValue('packageData.additionalServices', [
      ...currentServices,
      ''
    ]);
  };

  // Remove an additional service from the package
  const removeAdditionalService = (index: number) => {
    const currentServices = form.getValues('packageData.additionalServices') || [];
    form.setValue(
      'packageData.additionalServices',
      currentServices.filter((_, i) => i !== index)
    );
  };

  // Calculate package price with discount
  const calculatePackageDiscount = () => {
    const originalPrice = form.getValues('packageData.originalPrice') || 0;
    const packagePrice = form.getValues('packageData.packagePrice') || 0;
    
    if (originalPrice > 0 && packagePrice > 0) {
      const savingsAmount = originalPrice - packagePrice;
      const savingsPercentage = Math.round((savingsAmount / originalPrice) * 100);
      return {
        savingsAmount,
        savingsPercentage
      };
    }
    
    return {
      savingsAmount: 0,
      savingsPercentage: 0
    };
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'PPP');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Promotion' : 'Create New Promotion'}</CardTitle>
        <CardDescription>
          {isRejected 
            ? 'This promotion was rejected. Edit and resubmit for approval.' 
            : 'Create a new special offer or discount package for your patients'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Basic Details</TabsTrigger>
                <TabsTrigger value="discount">Discount Settings</TabsTrigger>
                {promotionType === 'package' && (
                  <TabsTrigger value="package">Package Details</TabsTrigger>
                )}
                <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              {/* Basic Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Summer Dental Special" {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear, descriptive title for your promotion
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promo Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., SUMMER2025" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormDescription>
                          The code patients will enter to claim this promotion (uppercase)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your promotion and its benefits..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Detailed description of what the promotion offers and any conditions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a promotion type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="discount">Discount</SelectItem>
                          <SelectItem value="package">Package</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Discount applies a simple price reduction, Package bundles multiple treatments
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="applicable_treatments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applicable Treatments</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableTreatments.map(treatment => (
                          <Button
                            key={treatment.id}
                            type="button"
                            variant={field.value.includes(treatment.id) ? "default" : "outline"}
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                              const newValue = field.value.includes(treatment.id)
                                ? field.value.filter(id => id !== treatment.id)
                                : [...field.value, treatment.id];
                              field.onChange(newValue);
                            }}
                          >
                            {treatment.name}
                          </Button>
                        ))}
                      </div>
                      <FormDescription>
                        Select all treatments this promotion applies to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Discount Settings Tab */}
              <TabsContent value="discount" className="space-y-4">
                {promotionType === 'discount' ? (
                  <>
                    <FormField
                      control={form.control}
                      name="discountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select discount type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="fixed_amount">Fixed Amount (£)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose between a percentage discount or a fixed amount
                          </FormDescription>
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
                            <div className="flex items-center">
                              <Input 
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                              <div className="ml-2 text-muted-foreground">
                                {form.watch('discountType') === 'percentage' ? '%' : '£'}
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            {form.watch('discountType') === 'percentage' 
                              ? 'Enter the percentage discount (e.g., 10 for 10% off)' 
                              : 'Enter the fixed amount discount in GBP (e.g., 100 for £100 off)'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Discount Example</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Original Price:</span>
                            <span className="font-medium">£1,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Discount Applied:</span>
                            <span className="font-medium text-primary">
                              {form.watch('discountType') === 'percentage' 
                                ? `${form.watch('discountValue') || 0}% (£${((form.watch('discountValue') || 0) / 100 * 1000).toFixed(2)})` 
                                : `£${form.watch('discountValue') || 0}`}
                            </span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-bold">
                            <span>Final Price:</span>
                            <span>
                              {form.watch('discountType') === 'percentage' 
                                ? `£${(1000 - (form.watch('discountValue') || 0) / 100 * 1000).toFixed(2)}` 
                                : `£${Math.max(0, 1000 - (form.watch('discountValue') || 0)).toFixed(2)}`}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <p>Discount settings are only available for promotions of type "Discount".</p>
                    <p>Your promotion is currently set as a "Package".</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        form.setValue('type', 'discount');
                        setActiveTab('details');
                      }}
                    >
                      Switch to Discount Type
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Package Details Tab */}
              <TabsContent value="package" className="space-y-6">
                {promotionType === 'package' ? (
                  <>
                    <FormField
                      control={form.control}
                      name="packageData.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Premium Implant Package" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of this treatment package
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
                              placeholder="Describe what this package includes..." 
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Detailed description of the package benefits
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Included Treatments</h3>
                      
                      {packageTreatments.map((treatment, index) => (
                        <div key={index} className="flex items-center gap-2 mb-3">
                          <FormField
                            control={form.control}
                            name={`packageData.treatments.${index}.id`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    const selectedTreatment = availableTreatments.find(t => t.id === value);
                                    if (selectedTreatment) {
                                      form.setValue(`packageData.treatments.${index}.name`, selectedTreatment.name);
                                    }
                                  }}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select treatment" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableTreatments.map(t => (
                                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`packageData.treatments.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="w-20">
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min={1}
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTreatment(index)}
                            disabled={packageTreatments.length <= 1}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={addTreatment}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Treatment
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="packageData.originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Price (£)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min={0}
                                step={0.01}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              The regular price without the package discount
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
                                min={0}
                                step={0.01}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              The special discounted package price
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Package Savings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Original Price:</span>
                            <span className="font-medium">£{form.watch('packageData.originalPrice') || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Package Price:</span>
                            <span className="font-medium">£{form.watch('packageData.packagePrice') || 0}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-bold">
                            <span>Total Savings:</span>
                            <span className="text-primary">
                              £{calculatePackageDiscount().savingsAmount} ({calculatePackageDiscount().savingsPercentage}%)
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Tourist Attractions (Optional)</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add tourist activities or experiences included in this package
                      </p>
                      
                      {packageAttractions.map((attraction, index) => (
                        <div key={index} className="border p-3 rounded-md mb-3">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <FormField
                              control={form.control}
                              name={`packageData.attractions.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Attraction Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Bosphorus Cruise" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`packageData.attractions.${index}.value`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Value (£)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number"
                                      min={0}
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name={`packageData.attractions.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="mb-3">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe this attraction..." 
                                    className="min-h-[60px]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttraction(index)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={addAttraction}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tourist Attraction
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Additional Services (Optional)</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add other benefits included in this package (e.g., airport transfer, hotel stay)
                      </p>
                      
                      {packageAdditionalServices.map((service, index) => (
                        <div key={index} className="flex items-center gap-2 mb-3">
                          <FormField
                            control={form.control}
                            name={`packageData.additionalServices.${index}`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormControl>
                                  <Input placeholder="e.g., Airport Transfer (Round Trip)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAdditionalService(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={addAdditionalService}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <p>Package details are only available for promotions of type "Package".</p>
                    <p>Your promotion is currently set as a "Discount".</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        form.setValue('type', 'package');
                        setActiveTab('details');
                      }}
                    >
                      Switch to Package Type
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Scheduling Tab */}
              <TabsContent value="scheduling" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  formatDate(new Date(field.value))
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={new Date(field.value)}
                              onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                              disabled={(date) => date < new Date()}
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
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  formatDate(new Date(field.value))
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={new Date(field.value)}
                              onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                              disabled={(date) => 
                                date < new Date() || 
                                (form.watch('start_date') && date < new Date(form.watch('start_date')))
                              }
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
                </div>
                
                <FormField
                  control={form.control}
                  name="max_uses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Uses</FormLabel>
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
                
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Promotion Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">
                          {form.watch('start_date') && form.watch('end_date') ? (
                            `${Math.ceil((new Date(form.watch('end_date')).getTime() - new Date(form.watch('start_date')).getTime()) / (1000 * 60 * 60 * 24))} days`
                          ) : (
                            'N/A'
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status after creation:</span>
                        <span className="font-medium">Draft (requires approval)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated review time:</span>
                        <span className="font-medium">1-2 business days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader className="bg-primary/5 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{form.watch('title') || 'Promotion Title'}</CardTitle>
                        <CardDescription>
                          <code className="bg-muted px-1 py-0.5 rounded text-sm">
                            {form.watch('code') || 'PROMOCODE'}
                          </code>
                        </CardDescription>
                      </div>
                      <Badge>
                        {form.watch('type') === 'discount' ? 'Discount' : 'Package'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Description</h3>
                        <p className="text-muted-foreground">
                          {form.watch('description') || 'No description provided.'}
                        </p>
                      </div>
                      
                      {form.watch('type') === 'discount' ? (
                        <div>
                          <h3 className="font-medium mb-2">Discount Details</h3>
                          <div className="bg-primary/10 p-4 rounded-md text-center">
                            <div className="text-2xl font-bold text-primary">
                              {form.watch('discountType') === 'percentage' 
                                ? `${form.watch('discountValue') || 0}% OFF` 
                                : `£${form.watch('discountValue') || 0} OFF`}
                            </div>
                            <p className="text-sm mt-1">
                              on selected treatments
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-medium mb-2">Package Details</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                              <span className="font-medium">Package Name:</span>
                              <span>{form.watch('packageData.name') || 'No name provided'}</span>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-2">Included Treatments:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {(form.watch('packageData.treatments') || []).map((treatment, index) => (
                                  treatment.id && (
                                    <li key={index}>
                                      {treatment.quantity}x {treatment.name || availableTreatments.find(t => t.id === treatment.id)?.name || 'Unknown Treatment'}
                                    </li>
                                  )
                                ))}
                              </ul>
                            </div>
                            
                            {(form.watch('packageData.attractions') || []).length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Tourist Attractions:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {(form.watch('packageData.attractions') || []).map((attraction, index) => (
                                    attraction.name && (
                                      <li key={index}>
                                        {attraction.name} (Value: £{attraction.value})
                                      </li>
                                    )
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {(form.watch('packageData.additionalServices') || []).length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Additional Services:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {(form.watch('packageData.additionalServices') || []).map((service, index) => (
                                    service && (
                                      <li key={index}>{service}</li>
                                    )
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="bg-primary/10 p-4 rounded-md">
                              <div className="flex justify-between mb-1">
                                <span>Regular Price:</span>
                                <span className="line-through">£{form.watch('packageData.originalPrice') || 0}</span>
                              </div>
                              <div className="flex justify-between text-lg font-bold">
                                <span>Package Price:</span>
                                <span className="text-primary">£{form.watch('packageData.packagePrice') || 0}</span>
                              </div>
                              <div className="text-center mt-2 text-sm">
                                Save £{calculatePackageDiscount().savingsAmount} ({calculatePackageDiscount().savingsPercentage}%)
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between border-t pt-4 text-sm text-muted-foreground">
                        <div>
                          Valid from: {form.watch('start_date') ? formatDate(new Date(form.watch('start_date'))) : 'Not set'}
                        </div>
                        <div>
                          Expires: {form.watch('end_date') ? formatDate(new Date(form.watch('end_date'))) : 'Not set'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-center">
                  <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>
                    Edit Details
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/clinic/promotions')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEdit ? 'Update Promotion' : 'Create Promotion'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PromotionForm;