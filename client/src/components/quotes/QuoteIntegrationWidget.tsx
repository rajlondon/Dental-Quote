import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { TreatmentList, Treatment } from './TreatmentList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileDownIcon, ClockIcon, CheckCircleIcon, RefreshCwIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { quoteIntegrationService, QuoteData } from '@/services/quote-integration-service';

export interface QuoteIntegrationWidgetProps {
  portalType: 'admin' | 'clinic' | 'patient';
  patientId?: string;
  clinicId?: string;
  onQuoteAction?: (action: string, quoteId: string) => void;
}

export function QuoteIntegrationWidget({
  portalType,
  patientId,
  clinicId,
  onQuoteAction,
}: QuoteIntegrationWidgetProps) {
  const { quoteId } = useParams();
  const [activeTab, setActiveTab] = useState('list');
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Function to format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'viewed': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Function to display currency values
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  // Load quotes based on portal type
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let fetchedQuotes: QuoteData[] = [];

        if (portalType === 'admin') {
          fetchedQuotes = await quoteIntegrationService.getAdminQuotes();
        } else if (portalType === 'clinic' && clinicId) {
          fetchedQuotes = await quoteIntegrationService.getClinicQuotes(clinicId);
        } else if (portalType === 'patient' && patientId) {
          fetchedQuotes = await quoteIntegrationService.getPatientQuotes(patientId);
        }

        setQuotes(fetchedQuotes);

        // If we have a quoteId, fetch that specific quote
        if (quoteId) {
          await fetchQuoteDetails(quoteId);
          setActiveTab('details');
        }
      } catch (err: any) {
        console.error('Error fetching quotes:', err);
        setError(err.message || 'Failed to load quotes');
        toast({
          title: 'Error',
          description: 'Failed to load quotes. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [portalType, patientId, clinicId, quoteId]);

  // Function to fetch a specific quote
  const fetchQuoteDetails = async (id: string) => {
    try {
      setLoading(true);
      
      let fetchedQuote: QuoteData;

      if (portalType === 'admin') {
        fetchedQuote = await quoteIntegrationService.getAdminQuote(id);
      } else if (portalType === 'clinic' && clinicId) {
        fetchedQuote = await quoteIntegrationService.getClinicQuote(clinicId, id);
      } else if (portalType === 'patient' && patientId) {
        fetchedQuote = await quoteIntegrationService.getPatientQuote(patientId, id);
      } else {
        throw new Error('Invalid portal configuration');
      }

      setQuote(fetchedQuote);
    } catch (err: any) {
      console.error('Error fetching quote details:', err);
      setError(err.message || 'Failed to load quote details');
      toast({
        title: 'Error',
        description: 'Failed to load quote details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle quote actions
  const handleAction = async (action: string, id: string) => {
    try {
      setUpdating(true);
      
      switch (action) {
        case 'download-pdf':
          const pdfBlob = await quoteIntegrationService.downloadQuotePdf(id);
          const url = window.URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `quote-${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast({
            title: 'Success',
            description: 'Quote PDF downloaded successfully',
          });
          break;
          
        case 'update-status':
          // This would typically open a modal for status selection
          // For now, we'll just toggle between 'draft' and 'sent'
          const newStatus = quote?.status === 'draft' ? 'sent' : 'draft';
          await quoteIntegrationService.updateQuoteStatus(id, newStatus);
          
          // Refresh the quote after update
          await fetchQuoteDetails(id);
          
          toast({
            title: 'Status Updated',
            description: `Quote status changed to ${newStatus}`,
          });
          break;
          
        case 'send-email':
          // For demo purposes, we'll just prompt for an email
          const email = prompt('Enter email address to send quote:');
          if (email) {
            await quoteIntegrationService.sendQuoteEmail(id, email);
            toast({
              title: 'Email Sent',
              description: `Quote sent to ${email}`,
            });
          }
          break;
          
        case 'request-appointment':
          await quoteIntegrationService.requestAppointment(id);
          toast({
            title: 'Appointment Requested',
            description: 'Your appointment request has been submitted',
          });
          break;
          
        default:
          // Pass other actions to parent component
          if (onQuoteAction) {
            onQuoteAction(action, id);
          }
      }
    } catch (err: any) {
      console.error(`Error performing action ${action}:`, err);
      toast({
        title: 'Action Failed',
        description: err.message || `Failed to ${action}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  // Function to handle treatment quantity updates
  const handleUpdateQuantity = async (treatmentId: string, quantity: number) => {
    if (!quoteId || !quote) return;
    
    try {
      setUpdating(true);
      await quoteIntegrationService.updateTreatmentQuantity(quoteId, treatmentId, quantity);
      
      // Refresh the quote to get updated totals
      await fetchQuoteDetails(quoteId);
      
      toast({
        title: 'Quantity Updated',
        description: 'Treatment quantity has been updated',
      });
    } catch (err: any) {
      console.error('Error updating treatment quantity:', err);
      toast({
        title: 'Update Failed',
        description: err.message || 'Failed to update quantity. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  // Function to handle treatment removal
  const handleRemoveTreatment = async (treatmentId: string) => {
    if (!quoteId || !quote) return;
    
    if (!confirm('Are you sure you want to remove this treatment?')) {
      return;
    }
    
    try {
      setUpdating(true);
      await quoteIntegrationService.removeTreatment(quoteId, treatmentId);
      
      // Refresh the quote to get updated list and totals
      await fetchQuoteDetails(quoteId);
      
      toast({
        title: 'Treatment Removed',
        description: 'Treatment has been removed from the quote',
      });
    } catch (err: any) {
      console.error('Error removing treatment:', err);
      toast({
        title: 'Removal Failed',
        description: err.message || 'Failed to remove treatment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-gray-900 rounded-full"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render quote list view
  const renderQuoteList = () => {
    if (quotes.length === 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No quotes found.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4">
        {quotes.map((quote) => (
          <Card key={quote.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">
                      Quote #{quote.id.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created: {formatDate(quote.created_at)}
                    </p>
                    {quote.clinic_name && (
                      <p className="text-sm mt-1">
                        <span className="text-muted-foreground">Clinic: </span>
                        {quote.clinic_name}
                      </p>
                    )}
                    <p className="text-sm mt-1">
                      <span className="text-muted-foreground">Patient: </span>
                      {quote.patient_name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge 
                      className={`text-xs px-2 py-1 font-medium border ${getStatusColor(quote.status)}`}
                    >
                      {quote.status.toUpperCase()}
                    </Badge>
                    <p className="font-medium text-lg mt-2">
                      {formatCurrency(quote.total, quote.currency)}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Items: </span>
                    {quote.treatments.length}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction('view-details', quote.id)}
                    >
                      View Details
                    </Button>
                    
                    {/* Render portal-specific action buttons */}
                    {portalType === 'admin' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction('edit', quote.id)}
                        >
                          Edit
                        </Button>
                        {!quote.clinic_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('assign', quote.id)}
                          >
                            Assign to Clinic
                          </Button>
                        )}
                      </>
                    )}
                    
                    {portalType === 'clinic' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('update-status', quote.id)}
                      >
                        Update Status
                      </Button>
                    )}
                    
                    {portalType === 'patient' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('download-pdf', quote.id)}
                      >
                        <FileDownIcon className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render quote detail view
  const renderQuoteDetail = () => {
    if (!quote) {
      return (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Select a quote to view details.</p>
          </CardContent>
        </Card>
      );
    }

    const isEditable = portalType === 'admin' || (portalType === 'clinic' && quote.status === 'draft');

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Quote #{quote.id.substring(0, 8)}</CardTitle>
                <CardDescription>Created on {formatDate(quote.created_at)}</CardDescription>
              </div>
              <Badge 
                className={`text-xs px-2 py-1 font-medium border ${getStatusColor(quote.status)}`}
              >
                {quote.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Patient Information</h3>
                <p className="font-medium">{quote.patient_name}</p>
                <p>{quote.patient_email}</p>
                <p>{quote.patient_phone}</p>
                <p>{quote.patient_country}</p>
              </div>
              
              {quote.clinic_name && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Clinic Information</h3>
                  <p className="font-medium">{quote.clinic_name}</p>
                  {quote.clinic_location && <p>{quote.clinic_location}</p>}
                  {quote.clinic_website && <p>{quote.clinic_website}</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Treatments</h3>
          <TreatmentList 
            treatments={quote.treatments} 
            editable={isEditable}
            onUpdateQuantity={isEditable ? handleUpdateQuantity : undefined}
            onRemoveTreatment={isEditable ? handleRemoveTreatment : undefined}
            showClinicReferences={portalType === 'clinic' || portalType === 'admin'}
          />
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(quote.subtotal, quote.currency)}</span>
              </div>
              
              {quote.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Discount {quote.promo_code && `(${quote.promo_code})`}</span>
                  <span className="text-green-600">
                    -{formatCurrency(quote.discount_amount, quote.currency)}
                  </span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-medium text-lg pt-1">
                <span>Total</span>
                <span>{formatCurrency(quote.total, quote.currency)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => handleAction('download-pdf', quote.id)}
              disabled={updating}
            >
              <FileDownIcon className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            
            {/* Render portal-specific actions */}
            {portalType === 'admin' && (
              <Button
                variant="default"
                onClick={() => handleAction('update-status', quote.id)}
                disabled={updating}
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            )}
            
            {portalType === 'clinic' && (
              <Button
                variant="default"
                onClick={() => handleAction('send-email', quote.id)}
                disabled={updating}
              >
                Send to Patient
              </Button>
            )}
            
            {portalType === 'patient' && quote.status !== 'accepted' && (
              <Button
                variant="default"
                onClick={() => handleAction('request-appointment', quote.id)}
                disabled={updating}
              >
                <ClockIcon className="h-4 w-4 mr-2" />
                Request Appointment
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  };

  // Main component render
  return (
    <div className="w-full">
      {quoteId ? (
        // Single quote detail view
        renderQuoteDetail()
      ) : (
        // Tab view for list and details
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="list">Quote List</TabsTrigger>
            <TabsTrigger value="details" disabled={!quote}>Quote Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-0">
            {renderQuoteList()}
          </TabsContent>
          
          <TabsContent value="details" className="mt-0">
            {renderQuoteDetail()}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}