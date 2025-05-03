import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuotes } from "@/hooks/use-quotes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CreateQuoteRequest } from "@/types/quote";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useClinics } from "@/hooks/use-clinics";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Treatment options
const TREATMENT_OPTIONS = [
  "Dental Implants",
  "Veneers",
  "Crowns",
  "Bridges",
  "Root Canal",
  "Teeth Whitening",
  "Full Mouth Rehabilitation",
  "Dental Bonding",
  "Orthodontics",
  "Other"
];

// Country options
const COUNTRY_OPTIONS = [
  "United Kingdom",
  "United States",
  "Germany",
  "France",
  "Netherlands",
  "Australia",
  "Canada",
  "Italy",
  "Spain",
  "Other"
];

// Language options
const LANGUAGE_OPTIONS = [
  "English",
  "German",
  "French",
  "Spanish",
  "Italian",
  "Dutch",
  "Turkish",
  "Arabic",
  "Other"
];

// Schema for validation
const createQuoteSchema = z.object({
  name: z.string().min(3, { message: "Name is required (at least 3 characters)" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().optional(),
  treatment: z.string().min(1, { message: "Treatment type is required" }),
  specificTreatment: z.string().optional(),
  notes: z.string().optional(),
  adminNotes: z.string().optional(),
  budget: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive().optional()
  ),
  travelDateRange: z.string().optional(),
  patientCountry: z.string().optional(),
  patientCity: z.string().optional(),
  patientLanguage: z.string().optional(),
  consent: z.boolean().refine(val => val === true, { message: "Patient consent is required" })
});

type FormValues = z.infer<typeof createQuoteSchema>;

export default function AdminNewQuotePage() {
  const [, setLocation] = useLocation();
  const { createQuoteMutation, assignClinicMutation } = useQuotes();
  const { allClinicsQuery } = useClinics();
  const { toast } = useToast();
  const [selectedClinic, setSelectedClinic] = useState<number | undefined>(undefined);

  // Load all clinics
  React.useEffect(() => {
    allClinicsQuery.refetch();
  }, []);

  // Form setup with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      treatment: "",
      specificTreatment: "",
      notes: "",
      adminNotes: "",
      budget: undefined,
      travelDateRange: "",
      patientCountry: "",
      patientCity: "",
      patientLanguage: "",
      consent: true
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // First create the quote
      const result = await createQuoteMutation.mutateAsync(data as CreateQuoteRequest);
      
      // Check if a clinic was selected for direct assignment
      if (selectedClinic && result.data && result.data.id) {
        await assignClinicMutation.mutateAsync({
          quoteId: result.data.id,
          clinicId: selectedClinic
        });
      }
      
      // Redirect to quotes list on success
      setLocation('/admin/quotes');
      
    } catch (error) {
      console.error("Error creating quote:", error);
      toast({
        title: "Error creating quote",
        description: "There was a problem creating the quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setLocation('/admin/quotes');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="Create New Quote Request"
        description="Create a new quote request and optionally assign to a clinic"
        actions={
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quotes
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quote Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="treatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Treatment</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select treatment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TREATMENT_OPTIONS.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                    control={form.control}
                    name="specificTreatment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Treatment Details (optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe specific treatment needs" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Budget in €" 
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? undefined : Number(e.target.value);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="travelDateRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel Date Range (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., June 2025 or flexible" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="patientCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COUNTRY_OPTIONS.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                      name="patientCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="patientLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Language</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LANGUAGE_OPTIONS.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Notes (optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional information from the patient" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adminNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Notes (optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Internal notes - not visible to patient" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Patient Consent</FormLabel>
                          <FormDescription>
                            Patient has provided consent for data processing and sharing with clinics
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createQuoteMutation.isPending || assignClinicMutation.isPending}
                    >
                      {createQuoteMutation.isPending ? "Creating..." : "Create Quote Request"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar for clinic assignment */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Assign to Clinic</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Optionally select a clinic to immediately assign this quote request after creation.
              </p>
              {allClinicsQuery.isLoading ? (
                <div className="py-4 text-center">Loading clinics...</div>
              ) : allClinicsQuery.error ? (
                <div className="py-4 text-center text-red-500">
                  Error loading clinics
                </div>
              ) : (
                <div className="space-y-4">
                  <Select
                    onValueChange={(value) => setSelectedClinic(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a clinic (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {allClinicsQuery.data?.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id.toString()}>
                          {clinic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedClinic && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">
                        Selected Clinic:
                      </p>
                      <p className="text-sm">
                        {allClinicsQuery.data?.find(c => c.id === selectedClinic)?.name}
                      </p>
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground mt-6">
                    <p className="font-medium">Note:</p>
                    <p>You can also assign this quote to a clinic later from the quote details page.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}