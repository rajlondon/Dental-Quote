import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  SpecialOffer, 
  CreateSpecialOffer, 
  CommissionTier 
} from '@shared/specialOffers';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { GenerateOfferImageButton } from './GenerateOfferImageButton';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CalendarIcon, PlusCircle, Edit, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

// Custom schema for the form
const specialOfferFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  discount_type: z.enum(["percentage", "fixed_amount"]),
  discount_value: z.coerce.number().min(1, "Discount value must be positive"),
  applicable_treatments: z.array(z.string()).default([]),
  start_date: z.date(),
  end_date: z.date(),
  promo_code: z.string().optional(),
  terms_conditions: z.string().optional(),
  banner_image: z.string().optional(),
  is_active: z.boolean().default(false),
  commission_percentage: z.coerce.number().min(5).max(30),
  promotion_level: z.enum(["standard", "featured", "premium"]),
  homepage_display: z.boolean().default(false),
});

type SpecialOfferFormValues = z.infer<typeof specialOfferFormSchema>;

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (e) {
    return dateString;
  }
}

export function SpecialOffersManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null);
  
  // Fetch commission tiers
  const { 
    data: commissionTiers,
    isLoading: isLoadingTiers,
  } = useQuery({
    queryKey: ['/api/commission-tiers'],
  });
  
  // Fetch clinic's special offers
  const { 
    data: offers,
    isLoading: isLoadingOffers,
    error: offersError
  } = useQuery({
    queryKey: ['/api/portal/clinic/special-offers'],
  });
  
  // Create form
  const createForm = useForm<SpecialOfferFormValues>({
    resolver: zodResolver(specialOfferFormSchema),
    defaultValues: {
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      applicable_treatments: [],
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      promo_code: '',
      terms_conditions: '',
      banner_image: '',
      is_active: false,
      commission_percentage: 10,
      promotion_level: 'standard',
      homepage_display: false,
    },
  });
  
  // Edit form
  const editForm = useForm<SpecialOfferFormValues>({
    resolver: zodResolver(specialOfferFormSchema),
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: SpecialOfferFormValues) => {
      // Convert dates to ISO strings for API
      const formattedData = {
        ...data,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
      };
      
      const res = await apiRequest("POST", "/api/portal/clinic/special-offers", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/clinic/special-offers'] });
      toast({
        title: 'Special offer created',
        description: 'Your special offer has been created and is pending admin approval',
      });
      setCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create special offer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: SpecialOfferFormValues & { id: string }) => {
      const { id, ...updateData } = data;
      
      // Convert dates to ISO strings for API
      const formattedData = {
        ...updateData,
        start_date: updateData.start_date.toISOString(),
        end_date: updateData.end_date.toISOString(),
      };
      
      const res = await apiRequest("PUT", `/api/portal/clinic/special-offers/${id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/clinic/special-offers'] });
      toast({
        title: 'Special offer updated',
        description: 'Your special offer has been updated and is pending admin approval',
      });
      setEditDialogOpen(false);
      setSelectedOffer(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update special offer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/portal/clinic/special-offers/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/clinic/special-offers'] });
      toast({
        title: 'Special offer deleted',
        description: 'Your special offer has been permanently deleted',
      });
      setDeleteDialogOpen(false);
      setSelectedOffer(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete special offer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle create form submission
  const onCreateSubmit = (data: SpecialOfferFormValues) => {
    createMutation.mutate(data);
  };
  
  // Handle edit form submission
  const onEditSubmit = (data: SpecialOfferFormValues) => {
    if (!selectedOffer) return;
    updateMutation.mutate({ ...data, id: selectedOffer.id });
  };
  
  // Handle delete confirmation
  const confirmDelete = () => {
    if (!selectedOffer) return;
    deleteMutation.mutate(selectedOffer.id);
  };
  
  // Initialize edit form when an offer is selected
  const handleEditOffer = (offer: SpecialOffer) => {
    setSelectedOffer(offer);
    
    // Convert ISO dates to Date objects for the form
    editForm.reset({
      ...offer,
      start_date: new Date(offer.start_date),
      end_date: new Date(offer.end_date),
    });
    
    setEditDialogOpen(true);
  };
  
  const handleDeleteOffer = (offer: SpecialOffer) => {
    setSelectedOffer(offer);
    setDeleteDialogOpen(true);
  };
  
  // Watch promotion level to update commission percentage minimum
  const watchPromotionLevel = createForm.watch('promotion_level');
  const watchEditPromotionLevel = editForm.watch('promotion_level');
  
  // Get minimum commission percentage based on selected tier
  const getMinCommission = (level: string) => {
    if (!commissionTiers) return 10;
    const tier = commissionTiers.find(t => t.id === level);
    return tier ? tier.min_commission_percentage : 10;
  };
  
  // Update commission and homepage display when promotion level changes
  React.useEffect(() => {
    const minCommission = getMinCommission(watchPromotionLevel);
    
    // Only update if current value is less than minimum
    if (createForm.getValues('commission_percentage') < minCommission) {
      createForm.setValue('commission_percentage', minCommission);
    }
    
    // For standard tier, homepage display is not available
    if (watchPromotionLevel === 'standard') {
      createForm.setValue('homepage_display', false);
    }
  }, [watchPromotionLevel, createForm]);
  
  // Same effect for edit form
  React.useEffect(() => {
    if (!watchEditPromotionLevel) return;
    
    const minCommission = getMinCommission(watchEditPromotionLevel);
    
    // Only update if current value is less than minimum
    if (editForm.getValues('commission_percentage') < minCommission) {
      editForm.setValue('commission_percentage', minCommission);
    }
    
    // For standard tier, homepage display is not available
    if (watchEditPromotionLevel === 'standard') {
      editForm.setValue('homepage_display', false);
    }
  }, [watchEditPromotionLevel, editForm]);
  
  // Loading state
  const isLoading = isLoadingTiers || isLoadingOffers;
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-48">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  if (offersError) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">
      Error loading offers: {offersError instanceof Error ? offersError.message : 'Unknown error'}
    </div>;
  }
  
  // Render promotion tier badge
  const renderPromotionBadge = (level: 'standard' | 'featured' | 'premium', commission: number) => {
    let bgColor = 'bg-gray-600';
    if (level === 'premium') bgColor = 'bg-purple-600';
    if (level === 'featured') bgColor = 'bg-blue-600';
    
    return (
      <Badge className={bgColor}>
        {level.toUpperCase()} • {commission}% Commission
      </Badge>
    );
  };
  
  // Render approval status badge
  const renderStatusBadge = (offer: SpecialOffer) => {
    if (offer.admin_approved) {
      return <Badge className="bg-green-600">Approved</Badge>;
    }
    
    if (offer.admin_rejection_reason) {
      return <Badge className="bg-red-600">Rejected</Badge>;
    }
    
    return <Badge className="bg-yellow-600">Pending Approval</Badge>;
  };
  
  // Filter offers by status
  const activeOffers = offers?.filter(offer => offer.is_active) || [];
  const inactiveOffers = offers?.filter(offer => !offer.is_active) || [];
  
  // Get the commission tiers information for display
  const renderCommissionTierInfo = () => {
    if (!commissionTiers) return null;
    
    return (
      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Promotion Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {commissionTiers.map(tier => (
            <Card key={tier.id} className={
              tier.id === 'premium' ? 'border-purple-200' : 
              tier.id === 'featured' ? 'border-blue-200' : 
              'border-gray-200'
            }>
              <CardHeader>
                <CardTitle className={
                  tier.id === 'premium' ? 'text-purple-700' : 
                  tier.id === 'featured' ? 'text-blue-700' : 
                  'text-gray-700'
                }>
                  {tier.name}
                </CardTitle>
                <CardDescription>
                  Minimum commission: {tier.min_commission_percentage}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">
                  Max active offers: {tier.max_active_offers}
                </span>
                <span className="text-sm font-medium">
                  {tier.homepage_display_included ? 
                    'Homepage eligible' : 
                    'No homepage display'}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Special Offers Management</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> 
          Create Offer
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Create and manage special offers with commission-based promotion tiers. Higher commission percentages provide better visibility on the platform.
      </p>
      
      {renderCommissionTierInfo()}
      
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active Offers ({activeOffers.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive Offers ({inactiveOffers.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          {activeOffers.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-muted-foreground">No active offers</p>
              <Button variant="outline" className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                Create your first offer
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeOffers.map(offer => (
                <Card key={offer.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 pb-3">
                    <div className="flex justify-between">
                      <CardTitle>{offer.title}</CardTitle>
                      {renderPromotionBadge(offer.promotion_level, offer.commission_percentage)}
                    </div>
                    <div className="flex justify-between items-center">
                      <CardDescription>
                        Valid: {formatDate(offer.start_date)} - {formatDate(offer.end_date)}
                      </CardDescription>
                      {renderStatusBadge(offer)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-gray-100">
                        {offer.discount_type === 'percentage' ? 
                          `${offer.discount_value}% off` : 
                          `£${offer.discount_value} off`}
                      </Badge>
                      {offer.homepage_display && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Homepage Featured
                        </Badge>
                      )}
                    </div>
                    
                    {offer.admin_rejection_reason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-md border border-red-200">
                        <div className="flex gap-2 text-red-600 font-medium mb-1">
                          <AlertCircle className="h-5 w-5" />
                          <span>Rejection Reason:</span>
                        </div>
                        <p className="text-sm text-red-600">{offer.admin_rejection_reason}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 gap-2 flex justify-between">
                    <div>
                      <GenerateOfferImageButton 
                        offer={offer}
                        onSuccess={(imageUrl) => {
                          // Update the cache with the new image URL
                          queryClient.setQueryData(
                            ['/api/portal/clinic/special-offers'],
                            (oldData: SpecialOffer[] | undefined) => {
                              if (!oldData) return oldData;
                              return oldData.map(o => 
                                o.id === offer.id ? { ...o, banner_image: imageUrl } : o
                              );
                            }
                          );
                          
                          toast({
                            title: 'Image Updated',
                            description: 'The special offer image has been updated',
                          });
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditOffer(offer)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteOffer(offer)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-6">
          {inactiveOffers.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-muted-foreground">No inactive offers</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inactiveOffers.map(offer => (
                <Card key={offer.id} className="overflow-hidden opacity-75">
                  <CardHeader className="bg-gray-50 pb-3">
                    <div className="flex justify-between">
                      <CardTitle>{offer.title}</CardTitle>
                      {renderPromotionBadge(offer.promotion_level, offer.commission_percentage)}
                    </div>
                    <div className="flex justify-between items-center">
                      <CardDescription>
                        Valid: {formatDate(offer.start_date)} - {formatDate(offer.end_date)}
                      </CardDescription>
                      <Badge variant="outline">Inactive</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-gray-100">
                        {offer.discount_type === 'percentage' ? 
                          `${offer.discount_value}% off` : 
                          `£${offer.discount_value} off`}
                      </Badge>
                      {offer.homepage_display && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Homepage Featured
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 gap-2 flex justify-between">
                    <div>
                      <GenerateOfferImageButton 
                        offer={offer}
                        onSuccess={(imageUrl) => {
                          // Update the cache with the new image URL
                          queryClient.setQueryData(
                            ['/api/portal/clinic/special-offers'],
                            (oldData: SpecialOffer[] | undefined) => {
                              if (!oldData) return oldData;
                              return oldData.map(o => 
                                o.id === offer.id ? { ...o, banner_image: imageUrl } : o
                              );
                            }
                          );
                          
                          toast({
                            title: 'Image Updated',
                            description: 'The special offer image has been updated',
                          });
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditOffer(offer)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteOffer(offer)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Create Offer Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Special Offer</DialogTitle>
            <DialogDescription>
              Create a new special offer with promotion options. Higher commission percentages give your offer more visibility.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={createForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Offer Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Summer Teeth Whitening Special" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe the offer in detail..." 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="discount_type"
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
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="discount_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Value</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <DatePicker 
                            date={field.value} 
                            setDate={field.onChange}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <DatePicker 
                            date={field.value} 
                            setDate={field.onChange}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={createForm.control}
                    name="promo_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Code (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., SUMMER25" />
                        </FormControl>
                        <FormDescription>
                          Patients can use this code when booking
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-6">
                  <FormField
                    control={createForm.control}
                    name="terms_conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms & Conditions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Any specific terms or limitations..." 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="banner_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/image.jpg" />
                        </FormControl>
                        <FormDescription>
                          Provide a URL to an image for this offer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="promotion_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Level</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="standard" id="standard" />
                              <Label htmlFor="standard">Standard (min {getMinCommission('standard')}% commission)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="featured" id="featured" />
                              <Label htmlFor="featured">Featured (min {getMinCommission('featured')}% commission)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="premium" id="premium" />
                              <Label htmlFor="premium">Premium (min {getMinCommission('premium')}% commission)</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          Higher commission levels give your offer better visibility
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="commission_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commission Percentage</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            min={getMinCommission(watchPromotionLevel)}
                            max={30}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum {getMinCommission(watchPromotionLevel)}% for {watchPromotionLevel} tier
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="homepage_display"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Homepage Display</FormLabel>
                            <FormDescription>
                              Show this offer on the homepage
                              {watchPromotionLevel === 'standard' && (
                                <div className="text-yellow-600 flex gap-1 items-center mt-1">
                                  <AlertTriangle className="h-4 w-4" />
                                  <span>Available for Featured & Premium tiers only</span>
                                </div>
                              )}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={watchPromotionLevel === 'standard'}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Active Status</FormLabel>
                            <FormDescription>
                              Active offers require admin approval before appearing on the platform
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
                  </div>
                </div>
              </div>
              
              <DialogFooter className="pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Offer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Offer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Special Offer</DialogTitle>
            <DialogDescription>
              Update your special offer details. Note that significant changes will require re-approval.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Offer Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Summer Teeth Whitening Special" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe the offer in detail..." 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="discount_type"
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
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="discount_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Value</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <DatePicker 
                            date={field.value} 
                            setDate={field.onChange}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <DatePicker 
                            date={field.value} 
                            setDate={field.onChange}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editForm.control}
                    name="promo_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Code (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., SUMMER25" />
                        </FormControl>
                        <FormDescription>
                          Patients can use this code when booking
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-6">
                  <FormField
                    control={editForm.control}
                    name="terms_conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms & Conditions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Any specific terms or limitations..." 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="banner_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/image.jpg" />
                        </FormControl>
                        <FormDescription>
                          Provide a URL to an image for this offer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="promotion_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Level</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="standard" id="edit-standard" />
                              <Label htmlFor="edit-standard">Standard (min {getMinCommission('standard')}% commission)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="featured" id="edit-featured" />
                              <Label htmlFor="edit-featured">Featured (min {getMinCommission('featured')}% commission)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="premium" id="edit-premium" />
                              <Label htmlFor="edit-premium">Premium (min {getMinCommission('premium')}% commission)</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          Changing tier will require admin re-approval
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="commission_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commission Percentage</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            min={getMinCommission(watchEditPromotionLevel || 'standard')}
                            max={30}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum {getMinCommission(watchEditPromotionLevel || 'standard')}% for {watchEditPromotionLevel || 'standard'} tier
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="homepage_display"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Homepage Display</FormLabel>
                            <FormDescription>
                              Show this offer on the homepage
                              {watchEditPromotionLevel === 'standard' && (
                                <div className="text-yellow-600 flex gap-1 items-center mt-1">
                                  <AlertTriangle className="h-4 w-4" />
                                  <span>Available for Featured & Premium tiers only</span>
                                </div>
                              )}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={watchEditPromotionLevel === 'standard'}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Active Status</FormLabel>
                            <FormDescription>
                              Activating a previously inactive offer will require admin approval
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
                  </div>
                </div>
              </div>
              
              <DialogFooter className="pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this special offer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="py-4">
              <h3 className="font-medium">{selectedOffer.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedOffer.description}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}