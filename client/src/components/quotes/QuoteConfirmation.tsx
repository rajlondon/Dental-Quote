import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Link2, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { trackEvent } from '@/lib/analytics';
import QuoteConfirmationEmail from './QuoteConfirmationEmail';

interface QuoteConfirmationProps {
  quoteId: string | number;
  onComplete?: () => void;
}

export const QuoteConfirmation = ({ quoteId, onComplete }: QuoteConfirmationProps) => {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const { toast } = useToast();

  // Fetch quote data on component mount
  useEffect(() => {
    if (!quoteId) return;

    const fetchQuote = async () => {
      setLoading(true);
      try {
        const response = await apiRequest('GET', `/api/quotes/${quoteId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quote');
        }
        
        const data = await response.json();
        setQuote(data.quote);
        
        // Track quote viewed event
        trackEvent('quote_confirmation_viewed', 'quotes', `quote_id_${quoteId}`);
      } catch (err) {
        console.error('Error fetching quote:', err);
        setError('Could not load quote details. Please try again later.');
        
        toast({
          title: 'Error',
          description: 'Could not load quote details. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuote();
  }, [quoteId, toast]);

  // Generate shareable link
  const shareableLink = `${window.location.origin}/quotes/${quoteId}`;
  
  // Handle copying link to clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      toast({
        title: 'Link Copied!',
        description: 'Quote link copied to clipboard',
      });
      
      trackEvent('quote_link_copied', 'quotes', `quote_id_${quoteId}`);
    }).catch(err => {
      console.error('Failed to copy link:', err);
      toast({
        title: 'Error',
        description: 'Failed to copy link to clipboard',
        variant: 'destructive',
      });
    });
  };
  
  // Handle downloading quote as PDF
  const downloadQuotePDF = async () => {
    if (!quoteId) return;
    
    setLoading(true);
    try {
      // Use fetch directly for blob responses since apiRequest doesn't support responseType
      const response = await fetch(`/api/quotes/${quoteId}/pdf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Create a blob from the PDF data
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `quote-${quoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'Quote PDF downloaded successfully',
      });
      
      // Track PDF download event
      trackEvent('quote_pdf_downloaded', 'quotes', `quote_id_${quoteId}`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Could not download quote PDF. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !quote) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading quote details...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>We encountered a problem loading your quote</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showEmailForm) {
    return <QuoteConfirmationEmail quoteId={quoteId} />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <CheckCircle2 className="mr-2 text-green-500" />
          Quote Created Successfully
        </CardTitle>
        <CardDescription>
          Your dental quote has been created and saved to our system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg">
          Thank you for using MyDentalFly! Your quote (ID: <span className="font-semibold">{quoteId}</span>) 
          is now saved in our system.
        </p>
        
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-semibold mb-2">Next Steps:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Our team will review your quote details</li>
            <li>You'll receive price confirmation within 24 hours</li>
            <li>Feel free to contact us with any questions</li>
            <li>If you're ready to proceed, you can book your appointment</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={copyLinkToClipboard}
          >
            <Link2 className="mr-2 h-4 w-4" />
            Copy Quote Link
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center"
            onClick={downloadQuotePDF}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download as PDF
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => setShowEmailForm(true)}
          >
            Send via Email
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={onComplete}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
};