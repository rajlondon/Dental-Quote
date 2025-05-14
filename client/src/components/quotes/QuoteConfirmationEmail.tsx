import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';

// Define form schema for email validation
const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(50),
  sendCopy: z.boolean().default(false),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface QuoteConfirmationEmailProps {
  quoteId: string | number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Component for sending quote confirmations via email
 * Uses React Hook Form with Zod validation
 */
const QuoteConfirmationEmail: React.FC<QuoteConfirmationEmailProps> = ({ 
  quoteId, 
  onSuccess,
  onError
}) => {
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
      name: '',
      sendCopy: false
    }
  });

  // Handle form submission
  const onSubmit = async (values: EmailFormValues) => {
    try {
      setIsSending(true);
      
      // Track email request
      trackEvent('quote_email_request', 'emails', `quote_id_${quoteId}`);
      
      // Call API to send email
      const response = await apiRequest('POST', '/api/quotes/send-email', {
        quoteId,
        recipientEmail: values.email,
        recipientName: values.name,
        sendCopy: values.sendCopy
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to send email' }));
        throw new Error(errorData.message || 'Failed to send email');
      }

      // Mark as successful
      setIsSuccess(true);
      toast({
        title: 'Email Sent',
        description: `Quote details have been sent to ${values.email}`,
      });
      
      // Track successful email send
      trackEvent('quote_email_sent', 'emails', `quote_id_${quoteId}`);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Show error toast
      toast({
        title: 'Email Failed',
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: 'destructive',
      });
      
      // Track error
      trackEvent('quote_email_error', 'error', error instanceof Error ? error.message : 'unknown');
      
      // Call error callback if provided
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsSending(false);
    }
  };

  // Reset the form and state
  const handleReset = () => {
    form.reset();
    setIsSuccess(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <span>Quote Email Confirmation</span>
        </CardTitle>
        <CardDescription>
          Receive your quote details via email for reference
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isSuccess ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Email Sent Successfully</h3>
            <p className="text-muted-foreground mt-2">
              Your quote details have been emailed. Please check your inbox.
            </p>
            <Button 
              variant="outline" 
              onClick={handleReset} 
              className="mt-4"
            >
              Send to Another Email
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
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
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
                      <Input 
                        type="email" 
                        placeholder="your.email@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      We'll send the quote details to this email address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sendCopy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Also send me a copy</FormLabel>
                      <FormDescription>
                        Send a copy to the dental clinic for reference
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Quote Details'
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          Your email will only be used to send this quote. We respect your privacy.
        </p>
      </CardFooter>
    </Card>
  );
};

export default QuoteConfirmationEmail;