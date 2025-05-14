import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Share2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';

interface QuoteConfirmationProps {
  quoteId: string | number;
}

export function QuoteConfirmation({ quoteId }: QuoteConfirmationProps) {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const { data: quote, isLoading, error } = useQuery({
    queryKey: ['/api/quotes', quoteId],
    // Query will use the default queryFn from queryClient
  });

  useEffect(() => {
    if (quote) {
      // Track successful quote creation
      trackEvent('quote_confirmed', 'quote', quoteId.toString());
    }
  }, [quote, quoteId]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    
    try {
      const response = await fetch(`/api/quotes/${quoteId}/pdf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Get blob from response
      const blob = await response.blob();
      
      // Create object URL
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `dental-quote-${quoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Quote PDF Downloaded',
        description: 'Your quote has been downloaded successfully.',
      });
      
      trackEvent('quote_pdf_downloaded', 'quote', quoteId.toString());
    } catch (err) {
      console.error('Error downloading PDF:', err);
      toast({
        title: 'Download Failed',
        description: 'There was an error downloading your quote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleShareQuote = async () => {
    setSharing(true);
    
    try {
      // Get shareable link from the API
      const response = await fetch(`/api/quotes/${quoteId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to create share link');
      }
      
      const { shareUrl } = await response.json();
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: 'Quote Shared',
        description: 'Share link copied to clipboard.',
      });
      
      trackEvent('quote_shared', 'quote', quoteId.toString());
    } catch (err) {
      console.error('Error sharing quote:', err);
      toast({
        title: 'Share Failed',
        description: 'There was an error creating a share link. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSharing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" aria-label="Loading" />
            <p>Loading quote details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !quote) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-destructive mb-4 text-4xl">!</div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Quote</h3>
            <p className="text-sm text-gray-500 mb-4">
              We couldn't load your quote details. Please try again or contact support.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <CardTitle className="text-2xl">Quote Confirmed!</CardTitle>
        <CardDescription>
          Your quote #{quoteId} has been created and saved successfully.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-gray-500 mb-4">
            Thank you for creating your dental treatment quote. You can download a PDF copy
            of your quote or share it via a secure link.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleShareQuote}
              disabled={sharing}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              {sharing ? 'Creating Link...' : 'Share Quote'}
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Quote reference: <span className="font-mono">{quoteId}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Created on: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}