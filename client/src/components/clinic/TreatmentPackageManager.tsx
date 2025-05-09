import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PromoType, DiscountType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { GeneratePackageImageButton } from './GeneratePackageImageButton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { AlertCircle, CalendarIcon, PlusCircle, Edit, Trash2, AlertTriangle, CheckCircle, XCircle, Package } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelect } from '../../components/ui/multi-select';

// Types
interface TreatmentPackage {
  id: string;
  slug: string;
  title: string;
  description: string;
  promoType: PromoType.PACKAGE;
  discountType: DiscountType;
  discountValue: number;
  heroImageUrl?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  cityCode?: string;
  countryCode?: string;
  validationSchema?: any;
  createdAt: string;
  updatedAt: string;
  items: PackageItem[];
  status?: 'approved' | 'pending' | 'rejected';
  admin_approved?: boolean;
  admin_rejection_reason?: string;
  clinics?: { clinicId: string; clinicName: string }[];
}

interface PackageItem {
  id: string;
  promoId: string;
  itemType: string;
  itemCode: string;
  qty: number;
  createdAt: string;
  updatedAt: string;
  name?: string; // For display purposes
}

interface TreatmentOption {
  code: string;
  name: string;
  category: string;
}

interface CityOption {
  code: string;
  name: string;
  country: string;
}

// Custom schema for the form
const treatmentPackageFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  discountType: z.enum([DiscountType.PERCENT, DiscountType.FIXED]),
  discountValue: z.coerce.number().min(1, "Discount value must be positive"),
  treatmentItems: z.array(z.object({
    itemCode: z.string(),
    qty: z.number().min(1),
  })).min(1, "At least one treatment must be selected"),
  startDate: z.date(),
  endDate: z.date(),
  heroImageUrl: z.string().optional(),
  isActive: z.boolean().default(false),
  cityCode: z.string().nullable().optional(),
  includedExtras: z.array(z.string()).default([]),
  terms_conditions: z.string().optional(),
});

type TreatmentPackageFormValues = z.infer<typeof treatmentPackageFormSchema>;

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (e) {
    return dateString;
  }
}

export function TreatmentPackageManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TreatmentPackage | null>(null);
  const [activeTab, setActiveTab] = useState<string>("active");

  // Fetch standard treatment options
  const { 
    data: treatments,
    isLoading: isLoadingTreatments,
  } = useQuery({
    queryKey: ['/api/treatments/standard'],
  });

  // Fetch cities for filtering
  const { 
    data: cities,
    isLoading: isLoadingCities,
  } = useQuery({
    queryKey: ['/api/locations/cities'],
  });

  // Fetch available extras
  const { 
    data: extras,
    isLoading: isLoadingExtras,
  } = useQuery({
    queryKey: ['/api/extras'],
  });

  // Fetch clinic's treatment packages
  const { 
    data: packages,
    isLoading: isLoadingPackages,
    error: packagesError
  } = useQuery({
    queryKey: ['/api/portal/clinic/treatment-packages'],
  });

  // Create form
  const createForm = useForm<TreatmentPackageFormValues>({
    resolver: zodResolver(treatmentPackageFormSchema),
    defaultValues: {
      title: '',
      description: '',
      discountType: DiscountType.PERCENT,
      discountValue: 10,
      treatmentItems: [],
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      heroImageUrl: '',
      isActive: false,
      cityCode: null,
      includedExtras: [],
      terms_conditions: '',
    },
  });

  // Edit form
  const editForm = useForm<TreatmentPackageFormValues>({
    resolver: zodResolver(treatmentPackageFormSchema),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: TreatmentPackageFormValues) => {
      // Convert dates to ISO strings for API
      const formattedData = {
        ...data,
        promoType: PromoType.PACKAGE,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      };
      
      const res = await apiRequest("POST", "/api/portal/clinic/treatment-packages", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/clinic/treatment-packages'] });
      toast({
        title: 'Treatment package created',
        description: 'Your treatment package has been created and is pending admin approval',
      });
      setCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create treatment package',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: TreatmentPackageFormValues & { id: string }) => {
      const { id, ...updateData } = data;
      
      // Convert dates to ISO strings for API
      const formattedData = {
        ...updateData,
        promoType: PromoType.PACKAGE,
        startDate: updateData.startDate.toISOString(),
        endDate: updateData.endDate.toISOString(),
      };
      
      const res = await apiRequest("PUT", `/api/portal/clinic/treatment-packages/${id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/clinic/treatment-packages'] });
      toast({
        title: 'Treatment package updated',
        description: 'Your treatment package has been updated and is pending admin approval',
      });
      setEditDialogOpen(false);
      setSelectedPackage(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update treatment package',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/portal/clinic/treatment-packages/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/clinic/treatment-packages'] });
      toast({
        title: 'Treatment package deleted',
        description: 'Your treatment package has been permanently deleted',
      });
      setDeleteDialogOpen(false);
      setSelectedPackage(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete treatment package',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle create form submission
  const onCreateSubmit = (data: TreatmentPackageFormValues) => {
    createMutation.mutate(data);
  };

  // Handle edit form submission
  const onEditSubmit = (data: TreatmentPackageFormValues) => {
    if (!selectedPackage) return;
    updateMutation.mutate({ ...data, id: selectedPackage.id });
  };

  // Handle delete confirmation
  const confirmDelete = () => {
    if (!selectedPackage) return;
    deleteMutation.mutate(selectedPackage.id);
  };

  // Initialize edit form when a package is selected
  const handleEditPackage = (pkg: TreatmentPackage) => {
    setSelectedPackage(pkg);
    
    // Convert ISO dates to Date objects for the form
    // Transform package data to match form data structure
    const treatmentItems = pkg.items
      .filter(item => item.itemType === 'TREATMENT')
      .map(item => ({
        itemCode: item.itemCode,
        qty: item.qty
      }));
    
    const includedExtras = pkg.items
      .filter(item => item.itemType === 'EXTRA')
      .map(item => item.itemCode);
    
    editForm.reset({
      title: pkg.title,
      description: pkg.description,
      discountType: pkg.discountType,
      discountValue: Number(pkg.discountValue),
      startDate: new Date(pkg.startDate),
      endDate: new Date(pkg.endDate),
      heroImageUrl: pkg.heroImageUrl || '',
      isActive: pkg.isActive,
      cityCode: pkg.cityCode || null,
      treatmentItems: treatmentItems,
      includedExtras: includedExtras,
      terms_conditions: pkg.validationSchema?.terms_conditions || '',
    });
    
    setEditDialogOpen(true);
  };

  const handleDeletePackage = (pkg: TreatmentPackage) => {
    setSelectedPackage(pkg);
    setDeleteDialogOpen(true);
  };

  // Loading state
  const isLoading = isLoadingTreatments || isLoadingPackages || isLoadingCities || isLoadingExtras;

  if (isLoading) {
    return <div className="flex justify-center items-center h-48">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  if (packagesError) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">
      Error loading packages: {packagesError instanceof Error ? packagesError.message : 'Unknown error'}
    </div>;
  }

  // Render approval status badge
  const renderStatusBadge = (pkg: TreatmentPackage) => {
    if (pkg.admin_approved) {
      return <Badge className="bg-green-600">Approved</Badge>;
    }
    
    if (pkg.admin_rejection_reason) {
      return <Badge className="bg-red-600">Rejected</Badge>;
    }
    
    return <Badge className="bg-yellow-600">Pending Approval</Badge>;
  };

  // Filter packages by status
  const activePackages = Array.isArray(packages) ? packages.filter(pkg => pkg.isActive) : [];
  const inactivePackages = Array.isArray(packages) ? packages.filter(pkg => !pkg.isActive) : [];

  // Format treatment items for display
  const formatTreatmentList = (items: PackageItem[]) => {
    if (!items || !items.length) return "No treatments included";
    
    const treatmentItems = items.filter(item => item.itemType === "TREATMENT");
    return treatmentItems.map(item => {
      const treatment = Array.isArray(treatments) ? treatments.find((t: any) => t.code === item.itemCode) : null;
      return `${treatment?.name || item.itemCode} (${item.qty})`;
    }).join(", ");
  };

  // Format extras for display
  const formatExtrasList = (items: PackageItem[]) => {
    if (!items || !items.length) return "No extras included";
    
    const extraItems = items.filter(item => item.itemType === "EXTRA");
    if (extraItems.length === 0) return "No extras included";
    
    return extraItems.map(item => {
      const extra = Array.isArray(extras) ? extras.find((e: any) => e.code === item.itemCode) : null;
      return `${extra?.name || item.itemCode} (${item.qty})`;
    }).join(", ");
  };
  
  // Helper function to get city name from code
  const getCityName = (cityCode: string | undefined) => {
    if (!cityCode) return "";
    return Array.isArray(cities) ? cities.find((c: any) => c.code === cityCode)?.name || cityCode : cityCode;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Treatment Package Management</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Package className="mr-2 h-4 w-4" /> 
          Create Package
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Create and manage comprehensive treatment packages that bundle multiple procedures together. 
        Treatment packages can include extras like airport transfers or hotel accommodations.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 flex items-start mb-6">
        <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-blue-800 font-medium">Package vs. Special Offer</p>
          <p className="text-sm text-blue-700">
            Treatment packages bundle multiple procedures with a discount and optional extras. 
            Special offers typically apply a discount to individual treatments. Both can be city-specific.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="active" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            Active Packages ({activePackages.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive Packages ({inactivePackages.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          {activePackages.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-muted-foreground">No active treatment packages</p>
              <Button variant="outline" className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                Create your first package
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activePackages.map(pkg => (
                <Card key={pkg.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 pb-3">
                    <div className="flex justify-between">
                      <CardTitle>{pkg.title}</CardTitle>
                      {pkg.cityCode && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {getCityName(pkg.cityCode)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <CardDescription>
                        Valid: {formatDate(pkg.startDate)} - {formatDate(pkg.endDate)}
                      </CardDescription>
                      {renderStatusBadge(pkg)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-gray-100">
                        {pkg.discountType === DiscountType.PERCENT ? 
                          `${pkg.discountValue}% off` : 
                          `£${pkg.discountValue} off`}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <p className="text-sm font-medium">Included Treatments:</p>
                      <p className="text-sm">{formatTreatmentList(pkg.items)}</p>
                      
                      <p className="text-sm font-medium mt-2">Included Extras:</p>
                      <p className="text-sm">{formatExtrasList(pkg.items)}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 bg-gray-50 mt-3 pt-3">
                    <Button variant="outline" size="sm" onClick={() => handleEditPackage(pkg)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeletePackage(pkg)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-6">
          {inactivePackages.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-muted-foreground">No inactive treatment packages</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inactivePackages.map(pkg => (
                <Card key={pkg.id} className="overflow-hidden opacity-75">
                  <CardHeader className="bg-gray-50 pb-3">
                    <div className="flex justify-between">
                      <CardTitle>{pkg.title}</CardTitle>
                      {pkg.cityCode && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {getCityName(pkg.cityCode)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <CardDescription>
                        Valid: {formatDate(pkg.startDate)} - {formatDate(pkg.endDate)}
                      </CardDescription>
                      {renderStatusBadge(pkg)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-gray-100">
                        {pkg.discountType === DiscountType.PERCENT ? 
                          `${pkg.discountValue}% off` : 
                          `£${pkg.discountValue} off`}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <p className="text-sm font-medium">Included Treatments:</p>
                      <p className="text-sm">{formatTreatmentList(pkg.items)}</p>
                      
                      <p className="text-sm font-medium mt-2">Included Extras:</p>
                      <p className="text-sm">{formatExtrasList(pkg.items)}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 bg-gray-50 mt-3 pt-3">
                    <Button variant="outline" size="sm" onClick={() => handleEditPackage(pkg)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeletePackage(pkg)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Create Treatment Package Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Treatment Package</DialogTitle>
            <DialogDescription>
              Create a new treatment package with bundled procedures and optional extras.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Title</FormLabel>
                      <FormControl>
                        <Input placeholder="All-Inclusive Dental Holiday Package" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="cityCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a city (or leave empty for all cities)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">All Cities</SelectItem>
                          {Array.isArray(cities) && cities.map((city: any) => (
                            <SelectItem key={city.code} value={city.code}>
                              {city.name}, {city.country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Specifying a city restricts this package to that location only.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the benefits and details of this treatment package..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Discount Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={DiscountType.PERCENT} id="percent" />
                            <Label htmlFor="percent">Percentage Discount</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={DiscountType.FIXED} id="fixed" />
                            <Label htmlFor="fixed">Fixed Amount Discount (£)</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          placeholder={createForm.watch('discountType') === DiscountType.PERCENT ? "e.g. 20 for 20%" : "e.g. 100 for £100"}
                          {...field}
                          onChange={e => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="startDate"
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <DatePicker 
                        date={field.value}
                        setDate={field.onChange}
                        minDate={createForm.watch('startDate')}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={createForm.control}
                name="heroImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Image URL (Optional)</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                      </div>
                      <div>
                        <GenerateOfferImageButton 
                          onImageGenerated={(url: any) => field.onChange(url)} 
                          title={createForm.watch('title') || 'Treatment Package'}
                        />
                      </div>
                    </div>
                    <FormDescription>
                      Add an image URL or generate one automatically.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Set whether this package should be active and visible to patients.
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
              
              <FormField
                control={createForm.control}
                name="terms_conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms & Conditions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Optional terms and conditions for this package..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Special terms that apply only to this package.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>Create Package</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Treatment Package Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Treatment Package</DialogTitle>
            <DialogDescription>
              Update the details of your treatment package.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Title</FormLabel>
                      <FormControl>
                        <Input placeholder="All-Inclusive Dental Holiday Package" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="cityCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a city (or leave empty for all cities)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">All Cities</SelectItem>
                          {Array.isArray(cities) && cities.map((city: any) => (
                            <SelectItem key={city.code} value={city.code}>
                              {city.name}, {city.country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the benefits and details of this package..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Discount Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={DiscountType.PERCENT} id="edit-percent" />
                            <Label htmlFor="edit-percent">Percentage Discount</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={DiscountType.FIXED} id="edit-fixed" />
                            <Label htmlFor="edit-fixed">Fixed Amount Discount (£)</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          placeholder={editForm.watch('discountType') === DiscountType.PERCENT ? "e.g. 20 for 20%" : "e.g. 100 for £100"}
                          {...field}
                          onChange={e => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <DatePicker 
                        date={field.value}
                        setDate={field.onChange}
                        minDate={editForm.watch('startDate')}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="heroImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Image URL (Optional)</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                      </div>
                      <div>
                        <GenerateOfferImageButton 
                          onImageGenerated={(url: any) => field.onChange(url)} 
                          title={editForm.watch('title') || 'Treatment Package'}
                        />
                      </div>
                    </div>
                    <FormDescription>
                      Add an image URL or generate one automatically.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Set whether this package should be active and visible to patients.
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
              
              <FormField
                control={editForm.control}
                name="terms_conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms & Conditions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Optional terms and conditions for this package..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Special terms that apply only to this package.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                      Updating...
                    </>
                  ) : (
                    <>Update Package</>
                  )}
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
              Are you sure you want to delete this package? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPackage && (
            <div className="py-4">
              <p><strong>Package:</strong> {selectedPackage.title}</p>
              <p><strong>Discount:</strong> {selectedPackage.discountType === DiscountType.PERCENT ? 
                `${selectedPackage.discountValue}%` : 
                `£${selectedPackage.discountValue}`}
              </p>
              {selectedPackage.cityCode && (
                <p><strong>City:</strong> {getCityName(selectedPackage.cityCode)}</p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>Delete Package</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}