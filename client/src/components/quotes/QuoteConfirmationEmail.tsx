import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { trackEvent } from '@/lib/analytics';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Schema for form validation
const emailSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface QuoteConfirmationEmailProps {
  quoteId: string | number;
  recipientEmail?: string;
  onComplete?: () => void;
}

export const QuoteConfirmationEmail = ({ quoteId, recipientEmail, onComplete }: QuoteConfirmationEmailProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showBackButton, setShowBackButton] = useState(true);
  const { toast } = useToast();

  // Initialize form with default values if recipientEmail is provided
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: recipientEmail || '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: EmailFormValues) => {
    setLoading(true);
    try {
      // Track event when user initiates email sending
      trackEvent('quote_email_initiated', 'quotes', `quote_id_${quoteId}`);
      
      // Send API request to send the confirmation email
      const response = await apiRequest('POST', `/api/quotes/${quoteId}/send-confirmation`, {
        email: values.email,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }
      
      const data = await response.json();
      
      // Update UI state
      setSuccess(true);
      setShowBackButton(false);
      
      // Show success toast
      toast({
        title: 'Email Sent!',
        description: `Quote confirmation has been sent to ${data.recipientEmail}`,
      });
      
      // Track successful email sending
      trackEvent('quote_email_sent', 'quotes', `quote_id_${quoteId}`);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      
      // Show error toast
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send email. Please try again later.',
        variant: 'destructive',
      });
      
      // Track error event
      trackEvent('quote_email_error', 'quotes', `quote_id_${quoteId}`);
    } finally {
      setLoading(false);
    }
  };

  // If email was successfully sent, show success state
  if (success) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <CheckCircle2 className="mr-2 text-green-500" />
            Email Sent Successfully
          </CardTitle>
          <CardDescription>
            Your quote has been emailed to the provided address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            The quote details have been sent to <span className="font-semibold">{form.getValues().email}</span>.
          </p>
          <p className="mt-4">
            Please check your inbox (and spam folder) for the email containing your dental quote information.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={() => window.location.href = '/quotes'}
            className="mt-4"
          >
            View All Quotes
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Mail className="mr-2 text-primary" />
          Send Quote by Email
        </CardTitle>
        <CardDescription>
          Receive a copy of your dental quote in your inbox
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your.email@example.com" 
                      {...field} 
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    We'll send your quote details to this email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {showBackButton && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center"
                  onClick={() => window.history.back()}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              
              <Button
                type="submit"
                className="flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Quote
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        <div className="mt-6 bg-muted p-4 rounded-md">
          <h3 className="font-semibold mb-2">What's included in the email:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Complete quote summary</li>
            <li>Treatment details with prices</li>
            <li>Applicable discounts and promo codes</li>
            <li>Total cost breakdown</li>
            <li>Link to view quote online</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};