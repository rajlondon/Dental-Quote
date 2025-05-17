import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Treatment, TreatmentList } from './TreatmentList';
import { useQuoteSystem, PortalType } from '@/hooks/use-quote-system';
import { formatPrice } from '@/utils/format-utils';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuoteIntegrationWidgetProps {
  initialTreatments?: Treatment[];
  readOnly?: boolean;
  selectedCurrency?: 'USD' | 'GBP' | 'EUR';
  title?: string;
  onQuoteCreated?: (quoteData: any) => void;
  apiEndpoint?: string;
  showPromoCodeInput?: boolean;
  initialPromoCode?: string;
  portalType?: PortalType;
}

const QuoteIntegrationWidget: React.FC<QuoteIntegrationWidgetProps> = ({
  initialTreatments,
  readOnly = false,
  selectedCurrency = 'USD',
  title = 'Treatment Quote Builder',
  onQuoteCreated,
  apiEndpoint,
  showPromoCodeInput = true,
  initialPromoCode = '',
  portalType = 'patient',
}) => {
  // State for patient information
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('treatments');
  const [savingQuote, setSavingQuote] = useState(false);
  const [specialOfferLoading, setSpecialOfferLoading] = useState(false);
  const { toast } = useToast();

  // Use our custom hook for quote system functionality
  const quoteSystem = useQuoteSystem(portalType);
  const {
    treatments,
    loading,
    error,
    subtotal,
    discountAmount,
    total,
    promoCode,
    appliedPromoCode,
    discountType,
    discountValue,
    specialOffers,
    updateTreatmentQuantity,
    removeTreatment,
    applyPromoCode,
    clearPromoCode,
    processSpecialOffer,
    saveQuote,
    setPromoCode,
    changeCurrency,
  } = quoteSystem;

  // Handle applying a promo code
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: 'Please enter a promo code',
        description: 'Enter a valid promotional code to apply a discount.',
        variant: 'destructive',
      });
      return;
    }

    await applyPromoCode(promoCode.trim());
  };

  // Handle removing a promo code
  const handleClearPromoCode = async () => {
    await clearPromoCode();
  };

  // Handle applying a special offer
  const handleApplySpecialOffer = async (offerId: string) => {
    setSpecialOfferLoading(true);
    try {
      await processSpecialOffer(offerId);
      toast({
        title: 'Special Offer Applied',
        description: 'The special offer has been applied to your quote.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to apply special offer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSpecialOfferLoading(false);
    }
  };

  // Handle saving the quote
  const handleSaveQuote = async () => {
    if (!patientName.trim() || !patientEmail.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide your name and email to save the quote.',
        variant: 'destructive',
      });
      return;
    }

    setSavingQuote(true);
    try {
      const result = await saveQuote({
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
        notes,
      });

      toast({
        title: 'Quote Saved',
        description: 'Your quote has been saved successfully!',
      });

      if (onQuoteCreated && result) {
        onQuoteCreated(result);
      }

      // Clear form fields after successful save
      setPatientName('');
      setPatientEmail('');
      setPatientPhone('');
      setNotes('');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save your quote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingQuote(false);
    }
  };

  // Handle currency change
  const handleCurrencyChange = (value: string) => {
    changeCurrency(value as 'USD' | 'GBP' | 'EUR');
  };

  // Set initial promo code if provided
  useEffect(() => {
    if (initialPromoCode && !appliedPromoCode) {
      setPromoCode(initialPromoCode);
      applyPromoCode(initialPromoCode);
    }
  }, [initialPromoCode, appliedPromoCode, setPromoCode, applyPromoCode]);

  // If there's an error, display it
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>
                {readOnly
                  ? 'View your treatment quote details'
                  : 'Create and customize your dental treatment quote'}
              </CardDescription>
            </div>
            <Select onValueChange={handleCurrencyChange} defaultValue={selectedCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading quote data...</span>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="treatments">Treatments</TabsTrigger>
                <TabsTrigger value="specialOffers">Special Offers</TabsTrigger>
                <TabsTrigger value="patientInfo" disabled={treatments.length === 0}>
                  Patient Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="treatments" className="space-y-4">
                {showPromoCodeInput && (
                  <div className="flex space-x-2 mb-4">
                    <div className="flex-1">
                      <Label htmlFor="promoCode">Promo Code</Label>
                      <Input
                        id="promoCode"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter promo code"
                        className="w-full"
                        disabled={!!appliedPromoCode || readOnly}
                      />
                    </div>
                    {!appliedPromoCode ? (
                      <Button
                        onClick={handleApplyPromoCode}
                        className="mt-6"
                        variant="outline"
                        disabled={!promoCode.trim() || readOnly}
                      >
                        Apply
                      </Button>
                    ) : (
                      <Button
                        onClick={handleClearPromoCode}
                        className="mt-6"
                        variant="outline"
                        disabled={readOnly}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                )}

                <TreatmentList
                  treatments={treatments}
                  readOnly={readOnly}
                  onQuantityChange={updateTreatmentQuantity}
                  onRemoveTreatment={removeTreatment}
                  selectedCurrency={selectedCurrency}
                  showTotals={true}
                  appliedPromoCode={appliedPromoCode}
                  discountAmount={discountAmount}
                  discountType={discountType || undefined}
                  discountValue={discountValue || undefined}
                />
              </TabsContent>

              <TabsContent value="specialOffers" className="space-y-4">
                {specialOffers.length === 0 ? (
                  <div className="text-center p-6 border rounded-lg border-dashed">
                    <p className="text-muted-foreground">No special offers available at the moment</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specialOffers.map((offer) => (
                      <Card key={offer.id} className="overflow-hidden">
                        {offer.bannerImage && (
                          <div className="h-32 overflow-hidden">
                            <img
                              src={offer.bannerImage}
                              alt={offer.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{offer.title}</CardTitle>
                          <CardDescription>{offer.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm font-medium text-primary">
                            {offer.discountType === 'percentage'
                              ? `${offer.discountValue}% discount`
                              : `${formatPrice(offer.discountValue, selectedCurrency)} off`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Promo code: {offer.promoCode}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={() => handleApplySpecialOffer(offer.id)}
                            disabled={readOnly || specialOfferLoading}
                            className="w-full"
                          >
                            {specialOfferLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Apply Offer'
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="patientInfo" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="Enter your email address"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number (optional)</Label>
                    <Input
                      id="phone"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <textarea
                      id="notes"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional information about your requirements"
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <TreatmentList
                    treatments={treatments}
                    readOnly={true}
                    selectedCurrency={selectedCurrency}
                    showTotals={true}
                    appliedPromoCode={appliedPromoCode}
                    discountAmount={discountAmount}
                    discountType={discountType || undefined}
                    discountValue={discountValue || undefined}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {activeTab === 'patientInfo' && !readOnly ? (
            <div className="w-full">
              <Button
                onClick={handleSaveQuote}
                disabled={savingQuote || !patientName || !patientEmail}
                className="w-full"
              >
                {savingQuote ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Quote'
                )}
              </Button>
            </div>
          ) : (
            <>
              {activeTab !== 'treatments' && (
                <Button
                  variant="outline"
                  onClick={() => setActiveTab(activeTab === 'specialOffers' ? 'treatments' : 'specialOffers')}
                >
                  Back
                </Button>
              )}
              {activeTab !== 'patientInfo' && treatments.length > 0 && !readOnly && (
                <Button
                  onClick={() =>
                    setActiveTab(activeTab === 'treatments' ? 'specialOffers' : 'patientInfo')
                  }
                >
                  Next
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuoteIntegrationWidget;