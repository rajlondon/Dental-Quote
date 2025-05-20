import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Loader2, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  XCircle,
  AlertTriangle, 
  Image,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Schema for approval form
const approvalFormSchema = z.object({
  notes: z.string().optional(),
  modifyDates: z.boolean().default(false),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  displayOnHomepage: z.boolean().default(false),
  homepagePriority: z.number().default(5),
  homepageImageUrl: z.string().optional(),
  homepageShortDescription: z.string().max(200, "Short description cannot exceed 200 characters").optional(),
});

// Schema for rejection form
const rejectionFormSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
});

// Type definitions for promotion
interface TouristAttraction {
  name: string;
  description: string;
  value: number;
  included: boolean;
}

interface PackageTreatment {
  id: string;
  name: string;
  quantity: number;
}

interface PackageData {
  name: string;
  description: string;
  treatments: PackageTreatment[];
  originalPrice: number;
  packagePrice: number;
  attractions?: TouristAttraction[];
  additionalServices?: string[];
}

interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'discount' | 'package';
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  clinicId: string;
  applicable_treatments: string[];
  start_date: string;
  end_date: string;
  max_uses: number;
  status: string;
  created_by: string;
  created_at: string;
  submitted_at: string;
  packageData?: PackageData;
}

interface PromotionReviewProps {
  promotionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproveReject: () => void;
}

const PromotionReview: React.FC<PromotionReviewProps> = ({
  promotionId,
  open,
  onOpenChange,
  onApproveReject,
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [approvalMode, setApprovalMode] = useState<'approve' | 'reject' | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch promotion details
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/admin/promotions/${promotionId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/admin/promotions/${promotionId}`);
      const data = await response.json();
      return data.promotion as Promotion;
    },
    enabled: open,
  });
  
  // Setup approval form
  const approvalForm = useForm<z.infer<typeof approvalFormSchema>>({
    resolver: zodResolver(approvalFormSchema),
    defaultValues: {
      notes: '',
      modifyDates: false,
      displayOnHomepage: false,
      homepagePriority: 5,
    },
  });
  
  // Update form when promotion data changes
  React.useEffect(() => {
    if (data) {
      approvalForm.setValue('startDate', new Date(data.start_date));
      approvalForm.setValue('endDate', new Date(data.end_date));
    }
  }, [data, approvalForm]);
  
  // Setup rejection form
  const rejectionForm = useForm<z.infer<typeof rejectionFormSchema>>({
    resolver: zodResolver(rejectionFormSchema),
    defaultValues: {
      reason: '',
    },
  });
  
  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof approvalFormSchema>) => {
      const payload = {
        notes: formData.notes,
        ...(formData.modifyDates && {
          startDate: formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : undefined,
          endDate: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : undefined,
        }),
        displayOnHomepage: formData.displayOnHomepage,
        homepagePriority: formData.homepagePriority,
        homepageImageUrl: formData.homepageImageUrl,
        homepageShortDescription: formData.homepageShortDescription,
      };
      
      return await apiRequest('PUT', `/admin/promotions/${promotionId}/approve`, payload);
    },
    onSuccess: () => {
      toast({
        title: 'Promotion approved',
        description: 'The promotion has been approved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions/pending'] });
      onApproveReject();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to approve promotion',
        description: error.message || 'An error occurred while approving the promotion.',
        variant: 'destructive',
      });
    },
  });
  
  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof rejectionFormSchema>) => {
      return await apiRequest('PUT', `/admin/promotions/${promotionId}/reject`, {
        reason: formData.reason,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Promotion rejected',
        description: 'The promotion has been rejected and sent back to the clinic.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions/pending'] });
      onApproveReject();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to reject promotion',
        description: error.message || 'An error occurred while rejecting the promotion.',
        variant: 'destructive',
      });
    },
  });
  
  // Handle approval submission
  const handleApprove = (formData: z.infer<typeof approvalFormSchema>) => {
    approveMutation.mutate(formData);
  };
  
  // Handle rejection submission
  const handleReject = (formData: z.infer<typeof rejectionFormSchema>) => {
    rejectMutation.mutate(formData);
  };
  
  // Format date display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return dateString;
    }
  };
  
  // Calculate package savings
  const calculateSavings = (originalPrice: number, packagePrice: number) => {
    const savingsAmount = originalPrice - packagePrice;
    const savingsPercentage = Math.round((savingsAmount / originalPrice) * 100);
    
    return {
      amount: savingsAmount,
      percentage: savingsPercentage,
    };
  };
  
  // Check for any errors with the promotion that should prevent approval
  const checkPromotionIssues = (promotion: Promotion) => {
    const issues = [];
    
    if (promotion.type === 'discount' && (!promotion.discountType || promotion.discountValue === undefined)) {
      issues.push('Discount type or value is missing');
    }
    
    if (promotion.type === 'package' && !promotion.packageData) {
      issues.push('Package data is missing');
    }
    
    if (new Date(promotion.end_date) <= new Date(promotion.start_date)) {
      issues.push('End date must be after start date');
    }
    
    if (new Date(promotion.end_date) < new Date()) {
      issues.push('End date is in the past');
    }
    
    return issues;
  };
  
  if (!open) return null;
  
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (error || !data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Failed to load promotion details. Please try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  const promotion = data;
  const promotionIssues = checkPromotionIssues(promotion);
  const hasIssues = promotionIssues.length > 0;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{promotion.title}</DialogTitle>
              <DialogDescription>
                Promo Code: <code className="bg-muted px-1 py-0.5 rounded">{promotion.code}</code> | 
                Clinic ID: {promotion.clinicId}
              </DialogDescription>
            </div>
            <Badge>
              {promotion.type === 'discount' ? 'Discount' : 'Package'}
            </Badge>
          </div>
        </DialogHeader>
        
        {approvalMode === null ? (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
                <TabsTrigger value="homepage">Homepage</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{promotion.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Promotion Type</h3>
                  {promotion.type === 'discount' ? (
                    <div className="bg-primary/10 p-4 rounded-md text-center">
                      <div className="text-xl font-bold">
                        {promotion.discountType === 'percentage' 
                          ? `${promotion.discountValue}% OFF` 
                          : `£${promotion.discountValue} OFF`}
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Applicable to {promotion.applicable_treatments.length} treatments
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between border-b pb-1">
                        <span className="font-medium">Package Name:</span>
                        <span>{promotion.packageData?.name}</span>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Included Treatments:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {promotion.packageData?.treatments.map((treatment, index) => (
                            <li key={index}>
                              {treatment.quantity}x {treatment.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {promotion.packageData?.attractions && promotion.packageData.attractions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Tourist Attractions:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {promotion.packageData.attractions.map((attraction, index) => (
                              <li key={index}>
                                {attraction.name} (Value: £{attraction.value})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {promotion.packageData?.additionalServices && promotion.packageData.additionalServices.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Additional Services:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {promotion.packageData.additionalServices.map((service, index) => (
                              <li key={index}>{service}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm pt-1">
                        <span>Original Price:</span>
                        <span className="line-through">£{promotion.packageData?.originalPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Package Price:</span>
                        <span>£{promotion.packageData?.packagePrice}</span>
                      </div>
                      <div className="text-center text-sm text-primary font-medium">
                        {promotion.packageData && (
                          <>
                            Save £{calculateSavings(
                              promotion.packageData.originalPrice, 
                              promotion.packageData.packagePrice
                            ).amount} 
                            ({calculateSavings(
                              promotion.packageData.originalPrice, 
                              promotion.packageData.packagePrice
                            ).percentage}%)
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Created By</h3>
                    <p className="text-sm">Clinic Staff ID: {promotion.created_by}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(promotion.created_at)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Submitted For Approval</h3>
                    <p className="text-sm text-muted-foreground">{formatDate(promotion.submitted_at)}</p>
                  </div>
                </div>
                
                {hasIssues && (
                  <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                      <h3 className="font-medium text-yellow-700">Potential Issues</h3>
                    </div>
                    <ul className="list-disc pl-5 text-sm text-yellow-700">
                      {promotionIssues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              
              {/* Scheduling Tab */}
              <TabsContent value="scheduling">
                <div className="space-y-4">
                  <div className="border p-4 rounded-md space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Current Schedule</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="text-sm font-medium">Start Date</p>
                          <p className="text-lg">{formatDate(promotion.start_date)}</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="text-sm font-medium">End Date</p>
                          <p className="text-lg">{formatDate(promotion.end_date)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Duration</h3>
                      <p className="text-lg">
                        {Math.ceil(
                          (new Date(promotion.end_date).getTime() - new Date(promotion.start_date).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )} days
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Maximum Uses</h3>
                      <p className="text-lg">{promotion.max_uses || 'Unlimited'}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Homepage Tab */}
              <TabsContent value="homepage">
                <div className="space-y-4 pb-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Homepage Integration</CardTitle>
                      <CardDescription>
                        Configure how this promotion appears on the homepage
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md mb-4">
                        <Image className="h-16 w-16 text-muted-foreground mb-2" />
                        <h3 className="font-medium">No Homepage Configuration</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          This promotion is not yet configured to appear on the homepage.
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          You can configure this promotion to appear on the homepage during approval. 
                          This will make it visible to all visitors and help drive more engagement.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Preview Tab */}
              <TabsContent value="preview">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="bg-primary/5 border-b">
                      <CardTitle>Customer View</CardTitle>
                      <CardDescription>
                        How patients will see this promotion
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold">{promotion.title}</h3>
                        <p className="text-muted-foreground">{promotion.description}</p>
                        
                        {promotion.type === 'discount' ? (
                          <div className="bg-primary/10 p-6 rounded-md text-center my-6">
                            <div className="text-3xl font-bold text-primary mb-2">
                              {promotion.discountType === 'percentage' 
                                ? `${promotion.discountValue}% OFF` 
                                : `£${promotion.discountValue} OFF`}
                            </div>
                            <p className="text-muted-foreground">
                              Use code: <code className="bg-background px-2 py-1 rounded font-bold">{promotion.code}</code>
                            </p>
                          </div>
                        ) : (
                          <div className="border rounded-md p-4 my-6">
                            <h4 className="font-medium mb-3">{promotion.packageData?.name}</h4>
                            
                            <div className="space-y-3">
                              <div>
                                <h5 className="text-sm font-medium mb-1">Included Treatments:</h5>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                  {promotion.packageData?.treatments.map((treatment, index) => (
                                    <li key={index}>
                                      {treatment.quantity}x {treatment.name}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              {promotion.packageData?.attractions && promotion.packageData.attractions.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium mb-1">Tourist Attractions:</h5>
                                  <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {promotion.packageData.attractions.map((attraction, index) => (
                                      <li key={index}>
                                        {attraction.name} (Value: £{attraction.value})
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              <div className="bg-primary/10 p-3 rounded-md mt-3">
                                <div className="flex justify-between text-sm">
                                  <span>Regular Price:</span>
                                  <span className="line-through">£{promotion.packageData?.originalPrice}</span>
                                </div>
                                <div className="flex justify-between font-bold mt-1">
                                  <span>Package Price:</span>
                                  <span className="text-primary">£{promotion.packageData?.packagePrice}</span>
                                </div>
                                <div className="text-center text-sm mt-2">
                                  <p className="font-medium">Use code: <code className="bg-background px-1 py-0.5 rounded">{promotion.code}</code></p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between border-t pt-3 text-sm text-muted-foreground">
                          <div>Valid from: {formatDate(promotion.start_date)}</div>
                          <div>Expires: {formatDate(promotion.end_date)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 border-t pt-6">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                
                <div className="space-x-2">
                  <Button
                    variant="destructive"
                    onClick={() => setApprovalMode('reject')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => setApprovalMode('approve')}
                    disabled={hasIssues}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
              
              {hasIssues && (
                <p className="text-yellow-600 text-sm mt-2 text-center">
                  Please resolve the issues before approving this promotion.
                </p>
              )}
            </div>
          </>
        ) : approvalMode === 'approve' ? (
          <Form {...approvalForm}>
            <form onSubmit={approvalForm.handleSubmit(handleApprove)} className="space-y-6">
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h2 className="text-lg font-medium">Approve Promotion</h2>
                  <p className="text-sm text-muted-foreground">
                    Review and configure this promotion before approval
                  </p>
                </div>
                
                <FormField
                  control={approvalForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approval Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add notes about this approval..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        These notes will be visible to the clinic
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <div>
                  <h3 className="text-base font-medium mb-3">Scheduling</h3>
                  
                  <FormField
                    control={approvalForm.control}
                    name="modifyDates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mb-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Modify Schedule</FormLabel>
                          <FormDescription>
                            Change the start/end dates of this promotion
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
                  
                  {approvalForm.watch('modifyDates') && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={approvalForm.control}
                        name="startDate"
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
                                      format(field.value, "PPP")
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
                                  selected={field.value}
                                  onSelect={field.onChange}
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
                        control={approvalForm.control}
                        name="endDate"
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
                                      format(field.value, "PPP")
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
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => 
                                    date < new Date() || 
                                    (approvalForm.watch('startDate') && date < approvalForm.watch('startDate'))
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
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-base font-medium mb-3">Homepage Display</h3>
                  
                  <FormField
                    control={approvalForm.control}
                    name="displayOnHomepage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mb-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Feature on Homepage</FormLabel>
                          <FormDescription>
                            Display this promotion on the website homepage
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
                  
                  {approvalForm.watch('displayOnHomepage') && (
                    <div className="space-y-4">
                      <FormField
                        control={approvalForm.control}
                        name="homepagePriority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Priority (1-10)</FormLabel>
                            <FormControl>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Low</span>
                                  <span>Medium</span>
                                  <span>High</span>
                                </div>
                                <Slider
                                  defaultValue={[field.value]}
                                  min={1}
                                  max={10}
                                  step={1}
                                  onValueChange={(value) => field.onChange(value[0])}
                                />
                                <div className="text-center text-sm">
                                  Priority: {field.value}
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Higher priority promotions will be more prominent on the homepage
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={approvalForm.control}
                        name="homepageImageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Homepage Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormDescription>
                              Banner image URL for homepage display
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={approvalForm.control}
                        name="homepageShortDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief description for homepage display..."
                                className="resize-none"
                                maxLength={200}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Brief teaser text for homepage display (max 200 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="p-4 border rounded-md">
                        <div className="flex items-start mb-3">
                          <Home className="h-5 w-5 text-primary mr-2" />
                          <h4 className="font-medium">Homepage Preview</h4>
                        </div>
                        
                        <div className="border p-3 rounded-md flex items-center space-x-3">
                          <div className="bg-muted h-16 w-24 flex items-center justify-center rounded">
                            <Image className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{promotion.title}</h5>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {approvalForm.watch('homepageShortDescription') || promotion.description}
                            </p>
                            <div className="text-primary text-xs font-medium mt-1">
                              {promotion.type === 'discount' 
                                ? (promotion.discountType === 'percentage' 
                                  ? `${promotion.discountValue}% off` 
                                  : `£${promotion.discountValue} off`)
                                : 'Special Package'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline" 
                  onClick={() => setApprovalMode(null)}
                >
                  Back
                </Button>
                <Button 
                  type="submit"
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    'Approve Promotion'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...rejectionForm}>
            <form onSubmit={rejectionForm.handleSubmit(handleReject)} className="space-y-6">
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h2 className="text-lg font-medium">Reject Promotion</h2>
                  <p className="text-sm text-muted-foreground">
                    Please provide a reason for rejection
                  </p>
                </div>
                
                <FormField
                  control={rejectionForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rejection Reason</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explain why this promotion is being rejected..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This feedback will be sent to the clinic
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline" 
                  onClick={() => setApprovalMode(null)}
                >
                  Back
                </Button>
                <Button 
                  type="submit"
                  variant="destructive"
                  disabled={rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject Promotion'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PromotionReview;