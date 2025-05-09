import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Define the form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  message: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: "You must consent to be contacted"
  })
});

type FormData = z.infer<typeof formSchema>;

interface FreeConsultationWidgetProps {
  clinicId?: string;
  className?: string;
  onSuccess?: () => void;
}

const FreeConsultationWidget: React.FC<FreeConsultationWidgetProps> = ({
  clinicId,
  className = '',
  onSuccess
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      consent: false
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Prepare request payload
      const payload = {
        ...data,
        clinicId: clinicId || 'general',
        source: 'quote_page',
        consultationType: 'free'
      };
      
      // Call API endpoint
      const response = await fetch('/api/consultations/free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit consultation request');
      }
      
      // Show success message
      toast({
        title: "Request Submitted",
        description: "Your free consultation request has been sent successfully!",
        variant: "default",
      });
      
      setIsSubmitted(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting consultation request:', error);
      
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle>Free Dental Consultation</CardTitle>
        <CardDescription className="text-primary-foreground/90">
          Get professional advice about your dental treatment options
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {isSubmitted ? (
          <div className="flex flex-col items-center text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
            <p className="text-muted-foreground mb-4">
              Your consultation request has been received. One of our dental experts will contact you shortly.
            </p>
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>
              Request Another Consultation
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
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
                      <Input type="email" placeholder="your.email@example.com" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us briefly about what you're looking for..." 
                        rows={3}
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I consent to be contacted about my dental treatment options
                      </FormLabel>
                      <FormDescription>
                        Your data will be handled according to our privacy policy.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  "Request Free Consultation"
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/50 text-xs text-muted-foreground">
        <p>Your information is secure and will only be used to contact you about dental services.</p>
      </CardFooter>
    </Card>
  );
};

export default FreeConsultationWidget;