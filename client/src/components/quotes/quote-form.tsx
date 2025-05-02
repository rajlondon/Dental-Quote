import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash2, Calendar } from "lucide-react";
import { QuoteData, QuoteTreatment } from "@/types/quote";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface QuoteFormProps {
  quoteId: number;
  initialData?: QuoteData;
  onSubmit: (quoteData: QuoteData, sendToPatient: boolean) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const formSchema = z.object({
  treatments: z.array(
    z.object({
      id: z.number(),
      treatmentName: z.string().min(1, "Treatment name is required"),
      description: z.string().optional(),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      unitPrice: z.number().min(0, "Price cannot be negative"),
      total: z.number(),
      teethNumbers: z.array(z.number()).optional(),
      category: z.string().optional(),
    })
  ).min(1, "At least one treatment is required"),
  subtotal: z.number(),
  discount: z.number().optional(),
  discountReason: z.string().optional(),
  total: z.number(),
  currency: z.string().default("USD"),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  accommodationIncluded: z.boolean().default(false),
  transportIncluded: z.boolean().default(false),
  additionalOffers: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        description: z.string(),
        price: z.number(),
        selected: z.boolean().default(false),
      })
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Default empty quote data
const DEFAULT_QUOTE_DATA: QuoteData = {
  treatments: [
    {
      id: 1,
      treatmentName: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ],
  subtotal: 0,
  total: 0,
  currency: "USD",
  additionalOffers: [],
};

// Generate a unique ID for new treatments
const generateId = () => Math.floor(Math.random() * 100000);

export default function QuoteForm({
  quoteId,
  initialData = DEFAULT_QUOTE_DATA,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: QuoteFormProps) {
  const { toast } = useToast();
  const [sendToPatient, setSendToPatient] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
    mode: "onChange",
  });

  const treatments = form.watch("treatments");
  const discount = form.watch("discount") || 0;

  // Calculate subtotal and total whenever treatments change
  React.useEffect(() => {
    const subtotal = treatments.reduce((sum, treatment) => sum + treatment.total, 0);
    const total = Math.max(0, subtotal - discount);
    
    form.setValue("subtotal", subtotal);
    form.setValue("total", total);
  }, [treatments, discount, form]);

  // Update treatment total when quantity or unitPrice changes
  const updateTreatmentTotal = (index: number) => {
    const treatment = form.getValues(`treatments.${index}`);
    const total = treatment.quantity * treatment.unitPrice;
    form.setValue(`treatments.${index}.total`, total);
  };

  // Add a new treatment
  const addTreatment = () => {
    const currentTreatments = form.getValues("treatments");
    form.setValue("treatments", [
      ...currentTreatments,
      {
        id: generateId(),
        treatmentName: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  // Remove a treatment
  const removeTreatment = (index: number) => {
    const currentTreatments = form.getValues("treatments");
    if (currentTreatments.length <= 1) {
      toast({
        title: "Cannot remove treatment",
        description: "At least one treatment is required",
        variant: "destructive",
      });
      return;
    }
    
    const updatedTreatments = [...currentTreatments];
    updatedTreatments.splice(index, 1);
    form.setValue("treatments", updatedTreatments);
  };

  const handleSubmit = async (data: FormValues) => {
    try {
      await onSubmit(data, sendToPatient);
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast({
        title: "Error submitting quote",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Treatment Quote</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Treatment Details</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTreatment}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Treatment
                </Button>
              </div>

              {treatments.map((treatment, index) => (
                <div key={treatment.id} className="mb-6 border rounded-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Treatment #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTreatment(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`treatments.${index}.treatmentName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Treatment Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Dental Implant" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`treatments.${index}.category`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="implants">Implants</SelectItem>
                              <SelectItem value="cosmetic">Cosmetic Dentistry</SelectItem>
                              <SelectItem value="restorative">Restorative</SelectItem>
                              <SelectItem value="orthodontics">Orthodontics</SelectItem>
                              <SelectItem value="surgery">Oral Surgery</SelectItem>
                              <SelectItem value="general">General Dentistry</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`treatments.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Detailed description of the treatment"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`treatments.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseInt(e.target.value) || 1);
                                updateTreatmentTotal(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`treatments.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseFloat(e.target.value) || 0);
                                updateTreatmentTotal(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-end md:col-span-2 pt-2">
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">
                          Treatment Total:
                        </span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(treatment.total, form.getValues("currency"))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Quote Details</h3>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="TRY">TRY (₺)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid Until</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              min={new Date().toISOString().split("T")[0]}
                            />
                          </FormControl>
                          <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <FormDescription>
                          Date until which this quote is valid
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g. 50% deposit required, balance due before treatment"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="accommodationIncluded"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Accommodation Included</FormLabel>
                          <FormDescription>
                            Complementary hotel stay is included in this quote
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transportIncluded"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Transport Included</FormLabel>
                          <FormDescription>
                            Airport transfers and local transportation are included
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Pricing</h3>

                <div className="space-y-6">
                  <div className="bg-muted/30 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span>Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(form.getValues("subtotal"), form.getValues("currency"))}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <span>Discount:</span>
                      <span className="font-medium">
                        {formatCurrency(discount, form.getValues("currency"))}
                      </span>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex justify-between items-center font-semibold">
                      <span>Total:</span>
                      <span className="text-xl">
                        {formatCurrency(form.getValues("total"), form.getValues("currency"))}
                      </span>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Reason</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. First-time patient special"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional information for the patient"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="bg-muted/20 p-4 rounded-md border">
              <div className="flex items-center mb-4">
                <Checkbox
                  id="sendToPatient"
                  checked={sendToPatient}
                  onCheckedChange={(checked) => setSendToPatient(!!checked)}
                  className="mr-2"
                />
                <label htmlFor="sendToPatient" className="text-sm font-medium cursor-pointer">
                  Send this quote to the patient immediately
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                If checked, the quote will be sent to the patient for review once saved. 
                Otherwise, it will be saved as a draft and can be sent later.
              </p>
            </div>

            <CardFooter className="px-0 pb-0 pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Quote"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}