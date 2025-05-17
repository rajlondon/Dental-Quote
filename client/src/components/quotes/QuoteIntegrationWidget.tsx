import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format-utils';
import TreatmentList, { Treatment } from './TreatmentList';
import { useQuoteSystem } from '@/hooks/use-quote-system';
import { CalendarIcon, CheckCircleIcon, DownloadIcon, MailIcon, SendIcon, XCircleIcon } from 'lucide-react';

export interface QuoteDetails {
  id: string;
  createdAt: string;
  patientName: string;
  patientEmail: string;
  treatments: Treatment[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'completed';
}

interface QuoteIntegrationWidgetProps {
  quoteId?: string;
  portalType: 'patient' | 'admin' | 'clinic';
  onQuoteUpdated?: (quote: QuoteDetails) => void;
  mode?: 'view' | 'edit';
}

export const QuoteIntegrationWidget: React.FC<QuoteIntegrationWidgetProps> = ({
  quoteId,
  portalType,
  onQuoteUpdated,
  mode = 'view'
}) => {
  const { toast } = useToast();
  const { 
    getQuote, 
    updateQuote, 
    applyPromoCode, 
    removePromoCode, 
    updateTreatmentQuantity,
    removeTreatment,
    downloadQuotePdf,
    sendQuoteByEmail,
    requestAppointment
  } = useQuoteSystem(portalType);

  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  // Fetch quote data on initial load
  useEffect(() => {
    if (quoteId) {
      loadQuote();
    }
  }, [quoteId]);

  const loadQuote = async () => {
    if (!quoteId) return;

    setLoading(true);
    
    try {
      const data = await getQuote(quoteId);
      setQuote(data);
      if (onQuoteUpdated) {
        onQuoteUpdated(data);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quote details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPromoCode = async () => {
    if (!quoteId || !promoCodeInput.trim() || !quote) return;

    setApplyingPromo(true);
    
    try {
      const updatedQuote = await applyPromoCode(quoteId, promoCodeInput);
      setQuote(updatedQuote);
      setPromoCodeInput('');
      
      toast({
        title: 'Promo code applied',
        description: `Discount applied to your quote: ${formatCurrency(updatedQuote.discount, updatedQuote.currency)}`,
        variant: 'success',
      });
      
      if (onQuoteUpdated) {
        onQuoteUpdated(updatedQuote);
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast({
        title: 'Error',
        description: 'Invalid promo code or cannot be applied to this quote',
        variant: 'destructive',
      });
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = async () => {
    if (!quoteId || !quote) return;
    
    try {
      const updatedQuote = await removePromoCode(quoteId);
      setQuote(updatedQuote);
      
      toast({
        title: 'Promo code removed',
        description: 'The promo code has been removed from your quote',
        variant: 'success',
      });
      
      if (onQuoteUpdated) {
        onQuoteUpdated(updatedQuote);
      }
    } catch (error) {
      console.error('Error removing promo code:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove promo code',
        variant: 'destructive',
      });
    }
  };

  const handleQuantityChange = async (treatmentId: string, newQuantity: number) => {
    if (!quoteId || !quote) return;
    
    try {
      const updatedQuote = await updateTreatmentQuantity(quoteId, treatmentId, newQuantity);
      setQuote(updatedQuote);
      
      toast({
        title: 'Quantity updated',
        description: 'Treatment quantity has been updated',
        variant: 'success',
      });
      
      if (onQuoteUpdated) {
        onQuoteUpdated(updatedQuote);
      }
    } catch (error) {
      console.error('Error updating treatment quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update treatment quantity',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveTreatment = async (treatmentId: string) => {
    if (!quoteId || !quote) return;
    
    try {
      const updatedQuote = await removeTreatment(quoteId, treatmentId);
      setQuote(updatedQuote);
      
      toast({
        title: 'Treatment removed',
        description: 'Treatment has been removed from your quote',
        variant: 'success',
      });
      
      if (onQuoteUpdated) {
        onQuoteUpdated(updatedQuote);
      }
    } catch (error) {
      console.error('Error removing treatment:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove treatment',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (!quoteId || !quote) return;
    
    setPdfDownloading(true);
    
    try {
      await downloadQuotePdf(quoteId);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Your quote PDF has been downloaded',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download quote PDF',
        variant: 'destructive',
      });
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!quoteId || !quote) return;
    
    setEmailSending(true);
    
    try {
      await sendQuoteByEmail(quoteId);
      
      toast({
        title: 'Email Sent',
        description: `Quote has been sent to ${quote.patientEmail}`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send quote email',
        variant: 'destructive',
      });
    } finally {
      setEmailSending(false);
    }
  };

  const handleRequestAppointment = async () => {
    if (!quoteId || !quote) return;
    
    try {
      await requestAppointment(quoteId);
      
      toast({
        title: 'Appointment Requested',
        description: 'Your appointment request has been submitted',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error requesting appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to request appointment',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading quote details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-8">
            <XCircleIcon className="h-12 w-12 text-destructive" />
            <p className="mt-4 text-muted-foreground">Quote not found or not accessible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Dental Treatment Quote</CardTitle>
            <CardDescription>Created on {new Date(quote.createdAt).toLocaleDateString()}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 text-xs font-medium rounded-full ${
              quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
              quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
              quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
              quote.status === 'completed' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <div className="mb-4">
            <Label className="text-sm text-muted-foreground">Patient Information</Label>
            <div className="mt-1">
              <p className="font-medium">{quote.patientName}</p>
              <p className="text-sm text-muted-foreground">{quote.patientEmail}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <Label className="text-sm text-muted-foreground">Treatment List</Label>
            <div className="mt-2">
              <TreatmentList 
                treatments={quote.treatments} 
                currency={quote.currency} 
                onQuantityChange={mode === 'edit' ? handleQuantityChange : undefined}
                onRemoveTreatment={mode === 'edit' ? handleRemoveTreatment : undefined}
                readOnly={mode !== 'edit'}
                portalType={portalType}
              />
            </div>
          </div>
          
          {mode === 'edit' && (
            <div className="mb-6">
              <Label htmlFor="promo-code">Promo Code</Label>
              <div className="flex mt-1.5 gap-2">
                <Input
                  id="promo-code"
                  placeholder="Enter promo code"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  disabled={applyingPromo || !!quote.promoCode}
                  className="w-full"
                />
                {quote.promoCode ? (
                  <Button 
                    variant="outline" 
                    onClick={handleRemovePromoCode}
                    className="whitespace-nowrap"
                  >
                    <XCircleIcon className="mr-2 h-4 w-4" />
                    Remove Code
                  </Button>
                ) : (
                  <Button 
                    onClick={handleApplyPromoCode}
                    disabled={!promoCodeInput.trim() || applyingPromo}
                    className="whitespace-nowrap"
                  >
                    {applyingPromo ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                        Applying...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="mr-2 h-4 w-4" />
                        Apply Code
                      </>
                    )}
                  </Button>
                )}
              </div>
              {quote.promoCode && (
                <p className="mt-2 text-sm text-primary">Promo code <strong>{quote.promoCode}</strong> applied</p>
              )}
            </div>
          )}
          
          <div className="rounded-md bg-muted p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(quote.subtotal, quote.currency)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-primary">
                {quote.discount > 0 
                  ? `- ${formatCurrency(quote.discount, quote.currency)}`
                  : formatCurrency(0, quote.currency)
                }
              </span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(quote.total, quote.currency)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2 justify-end">
        {portalType === 'patient' && (
          <Button
            variant="outline"
            onClick={handleRequestAppointment}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Request Appointment
          </Button>
        )}
        
        <Button
          variant="outline"
          onClick={handleDownloadPdf}
          disabled={pdfDownloading}
        >
          {pdfDownloading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
              Downloading...
            </>
          ) : (
            <>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
        
        {(portalType === 'admin' || portalType === 'clinic') && (
          <Button
            onClick={handleSendEmail}
            disabled={emailSending}
          >
            {emailSending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <MailIcon className="mr-2 h-4 w-4" />
                Send to Patient
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuoteIntegrationWidget;