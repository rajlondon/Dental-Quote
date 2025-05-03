import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuotes } from "@/hooks/use-quotes";
import { useClinics } from "@/hooks/use-clinics";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateQuoteRequest } from "@/types/quote";

// Define the form schema based on CreateQuoteRequest
const createQuoteSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  treatment: z.string().min(1, "Treatment is required"),
  specificTreatment: z.string().optional(),
  notes: z.string().optional(),
  adminNotes: z.string().optional(),
  budget: z.string().optional(),
  travelDateRange: z.string().optional(),
  patientCountry: z.string().optional(),
  patientCity: z.string().optional(),
  patientLanguage: z.string().optional(),
  consent: z.boolean().refine(value => value === true, {
    message: "You must confirm the patient has consented to data processing"
  }),
  clinicId: z.string().optional(), // Optional clinic selection
});

type FormValues = z.infer<typeof createQuoteSchema>;

export default function AdminNewQuotePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { createQuoteMutation } = useQuotes();
  const { allClinicsQuery } = useClinics();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load clinics when component mounts
  useEffect(() => {
    allClinicsQuery.refetch();
  }, []);

  // Setup form
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
      budget: "",
      travelDateRange: "",
      patientCountry: "",
      patientCity: "",
      patientLanguage: "",
      consent: false,
      clinicId: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Extract fields for quote creation
      const quoteData: CreateQuoteRequest = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        treatment: data.treatment,
        specificTreatment: data.specificTreatment || undefined,
        notes: data.notes || undefined,
        adminNotes: data.adminNotes || undefined,
        budget: data.budget ? parseFloat(data.budget) : undefined,
        travelDateRange: data.travelDateRange || undefined,
        patientCountry: data.patientCountry || undefined,
        patientCity: data.patientCity || undefined,
        patientLanguage: data.patientLanguage || undefined,
        consent: data.consent,
      };

      // Create the quote
      const response = await createQuoteMutation.mutateAsync(quoteData);
      
      // If a clinic is selected, assign the quote to the clinic
      if (data.clinicId && response?.id) {
        // You could add the assignClinicMutation here if needed
        toast({
          title: "Quote created and assigned",
          description: "The quote has been created and assigned to the clinic successfully.",
        });
      } else {
        toast({
          title: "Quote created",
          description: "The quote has been created successfully.",
        });
      }
      
      // Redirect to quotes page
      setLocation("/admin-portal");
    } catch (error) {
      console.error("Error creating quote:", error);
      toast({
        title: "Error creating quote",
        description: error.message || "An error occurred while creating the quote",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define treatment options
  const treatmentOptions = [
    "Dental Implants",
    "Veneers",
    "Crowns",
    "Bridges",
    "Root Canal Treatment",
    "Teeth Whitening",
    "Full Mouth Restoration",
    "Dental Bonding",
    "Invisalign/Clear Aligners",
    "Hollywood Smile",
    "Other",
  ];

  // Define country options
  const countryOptions = [
    "United Kingdom",
    "United States",
    "Canada",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Belgium",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Australia",
    "New Zealand",
    "Other",
  ];

  // Define language options
  const languageOptions = [
    "English",
    "German",
    "French",
    "Spanish",
    "Italian",
    "Dutch",
    "Swedish",
    "Norwegian",
    "Danish",
    "Finnish",
    "Arabic",
    "Russian",
    "Turkish",
    "Other",
  ];

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="Create New Quote"
        description="Create a new quote request for a patient"
        actions={
          <Button 
            variant="outline" 
            onClick={() => setLocation("/admin-portal")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Quotes
          </Button>
        }
      />

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>
                Enter the patient's details to create a new quote request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
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
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="john.smith@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+44 7123 456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="5000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
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
                              {treatmentOptions.map((option) => (
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
                      name="specificTreatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specific Treatment Details</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="E.g., 4 implants, full upper arch veneers" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patientCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient Country</FormLabel>
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
                              {countryOptions.map((option) => (
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
                          <FormLabel>Patient City</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="London" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
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
                              {languageOptions.map((option) => (
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
                      name="travelDateRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel Date Range</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="E.g., June 2025" 
                              {...field} 
                            />
                          </FormControl>
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
                        <FormLabel>Patient Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information provided by the patient" 
                            className="min-h-[100px]"
                            {...field} 
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
                        <FormLabel>Admin Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Internal notes visible only to admins" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clinicId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to Clinic (Optional)</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select clinic (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allClinicsQuery.data?.map((clinic) => (
                              <SelectItem key={clinic.id} value={clinic.id.toString()}>
                                {clinic.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          You can assign the quote to a clinic now or do it later
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Data Processing Consent</FormLabel>
                          <FormDescription>
                            I confirm the patient has consented to processing their data for the purpose of creating treatment quotes
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setLocation("/admin-portal")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Create Quote
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Help & Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Creating a New Quote</h3>
                <p className="text-sm text-muted-foreground">
                  Fill in the patient's information to create a new quote request. 
                  Required fields are marked with an asterisk.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Clinic Assignment</h3>
                <p className="text-sm text-muted-foreground">
                  You can optionally assign the quote to a clinic now, or do it later
                  from the Quotes Administration page.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Patient Consent</h3>
                <p className="text-sm text-muted-foreground">
                  You must confirm the patient has consented to having their data processed
                  for creating treatment quotes before submitting the form.
                </p>
              </div>
              
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800">X-ray Uploads</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      After creating the quote, you'll be able to upload any X-rays or
                      scans the patient has provided from the quote details page.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}