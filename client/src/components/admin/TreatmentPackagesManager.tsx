import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, Package, X, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

import { apiRequest } from '@/lib/queryClient';
import { insertTreatmentPackageSchema, type TreatmentPackage, type Clinic } from '@shared/schema';

interface Treatment {
  id: string;
  name: string;
  price: number;
}

interface PackageTreatment {
  treatmentId: string;
  treatmentName: string;
  treatmentPrice: number;
  quantity: number;
}

interface PackageService {
  serviceType: string;
  name: string;
  description: string;
  quantity: number;
}

const serviceTypes = [
  { value: 'HOTEL', label: 'Hotel Accommodation' },
  { value: 'TRANSFER', label: 'Airport Transfer' },
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'FOLLOW_UP', label: 'Follow-up Care' },
  { value: 'MEDICATION', label: 'Medication' },
  { value: 'XRAY', label: 'X-Ray/Imaging' },
  { value: 'CLEANING', label: 'Dental Cleaning' },
  { value: 'OTHER', label: 'Other Service' },
];

export default function TreatmentPackagesManager() {
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertTreatmentPackageSchema.extend({
      includedTreatments: zodResolver(null),
      includedServices: zodResolver(null),
    })),
    defaultValues: {
      title: '',
      description: '',
      clinicId: 0,
      promoCode: '',
      totalPrice: 0,
      originalPrice: 0,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      maxUses: undefined,
      includedTreatments: [] as PackageTreatment[],
      includedServices: [] as PackageService[],
    }
  });

  const { fields: treatmentFields, append: appendTreatment, remove: removeTreatment } = useFieldArray({
    control: form.control,
    name: 'includedTreatments',
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: 'includedServices',
  });

  // Fetch clinics
  const { data: clinics = [] } = useQuery<Clinic[]>({
    queryKey: ['/api/admin/clinics'],
  });

  // Fetch treatment packages
  const { data: treatmentPackages = [], isLoading: packagesLoading } = useQuery<TreatmentPackage[]>({
    queryKey: ['/api/admin/treatment-packages'],
  });

  // Fetch treatments for selected clinic
  const { data: treatments = [] } = useQuery<Treatment[]>({
    queryKey: ['/api/admin/clinics', selectedClinicId, 'treatments'],
    enabled: !!selectedClinicId,
  });

  // Create package mutation
  const createPackageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/treatment-packages', data);
      return response.json();
    },
    onSuccess: () => {
      toast.success('Treatment package created successfully');
      form.reset();
      setIsEditing(false);
      setSelectedPackageId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/treatment-packages'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create treatment package');
    },
  });

  // Update package mutation
  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/treatment-packages/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast.success('Treatment package updated successfully');
      form.reset();
      setIsEditing(false);
      setSelectedPackageId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/treatment-packages'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update treatment package');
    },
  });

  // Delete package mutation
  const deletePackageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/treatment-packages/${id}`);
    },
    onSuccess: () => {
      toast.success('Treatment package deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/treatment-packages'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete treatment package');
    },
  });

  const onSubmit = (data: any) => {
    // Calculate original price from treatments
    const originalPrice = data.includedTreatments.reduce(
      (sum: number, treatment: PackageTreatment) => sum + (treatment.treatmentPrice * treatment.quantity),
      0
    );

    const formData = {
      ...data,
      clinicId: parseInt(selectedClinicId),
      originalPrice,
      expiryDate: new Date(data.expiryDate).toISOString(),
    };

    if (isEditing && selectedPackageId) {
      updatePackageMutation.mutate({ id: selectedPackageId, data: formData });
    } else {
      createPackageMutation.mutate(formData);
    }
  };

  const addTreatmentToPackage = (treatment: Treatment) => {
    appendTreatment({
      treatmentId: treatment.id,
      treatmentName: treatment.name,
      treatmentPrice: treatment.price,
      quantity: 1,
    });
    
    // Update original price
    const currentOriginal = form.getValues('originalPrice');
    form.setValue('originalPrice', currentOriginal + treatment.price);
  };

  const removeTreatmentFromPackage = (index: number) => {
    const treatment = form.getValues(`includedTreatments.${index}`);
    removeTreatment(index);
    
    // Update original price
    const currentOriginal = form.getValues('originalPrice');
    form.setValue('originalPrice', currentOriginal - (treatment.treatmentPrice * treatment.quantity));
  };

  const generatePromoCode = () => {
    const selectedClinic = clinics.find(c => c.id === parseInt(selectedClinicId));
    const prefix = selectedClinic 
      ? selectedClinic.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') 
      : 'PKG';
    
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    form.setValue('promoCode', `${prefix}-PKG-${randomCode}`);
  };

  const handleClinicChange = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    form.setValue('clinicId', parseInt(clinicId));
    form.setValue('includedTreatments', []); // Reset treatments
    form.setValue('originalPrice', 0);
  };

  const getSavingsPercentage = () => {
    const totalPrice = form.watch('totalPrice');
    const originalPrice = form.watch('originalPrice');
    if (originalPrice === 0) return 0;
    return Math.round(((originalPrice - totalPrice) / originalPrice) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Treatment Package' : 'Create Treatment Package'}
        </h1>
        {isEditing && (
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setSelectedPackageId(null);
              form.reset();
            }}
          >
            Cancel Edit
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <Package className="inline-block mr-2 h-5 w-5" />
                {isEditing ? 'Edit Package' : 'New Treatment Package'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    
                    {/* Clinic Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="clinic">Clinic *</Label>
                      <Select value={selectedClinicId} onValueChange={handleClinicChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a clinic" />
                        </SelectTrigger>
                        <SelectContent>
                          {clinics.map(clinic => (
                            <SelectItem key={clinic.id} value={clinic.id.toString()}>
                              {clinic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Complete Smile Makeover Package" {...field} />
                          </FormControl>
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
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what's included in this package..."
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Included Treatments */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Included Treatments</h3>
                      {selectedClinicId && treatments.length > 0 && (
                        <Select onValueChange={(value) => {
                          const treatment = treatments.find(t => t.id === value);
                          if (treatment) addTreatmentToPackage(treatment);
                        }}>
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Add treatment..." />
                          </SelectTrigger>
                          <SelectContent>
                            {treatments.filter(t => 
                              !treatmentFields.some(field => field.treatmentId === t.id)
                            ).map(treatment => (
                              <SelectItem key={treatment.id} value={treatment.id}>
                                {treatment.name} - £{treatment.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {treatmentFields.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8 border border-dashed rounded">
                        {selectedClinicId ? 'Add treatments to this package' : 'Select a clinic first'}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {treatmentFields.map((field, index) => (
                          <div key={field.id} className="flex items-center space-x-3 p-3 border rounded">
                            <div className="flex-1">
                              <p className="font-medium">{field.treatmentName}</p>
                              <p className="text-sm text-muted-foreground">£{field.treatmentPrice} each</p>
                            </div>
                            <FormField
                              control={form.control}
                              name={`includedTreatments.${index}.quantity`}
                              render={({ field: quantityField }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      className="w-20"
                                      {...quantityField}
                                      onChange={(e) => {
                                        const newQuantity = parseInt(e.target.value) || 1;
                                        quantityField.onChange(newQuantity);
                                        
                                        // Recalculate original price
                                        const treatments = form.getValues('includedTreatments');
                                        const newOriginalPrice = treatments.reduce(
                                          (sum, treatment, i) => {
                                            const qty = i === index ? newQuantity : treatment.quantity;
                                            return sum + (treatment.treatmentPrice * qty);
                                          }, 0
                                        );
                                        form.setValue('originalPrice', newOriginalPrice);
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeTreatmentFromPackage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Included Services */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Included Services</h3>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendService({
                          serviceType: 'OTHER',
                          name: '',
                          description: '',
                          quantity: 1,
                        })}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </div>

                    {serviceFields.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8 border border-dashed rounded">
                        Add complementary services to enhance this package
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {serviceFields.map((field, index) => (
                          <div key={field.id} className="p-3 border rounded space-y-3">
                            <div className="flex items-center justify-between">
                              <FormField
                                control={form.control}
                                name={`includedServices.${index}.serviceType`}
                                render={({ field: serviceTypeField }) => (
                                  <FormItem className="flex-1 mr-3">
                                    <Select onValueChange={serviceTypeField.onChange} defaultValue={serviceTypeField.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {serviceTypes.map(type => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeService(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3">
                              <FormField
                                control={form.control}
                                name={`includedServices.${index}.name`}
                                render={({ field: nameField }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input placeholder="Service name" {...nameField} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`includedServices.${index}.description`}
                                render={({ field: descField }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input placeholder="Description" {...descField} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`includedServices.${index}.quantity`}
                                render={({ field: qtyField }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder="Qty"
                                        {...qtyField}
                                        onChange={(e) => qtyField.onChange(parseInt(e.target.value) || 1)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Pricing and Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pricing & Settings</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Original Price (Auto-calculated)</Label>
                        <Input
                          type="number"
                          value={form.watch('originalPrice')}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="totalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Package Price *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch('totalPrice') > 0 && form.watch('originalPrice') > 0 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm font-medium text-green-800">
                          Savings: £{(form.watch('originalPrice') - form.watch('totalPrice')).toFixed(2)} 
                          ({getSavingsPercentage()}% off)
                        </p>
                      </div>
                    )}

                    {/* Promo Code */}
                    <div className="space-y-2">
                      <Label>Promo Code *</Label>
                      <div className="flex space-x-2">
                        <FormField
                          control={form.control}
                          name="promoCode"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="e.g., SMILE-PKG-ABC123" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={generatePromoCode}
                          disabled={!selectedClinicId}
                        >
                          Generate
                        </Button>
                      </div>
                    </div>

                    {/* Expiry Date and Max Uses */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date *</FormLabel>
                            <FormControl>
                              <Input 
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxUses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Uses (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="1"
                                placeholder="Unlimited"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Active Checkbox */}
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Active Package</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
                    >
                      {isEditing ? 'Update Package' : 'Create Package'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* List of Treatment Packages */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Packages ({treatmentPackages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {packagesLoading ? (
                <div className="text-center py-8">Loading packages...</div>
              ) : treatmentPackages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No packages found</p>
              ) : (
                <div className="space-y-4">
                  {treatmentPackages.map(pkg => {
                    const clinic = clinics.find(c => c.id === pkg.clinicId);
                    const isExpired = new Date(pkg.expiryDate) < new Date();
                    const savings = parseFloat(pkg.originalPrice) - parseFloat(pkg.totalPrice);
                    const savingsPercent = Math.round((savings / parseFloat(pkg.originalPrice)) * 100);
                    
                    return (
                      <div key={pkg.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{pkg.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {clinic?.name || 'Unknown Clinic'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {pkg.isActive && !isExpired ? (
                              <Badge variant="default">
                                <Eye className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <EyeOff className="h-3 w-3 mr-1" />
                                {isExpired ? 'Expired' : 'Inactive'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Package Price:</span>
                            <span className="font-semibold">£{pkg.totalPrice}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Original Price:</span>
                            <span className="line-through">£{pkg.originalPrice}</span>
                          </div>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>You Save:</span>
                            <span className="font-semibold">£{savings.toFixed(2)} ({savingsPercent}%)</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Code:</span> {pkg.promoCode}
                          </div>
                          <div>
                            <span className="font-medium">Expires:</span>{' '}
                            {new Date(pkg.expiryDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Uses:</span>{' '}
                            {pkg.currentUses}/{pkg.maxUses || '∞'}
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Handle edit package
                              setIsEditing(true);
                              setSelectedPackageId(pkg.id);
                              // Populate form... (implementation similar to special offers)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this package?')) {
                                deletePackageMutation.mutate(pkg.id);
                              }
                            }}
                            disabled={deletePackageMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}