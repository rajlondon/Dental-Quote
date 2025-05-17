/**
 * Quote Integration Widget Component
 * 
 * This component provides a unified interface for managing quotes across all portals
 * (admin, clinic, and patient). It adapts its functionality based on the portal type.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Mail, 
  Calendar, 
  ClipboardCheck, 
  Check, 
  X, 
  FileText, 
  Building, 
  User 
} from 'lucide-react';
import { TreatmentList } from './TreatmentList';
import { 
  useAdminQuotes, 
  useAdminQuote, 
  useClinicQuotes, 
  useClinicQuote, 
  usePatientQuotes, 
  usePatientQuote,
  useUpdateQuoteStatus,
  useAssignQuote,
  useUnassignQuote,
  useUpdateTreatmentQuantity,
  useRemoveTreatment,
  useSendQuoteEmail,
  useRequestAppointment,
  useDownloadQuotePdf
} from '@/hooks/use-quote-system';
import { QuoteData } from '@/services/quote-integration-service';

export type PortalType = 'admin' | 'clinic' | 'patient';

interface QuoteStatusBadgeProps {
  status: string;
}

function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' = 'default';
  
  switch(status.toLowerCase()) {
    case 'pending':
      variant = 'default';
      break;
    case 'accepted':
      variant = 'success';
      break;
    case 'rejected':
      variant = 'destructive';
      break;
    case 'in progress':
      variant = 'secondary';
      break;
    case 'completed':
      variant = 'outline';
      break;
    default:
      variant = 'default';
  }
  
  return <Badge variant={variant}>{status}</Badge>;
}

interface QuoteListItemProps {
  quote: QuoteData;
  portalType: PortalType;
  onSelect: (quoteId: string) => void;
  isSelected: boolean;
}

function QuoteListItem({ quote, portalType, onSelect, isSelected }: QuoteListItemProps) {
  return (
    <Card 
      className={`mb-2 cursor-pointer hover:bg-accent/10 transition-colors ${isSelected ? 'border-primary' : ''}`} 
      onClick={() => onSelect(quote.id)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{quote.patient_name}</h3>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(quote.created_at).toLocaleDateString()}
            </p>
            {portalType === 'admin' && quote.clinic_name && (
              <p className="text-sm text-muted-foreground">
                Clinic: {quote.clinic_name}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end">
            <QuoteStatusBadge status={quote.status} />
            <p className="mt-1 font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: quote.currency,
              }).format(quote.total)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuoteSystemContextProps {
  portalType: PortalType;
  clinicId?: string;
  patientId?: string;
}

function useQuoteSystemContext({ portalType, clinicId, patientId }: QuoteSystemContextProps) {
  switch(portalType) {
    case 'admin':
      return {
        listHook: useAdminQuotes,
        detailHook: useAdminQuote,
      };
    case 'clinic':
      return {
        listHook: () => useClinicQuotes(clinicId),
        detailHook: (quoteId: string) => useClinicQuote(clinicId, quoteId),
      };
    case 'patient':
      return {
        listHook: () => usePatientQuotes(patientId),
        detailHook: (quoteId: string) => usePatientQuote(patientId, quoteId),
      };
    default:
      throw new Error(`Unsupported portal type: ${portalType}`);
  }
}

export interface QuoteIntegrationWidgetProps {
  portalType: PortalType;
  clinicId?: string;
  patientId?: string;
  viewOnly?: boolean;
  onQuoteAction: (action: string, quoteId: string) => void;
}

export function QuoteIntegrationWidget({ 
  portalType, 
  clinicId,
  patientId,
  viewOnly = false,
  onQuoteAction
}: QuoteIntegrationWidgetProps) {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | undefined>();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  
  const { listHook, detailHook } = useQuoteSystemContext({ portalType, clinicId, patientId });
  
  // Get quotes list
  const { 
    data: quotes, 
    isLoading: isLoadingQuotes, 
    error: quotesError 
  } = listHook();
  
  // Get selected quote details
  const {
    data: selectedQuote,
    isLoading: isLoadingSelectedQuote,
    error: selectedQuoteError
  } = detailHook(selectedQuoteId);
  
  // Mutations
  const updateStatusMutation = useUpdateQuoteStatus();
  const assignQuoteMutation = useAssignQuote();
  const unassignQuoteMutation = useUnassignQuote();
  const updateTreatmentQuantityMutation = useUpdateTreatmentQuantity();
  const removeTreatmentMutation = useRemoveTreatment();
  const sendEmailMutation = useSendQuoteEmail();
  const requestAppointmentMutation = useRequestAppointment();
  const downloadPdfMutation = useDownloadQuotePdf();
  
  // Set the first quote as selected if none is selected
  useEffect(() => {
    if (!selectedQuoteId && quotes && quotes.length > 0) {
      setSelectedQuoteId(quotes[0].id);
    }
  }, [quotes, selectedQuoteId]);
  
  // Handle quote actions
  const handleQuoteAction = (action: string) => {
    if (!selectedQuoteId) return;
    
    switch(action) {
      case 'approve':
        updateStatusMutation.mutate({ quoteId: selectedQuoteId, status: 'accepted' });
        break;
      case 'reject':
        updateStatusMutation.mutate({ quoteId: selectedQuoteId, status: 'rejected' });
        break;
      case 'assign':
        if (clinicId) {
          assignQuoteMutation.mutate({ quoteId: selectedQuoteId, clinicId });
        }
        break;
      case 'unassign':
        unassignQuoteMutation.mutate({ quoteId: selectedQuoteId });
        break;
      case 'download':
        downloadPdfMutation.mutate({ quoteId: selectedQuoteId });
        break;
      case 'request-appointment':
        requestAppointmentMutation.mutate({ quoteId: selectedQuoteId });
        break;
      case 'send-email':
        setEmailDialogOpen(true);
        break;
      default:
        // Forward to parent component for custom actions
        onQuoteAction(action, selectedQuoteId);
    }
  };
  
  const handleSendEmail = () => {
    if (!selectedQuoteId || !emailAddress) return;
    
    sendEmailMutation.mutate(
      { quoteId: selectedQuoteId, email: emailAddress },
      {
        onSuccess: () => {
          setEmailDialogOpen(false);
          setEmailAddress('');
        }
      }
    );
  };
  
  const handleUpdateQuantity = (treatmentId: string, quantity: number) => {
    if (!selectedQuoteId) return;
    
    updateTreatmentQuantityMutation.mutate({
      quoteId: selectedQuoteId,
      treatmentId,
      quantity
    });
  };
  
  const handleRemoveTreatment = (treatmentId: string) => {
    if (!selectedQuoteId) return;
    
    removeTreatmentMutation.mutate({
      quoteId: selectedQuoteId,
      treatmentId
    });
  };
  
  // Loading state
  if (isLoadingQuotes) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-muted-foreground">Loading quotes...</p>
      </div>
    );
  }
  
  // Error state
  if (quotesError) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-destructive">Error loading quotes: {quotesError.message}</p>
      </div>
    );
  }
  
  // No quotes
  if (!quotes || quotes.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-muted-foreground">No quotes found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Quote List */}
      <div className="w-full md:w-1/3 lg:w-1/4">
        <Card>
          <CardHeader>
            <CardTitle>Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[70vh] overflow-y-auto">
              {quotes.map(quote => (
                <QuoteListItem
                  key={quote.id}
                  quote={quote}
                  portalType={portalType}
                  onSelect={setSelectedQuoteId}
                  isSelected={selectedQuoteId === quote.id}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quote Details */}
      <div className="w-full md:w-2/3 lg:w-3/4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quote Details</CardTitle>
            {selectedQuote && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuoteAction('download')}
                  disabled={downloadPdfMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuoteAction('send-email')}
                  disabled={sendEmailMutation.isPending}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Quote
                </Button>
                
                {portalType === 'patient' && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleQuoteAction('request-appointment')}
                    disabled={requestAppointmentMutation.isPending}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Request Appointment
                  </Button>
                )}
                
                {portalType === 'clinic' && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleQuoteAction('approve')}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleQuoteAction('reject')}
                      disabled={updateStatusMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                
                {portalType === 'admin' && (
                  <>
                    {!selectedQuote.clinic_id ? (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleQuoteAction('assign')}
                        disabled={assignQuoteMutation.isPending || !clinicId}
                      >
                        <Building className="h-4 w-4 mr-2" />
                        Assign to Clinic
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleQuoteAction('unassign')}
                        disabled={unassignQuoteMutation.isPending}
                      >
                        <Building className="h-4 w-4 mr-2" />
                        Unassign
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoadingSelectedQuote ? (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-muted-foreground">Loading quote details...</p>
              </div>
            ) : selectedQuoteError ? (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-destructive">Error loading quote: {selectedQuoteError.message}</p>
              </div>
            ) : selectedQuote ? (
              <div>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="treatments">Treatments</TabsTrigger>
                    <TabsTrigger value="patient">Patient Info</TabsTrigger>
                    {selectedQuote.clinic_id && <TabsTrigger value="clinic">Clinic Info</TabsTrigger>}
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Quote Summary</h3>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <QuoteStatusBadge status={selectedQuote.status} />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date Created:</span>
                            <span>{new Date(selectedQuote.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Updated:</span>
                            <span>{new Date(selectedQuote.updated_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Patient:</span>
                            <span>{selectedQuote.patient_name}</span>
                          </div>
                          {selectedQuote.promo_code && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Promo Code:</span>
                              <Badge variant="outline">{selectedQuote.promo_code}</Badge>
                            </div>
                          )}
                          {selectedQuote.special_offer_name && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Special Offer:</span>
                              <Badge>{selectedQuote.special_offer_name}</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Pricing</h3>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: selectedQuote.currency,
                              }).format(selectedQuote.subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Discount:</span>
                            <span>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: selectedQuote.currency,
                              }).format(selectedQuote.discount_amount)}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: selectedQuote.currency,
                              }).format(selectedQuote.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedQuote.notes && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">Notes</h3>
                        <p className="text-muted-foreground">{selectedQuote.notes}</p>
                      </div>
                    )}
                    
                    {selectedQuote.preferred_dates && selectedQuote.preferred_dates.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Preferred Dates</h3>
                        <ul className="list-disc list-inside">
                          {selectedQuote.preferred_dates.map((date, index) => (
                            <li key={index} className="text-muted-foreground">{date}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="treatments">
                    <TreatmentList 
                      treatments={selectedQuote.treatments}
                      editable={!viewOnly && (portalType === 'admin' || portalType === 'clinic')}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveTreatment={handleRemoveTreatment}
                      showClinicReferences={portalType === 'clinic'}
                    />
                  </TabsContent>
                  
                  <TabsContent value="patient">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Patient Information</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-muted-foreground block">Name:</span>
                            <span className="font-medium">{selectedQuote.patient_name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Email:</span>
                            <span className="font-medium">{selectedQuote.patient_email}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Phone:</span>
                            <span className="font-medium">{selectedQuote.patient_phone}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Country:</span>
                            <span className="font-medium">{selectedQuote.patient_country}</span>
                          </div>
                          {selectedQuote.preferred_contact_method && (
                            <div>
                              <span className="text-muted-foreground block">Preferred Contact Method:</span>
                              <span className="font-medium">{selectedQuote.preferred_contact_method}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {selectedQuote.clinic_id && (
                    <TabsContent value="clinic">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Clinic Information</h3>
                          <div className="space-y-2">
                            {selectedQuote.clinic_logo && (
                              <div className="mb-4">
                                <img
                                  src={selectedQuote.clinic_logo}
                                  alt={selectedQuote.clinic_name}
                                  className="max-h-24 mb-2"
                                />
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground block">Name:</span>
                              <span className="font-medium">{selectedQuote.clinic_name}</span>
                            </div>
                            {selectedQuote.clinic_location && (
                              <div>
                                <span className="text-muted-foreground block">Location:</span>
                                <span className="font-medium">{selectedQuote.clinic_location}</span>
                              </div>
                            )}
                            {selectedQuote.clinic_website && (
                              <div>
                                <span className="text-muted-foreground block">Website:</span>
                                <a 
                                  href={selectedQuote.clinic_website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {selectedQuote.clinic_website}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {selectedQuote.clinic_description && (
                          <div>
                            <h3 className="text-lg font-medium mb-2">About</h3>
                            <p className="text-muted-foreground">{selectedQuote.clinic_description}</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-muted-foreground">Select a quote to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quote by Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="col-span-3 p-2 border rounded"
                placeholder="Enter recipient email"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              disabled={!emailAddress || sendEmailMutation.isPending} 
              onClick={handleSendEmail}
            >
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}