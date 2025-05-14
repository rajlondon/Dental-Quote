import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { trackEvent } from '@/lib/analytics';

interface QuoteConfirmationEmailProps {
  quoteId: string | number;
  recipientEmail?: string;
}

export const QuoteConfirmationEmail = ({ quoteId, recipientEmail }: QuoteConfirmationEmailProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const sendConfirmationEmail = async () => {
    if (!quoteId) {
      toast({
        title: 'Error',
        description: 'Cannot send confirmation email without a quote ID',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('POST', `/api/quotes/${quoteId}/send-confirmation`, {
        email: recipientEmail
      });
      
      setEmailSent(true);
      toast({
        title: 'Success',
        description: 'Confirmation email sent!',
      });
      
      // Track the event
      trackEvent('quote_confirmation_email_sent', 'quotes', `quote_id_${quoteId}`);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      toast({
        title: 'Error sending email',
        description: 'We could not send the confirmation email. Please try again later.',
        variant: 'destructive',
      });
      
      // Track the error
      trackEvent('quote_confirmation_email_error', 'quotes', `quote_id_${quoteId}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          {emailSent ? <CheckCircle2 className="mr-2 text-green-500" /> : <Mail className="mr-2" />}
          Quote Confirmation
        </CardTitle>
        <CardDescription>
          {emailSent 
            ? 'Your quote confirmation has been sent!' 
            : 'Would you like to receive this quote by email?'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emailSent ? (
          <p>
            We've sent a confirmation email with your quote details. 
            You can access this quote anytime from your account dashboard.
          </p>
        ) : (
          <p>
            Click the button below to receive a copy of your quote by email.
            This email will include all details of your selected treatments and pricing.
          </p>
        )}
      </CardContent>
      <CardFooter>
        {!emailSent && (
          <Button 
            onClick={sendConfirmationEmail} 
            disabled={isLoading || emailSent}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Quote by Email'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};