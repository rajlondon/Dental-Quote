import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuoteStore } from '@/stores/quoteStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Validation schema
const patientInfoSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  preferredDate: z.string().optional(),
  notes: z.string().optional(),
});

type PatientInfoFormValues = z.infer<typeof patientInfoSchema>;

const PatientInfoForm: React.FC = () => {
  const { patientInfo, setPatientInfo, treatments } = useQuoteStore();
  const [, navigate] = useLocation();
  
  // Create form with default values from the store
  const form = useForm<PatientInfoFormValues>({
    resolver: zodResolver(patientInfoSchema),
    defaultValues: {
      firstName: patientInfo?.firstName || '',
      lastName: patientInfo?.lastName || '',
      email: patientInfo?.email || '',
      phone: patientInfo?.phone || '',
      preferredDate: patientInfo?.preferredDate || '',
      notes: patientInfo?.notes || '',
    },
  });

  const onSubmit = (values: PatientInfoFormValues) => {
    // Save patient info to the store
    setPatientInfo({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || '',
      preferredDate: values.preferredDate || '',
      notes: values.notes || '',
    });

    toast({
      title: 'Information saved',
      description: 'Your contact information has been saved.',
    });

    // Navigate to the summary page
    navigate('/standalone-quote/summary');
  };

  const goBack = () => {
    navigate('/standalone-quote/treatments');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Information</h2>
        <p className="text-gray-600">
          Please provide your contact information so we can prepare your quote.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
          <CardDescription>
            Fill in your information below to receive your personalized dental treatment quote.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your first name" {...field} />
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
                        <Input placeholder="Your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        We'll send your quote to this email address
                      </FormDescription>
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
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="preferredDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      When would you like to start your treatment?
                    </FormDescription>
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
                        placeholder="Any additional information or questions you'd like to include with your quote..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                >
                  Back to Treatments
                </Button>
                
                <Button 
                  type="submit"
                  disabled={treatments.length === 0}
                >
                  {treatments.length === 0 ? 'Please select treatments first' : 'Continue to Summary'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientInfoForm;