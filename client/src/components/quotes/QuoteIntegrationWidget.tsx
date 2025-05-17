/**
 * Quote Integration Widget Component
 * 
 * This component provides a unified interface for managing quotes across all portals
 * (admin, clinic, and patient). It adapts its functionality based on the portal type.
 */
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TreatmentList } from './TreatmentList';
import { 
  useAdminQuotes, useAdminQuote, 
  useClinicQuotes, useClinicQuote,
  usePatientQuotes, usePatientQuote,
  useUpdateQuoteStatus, useAssignQuote, useUnassignQuote,
  useUpdateTreatmentQuantity, useRemoveTreatment,
  useSendQuoteEmail, useRequestAppointment, useDownloadQuotePdf
} from '@/hooks/use-quote-system';
import { useClinics } from '@/hooks/use-clinics';
import { Loader2, Download, Mail, Calendar, UserCheck } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { QuoteData } from '@/services/quote-integration-service';

// Portal type definitions
export type PortalType = 'admin' | 'clinic' | 'patient';

interface QuoteStatusBadgeProps {
  status: string;
}

function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  
  switch (status.toLowerCase()) {
    case 'pending':
      variant = 'outline';
      break;
    case 'confirmed':
      variant = 'default';
      break;
    case 'completed':
      variant = 'secondary';
      break;
    case 'cancelled':
      variant = 'destructive';
      break;
    default:
      variant = 'outline';
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
  const formattedDate = quote.created_at 
    ? format(new Date(quote.created_at), 'MMM d, yyyy')
    : 'Unknown date';
  
  const bgClass = isSelected ? 'bg-muted' : 'hover:bg-muted/50';
  
  return (
    <div 
      className={`p-4 cursor-pointer rounded-md mb-2 ${bgClass} transition-colors`}
      onClick={() => onSelect(quote.id)}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="font-medium">
          {quote.patient_name || 'No patient name'}
        </div>
        <QuoteStatusBadge status={quote.status} />
      </div>
      <div className="text-sm text-muted-foreground mb-1">
        {formattedDate}
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm">
          {quote.treatments.length} treatments | 
          {quote.currency} {quote.total.toFixed(2)}
        </div>
        {quote.clinic_name && portalType === 'admin' && (
          <div className="text-xs text-muted-foreground">
            {quote.clinic_name}
          </div>
        )}
      </div>
    </div>
  );
}

interface QuoteSystemContextProps {
  portalType: PortalType;
  clinicId?: string;
  patientId?: string;
}

function useQuoteSystemContext({ portalType, clinicId, patientId }: QuoteSystemContextProps) {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  
  // Query hooks based on portal type
  const adminQuotesQuery = useAdminQuotes();
  const adminQuoteQuery = useAdminQuote(selectedQuoteId || undefined);
  
  const clinicQuotesQuery = useClinicQuotes(clinicId);
  const clinicQuoteQuery = useClinicQuote(clinicId, selectedQuoteId || undefined);
  
  const patientQuotesQuery = usePatientQuotes(patientId);
  const patientQuoteQuery = usePatientQuote(patientId, selectedQuoteId || undefined);
  
  // Mutation hooks
  const updateStatusMutation = useUpdateQuoteStatus();
  const assignQuoteMutation = useAssignQuote();
  const unassignQuoteMutation = useUnassignQuote();
  const updateTreatmentQuantityMutation = useUpdateTreatmentQuantity();
  const removeTreatmentMutation = useRemoveTreatment();
  const sendEmailMutation = useSendQuoteEmail();
  const requestAppointmentMutation = useRequestAppointment();
  const downloadPdfMutation = useDownloadQuotePdf();
  
  // Clinics data for assignment
  const clinicsQuery = useClinics();
  
  // Helper for refetching quotes
  const queryClient = useQueryClient();
  const refetchQuotes = () => {
    if (portalType === 'admin') {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quotes'] });
    } else if (portalType === 'clinic' && clinicId) {
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/quotes', clinicId] });
    } else if (portalType === 'patient' && patientId) {
      queryClient.invalidateQueries({ queryKey: ['/api/patient/quotes', patientId] });
    }
  };
  
  // Determine which queries to use based on portal type
  const allQuotesQuery = portalType === 'admin' 
    ? adminQuotesQuery 
    : portalType === 'clinic' 
      ? clinicQuotesQuery 
      : patientQuotesQuery;
  
  const selectedQuoteQuery = portalType === 'admin' 
    ? adminQuoteQuery 
    : portalType === 'clinic' 
      ? clinicQuoteQuery 
      : patientQuoteQuery;
  
  return {
    selectedQuoteId,
    setSelectedQuoteId,
    allQuotesQuery,
    selectedQuoteQuery,
    updateStatusMutation,
    assignQuoteMutation,
    unassignQuoteMutation,
    updateTreatmentQuantityMutation,
    removeTreatmentMutation,
    sendEmailMutation,
    requestAppointmentMutation,
    downloadPdfMutation,
    clinicsQuery,
    quotes: allQuotesQuery.data,
    selectedQuote: selectedQuoteQuery.data,
    isLoadingQuotes: allQuotesQuery.isLoading,
    isLoadingSelectedQuote: selectedQuoteQuery.isLoading,
    refetchQuotes
  };
}

export interface QuoteIntegrationWidgetProps {
  portalType: PortalType;
  clinicId?: string;
  patientId?: string;
  viewOnly?: boolean;
}

export function QuoteIntegrationWidget({ 
  portalType, 
  clinicId, 
  patientId,
  viewOnly = false
}: QuoteIntegrationWidgetProps) {
  const quoteSystem = useQuoteSystemContext({ portalType, clinicId, patientId });
  const [assignClinicId, setAssignClinicId] = useState<string>("");
  const [statusValue, setStatusValue] = useState<string>("");
  
  const handleStatusChange = (quoteId: string, newStatus: string) => {
    quoteSystem.updateStatusMutation.mutate({
      quoteId,
      status: newStatus
    });
  };
  
  const handleAssignClinic = (quoteId: string) => {
    if (assignClinicId) {
      quoteSystem.assignQuoteMutation.mutate({
        quoteId,
        clinicId: assignClinicId
      });
    }
  };
  
  const handleUnassignClinic = (quoteId: string) => {
    quoteSystem.unassignQuoteMutation.mutate({
      quoteId
    });
  };
  
  const handleSendEmail = (quoteId: string, email: string) => {
    quoteSystem.sendEmailMutation.mutate({
      quoteId,
      email
    });
  };
  
  const handleRequestAppointment = (quoteId: string) => {
    quoteSystem.requestAppointmentMutation.mutate({
      quoteId
    });
  };
  
  const handleDownloadPdf = (quoteId: string) => {
    quoteSystem.downloadPdfMutation.mutate({
      quoteId
    });
  };
  
  const handleUpdateTreatmentQuantity = (quoteId: string, treatmentId: string, quantity: number) => {
    quoteSystem.updateTreatmentQuantityMutation.mutate({
      quoteId,
      treatmentId,
      quantity
    });
  };
  
  const handleRemoveTreatment = (quoteId: string, treatmentId: string) => {
    quoteSystem.removeTreatmentMutation.mutate({
      quoteId,
      treatmentId
    });
  };
  
  // Loading state
  if (quoteSystem.isLoadingQuotes) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // No quotes state
  if (!quoteSystem.quotes || quoteSystem.quotes.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Quotes</CardTitle>
          <CardDescription>
            {portalType === 'admin' 
              ? 'No quotes available in the system.' 
              : portalType === 'clinic' 
                ? 'No quotes assigned to this clinic.' 
                : 'You have no quotes yet.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground text-center mb-4">
            {portalType === 'admin' 
              ? 'Patients need to submit quote requests through the quote builder.' 
              : portalType === 'clinic' 
                ? 'Admin needs to assign quotes to this clinic.' 
                : 'Get started by creating a new quote.'}
          </p>
          {portalType === 'patient' && (
            <Button variant="outline">Create New Quote</Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid md:grid-cols-12 gap-4">
      {/* Quote list sidebar */}
      <div className="md:col-span-4 lg:col-span-3">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>My Quotes</CardTitle>
            <CardDescription>
              {portalType === 'admin' 
                ? 'Manage all patient quotes' 
                : portalType === 'clinic' 
                  ? 'Quotes assigned to your clinic' 
                  : 'Your treatment quotes'}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            {quoteSystem.quotes.map((quote) => (
              <QuoteListItem
                key={quote.id}
                quote={quote}
                portalType={portalType}
                onSelect={quoteSystem.setSelectedQuoteId}
                isSelected={quote.id === quoteSystem.selectedQuoteId}
              />
            ))}
          </CardContent>
        </Card>
      </div>
      
      {/* Quote details */}
      <div className="md:col-span-8 lg:col-span-9">
        {quoteSystem.selectedQuoteId ? (
          <Card className="w-full">
            {quoteSystem.isLoadingSelectedQuote ? (
              <CardContent className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            ) : !quoteSystem.selectedQuote ? (
              <CardContent className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Quote not found</p>
              </CardContent>
            ) : (
              <>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Quote #{quoteSystem.selectedQuote.id.substring(0, 8)}</CardTitle>
                      <CardDescription>
                        Created on {format(new Date(quoteSystem.selectedQuote.created_at), 'MMMM d, yyyy')}
                      </CardDescription>
                    </div>
                    <QuoteStatusBadge status={quoteSystem.selectedQuote.status} />
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="details">
                    <TabsList className="mb-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="treatments">Treatments</TabsTrigger>
                      <TabsTrigger value="patient">Patient</TabsTrigger>
                      {portalType === 'admin' && (
                        <TabsTrigger value="assignment">Assignment</TabsTrigger>
                      )}
                    </TabsList>
                    
                    <TabsContent value="details">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Status</h4>
                            <div className="flex items-center">
                              {viewOnly ? (
                                <p>{quoteSystem.selectedQuote.status}</p>
                              ) : (
                                <Select 
                                  value={statusValue || quoteSystem.selectedQuote.status} 
                                  onValueChange={(value) => {
                                    setStatusValue(value);
                                    handleStatusChange(quoteSystem.selectedQuote.id, value);
                                  }}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder={quoteSystem.selectedQuote.status} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">Total</h4>
                            <p className="text-lg font-semibold">
                              {quoteSystem.selectedQuote.currency} {quoteSystem.selectedQuote.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Subtotal</h4>
                          <p>{quoteSystem.selectedQuote.currency} {quoteSystem.selectedQuote.subtotal.toFixed(2)}</p>
                        </div>
                        
                        {quoteSystem.selectedQuote.discount_amount > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Discount</h4>
                            <p>- {quoteSystem.selectedQuote.currency} {quoteSystem.selectedQuote.discount_amount.toFixed(2)}</p>
                            {quoteSystem.selectedQuote.promo_code && (
                              <p className="text-xs text-muted-foreground">Promo code: {quoteSystem.selectedQuote.promo_code}</p>
                            )}
                          </div>
                        )}
                        
                        {quoteSystem.selectedQuote.clinic_name && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Assigned Clinic</h4>
                            <p>{quoteSystem.selectedQuote.clinic_name}</p>
                          </div>
                        )}
                        
                        {quoteSystem.selectedQuote.special_offer_name && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Special Offer</h4>
                            <p>{quoteSystem.selectedQuote.special_offer_name}</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="treatments">
                      <TreatmentList 
                        treatments={quoteSystem.selectedQuote.treatments} 
                        editable={!viewOnly && (portalType === 'admin' || portalType === 'clinic')}
                        onUpdateQuantity={
                          (treatmentId, quantity) => 
                            handleUpdateTreatmentQuantity(quoteSystem.selectedQuote.id, treatmentId, quantity)
                        }
                        onRemoveTreatment={
                          (treatmentId) => 
                            handleRemoveTreatment(quoteSystem.selectedQuote.id, treatmentId)
                        }
                        showClinicReferences={portalType !== 'patient'}
                      />
                    </TabsContent>
                    
                    <TabsContent value="patient">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Name</h4>
                          <p>{quoteSystem.selectedQuote.patient_name}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Email</h4>
                          <p>{quoteSystem.selectedQuote.patient_email}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Phone</h4>
                          <p>{quoteSystem.selectedQuote.patient_phone || 'Not provided'}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Country</h4>
                          <p>{quoteSystem.selectedQuote.patient_country}</p>
                        </div>
                        
                        {quoteSystem.selectedQuote.preferred_contact_method && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Preferred Contact Method</h4>
                            <p>{quoteSystem.selectedQuote.preferred_contact_method}</p>
                          </div>
                        )}
                        
                        {quoteSystem.selectedQuote.preferred_dates && 
                         quoteSystem.selectedQuote.preferred_dates.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Preferred Dates</h4>
                            <ul className="list-disc pl-5">
                              {quoteSystem.selectedQuote.preferred_dates.map((date, index) => (
                                <li key={index}>{date}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {quoteSystem.selectedQuote.notes && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Notes</h4>
                            <p>{quoteSystem.selectedQuote.notes}</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    {portalType === 'admin' && (
                      <TabsContent value="assignment">
                        <div className="space-y-4">
                          {quoteSystem.selectedQuote.clinic_id ? (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Currently Assigned To</h4>
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{quoteSystem.selectedQuote.clinic_name}</p>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline">Unassign</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Unassign Quote</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to unassign this quote from {quoteSystem.selectedQuote.clinic_name}?
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleUnassignClinic(quoteSystem.selectedQuote.id)}
                                      >
                                        Unassign
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Assign to Clinic</h4>
                              <div className="flex items-end gap-2">
                                <div className="flex-1">
                                  <Select value={assignClinicId} onValueChange={setAssignClinicId}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a clinic" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {quoteSystem.clinicsQuery.isLoading ? (
                                        <div className="flex items-center justify-center p-2">
                                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        </div>
                                      ) : quoteSystem.clinicsQuery.data?.map(clinic => (
                                        <SelectItem key={clinic.id} value={clinic.id}>
                                          {clinic.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button 
                                  disabled={!assignClinicId} 
                                  onClick={() => handleAssignClinic(quoteSystem.selectedQuote.id)}
                                >
                                  Assign
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </CardContent>
                
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadPdf(quoteSystem.selectedQuote.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Send via Email
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Quote</DialogTitle>
                          <DialogDescription>
                            Send the quote to the patient or another email address.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Button 
                            className="w-full"
                            onClick={() => handleSendEmail(quoteSystem.selectedQuote.id, quoteSystem.selectedQuote.patient_email)}
                          >
                            Send to {quoteSystem.selectedQuote.patient_email}
                          </Button>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" type="button">
                            Close
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {portalType === 'patient' && (
                    <Button 
                      onClick={() => handleRequestAppointment(quoteSystem.selectedQuote.id)}
                      disabled={quoteSystem.selectedQuote.status !== 'confirmed'}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Request Appointment
                    </Button>
                  )}
                  
                  {portalType === 'clinic' && (
                    <Button 
                      onClick={() => handleStatusChange(quoteSystem.selectedQuote.id, 'confirmed')}
                      disabled={quoteSystem.selectedQuote.status !== 'pending'}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Confirm Quote
                    </Button>
                  )}
                </CardFooter>
              </>
            )}
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
            <h3 className="text-lg font-medium mb-2">Select a quote</h3>
            <p className="text-muted-foreground">
              Choose a quote from the list to view its details
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}