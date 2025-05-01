import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTreatmentPlan } from "@/hooks/use-treatment-plans";
import { usePatients } from "@/hooks/use-patients";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Minus } from "lucide-react";

// Create a schema for our form
const createTreatmentPlanSchema = z.object({
  patientId: z.coerce.number().positive({ message: "Please select a patient" }),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  treatmentItems: z.array(
    z.object({
      name: z.string().min(1, { message: "Name is required" }),
      price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
      quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }),
      description: z.string().optional(),
    })
  ).min(1, { message: "At least one treatment item is required" }),
  estimatedDuration: z.string().optional(),
  notes: z.string().optional(),
  currency: z.string().min(1, { message: "Currency is required" }),
});

type FormValues = z.infer<typeof createTreatmentPlanSchema>;

// Default form values
const defaultValues: FormValues = {
  patientId: 0,
  title: "",
  description: "",
  treatmentItems: [
    { name: "", price: 0, quantity: 1, description: "" }
  ],
  estimatedDuration: "",
  notes: "",
  currency: "GBP",
};

interface CreateTreatmentPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTreatmentPlanDialog = ({
  open,
  onOpenChange,
}: CreateTreatmentPlanDialogProps) => {
  const { patients, isLoading: patientsLoading } = usePatients();
  const createMutation = useCreateTreatmentPlan();

  // Setup form
  const form = useForm<FormValues>({
    resolver: zodResolver(createTreatmentPlanSchema),
    defaultValues,
  });

  // Calculate total price
  const calculateTotal = (items: { price: number; quantity: number }[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync(values);
      onOpenChange(false);
      form.reset(defaultValues);
    } catch (error) {
      console.error("Error creating treatment plan:", error);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Treatment Plan</DialogTitle>
          <DialogDescription>
            Create a new treatment plan for a patient. Add all required treatments and their details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Selection */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value.toString()}
                    disabled={patientsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patientsLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : patients?.length === 0 ? (
                        <div className="py-2 text-center text-sm">No patients found</div>
                      ) : (
                        patients?.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.firstName} {patient.lastName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  currency: form.watch('currency') || 'GBP'
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

            {/* Currency */}
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="TRY">TRY (₺)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : "Create Treatment Plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};