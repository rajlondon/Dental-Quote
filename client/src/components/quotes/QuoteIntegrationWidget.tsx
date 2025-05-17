import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import TreatmentList, { Treatment } from './TreatmentList';
import { useQuoteSystem } from '@/hooks/use-quote-system';
import { Download, Check, FileDown, Info, Mail, Printer, RefreshCw } from 'lucide-react';

export type PortalType = 'patient' | 'clinic' | 'admin';
export type ModeType = 'view' | 'edit' | 'create';

interface QuoteIntegrationWidgetProps {
  quoteId?: string;
  portalType: PortalType;
  mode?: ModeType;
  initialSection?: string;
  onSave?: (quoteData: any) => void;
  onCancel?: () => void;
}

const QuoteIntegrationWidget: React.FC<QuoteIntegrationWidgetProps> = ({
  quoteId,
  portalType,
  mode = 'view',
  initialSection = 'treatments',
  onSave,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState(initialSection);
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'GBP' | 'EUR'>('USD');
  const { toast } = useToast();
  
  const {
    quote,
    loading,
    error,
    fetchQuote,
    updateTreatmentQuantity,
    removeTreatment,
    applyPromoCode,
    removePromoCode,
    downloadQuotePdf,
    emailQuote,
    printQuote
  } = useQuoteSystem(portalType);

  // Fetch quote data on mount if quoteId is provided
  useEffect(() => {
    if (quoteId) {
      fetchQuote(quoteId);
    }
  }, [quoteId, fetchQuote]);

  // Handle promo code application
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a promo code',
        variant: 'destructive',
      });
      return;
    }

    setIsApplyingPromo(true);
    try {
      await applyPromoCode(quoteId!, promoCode);
      toast({
        title: 'Success',
        description: 'Promo code applied successfully',
        variant: 'default',
      });
      setPromoCode(''); // Clear input after successful application
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to apply promo code',
        variant: 'destructive',
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Handle promo code removal
  const handleRemovePromoCode = async () => {
    try {
      await removePromoCode(quoteId!);
      toast({
        title: 'Success',
        description: 'Promo code removed successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to remove promo code',
        variant: 'destructive',
      });
    }
  };

  // Handle PDF download
  const handleDownloadPdf = async () => {
    try {
      await downloadQuotePdf(quoteId!);
      toast({
        title: 'Success',
        description: 'Quote PDF downloaded successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to download PDF',
        variant: 'destructive',
      });
    }
  };

  // Handle email quote
  const handleEmailQuote = async () => {
    if (!patientEmail) {
      toast({
        title: 'Error',
        description: 'Please enter the patient email',
        variant: 'destructive',
      });
      return;
    }

    try {
      await emailQuote(quoteId!, patientEmail);
      toast({
        title: 'Success',
        description: 'Quote emailed successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to email quote',
        variant: 'destructive',
      });
    }
  };

  // Handle print quote
  const handlePrintQuote = async () => {
    try {
      await printQuote(quoteId!);
      toast({
        title: 'Success',
        description: 'Quote sent to printer',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to print quote',
        variant: 'destructive',
      });
    }
  };

  // Show loading state
  if (loading && !quote) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center">
        <CardContent>
          <div className="text-center">
            <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quote data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error && !quote) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500 mb-4">
            <Info className="h-10 w-10 mx-auto mb-2" />
            <p>{error}</p>
          </div>
          <Button 
            onClick={() => quoteId && fetchQuote(quoteId)} 
            className="mx-auto block"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If no quote data is available yet
  if (!quote) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No quote data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            Dental Treatment Quote #{quote.id.substring(0, 8)}
          </div>
          {portalType === 'patient' && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                <Download className="h-4 w-4 mr-1" /> Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintQuote}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="treatments">Treatments</TabsTrigger>
            <TabsTrigger value="promo">Promo Code</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          {/* Treatments Tab */}
          <TabsContent value="treatments">
            <div className="space-y-4">
              <TreatmentList
                treatments={quote.treatments as Treatment[]}
                readOnly={mode === 'view'}
                onQuantityChange={updateTreatmentQuantity}
                onRemoveTreatment={removeTreatment}
                selectedCurrency={selectedCurrency}
                showTotals={true}
                appliedPromoCode={quote.promoCode}
                discountAmount={quote.discountAmount || 0}
                discountType={quote.discountType as 'percentage' | 'fixed_amount'}
                discountValue={quote.discountValue || 0}
              />

              <div className="flex justify-between mt-4">
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('promo')}
                  >
                    Next: Promo Code
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Promo Code Tab */}
          <TabsContent value="promo">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {quote.promoCode ? (
                      <div>
                        <div className="flex items-center mb-4">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span className="font-medium">
                            Promo code <span className="text-primary font-bold">{quote.promoCode}</span> applied!
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          You're saving {quote.discountType === 'percentage'
                            ? `${quote.discountValue}%`
                            : `$${quote.discountAmount.toFixed(2)}`
                          } on your dental treatment quote.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={handleRemovePromoCode}
                          className="w-full"
                        >
                          Remove Promo Code
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="promoCode">Enter promo code</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="promoCode"
                            placeholder="e.g. SUMMER15"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                          />
                          <Button 
                            onClick={handleApplyPromoCode}
                            disabled={isApplyingPromo || !promoCode}
                          >
                            {isApplyingPromo ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                Applying...
                              </>
                            ) : (
                              'Apply'
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Enter a valid promo code to get a discount on your dental treatment
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <TreatmentList
                treatments={quote.treatments as Treatment[]}
                readOnly={true}
                selectedCurrency={selectedCurrency}
                showTotals={true}
                appliedPromoCode={quote.promoCode}
                discountAmount={quote.discountAmount || 0}
                discountType={quote.discountType as 'percentage' | 'fixed_amount'}
                discountValue={quote.discountValue || 0}
              />

              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('treatments')}
                >
                  Back: Treatments
                </Button>
                <Button 
                  onClick={() => setActiveTab('details')}
                >
                  Next: Details
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="patientName">Patient Name</Label>
                      <Input
                        id="patientName"
                        placeholder="Full Name"
                        value={patientName || quote.patientName || ''}
                        onChange={(e) => setPatientName(e.target.value)}
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientEmail">Patient Email</Label>
                      <Input
                        id="patientEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={patientEmail || quote.patientEmail || ''}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientPhone">Patient Phone</Label>
                      <Input
                        id="patientPhone"
                        placeholder="+1 (123) 456-7890"
                        value={patientPhone || quote.patientPhone || ''}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        disabled={mode === 'view'}
                      />
                    </div>

                    {portalType === 'patient' && mode !== 'view' && (
                      <div className="pt-2">
                        <Button 
                          onClick={handleEmailQuote}
                          className="w-full"
                          disabled={!patientEmail}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email Quote to Me
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <TreatmentList
                treatments={quote.treatments as Treatment[]}
                readOnly={true}
                selectedCurrency={selectedCurrency}
                showTotals={true}
                appliedPromoCode={quote.promoCode}
                discountAmount={quote.discountAmount || 0}
                discountType={quote.discountType as 'percentage' | 'fixed_amount'}
                discountValue={quote.discountValue || 0}
              />

              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('promo')}
                >
                  Back: Promo Code
                </Button>

                {mode !== 'view' && (
                  <div className="flex gap-2">
                    {onCancel && (
                      <Button 
                        variant="outline" 
                        onClick={onCancel}
                      >
                        Cancel
                      </Button>
                    )}
                    {onSave && (
                      <Button 
                        onClick={() => {
                          const updatedQuote = {
                            ...quote,
                            patientName,
                            patientEmail,
                            patientPhone,
                          };
                          onSave(updatedQuote);
                        }}
                      >
                        Save Quote
                      </Button>
                    )}
                    {!onSave && portalType === 'patient' && (
                      <Button onClick={handleDownloadPdf}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Download Quote
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QuoteIntegrationWidget;