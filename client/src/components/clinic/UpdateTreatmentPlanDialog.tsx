import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateTreatmentPlan, useTreatmentPlan } from "@/hooks/use-treatment-plans";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Minus } from "lucide-react";
import { TreatmentPlanStatus, PaymentStatus } from "../../../shared/models/treatment-plan";

// Create a schema for our form
const updateTreatmentPlanSchema = z.object({
  id: z.number(),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  status: z.nativeEnum(TreatmentPlanStatus),
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
  appointmentDate: z.string().optional(),
  completionDate: z.string().optional(),
  paymentStatus: z.nativeEnum(PaymentStatus),
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
  const { data, isLoading, isError } = useTreatmentPlan(treatmentPlanId);
  const updateMutation = useUpdateTreatmentPlan(treatmentPlanId);

  // Setup form with default empty values
  const form = useForm<FormValues>({
    resolver: zodResolver(updateTreatmentPlanSchema),
    defaultValues: {
      id: treatmentPlanId,
      title: "",
      description: "",
      status: TreatmentPlanStatus.DRAFT,
      treatmentItems: [
        { name: "", price: 0, quantity: 1, description: "" }
      ],
      estimatedDuration: "",
      notes: "",
      appointmentDate: "",
      completionDate: "",
      paymentStatus: PaymentStatus.PENDING,
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (data?.data?.treatmentPlan) {
      const plan = data.data.treatmentPlan;
      
      form.reset({
        id: plan.id,
        title: plan.title,
        description: plan.description || "",
        status: plan.status,
        treatmentItems: plan.treatmentItems,
        estimatedDuration: plan.estimatedDuration || "",
        notes: plan.notes || "",
        appointmentDate: plan.appointmentDate || "",
        completionDate: plan.completionDate || "",
        paymentStatus: plan.paymentStatus,
      });
    }
  }, [data, form]);

  // Calculate total price
  const calculateTotal = (items: { price: number; quantity: number }[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      await updateMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating treatment plan:", error);
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
      form.setValue("treatmentItems", currentItems.filter((_, i) => i !== index));
    }
  };

  // Get the current treatment items from the form
  const treatmentItems = form.watch("treatmentItems");
  const total = calculateTotal(treatmentItems);

  // Format date for input fields
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Format to YYYY-MM-DD for date input
    return date.toISOString().split('T')[0];
  };

  if (isError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Failed to load treatment plan. Please try again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Treatment Plan</DialogTitle>
          <DialogDescription>
            Make changes to the treatment plan and update its status.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Patient Information (read-only) */}
              {data?.data?.treatmentPlan?.patientName && (
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium mb-1">Patient Information</h4>
                  <p className="text-sm">{data.data.treatmentPlan.patientName}</p>
                </div>
              )}

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

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TreatmentPlanStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PaymentStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
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

                {treatmentItems.map((_, index) => (
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
                    currency: data?.data?.treatmentPlan?.currency || 'GBP'
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

              {/* Appointment Date */}
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={formatDateForInput(field.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      When is the treatment scheduled to begin?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Completion Date */}
              <FormField
                control={form.control}
                name="completionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completion Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={formatDateForInput(field.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      When was the treatment completed?
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