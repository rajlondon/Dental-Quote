import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PromotionFormData } from '@/types/promotion';

// Form validation schema
const formSchema = z.object({
  clinic_id: z.string().min(1, 'Clinic is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.coerce.number().positive('Discount value must be positive'),
  applicable_treatments: z.array(z.string()).min(1, 'Select at least one treatment'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  promo_code: z.string().min(3, 'Promo code must be at least 3 characters'),
  terms_conditions: z.string().min(10, 'Terms must be at least 10 characters'),
  banner_image: z.string().optional(),
  is_active: z.boolean().default(true),
  admin_approved: z.boolean().default(true),
  commission_percentage: z.coerce.number().min(0).max(100).optional(),
  promotion_level: z.enum(['standard', 'featured', 'premium']).default('standard'),
  homepage_display: z.boolean().default(false),
  treatment_price_gbp: z.coerce.number().positive('Price must be positive').optional(),
  treatment_price_usd: z.coerce.number().positive('Price must be positive').optional(),
});

interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePromotionModal({ isOpen, onClose }: CreatePromotionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get available clinics from API
  const treatmentOptions = [
    { value: 'dental_implant_standard', label: 'Dental Implant (Standard)' },
    { value: 'porcelain_veneers', label: 'Porcelain Veneers' },
    { value: 'dental_crowns', label: 'Dental Crowns' },
    { value: 'full_mouth_reconstruction', label: 'Full Mouth Reconstruction' },
    { value: 'hollywood_smile', label: 'Hollywood Smile' },
    { value: 'all_on_4_implants', label: 'All-on-4 Implants' }
  ];
  
  const clinicOptions = [
    { value: '1', label: 'Istanbul Dental Smile' },
    { value: '2', label: 'Premium Dent' },
    { value: '3', label: 'DentSpa' },
    { value: '4', label: 'Beyaz Ada Clinic' },
    { value: '5', label: 'Maltepe Dental' }
  ];

  // Form setup
  const form = useForm<PromotionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clinic_id: '',
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      applicable_treatments: [],
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      promo_code: '',
      terms_conditions: '',
      banner_image: '',
      is_active: true,
      admin_approved: true,
      commission_percentage: 15,
      promotion_level: 'standard',
      homepage_display: false,
      treatment_price_gbp: 0,
      treatment_price_usd: 0,
    },
  });

  // Create promotion mutation
  const createMutation = useMutation({
    mutationFn: async (data: PromotionFormData) => {
      const response = await apiRequest('POST', '/api/admin/promotions', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create promotion');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Promotion created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating promotion',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(data: PromotionFormData) {
    createMutation.mutate(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Promotion</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clinic_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select clinic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clinicOptions.map(clinic => (
                          <SelectItem key={clinic.value} value={clinic.value}>
                            {clinic.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="promo_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promo Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., SUMMER25" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Promotion title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Detailed description of the promotion" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discount Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discount_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                control={form.control}
                name="discount_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={0} placeholder="Enter value" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Applicable Treatments */}
            <div className="space-y-2">
              <FormLabel>Applicable Treatments</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {treatmentOptions.map(treatment => (
                  <FormField
                    key={treatment.value}
                    control={form.control}
                    name="applicable_treatments"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value?.includes(treatment.value)}
                            onChange={e => {
                              const checked = e.target.checked;
                              const currentValues = field.value || [];
                              field.onChange(
                                checked
                                  ? [...currentValues, treatment.value]
                                  : currentValues.filter(value => value !== treatment.value)
                              );
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="m-0">{treatment.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="terms_conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms & Conditions</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Specify terms and conditions" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="banner_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="URL to promotion banner image" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Commission and Promotion Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="commission_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Percentage</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={0} max={100} placeholder="Enter percentage" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="promotion_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Treatment Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="treatment_price_gbp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treatment Price (GBP)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={0} placeholder="Price in GBP" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="treatment_price_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treatment Price (USD)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={0} placeholder="Price in USD" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
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
                control={form.control}
                name="admin_approved"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Approved</FormLabel>
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
                control={form.control}
                name="homepage_display"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Show on Homepage</FormLabel>
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

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Promotion'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}