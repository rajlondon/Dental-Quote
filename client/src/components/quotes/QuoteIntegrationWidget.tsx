import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Download, Send, Check, X } from 'lucide-react';
import TreatmentList from './TreatmentList';
import { useQuoteSystem, QuoteData } from '@/hooks/use-quote-system';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/format-utils';

export interface QuoteDetails {
  id: string;
  createdAt: string;
  patientName: string;
  patientEmail: string;
  treatments: {
    id: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    category?: string;
  }[];
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

const QuoteIntegrationWidget: React.FC<QuoteIntegrationWidgetProps> = ({
  quoteId,
  portalType,
  onQuoteUpdated,
  mode = 'view'
}) => {
  const {
    currentQuote,
    loading,
    error,
    loadQuoteDetails,
    applyPromoCode,
    removePromoCode,
    updateTreatmentQuantity,
    removeTreatment,
    downloadQuotePdf,
    requestAppointment,
    sendQuoteEmail
  } = useQuoteSystem(portalType);
  
  const [promoCode, setPromoCode] = useState<string>('');
  const [applyingPromo, setApplyingPromo] = useState<boolean>(false);
  const [removingPromo, setRemovingPromo] = useState<boolean>(false);
  const [processingAction, setProcessingAction] = useState<boolean>(false);
  const { toast } = useToast();

  // Load quote details on component mount or quoteId change
  useEffect(() => {
    if (quoteId) {
      loadQuoteDetails(quoteId).catch((err) => {
        console.error('Error loading quote details:', err);
      });
    }
  }, [quoteId, loadQuoteDetails]);

  // Handle applying promo code
  const handleApplyPromoCode = async () => {
    if (!promoCode || !currentQuote) return;
    
    setApplyingPromo(true);
    try {
      await applyPromoCode(currentQuote.id, promoCode);
      setPromoCode('');
      toast({
        title: 'Promo Code Applied',
        description: 'The promo code has been successfully applied to your quote.',
        variant: 'success'
      });
      if (onQuoteUpdated && currentQuote) {
        onQuoteUpdated(currentQuote);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to apply promo code',
        variant: 'destructive'
      });
    } finally {
      setApplyingPromo(false);
    }
  };

  // Handle removing promo code
  const handleRemovePromoCode = async () => {
    if (!currentQuote || !currentQuote.promoCode) return;
    
    setRemovingPromo(true);
    try {
      await removePromoCode(currentQuote.id);
      toast({
        title: 'Promo Code Removed',
        description: 'The promo code has been removed from your quote.',
        variant: 'success'
      });
      if (onQuoteUpdated && currentQuote) {
        onQuoteUpdated(currentQuote);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to remove promo code',
        variant: 'destructive'
      });
    } finally {
      setRemovingPromo(false);
    }
  };

  // Handle updating treatment quantity
  const handleUpdateQuantity = async (treatmentId: string, quantity: number) => {
    if (!currentQuote) return;
    
    try {
      await updateTreatmentQuantity(currentQuote.id, treatmentId, quantity);
      if (onQuoteUpdated && currentQuote) {
        onQuoteUpdated(currentQuote);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update treatment quantity',
        variant: 'destructive'
      });
    }
  };

  // Handle removing a treatment
  const handleRemoveTreatment = async (treatmentId: string) => {
    if (!currentQuote) return;
    
    try {
      await removeTreatment(currentQuote.id, treatmentId);
      toast({
        title: 'Treatment Removed',
        description: 'The treatment has been removed from your quote.',
        variant: 'success'
      });
      if (onQuoteUpdated && currentQuote) {
        onQuoteUpdated(currentQuote);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to remove treatment',
        variant: 'destructive'
      });
    }
  };

  // Handle downloading PDF
  const handleDownloadPdf = async () => {
    if (!currentQuote) return;
    
    setProcessingAction(true);
    try {
      await downloadQuotePdf(currentQuote.id);
      toast({
        title: 'PDF Downloaded',
        description: 'The quote PDF has been downloaded successfully.',
        variant: 'success'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to download PDF',
        variant: 'destructive'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle requesting an appointment
  const handleRequestAppointment = async () => {
    if (!currentQuote) return;
    
    setProcessingAction(true);
    try {
      await requestAppointment(currentQuote.id);
      toast({
        title: 'Appointment Requested',
        description: 'Your appointment request has been sent successfully.',
        variant: 'success'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to request appointment',
        variant: 'destructive'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle sending quote via email
  const handleSendEmail = async () => {
    if (!currentQuote) return;
    
    setProcessingAction(true);
    try {
      await sendQuoteEmail(currentQuote.id);
      toast({
        title: 'Email Sent',
        description: 'The quote has been sent via email successfully.',
        variant: 'success'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to send email',
        variant: 'destructive'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading quote details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <div className="flex flex-col items-center">
            <X className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Quote</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => quoteId && loadQuoteDetails(quoteId)}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No quote or quote not found
  if (!currentQuote) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <div className="flex flex-col items-center">
            <p className="text-muted-foreground">
              {quoteId ? 'Quote not found' : 'No quote selected'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <CardTitle className="text-xl mb-1">
              Dental Treatment Quote #{currentQuote.id}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Created on {formatDate(currentQuote.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium
              ${currentQuote.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                currentQuote.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                currentQuote.status === 'sent' ? 'bg-blue-100 text-blue-800' : 
                currentQuote.status === 'completed' ? 'bg-purple-100 text-purple-800' : 
                'bg-gray-100 text-gray-800'}`
            }>
              {currentQuote.status.charAt(0).toUpperCase() + currentQuote.status.slice(1)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Patient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Patient Information</h3>
              <div className="space-y-1">
                <p><span className="font-medium">Name:</span> {currentQuote.patientName}</p>
                <p><span className="font-medium">Email:</span> {currentQuote.patientEmail}</p>
              </div>
            </div>
            {currentQuote.clinicName && (
              <div>
                <h3 className="text-sm font-medium mb-2">Assigned Clinic</h3>
                <p>{currentQuote.clinicName}</p>
              </div>
            )}
          </div>

          {/* Treatments */}
          <div>
            <h3 className="text-sm font-medium mb-3">Treatments</h3>
            <TreatmentList 
              treatments={currentQuote.treatments}
              onUpdateQuantity={mode === 'edit' ? handleUpdateQuantity : undefined}
              onRemoveTreatment={mode === 'edit' ? handleRemoveTreatment : undefined}
              readOnly={mode !== 'edit'}
              currency={currentQuote.currency}
            />
          </div>

          {/* Promo Code */}
          <div>
            <h3 className="text-sm font-medium mb-3">Promo Code</h3>
            {currentQuote.promoCode ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Applied Code:</span> {currentQuote.promoCode}
                  <div className="text-sm text-muted-foreground mt-1">
                    {currentQuote.discount > 0 && (
                      <>Savings: ${currentQuote.discount.toFixed(2)}</>
                    )}
                  </div>
                </div>
                {mode === 'edit' && (
                  <Button 
                    variant="outline" 
                    onClick={handleRemovePromoCode}
                    disabled={removingPromo}
                  >
                    {removingPromo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                    Remove
                  </Button>
                )}
              </div>
            ) : mode === 'edit' ? (
              <div className="flex items-center gap-2">
                <div className="flex-grow">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleApplyPromoCode} 
                  disabled={!promoCode || applyingPromo}
                >
                  {applyingPromo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Apply
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No promo code applied</p>
            )}
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${currentQuote.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Discount</span>
              <span>${currentQuote.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${currentQuote.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={processingAction}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            
            {portalType === 'patient' && (
              <Button
                onClick={handleRequestAppointment}
                disabled={processingAction}
                className="bg-primary hover:bg-primary/90"
              >
                Request Appointment
              </Button>
            )}
            
            {portalType === 'clinic' && (
              <Button
                onClick={handleSendEmail}
                disabled={processingAction}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4 mr-2" />
                Send to Patient
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteIntegrationWidget;