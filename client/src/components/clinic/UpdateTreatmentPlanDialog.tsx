import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Minus } from "lucide-react";
import { TreatmentPlanStatus, PaymentStatus } from "@shared/models/treatment-plan";
import { useTreatmentPlan, useUpdateTreatmentPlan } from '@/hooks/use-treatment-plans';
import { useToast } from "@/hooks/use-toast";

// Create a schema for our form
const updateTreatmentPlanSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  treatmentItems: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string().min(1, { message: "Name is required" }),
      price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
      quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }),
      description: z.string().optional(),
    })
  ).min(1, { message: "At least one treatment item is required" }),
  estimatedDuration: z.string().optional(),
  notes: z.string().optional(),
  currency: z.string(),
  status: z.string(),
  paymentStatus: z.string(),
});

type FormValues = z.infer<typeof updateTreatmentPlanSchema>;

interface UpdateTreatmentPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentPlanId: number;
}

export const UpdateTreatmentPlanDialog = ({
  open,
  onOpenChange,
  treatmentPlanId,
}: UpdateTreatmentPlanDialogProps) => {
  const { toast } = useToast();
  const { data: treatmentPlanData, isLoading: isLoadingPlan } = useTreatmentPlan(treatmentPlanId);
  const updateMutation = useUpdateTreatmentPlan();

  // Setup form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(updateTreatmentPlanSchema),
    defaultValues: {
      title: "",
      description: "",
      treatmentItems: [
        { name: "", price: 0, quantity: 1, description: "" }
      ],
      estimatedDuration: "",
      notes: "",
      currency: "GBP",
      status: TreatmentPlanStatus.DRAFT,
      paymentStatus: PaymentStatus.PENDING,
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (treatmentPlanData?.data?.treatmentPlan) {
      const plan = treatmentPlanData.data.treatmentPlan;
      form.reset({
        title: plan.title,
        description: plan.description || "",
        treatmentItems: plan.treatmentItems || [
          { name: "", price: 0, quantity: 1, description: "" }
        ],
        estimatedDuration: plan.estimatedDuration || "",
        notes: plan.notes || "",
        currency: plan.currency || "GBP",
        status: plan.status,
        paymentStatus: plan.paymentStatus,
      });
    }
  }, [treatmentPlanData, form]);

  // Calculate total price
  const calculateTotal = (items: { price: number; quantity: number }[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      // Convert string status to enum value
      const formattedValues = {
        ...values,
        id: treatmentPlanId,
        status: values.status as TreatmentPlanStatus,
        paymentStatus: values.paymentStatus as PaymentStatus,
      };
      
      await updateMutation.mutateAsync(formattedValues);
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Treatment plan updated successfully",
      });
    } catch (error) {
      console.error("Error updating treatment plan:", error);
      toast({
        title: "Error",
        description: "Failed to update treatment plan",
        variant: "destructive",
      });
    }
  };

  // Add a new treatment item
  const addTreatmentItem = () => {
    const currentItems = form.getValues("treatmentItems");
    form.setValue("treatmentItems", [
      ...currentItems,
      { name: "", price: 0, quantity: 1, description: "" }
    ]);
  };

  // Remove a treatment item
  const removeTreatmentItem = (index: number) => {
    const currentItems = form.getValues("treatmentItems");
    if (currentItems.length > 1) {
      form.setValue("treatmentItems", currentItems.filter((_: any, i: number) => i !== index));
    }
  };

  // Get the current treatment items from the form
  const treatmentItems = form.watch("treatmentItems");
  const total = calculateTotal(treatmentItems);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Treatment Plan</DialogTitle>
          <DialogDescription>
            Update the details of this treatment plan.
          </DialogDescription>
        </DialogHeader>

        {isLoadingPlan ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Treatment plan title" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide a brief description of the treatment plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status and Payment in 2 columns on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TreatmentPlanStatus.DRAFT}>Draft</SelectItem>
                          <SelectItem value={TreatmentPlanStatus.SENT}>Sent</SelectItem>
                          <SelectItem value={TreatmentPlanStatus.ACCEPTED}>Accepted</SelectItem>
                          <SelectItem value={TreatmentPlanStatus.IN_PROGRESS}>In Progress</SelectItem>
                          <SelectItem value={TreatmentPlanStatus.COMPLETED}>Completed</SelectItem>
                          <SelectItem value={TreatmentPlanStatus.REJECTED}>Rejected</SelectItem>
                          <SelectItem value={TreatmentPlanStatus.CANCELLED}>Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Status */}
                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                          <SelectItem value={PaymentStatus.PARTIAL}>Partial</SelectItem>
                          <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
                          <SelectItem value={PaymentStatus.REFUNDED}>Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Currency */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="TRY">Turkish Lira (₺)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Treatment Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">Treatment Items</FormLabel>
                  <Button type="button" size="sm" variant="outline" onClick={addTreatmentItem}>
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>

                {treatmentItems.map((_: any, index: number) => (
                  <div key={index} className="grid grid-cols-12 gap-2 p-3 border rounded-md">
                    <div className="col-span-12 sm:col-span-6">
                      <FormField
                        control={form.control}
                        name={`treatmentItems.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Treatment name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <FormField
                        control={form.control}
                        name={`treatmentItems.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Price</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-5 sm:col-span-2">
                      <FormField
                        control={form.control}
                        name={`treatmentItems.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" step="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-1 flex items-end justify-center">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeTreatmentItem(index)}
                        disabled={treatmentItems.length <= 1}
                        className="h-10"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="col-span-12 sm:col-span-11">
                      <FormField
                        control={form.control}
                        name={`treatmentItems.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Description (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                {/* Show subtotal */}
                <div className="text-right text-sm">
                  Subtotal: {new Intl.NumberFormat('en-GB', {
                    style: 'currency',
                    currency: form.getValues("currency") || 'GBP'
                  }).format(total)}
                </div>
              </div>

              {/* Estimated Duration */}
              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 3-5 days" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide an estimate of how long the treatment will take
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional information about the treatment plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : "Update Treatment Plan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};