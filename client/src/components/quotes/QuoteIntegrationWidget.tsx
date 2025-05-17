/**
 * Quote Integration Widget
 * 
 * This component provides a unified interface for interacting with quotes
 * across all three portals (admin, clinic, patient).
 */
import React, { useState } from 'react';
import { useQuoteSystem } from '@/hooks/use-quote-system';
import { QuoteData } from '@/services/quote-integration-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, Send, Download, Plus, Minus, 
  CheckCircle, XCircle, Loader2, DollarSign
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { TreatmentList } from './TreatmentList';

interface QuoteIntegrationWidgetProps {
  portalType: 'admin' | 'clinic' | 'patient';
  quoteId?: string;
  userId?: string; // clinicId or patientId depending on portalType
  onQuoteAction?: (action: string, quoteId: string) => void;
}

export function QuoteIntegrationWidget({ 
  portalType, 
  quoteId, 
  userId,
  onQuoteAction 
}: QuoteIntegrationWidgetProps) {
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [email, setEmail] = useState('');

  // Initialize the quote system with the appropriate portal type and ID
  const quoteSystem = useQuoteSystem(portalType, userId);
  
  // If a specific quoteId is provided, set it as selected
  React.useEffect(() => {
    if (quoteId) {
      quoteSystem.setSelectedQuoteId(quoteId);
    }
  }, [quoteId]);

  // Handle loading state
  if (quoteId && quoteSystem.quoteDetailQuery.isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading quote details...</p>
        </CardContent>
      </Card>
    );
  }

  // If no quoteId is provided or selected, show a quote list
  if (!quoteSystem.selectedQuoteId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Quotes</CardTitle>
          <CardDescription>
            {portalType === 'admin' 
              ? 'Manage all customer quotes' 
              : portalType === 'clinic' 
                ? 'View and manage quotes assigned to your clinic'
                : 'Your dental treatment quotes'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quoteSystem.quotes?.length ? (
            <div className="space-y-2">
              {quoteSystem.quotes.map((quote: QuoteData) => (
                <div 
                  key={quote.quote_id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => quoteSystem.setSelectedQuoteId(quote.quote_id)}
                >
                  <div>
                    <p className="font-medium">{quote.quote_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {quote.patient_info.first_name} {quote.patient_info.last_name} - {quote.created_at}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      quote.status === 'pending' ? 'default' :
                      quote.status === 'in_progress' ? 'secondary' :
                      quote.status === 'completed' ? 'success' : 'outline'
                    }>
                      {quote.status}
                    </Badge>
                    <p className="font-bold text-primary">
                      ${quote.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : quoteSystem.allQuotesQuery.isLoading || 
             quoteSystem.clinicQuotesQuery.isLoading || 
             quoteSystem.patientQuotesQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading quotes...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No quotes found</p>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                {portalType === 'admin' 
                  ? 'There are no quotes in the system yet.'
                  : portalType === 'clinic'
                    ? 'No quotes have been assigned to your clinic yet.'
                    : 'You have not created any quotes yet.'}
              </p>
              {portalType === 'patient' && (
                <Button onClick={() => onQuoteAction?.('create', '')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Quote
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Display a specific quote
  const quote = quoteSystem.currentQuote;
  
  if (!quote) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[400px]">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Quote not found</p>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            The requested quote could not be found or you don't have permission to view it.
          </p>
          <Button onClick={() => quoteSystem.setSelectedQuoteId(null)} variant="outline">
            Back to Quotes
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render quote details
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-muted pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Quote #{quote.quote_id}
              <Badge variant={
                quote.status === 'pending' ? 'default' :
                quote.status === 'in_progress' ? 'secondary' :
                quote.status === 'completed' ? 'success' : 'outline'
              }>
                {quote.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              Created on {new Date(quote.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => quoteSystem.setSelectedQuoteId(null)}
            >
              Back
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => quoteSystem.generatePdfMutation.mutate(quote.quote_id)}
              disabled={quoteSystem.generatePdfMutation.isPending}
            >
              {quoteSystem.generatePdfMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
        {/* Patient Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Patient Information</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p>{quote.patient_info.first_name} {quote.patient_info.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p>{quote.patient_info.country}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{quote.patient_info.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p>{quote.patient_info.phone}</p>
            </div>
            {quote.patient_info.preferred_dates && (
              <div>
                <p className="text-sm text-muted-foreground">Preferred Dates</p>
                <p>{quote.patient_info.preferred_dates}</p>
              </div>
            )}
            {quote.patient_info.additional_notes && (
              <div>
                <p className="text-sm text-muted-foreground">Additional Notes</p>
                <p>{quote.patient_info.additional_notes}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Accommodation</p>
                <p>{quote.patient_info.accommodation_needed ? 'Needed' : 'Not needed'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Airport Transfer</p>
                <p>{quote.patient_info.airport_transfer_needed ? 'Needed' : 'Not needed'}</p>
              </div>
            </div>
          </div>
          
          {/* Email Quote Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Email Quote</h3>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={() => quoteSystem.sendEmailMutation.mutate({ 
                  quoteId: quote.quote_id, 
                  email: email || quote.patient_info.email 
                })}
                disabled={quoteSystem.sendEmailMutation.isPending}
              >
                {quoteSystem.sendEmailMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send
              </Button>
            </div>
          </div>
        </div>
        
        {/* Treatments Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Treatments</h3>
          
          {/* Treatment List Component */}
          <TreatmentList
            treatments={quote.selected_treatments}
            editable={portalType === 'admin' || portalType === 'patient'}
            onUpdateQuantity={
              (treatmentId, quantity) => quoteSystem.updateQuantityMutation.mutate({ 
                quoteId: quote.quote_id, 
                treatmentId, 
                quantity 
              })
            }
            onRemoveTreatment={
              (treatmentId) => quoteSystem.removeTreatmentMutation.mutate({ 
                quoteId: quote.quote_id, 
                treatmentId 
              })
            }
          />
          
          {/* Price Summary */}
          <div className="border rounded-md p-4 mt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${quote.subtotal.toFixed(2)}</span>
            </div>
            
            {quote.discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Discount {quote.promo_code && `(${quote.promo_code})`}</span>
                <span>-${quote.discount.toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${quote.total.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Promo Code Section */}
          {(portalType === 'admin' || portalType === 'patient') && (
            <div className="mt-4">
              {quote.promo_code ? (
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted">
                  <div>
                    <p className="text-sm text-muted-foreground">Applied Promo Code</p>
                    <p className="font-medium">{quote.promo_code}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => quoteSystem.removePromoCodeMutation.mutate(quote.quote_id)}
                    disabled={quoteSystem.removePromoCodeMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <Button
                    onClick={() => {
                      if (promoCode) {
                        quoteSystem.applyPromoCodeMutation.mutate({ 
                          quoteId: quote.quote_id, 
                          promoCode 
                        });
                        setPromoCode('');
                      } else {
                        toast({
                          title: "Promo Code Required",
                          description: "Please enter a promo code",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={!promoCode || quoteSystem.applyPromoCodeMutation.isPending}
                  >
                    {quoteSystem.applyPromoCodeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Apply
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-6 bg-muted/50">
        <Button 
          variant="outline" 
          onClick={() => quoteSystem.setSelectedQuoteId(null)}
        >
          Back to Quotes
        </Button>
        
        <div className="flex gap-2">
          {/* Additional Actions - For Admin and Clinic */}
          {portalType === 'admin' && (
            <>
              <Button 
                variant="outline"
                onClick={() => onQuoteAction?.('assign', quote.quote_id)}
              >
                Assign to Clinic
              </Button>
              
              <Button 
                variant={quote.status === 'completed' ? 'outline' : 'default'}
                onClick={() => quoteSystem.updateStatusMutation.mutate({ 
                  quoteId: quote.quote_id, 
                  status: quote.status === 'completed' ? 'pending' : 'completed' 
                })}
                disabled={quoteSystem.updateStatusMutation.isPending}
              >
                {quoteSystem.updateStatusMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : quote.status === 'completed' ? (
                  <XCircle className="h-4 w-4 mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {quote.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
              </Button>
            </>
          )}
          
          {portalType === 'clinic' && (
            <Button 
              variant={quote.status === 'in_progress' ? 'outline' : 'default'}
              onClick={() => quoteSystem.updateStatusMutation.mutate({ 
                quoteId: quote.quote_id, 
                status: quote.status === 'in_progress' ? 'pending' : 'in_progress' 
              })}
              disabled={quoteSystem.updateStatusMutation.isPending}
            >
              {quoteSystem.updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : quote.status === 'in_progress' ? (
                <XCircle className="h-4 w-4 mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {quote.status === 'in_progress' ? 'Return to Pending' : 'Start Processing'}
            </Button>
          )}
          
          {/* Patient-specific actions */}
          {portalType === 'patient' && (
            <Button onClick={() => onQuoteAction?.('payment', quote.quote_id)}>
              <DollarSign className="h-4 w-4 mr-2" />
              Proceed to Payment
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}