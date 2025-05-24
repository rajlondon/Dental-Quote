import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { apiRequest } from '@/lib/queryClient';
import { insertSpecialOfferSchema, type SpecialOffer, type Clinic } from '@shared/schema';

interface Treatment {
  id: string;
  name: string;
  price: number;
}

export default function SpecialOffersManager() {
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertSpecialOfferSchema),
    defaultValues: {
      title: '',
      description: '',
      discountType: 'PERCENTAGE' as const,
      discountValue: 0,
      clinicId: 0,
      treatmentIds: [] as string[],
      promoCode: '',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      isActive: true,
      maxUses: null,
    }
  });

  // Fetch clinics
  const { data: clinics = [] } = useQuery<Clinic[]>({
    queryKey: ['/api/admin/clinics'],
  });

  // Fetch special offers
  const { data: specialOffers = [], isLoading: offersLoading } = useQuery<SpecialOffer[]>({
    queryKey: ['/api/admin/special-offers'],
  });

  // Fetch treatments for selected clinic
  const { data: treatments = [] } = useQuery<Treatment[]>({
    queryKey: ['/api/admin/clinics', selectedClinicId, 'treatments'],
    enabled: !!selectedClinicId,
  });

  // Create special offer mutation
  const createOfferMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/special-offers', data);
      return response.json();
    },
    onSuccess: () => {
      toast.success('Special offer created successfully');
      form.reset();
      setIsEditing(false);
      setSelectedOfferId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/special-offers'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create special offer');
    },
  });

  // Update special offer mutation
  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/special-offers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast.success('Special offer updated successfully');
      form.reset();
      setIsEditing(false);
      setSelectedOfferId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/special-offers'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update special offer');
    },
  });

  // Delete special offer mutation
  const deleteOfferMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/special-offers/${id}`);
    },
    onSuccess: () => {
      toast.success('Special offer deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/special-offers'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete special offer');
    },
  });

  const onSubmit = (data: any) => {
    const formData = {
      ...data,
      clinicId: parseInt(selectedClinicId),
      expiryDate: new Date(data.expiryDate).toISOString(),
    };

    if (isEditing && selectedOfferId) {
      updateOfferMutation.mutate({ id: selectedOfferId, data: formData });
    } else {
      createOfferMutation.mutate(formData);
    }
  };

  const handleEditOffer = (offer: SpecialOffer) => {
    setIsEditing(true);
    setSelectedOfferId(offer.id);
    setSelectedClinicId(offer.clinicId.toString());
    
    form.reset({
      title: offer.title,
      description: offer.description,
      discountType: offer.discountType as 'PERCENTAGE' | 'FIXED_AMOUNT',
      discountValue: parseFloat(offer.discountValue),
      clinicId: offer.clinicId,
      treatmentIds: offer.treatmentIds || [],
      promoCode: offer.promoCode,
      expiryDate: new Date(offer.expiryDate).toISOString().split('T')[0],
      isActive: offer.isActive,
      maxUses: offer.maxUses || undefined,
    });
  };

  const handleDeleteOffer = (id: number) => {
    if (window.confirm('Are you sure you want to delete this special offer?')) {
      deleteOfferMutation.mutate(id);
    }
  };

  const generatePromoCode = () => {
    const selectedClinic = clinics.find(c => c.id === parseInt(selectedClinicId));
    const prefix = selectedClinic 
      ? selectedClinic.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') 
      : 'OFF';
    
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    form.setValue('promoCode', `${prefix}-${randomCode}`);
  };

  const handleClinicChange = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    form.setValue('clinicId', parseInt(clinicId));
    form.setValue('treatmentIds', []); // Reset treatment selection
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Special Offer' : 'Create Special Offer'}
        </h1>
        {isEditing && (
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setSelectedOfferId(null);
              form.reset();
            }}
          >
            Cancel Edit
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Plus className="inline-block mr-2 h-5 w-5" />
              {isEditing ? 'Edit Offer' : 'New Special Offer'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Summer Teeth Whitening Special" {...field} />
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
                          placeholder="Describe the special offer details..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Discount Type and Value */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                            <SelectItem value="FIXED_AMOUNT">Fixed Amount (£)</SelectItem>
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
                        <FormLabel>Discount Value *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step={form.watch('discountType') === 'PERCENTAGE' ? '1' : '0.01'}
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

                {/* Applicable Treatments */}
                {treatments.length > 0 && (
                  <FormField
                    control={form.control}
                    name="treatmentIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applicable Treatments</FormLabel>
                        <div className="max-h-48 overflow-y-auto border rounded p-3 space-y-2">
                          {treatments.map(treatment => (
                            <div key={treatment.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`treatment-${treatment.id}`}
                                checked={field.value?.includes(treatment.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value || []), treatment.id]);
                                  } else {
                                    field.onChange(field.value?.filter(id => id !== treatment.id));
                                  }
                                }}
                              />
                              <Label htmlFor={`treatment-${treatment.id}`} className="text-sm">
                                {treatment.name} - £{treatment.price}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            <Input placeholder="e.g., SUMMER25" {...field} />
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
                        <FormLabel>Active Offer</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="submit"
                    disabled={createOfferMutation.isPending || updateOfferMutation.isPending}
                  >
                    {isEditing ? 'Update Offer' : 'Create Offer'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* List of Special Offers */}
        <Card>
          <CardHeader>
            <CardTitle>Special Offers ({specialOffers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {offersLoading ? (
              <div className="text-center py-8">Loading offers...</div>
            ) : specialOffers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No special offers found</p>
            ) : (
              <div className="space-y-4">
                {specialOffers.map(offer => {
                  const clinic = clinics.find(c => c.id === offer.clinicId);
                  const isExpired = new Date(offer.expiryDate) < new Date();
                  
                  return (
                    <div key={offer.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{offer.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {clinic?.name || 'Unknown Clinic'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {offer.isActive && !isExpired ? (
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
                      
                      <p className="text-sm">{offer.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Code:</span> {offer.promoCode}
                        </div>
                        <div>
                          <span className="font-medium">Discount:</span>{' '}
                          {offer.discountType === 'PERCENTAGE' 
                            ? `${offer.discountValue}%` 
                            : `£${offer.discountValue}`}
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span>{' '}
                          {new Date(offer.expiryDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Uses:</span>{' '}
                          {offer.currentUses}/{offer.maxUses || '∞'}
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOffer(offer)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteOffer(offer.id)}
                          disabled={deleteOfferMutation.isPending}
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
  );
}