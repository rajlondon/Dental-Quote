import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Tag, X } from 'lucide-react';
import TreatmentList, { TreatmentLineItem } from './TreatmentList';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format-utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAutoApplyCode } from '@/hooks/use-auto-apply-code';

// Define API service types
interface QuoteService {
  initialize: () => Promise<void>;
  addTreatment: (treatmentId: string, quantity: number) => Promise<void>;
  removeTreatment: (treatmentId: string) => Promise<void>;
  updateQuantity: (treatmentId: string, quantity: number) => Promise<void>;
  applyPromoCode: (promoCode: string) => Promise<{ success: boolean; message?: string }>;
  clearPromoCode: () => Promise<void>;
  processOffer: (offerId: string) => Promise<void>;
  submitPatientInfo: (patientInfo: PatientInfo) => Promise<void>;
  saveQuote: () => Promise<{ quoteId: string }>;
  getState: () => Promise<QuoteState>;
}

// Define patient info form schema
const patientInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  city: z.string().optional(),
  preferredCurrency: z.string().optional(),
  preferredTravelDate: z.string().optional(),
  notes: z.string().optional()
});

// Define types
type PatientInfo = z.infer<typeof patientInfoSchema>;

interface QuoteState {
  treatments: TreatmentLineItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  promoCode?: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  currency: string;
  patientInfo?: PatientInfo;
}

interface QuoteIntegrationWidgetProps {
  quoteService: QuoteService;
  initialCurrency?: string;
  initialTab?: string;
  showPromoCodeSection?: boolean;
  showPatientInfoSection?: boolean;
  onQuoteSaved?: (quoteId: string) => void;
  onTabChange?: (tabValue: string) => void;
  className?: string;
}

/**
 * A widget for integrating with the quote generation system
 * This component handles the full quote flow from treatment selection to saving
 */
const QuoteIntegrationWidget: React.FC<QuoteIntegrationWidgetProps> = ({
  quoteService,
  initialCurrency = 'USD',
  initialTab = 'treatments',
  showPromoCodeSection = true,
  showPatientInfoSection = true,
  onQuoteSaved,
  onTabChange,
  className = ''
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quoteState, setQuoteState] = useState<QuoteState>({
    treatments: [],
    subtotal: 0,
    discountAmount: 0,
    total: 0,
    currency: initialCurrency
  });
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeError, setPromoCodeError] = useState('');

  // Patient info form
  const patientInfoForm = useForm<PatientInfo>({
    resolver: zodResolver(patientInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      preferredCurrency: initialCurrency,
      preferredTravelDate: '',
      notes: ''
    }
  });

  // Initialize the quote on component mount
  useEffect(() => {
    const initializeQuote = async () => {
      setIsLoading(true);
      try {
        await quoteService.initialize();
        await refreshQuoteState();
      } catch (error) {
        console.error('Error initializing quote:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize quote. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeQuote();
  }, [quoteService]);

  // Auto-apply promo code from URL if present
  useAutoApplyCode((code) => {
    setPromoCode(code);
    handleApplyPromoCode(code);
  });

  // Refresh quote state from the server
  const refreshQuoteState = async () => {
    try {
      const state = await quoteService.getState();
      setQuoteState(state);
      
      // Update promo code state if one is applied
      if (state.promoCode) {
        setPromoCode(state.promoCode);
      }
      
      // Update patient info form if data is available
      if (state.patientInfo) {
        patientInfoForm.reset(state.patientInfo);
      }
      
      return state;
    } catch (error) {
      console.error('Error refreshing quote state:', error);
      return null;
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  // Handle quantity change
  const handleQuantityChange = async (treatmentId: string, quantity: number) => {
    setIsProcessing(true);
    try {
      await quoteService.updateQuantity(treatmentId, quantity);
      await refreshQuoteState();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quantity. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle remove treatment
  const handleRemoveTreatment = async (treatmentId: string) => {
    setIsProcessing(true);
    try {
      await quoteService.removeTreatment(treatmentId);
      await refreshQuoteState();
      toast({
        title: 'Treatment removed',
        description: 'The treatment has been removed from your quote.',
      });
    } catch (error) {
      console.error('Error removing treatment:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove treatment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle apply promo code
  const handleApplyPromoCode = async (code: string) => {
    if (!code.trim()) {
      setPromoCodeError('Please enter a promo code');
      return;
    }

    setIsProcessing(true);
    setPromoCodeError('');
    
    try {
      const result = await quoteService.applyPromoCode(code);
      if (result.success) {
        await refreshQuoteState();
        toast({
          title: 'Promo code applied',
          description: 'Your promo code has been applied successfully.',
        });
      } else {
        setPromoCodeError(result.message || 'Invalid promo code');
        toast({
          title: 'Invalid promo code',
          description: result.message || 'The promo code you entered is invalid or has expired.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      setPromoCodeError('Failed to apply promo code. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to apply promo code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle clear promo code
  const handleClearPromoCode = async () => {
    setIsProcessing(true);
    try {
      await quoteService.clearPromoCode();
      await refreshQuoteState();
      setPromoCode('');
      setPromoCodeError('');
      toast({
        title: 'Promo code removed',
        description: 'Your promo code has been removed.',
      });
    } catch (error) {
      console.error('Error clearing promo code:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear promo code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle patient info submission
  const handlePatientInfoSubmit = async (data: PatientInfo) => {
    setIsProcessing(true);
    try {
      await quoteService.submitPatientInfo(data);
      await refreshQuoteState();
      toast({
        title: 'Patient information saved',
        description: 'Your information has been saved successfully.',
      });
      
      // Move to review tab
      handleTabChange('review');
    } catch (error) {
      console.error('Error submitting patient info:', error);
      toast({
        title: 'Error',
        description: 'Failed to save patient information. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle save quote
  const handleSaveQuote = async () => {
    setIsProcessing(true);
    try {
      const { quoteId } = await quoteService.saveQuote();
      await refreshQuoteState();
      toast({
        title: 'Quote saved',
        description: 'Your quote has been saved successfully.',
      });
      
      if (onQuoteSaved) {
        onQuoteSaved(quoteId);
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to save quote. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading quote information...</span>
      </div>
    );
  }

  return (
    <div className={`quote-integration-widget space-y-4 ${className}`}>
      <Tabs 
        defaultValue={activeTab} 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          {showPatientInfoSection && (
            <TabsTrigger value="patient-info">Patient Info</TabsTrigger>
          )}
          <TabsTrigger value="review">Review & Save</TabsTrigger>
        </TabsList>
        
        {/* Treatments Tab */}
        <TabsContent value="treatments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Selected Treatments</CardTitle>
              <CardDescription>
                View and manage your selected dental treatments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TreatmentList
                treatments={quoteState.treatments}
                currency={quoteState.currency}
                discountType={quoteState.discountType}
                discountValue={quoteState.discountValue}
                promoCode={quoteState.promoCode}
                onQuantityChange={handleQuantityChange}
                onRemoveTreatment={handleRemoveTreatment}
              />
            </CardContent>
          </Card>
          
          {/* Promo Code Section */}
          {showPromoCodeSection && (
            <Card>
              <CardHeader>
                <CardTitle>Promo Code</CardTitle>
                <CardDescription>
                  Enter a promo code to get a discount on your treatment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 items-start">
                  {quoteState.promoCode ? (
                    <div className="bg-muted p-3 rounded-md flex items-center w-full">
                      <Tag className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm font-medium">{quoteState.promoCode}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {quoteState.discountType === 'percentage' 
                          ? `(${quoteState.discountValue}% off)` 
                          : `(${formatCurrency(quoteState.discountValue || 0, quoteState.currency)} off)`}
                      </span>
                      <div className="flex-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={handleClearPromoCode}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <Input
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Enter promo code"
                          className="uppercase"
                          aria-label="Promo code"
                        />
                        {promoCodeError && (
                          <p className="text-xs text-destructive mt-1">{promoCodeError}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleApplyPromoCode(promoCode)}
                        disabled={isProcessing || !promoCode}
                        className="shrink-0"
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Apply
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => handleTabChange('patient-info')}
              disabled={quoteState.treatments.length === 0}
              size="lg"
            >
              Next: Patient Information
            </Button>
          </div>
        </TabsContent>
        
        {/* Patient Info Tab */}
        {showPatientInfoSection && (
          <TabsContent value="patient-info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>
                  Please provide your contact information for your quote
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...patientInfoForm}>
                  <form onSubmit={patientInfoForm.handleSubmit(handlePatientInfoSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={patientInfoForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={patientInfoForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={patientInfoForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john.doe@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={patientInfoForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 123 456 7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={patientInfoForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="United States" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={patientInfoForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={patientInfoForm.control}
                      name="preferredTravelDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Travel Date (optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            When would you like to travel for your treatment?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={patientInfoForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Any special requirements or questions" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => handleTabChange('treatments')}>
                        Back
                      </Button>
                      <Button type="submit" disabled={isProcessing}>
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Next: Review'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {/* Review Tab */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
              <CardDescription>
                Review your dental treatment quote before saving
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TreatmentList
                treatments={quoteState.treatments}
                currency={quoteState.currency}
                discountType={quoteState.discountType}
                discountValue={quoteState.discountValue}
                promoCode={quoteState.promoCode}
                isReadOnly={true}
              />
              
              {quoteState.patientInfo && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p>
                        {quoteState.patientInfo.firstName} {quoteState.patientInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{quoteState.patientInfo.email}</p>
                    </div>
                    {quoteState.patientInfo.phone && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p>{quoteState.patientInfo.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Location</p>
                      <p>
                        {quoteState.patientInfo.city && `${quoteState.patientInfo.city}, `}
                        {quoteState.patientInfo.country}
                      </p>
                    </div>
                    {quoteState.patientInfo.preferredTravelDate && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Preferred Travel Date
                        </p>
                        <p>{quoteState.patientInfo.preferredTravelDate}</p>
                      </div>
                    )}
                    {quoteState.patientInfo.notes && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Notes</p>
                        <p>{quoteState.patientInfo.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => handleTabChange(showPatientInfoSection ? 'patient-info' : 'treatments')}
              >
                Back
              </Button>
              <Button onClick={handleSaveQuote} disabled={isProcessing || quoteState.treatments.length === 0}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Quote'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuoteIntegrationWidget;