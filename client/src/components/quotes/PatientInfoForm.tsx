import React from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useQuoteStore, PatientInfo } from '@/stores/quoteStore';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// Form validation schema
const patientInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(6, 'Please enter a valid phone number'),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  notes: z.string().optional()
});

type PatientInfoFormValues = z.infer<typeof patientInfoSchema>;

const PatientInfoForm: React.FC = () => {
  const [_, navigate] = useLocation();
  const { patientInfo, setPatientInfo } = useQuoteStore();
  
  // Initialize form with existing values or defaults
  const form = useForm<PatientInfoFormValues>({
    resolver: zodResolver(patientInfoSchema),
    defaultValues: patientInfo || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      preferredDate: '',
      notes: ''
    }
  });
  
  // Handle form submission
  const onSubmit = (data: PatientInfoFormValues) => {
    setPatientInfo({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      preferredDate: data.preferredDate,
      notes: data.notes || '' // Ensure notes is always a string
    });
    
    // Navigate to summary step
    navigate('/quote/summary');
  };
  
  // Go back to treatments step
  const handleGoBack = () => {
    navigate('/quote/treatments');
  };
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <FormItem className="col-span-full md:col-span-1">
                  <FormLabel>Preferred Date for Appointment</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any special requirements or questions you may have..." 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Treatments
            </Button>
            
            <Button type="submit">
              Review Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PatientInfoForm;