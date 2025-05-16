import React from 'react';
import { useQuoteStore } from '@/stores/quoteStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Define the form schema
const patientInfoSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(8, { message: 'Please enter a valid phone number' }),
  preferredDate: z.string().min(1, { message: 'Please select a preferred date' }),
  notes: z.string().optional(),
});

type PatientInfoFormValues = z.infer<typeof patientInfoSchema>;

const PatientInfoForm: React.FC = () => {
  const { patientInfo, treatments, setPatientInfo } = useQuoteStore();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Initialize form with default values
  const form = useForm<PatientInfoFormValues>({
    resolver: zodResolver(patientInfoSchema),
    defaultValues: patientInfo || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      preferredDate: '',
      notes: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: PatientInfoFormValues) => {
    if (treatments.length === 0) {
      toast({
        title: 'No treatments selected',
        description: 'Please select at least one treatment before proceeding',
        variant: 'destructive'
      });
      navigate('/quote/treatments');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update the patient info in the store
      setPatientInfo(data);
      
      // Show success message
      toast({
        title: 'Information saved',
        description: 'Your information has been saved',
        variant: 'default'
      });
      
      // Navigate to summary page
      navigate('/quote/summary');
    } catch (error) {
      console.error('Error saving patient info:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving your information. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
        <CardDescription>Please provide your contact details so we can prepare your quote</CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
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
                    <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="preferredDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Treatment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about any specific requirements or questions you have"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/quote/treatments')}
              disabled={isSubmitting}
            >
              Back
            </Button>
            
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue to Summary'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default PatientInfoForm;