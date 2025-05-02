import React from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";

const TREATMENT_OPTIONS = [
  { value: "dental_implants", label: "Dental Implants" },
  { value: "veneers", label: "Veneers" },
  { value: "crowns", label: "Crowns" },
  { value: "teeth_whitening", label: "Teeth Whitening" },
  { value: "root_canal", label: "Root Canal Treatment" },
  { value: "orthodontics", label: "Orthodontics (Braces/Invisalign)" },
  { value: "dentures", label: "Dentures" },
  { value: "wisdom_teeth", label: "Wisdom Teeth Extraction" },
  { value: "full_mouth_restoration", label: "Full Mouth Restoration" },
  { value: "other", label: "Other" },
];

const TRAVEL_PERIODS = [
  { value: "flexible", label: "Flexible / Not Sure Yet" },
  { value: "1_month", label: "Within 1 Month" },
  { value: "3_months", label: "Within 3 Months" },
  { value: "6_months", label: "Within 6 Months" },
  { value: "later", label: "Later than 6 Months" },
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  treatment: z.string().min(1, "Please select a treatment"),
  specificTreatment: z.string().optional(),
  budget: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
    .refine((val) => !val || (val >= 0 && val <= 100000), {
      message: "Budget must be between $0 and $100,000",
    }),
  travelDateRange: z.string().optional(),
  notes: z.string().optional(),
  patientCountry: z.string().optional(),
  patientCity: z.string().optional(),
  patientLanguage: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and privacy policy",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function QuoteRequestPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Default values from authenticated user if available
  const defaultValues: Partial<FormValues> = {
    name: user?.name || "",
    email: user?.email || "",
    consent: false,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/quotes", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit quote request");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quote Request Submitted",
        description: "Your quote request has been submitted successfully. We will notify you once a quote is ready.",
      });
      
      // Redirect to the thank you page or patient quotes page
      if (user) {
        setLocation(`/patient/quotes/${data.data.id}`);
      } else {
        setLocation("/quote-request-success");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createQuoteMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Request a Dental Treatment Quote</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to receive a personalized quote from our partner clinics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Quote Details</CardTitle>
          <CardDescription>
            The more details you provide, the more accurate your quote will be
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 8901" {...field} />
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
                      <FormLabel>Preferred Language (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="turkish">Turkish</SelectItem>
                          <SelectItem value="german">German</SelectItem>
                          <SelectItem value="arabic">Arabic</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="russian">Russian</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The language you prefer for communication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="patientCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Country (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. United Kingdom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patientCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your City (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. London" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Treatment Information</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="treatment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a treatment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TREATMENT_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
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
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Your budget in USD"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          An approximate budget will help clinics provide suitable options
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="specificTreatment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment Details</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your dental needs in detail. Include information about your current situation and what you'd like to achieve."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The more detail you provide, the more accurate your quote will be
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Travel Information</h3>
                <FormField
                  control={form.control}
                  name="travelDateRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>When are you considering traveling?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time frame" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TRAVEL_PERIODS.map((period) => (
                            <SelectItem key={period.value} value={period.value}>
                              {period.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This helps clinics plan for your potential visit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any other information you'd like to share with the clinics"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

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
                      <FormLabel>
                        I agree to the terms of service and privacy policy
                      </FormLabel>
                      <FormDescription>
                        By submitting this form, you agree that your information will be shared with relevant partner clinics to provide you with quotes. We respect your privacy and will handle your data in accordance with our privacy policy.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="px-6"
                  disabled={createQuoteMutation.isPending}
                >
                  {createQuoteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Quote Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}