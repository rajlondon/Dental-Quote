import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  treatment: z.string().min(1, "Treatment is required"),
  otherTreatment: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  budget: z.string().optional(),
  dates: z.string().optional(),
  notes: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: "You must consent to be contacted",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const QuoteForm: React.FC = () => {
  const [showOtherField, setShowOtherField] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      treatment: "",
      otherTreatment: "",
      name: "",
      email: "",
      budget: "",
      dates: "",
      notes: "",
      consent: false,
    },
  });

  const handleTreatmentChange = (value: string) => {
    setShowOtherField(value === "other");
  };
  
  const submitQuoteRequest = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/quote-requests", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Quote request submitted",
        description: "We'll get back to you within 24 hours with your personalized treatment options.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error submitting request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    submitQuoteRequest.mutate(data);
  };

  return (
    <section id="quote-form" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display font-bold text-3xl text-neutral-800 mb-4">Get Your Free Quote</h2>
            <p className="text-neutral-600 mb-6">Tell us what you're looking for, and our team will create a personalized quote with vetted options that match your needs.</p>
            
            <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200 mb-6">
              <h3 className="font-display font-semibold text-lg mb-2 text-primary">What to expect after submitting:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="fas fa-clock text-secondary mt-1 mr-3"></i>
                  <span className="text-neutral-700">Response within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-file-medical text-secondary mt-1 mr-3"></i>
                  <span className="text-neutral-700">Three custom-matched provider options</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-tags text-secondary mt-1 mr-3"></i>
                  <span className="text-neutral-700">Clear, all-inclusive pricing</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-comments text-secondary mt-1 mr-3"></i>
                  <span className="text-neutral-700">Follow-up consultation with our team</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-primary/10 p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <i className="fas fa-shield-alt text-primary text-xl mr-3"></i>
                <h3 className="font-display font-semibold text-lg text-primary">Your Privacy Matters</h3>
              </div>
              <p className="text-neutral-700 text-sm">All information you provide is kept strictly confidential and is only shared with medical providers if you choose to proceed.</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border border-neutral-200">
            {isSubmitted ? (
              <div className="p-6 bg-secondary/20 text-secondary-dark rounded-lg text-center">
                <div className="text-5xl mb-4"><i className="fas fa-check-circle"></i></div>
                <h3 className="font-display font-bold text-xl mb-2">Thank You!</h3>
                <p>We'll get back to you within 24 hours with your personalized treatment options.</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="treatment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment(s) Needed <span className="text-accent">*</span></FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleTreatmentChange(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select primary treatment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dental">Dental Work</SelectItem>
                            <SelectItem value="cosmetic">Cosmetic Treatments</SelectItem>
                            <SelectItem value="hair">Hair Transplant</SelectItem>
                            <SelectItem value="eye">Laser Eye Surgery</SelectItem>
                            <SelectItem value="wellness">Wellness & Anti-aging</SelectItem>
                            <SelectItem value="multiple">Multiple Treatments</SelectItem>
                            <SelectItem value="other">Other (Please specify)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {showOtherField && (
                    <FormField
                      control={form.control}
                      name="otherTreatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please Specify Treatment</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name <span className="text-accent">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Email Address <span className="text-accent">*</span></FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
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
                          <FormLabel>Estimated Budget (€)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 3000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dates"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Travel Dates</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. June 10-20" {...field} />
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
                        <FormLabel>Additional Details or Questions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us more about what you're looking for..." 
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
                    name="consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm text-neutral-600">
                            I consent to being contacted about my inquiry and understand my data will be processed according to the <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                    disabled={submitQuoteRequest.isPending}
                  >
                    {submitQuoteRequest.isPending ? "Submitting..." : "Request My Free Quote"}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteForm;
