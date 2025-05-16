import React, { useState } from 'react';
import { useQuoteStore } from '@/stores/quoteStore';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Send, Tag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const QuoteSummary: React.FC = () => {
  const { treatments, patientInfo, promoCode, discountPercentage, subtotal, total } = useQuoteStore();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleBack = () => {
    navigate('/quote/patient-info');
  };

  const handleSubmit = async () => {
    if (!patientInfo) {
      toast({
        title: 'Missing information',
        description: 'Please complete your patient information first',
        variant: 'destructive'
      });
      navigate('/quote/patient-info');
      return;
    }

    if (treatments.length === 0) {
      toast({
        title: 'No treatments selected',
        description: 'Please select at least one treatment before submitting your quote',
        variant: 'destructive'
      });
      navigate('/quote/treatments');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare quote data for submission
      const quoteData = {
        patientInfo,
        treatments,
        promoCode,
        discountPercentage,
        subtotal,
        total
      };
      
      // Send to API
      const response = await apiRequest('POST', '/api/quotes', quoteData);
      
      if (!response.ok) {
        throw new Error('Failed to submit quote');
      }
      
      const data = await response.json();
      
      // Generate PDF if successful
      if (data.id) {
        const pdfResponse = await apiRequest('GET', `/api/quotes/${data.id}/pdf`);
        
        if (pdfResponse.ok) {
          const pdfBlob = await pdfResponse.blob();
          const pdfObjectUrl = URL.createObjectURL(pdfBlob);
          setPdfUrl(pdfObjectUrl);
        }
      }
      
      // Show success message
      toast({
        title: 'Quote submitted successfully',
        description: 'Your quote has been saved. We will contact you shortly!',
        variant: 'default'
      });
      
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your quote. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `MyDentalFly_Quote_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Calculate discount amount
  const discountAmount = subtotal * (discountPercentage / 100);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Quote Summary</CardTitle>
        <CardDescription>Review your dental treatment quote before submitting</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Patient Information */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Patient Information</h3>
          <div className="bg-muted p-4 rounded-md">
            {patientInfo ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name:</p>
                  <p>{patientInfo.firstName} {patientInfo.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email:</p>
                  <p>{patientInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone:</p>
                  <p>{patientInfo.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Preferred Date:</p>
                  <p>{new Date(patientInfo.preferredDate).toLocaleDateString()}</p>
                </div>
                {patientInfo.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Notes:</p>
                    <p>{patientInfo.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No patient information provided</p>
            )}
          </div>
        </div>
        
        {/* Selected Treatments */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Selected Treatments</h3>
          {treatments.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Treatment</th>
                    <th className="px-4 py-2 text-center font-medium">Qty</th>
                    <th className="px-4 py-2 text-right font-medium">Price</th>
                    <th className="px-4 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {treatments.map((treatment) => (
                    <tr key={treatment.id} className="border-t">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{treatment.name}</p>
                          <p className="text-sm text-muted-foreground">{treatment.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{treatment.quantity}</td>
                      <td className="px-4 py-3 text-right">${treatment.price}</td>
                      <td className="px-4 py-3 text-right">${treatment.price * treatment.quantity}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/50">
                  <tr className="border-t">
                    <td colSpan={3} className="px-4 py-2 font-medium text-right">Subtotal:</td>
                    <td className="px-4 py-2 text-right font-medium">${subtotal}</td>
                  </tr>
                  
                  {promoCode && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 font-medium text-right text-green-600 flex items-center justify-end">
                        <Tag className="h-4 w-4 mr-1" />
                        Discount ({promoCode} - {discountPercentage}%):
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-green-600">
                        -${discountAmount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  
                  <tr className="border-t">
                    <td colSpan={3} className="px-4 py-2 font-bold text-right">Total:</td>
                    <td className="px-4 py-2 text-right font-bold">${total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground">No treatments selected</p>
          )}
        </div>
        
        {/* PDF Download Button */}
        {pdfUrl && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Quote PDF
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        
        {pdfUrl ? (
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || treatments.length === 0 || !patientInfo}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Quote Request
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuoteSummary;