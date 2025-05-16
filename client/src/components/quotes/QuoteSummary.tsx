import React from 'react';
import { useQuoteStore } from '@/stores/quoteStore';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, Printer, Download, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QuoteSummary: React.FC = () => {
  const { 
    treatments, 
    patientInfo,
    subtotal,
    discountPercent,
    total,
    promoCode,
    resetQuote
  } = useQuoteStore();
  
  const { toast } = useToast();

  // Handle print quote
  const handlePrintQuote = () => {
    window.print();
  };

  // Handle download quote as PDF
  const handleDownloadPDF = async () => {
    try {
      toast({
        title: 'Generating PDF',
        description: 'Please wait while we prepare your quote PDF...'
      });
      
      const response = await fetch('/api/quotes/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          treatments,
          patientInfo,
          subtotal,
          discountPercent,
          total,
          promoCode,
          date: new Date().toISOString()
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dental-quote-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Your quote has been downloaded successfully.'
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not download your quote. Please try again later.',
        variant: 'destructive'
      });
    }
  };

  // Handle reset quote
  const handleResetQuote = () => {
    if (window.confirm('Are you sure you want to reset this quote? All your selected treatments and information will be lost.')) {
      resetQuote();
      toast({
        title: 'Quote Reset',
        description: 'Your quote has been reset.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Quote Summary</h2>
      <p className="text-gray-600 mb-6">
        Review your personalized dental treatment quote below.
      </p>
      
      {/* Patient Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>Contact details for this quote</CardDescription>
        </CardHeader>
        <CardContent>
          {patientInfo ? (
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span> {patientInfo.firstName} {patientInfo.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {patientInfo.email}
              </p>
              {patientInfo.phone && (
                <p>
                  <span className="font-medium">Phone:</span> {patientInfo.phone}
                </p>
              )}
              {patientInfo.preferredDate && (
                <p>
                  <span className="font-medium">Preferred Date:</span> {patientInfo.preferredDate}
                </p>
              )}
              {patientInfo.notes && (
                <div>
                  <span className="font-medium">Additional Notes:</span>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap mt-1">{patientInfo.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No patient information provided</p>
          )}
        </CardContent>
      </Card>
      
      {/* Treatment List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Selected Treatments</CardTitle>
          <CardDescription>Dental procedures included in this quote</CardDescription>
        </CardHeader>
        <CardContent>
          {treatments.length > 0 ? (
            <div className="space-y-4">
              <div className="border-b">
                <div className="grid grid-cols-12 font-medium pb-2">
                  <div className="col-span-6">Treatment</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>
              </div>
              
              <div className="space-y-4">
                {treatments.map(treatment => (
                  <div key={treatment.id} className="grid grid-cols-12 items-center">
                    <div className="col-span-6">
                      <div className="font-medium">{treatment.name}</div>
                      {treatment.description && (
                        <div className="text-sm text-gray-500">{treatment.description}</div>
                      )}
                    </div>
                    <div className="col-span-2 text-right">${treatment.price.toFixed(2)}</div>
                    <div className="col-span-2 text-right">{treatment.quantity}</div>
                    <div className="col-span-2 text-right font-medium">
                      ${(treatment.price * treatment.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No treatments selected</p>
          )}
        </CardContent>
      </Card>
      
      {/* Pricing Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quote Total</CardTitle>
          <CardDescription>Final pricing for your selected treatments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            {promoCode && discountPercent > 0 && (
              <div className="flex justify-between text-green-600">
                <span>
                  Promo Code Discount: <span className="font-medium">{promoCode}</span> ({discountPercent}%)
                </span>
                <span>-${(subtotal - total).toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between pt-2 border-t mt-2 font-bold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-gray-500">
            <p>This quote is valid for 30 days from today.</p>
            <p>Prices are estimated and may vary depending on specific clinical findings.</p>
          </div>
        </CardFooter>
      </Card>
      
      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-between">
        <Button 
          variant="outline" 
          className="flex gap-2"
          onClick={handlePrintQuote}
        >
          <Printer size={16} />
          <span>Print Quote</span>
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            className="flex gap-2"
            onClick={handleResetQuote}
          >
            <Trash size={16} />
            <span>Reset Quote</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex gap-2"
            onClick={handleDownloadPDF}
          >
            <Download size={16} />
            <span>Download PDF</span>
          </Button>
          
          <Button className="flex gap-2">
            <ArrowUpRight size={16} />
            <span>Find Clinics</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuoteSummary;