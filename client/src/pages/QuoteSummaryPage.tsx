import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * QuoteSummaryPage
 * 
 * This page displays a summary of a user's dental quote that was just created,
 * likely from a promotional token or special offer flow.
 */
const QuoteSummaryPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get quote ID from localStorage (set by MatchedClinicsPage)
  const quoteId = localStorage.getItem('generatedQuoteId');
  const clinicName = localStorage.getItem('selectedClinicName') || 'Selected Clinic';
  const promoToken = localStorage.getItem('promoToken');

  useEffect(() => {
    // If no quoteId is available, show an error
    if (!quoteId) {
      setError('No quote information found. Please try creating a quote again.');
      setLoading(false);
      return;
    }

    // Fetch the quote details using the ID
    const fetchQuoteDetails = async () => {
      try {
        const response = await fetch(`/api/quotes/${quoteId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quote details');
        }
        
        const data = await response.json();
        if (data.success) {
          setQuoteData(data.data);
        } else {
          throw new Error(data.message || 'Failed to load quote details');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading your quote');
        toast({
          title: 'Error Loading Quote',
          description: err.message || 'Failed to load quote details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteDetails();
  }, [quoteId, toast]);

  // Redirect to the patient portal to view the quote
  const viewInPatientPortal = () => {
    // Store the quote ID for patient portal to access
    localStorage.setItem('viewQuoteId', quoteId || '');
    setLocation('/patient-portal');
  };

  // Continue to quote editing
  const editQuote = () => {
    setLocation(`/patient/quotes/${quoteId}/edit`);
  };

  // Download the quote
  const downloadQuote = async () => {
    if (!quoteId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/quotes/${quoteId}/download`);
      if (!response.ok) {
        throw new Error('Failed to generate quote PDF');
      }
      
      // Get the PDF file from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `dental-quote-${quoteId}.pdf`;
      
      // Append to the document and click the link
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Quote Downloaded',
        description: 'Your quote has been downloaded successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Download Failed',
        description: err.message || 'Failed to download quote',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-12">
      <Card className="w-full overflow-hidden border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-2xl md:text-3xl">Quote Summary</CardTitle>
          <CardDescription>
            Your dental quote has been created successfully
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-4 border border-destructive/20 rounded-md bg-destructive/5 text-destructive">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="border p-4 rounded-md bg-muted/30">
                  <h3 className="font-semibold text-lg">Quote Details</h3>
                  <p className="text-sm text-muted-foreground">Reference: #{quoteId}</p>
                  {clinicName && (
                    <p className="mt-2">Clinic: <span className="font-medium">{clinicName}</span></p>
                  )}
                </div>
                
                <div className="p-4 border rounded-md bg-success/5 border-success/20">
                  <h3 className="font-semibold text-green-600">Success!</h3>
                  <p>Your quote has been created successfully with your selected promotional discount applied.</p>
                </div>
                
                <div className="border p-4 rounded-md">
                  <h3 className="font-semibold">Next Steps</h3>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Review your quote details in the patient portal</li>
                    <li>Download a PDF copy for your records</li>
                    <li>Contact the clinic with any questions</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 bg-muted/20 p-6">
          <Button 
            onClick={viewInPatientPortal} 
            className="w-full sm:w-auto"
            disabled={loading || !!error}
          >
            View in Patient Portal
          </Button>
          <Button 
            onClick={downloadQuote} 
            variant="outline" 
            className="w-full sm:w-auto"
            disabled={loading || !!error}
          >
            Download Quote PDF
          </Button>
          <Button 
            onClick={editQuote} 
            variant="secondary" 
            className="w-full sm:w-auto"
            disabled={loading || !!error}
          >
            Edit Quote
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuoteSummaryPage;