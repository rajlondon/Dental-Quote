import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, FileText, Printer, Mail, Calendar, Check, X, ArrowRight, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TreatmentList } from './TreatmentList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useQuoteSystem, type QuoteData } from '@/hooks/use-quote-system';

export interface QuoteIntegrationWidgetProps {
  portalType: 'admin' | 'clinic' | 'patient';
  quoteId?: string;
  patientId?: string;
  clinicId?: string;
  onQuoteAction?: (action: string, quoteId: string) => void;
}

export function QuoteIntegrationWidget({ 
  portalType, 
  quoteId, 
  patientId, 
  clinicId,
  onQuoteAction 
}: QuoteIntegrationWidgetProps) {
  const quoteSystem = useQuoteSystem({ portalType, patientId, clinicId });
  const [activeTab, setActiveTab] = useState('details');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);

  useEffect(() => {
    // If we have a specific quote ID, load that quote's details
    if (quoteId) {
      quoteSystem.loadQuoteDetails(quoteId);
    } 
    // Otherwise, load all quotes for this portal
    else {
      quoteSystem.loadQuotes();
    }
  }, [quoteId, quoteSystem]);

  // If we're loading a specific quote and it's still loading
  if (quoteId && quoteSystem.loading && !quoteSystem.currentQuote) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If we're showing a specific quote
  if (quoteId && quoteSystem.currentQuote) {
    const quote = quoteSystem.currentQuote;
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      sent: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-gray-100 text-gray-800',
      expired: 'bg-orange-100 text-orange-800'
    };

    const handleUpdateStatus = (status: string) => {
      quoteSystem.updateQuoteStatus(quoteId, status);
    };

    const handleSendEmail = () => {
      if (recipientEmail.trim()) {
        quoteSystem.sendQuoteEmail(quoteId, recipientEmail.trim())
          .then(() => {
            setEmailDialogOpen(false);
            setRecipientEmail('');
          });
      }
    };

    const handleRequestAppointment = () => {
      quoteSystem.requestAppointment(quoteId)
        .then(() => {
          setAppointmentDialogOpen(false);
        });
    };

    const handleDownloadPdf = () => {
      quoteSystem.downloadQuotePdf(quoteId);
    };

    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Quote #{quote.id}</CardTitle>
              <CardDescription>
                Created {quote.created_at ? formatDistanceToNow(new Date(quote.created_at), { addSuffix: true }) : 'recently'}
              </CardDescription>
            </div>
            <Badge className={statusColors[quote.status || 'pending']}>
              {quote.status?.toUpperCase() || 'PENDING'}
            </Badge>
          </div>
        </CardHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="px-6">
          <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-2 sm:grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="treatments">Treatments</TabsTrigger>
            {portalType !== 'patient' && <TabsTrigger value="actions">Actions</TabsTrigger>}
          </TabsList>

          <TabsContent value="details" className="pt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Patient Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {quote.patient_name || 'Not provided'}</p>
                  <p><span className="font-medium">Email:</span> {quote.patient_email || 'Not provided'}</p>
                  <p><span className="font-medium">Phone:</span> {quote.patient_phone || 'Not provided'}</p>
                  {quote.patient_notes && (
                    <div>
                      <span className="font-medium">Notes:</span>
                      <p className="mt-1 text-sm text-gray-600">{quote.patient_notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Quote Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Created:</span> {quote.created_at ? new Date(quote.created_at).toLocaleString() : 'N/A'}</p>
                  <p><span className="font-medium">Updated:</span> {quote.updated_at ? new Date(quote.updated_at).toLocaleString() : 'N/A'}</p>
                  <p><span className="font-medium">Promo Code:</span> {quote.promo_code || 'None'}</p>
                  <p><span className="font-medium">Discount:</span> {quote.discount_percent ? `${quote.discount_percent}%` : 'None'}</p>
                  {portalType !== 'patient' && quote.clinic_name && (
                    <p><span className="font-medium">Assigned to:</span> {quote.clinic_name}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Financial Summary</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Subtotal</TableCell>
                    <TableCell className="text-right">${quote.subtotal?.toFixed(2) || '0.00'}</TableCell>
                  </TableRow>
                  {quote.discount_amount > 0 && (
                    <TableRow>
                      <TableCell>Discount {quote.promo_code && `(${quote.promo_code})`}</TableCell>
                      <TableCell className="text-right text-red-600">-${quote.discount_amount?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                  )}
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">${quote.total?.toFixed(2) || '0.00'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="treatments" className="pt-4">
            <TreatmentList 
              treatments={quote.treatments || []} 
              readOnly={portalType === 'patient' || quote.status === 'completed' || quote.status === 'accepted'} 
              onUpdateQuantity={(treatmentId, quantity) => 
                quoteSystem.updateTreatmentQuantity(quoteId, treatmentId, quantity)
              }
              onRemoveTreatment={(treatmentId) => 
                quoteSystem.removeTreatment(quoteId, treatmentId)
              }
            />
          </TabsContent>

          {portalType !== 'patient' && (
            <TabsContent value="actions" className="pt-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Update Status</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {portalType === 'admin' && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => handleUpdateStatus('pending')}
                        disabled={quote.status === 'pending'}
                      >
                        Mark as Pending
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleUpdateStatus('assigned')}
                        disabled={quote.status === 'assigned'}
                      >
                        Mark as Assigned
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdateStatus('in_progress')}
                    disabled={quote.status === 'in_progress'}
                  >
                    Mark as In Progress
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdateStatus('sent')}
                    disabled={quote.status === 'sent'}
                  >
                    Mark as Sent
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-green-50 text-green-700 hover:bg-green-100"
                    onClick={() => handleUpdateStatus('accepted')}
                    disabled={quote.status === 'accepted'}
                  >
                    <Check className="h-4 w-4 mr-2" /> Mark as Accepted
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-red-50 text-red-700 hover:bg-red-100"
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={quote.status === 'rejected'}
                  >
                    <X className="h-4 w-4 mr-2" /> Mark as Rejected
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdateStatus('completed')}
                    disabled={quote.status === 'completed'}
                  >
                    Mark as Completed
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdateStatus('cancelled')}
                    disabled={quote.status === 'cancelled'}
                  >
                    Mark as Cancelled
                  </Button>
                </div>

                <Separator className="my-4" />

                <h3 className="text-sm font-medium text-gray-500 mb-2">Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center"
                    onClick={() => setEmailDialogOpen(true)}
                  >
                    <Mail className="h-4 w-4 mr-2" /> Email Quote
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center"
                    onClick={handleDownloadPdf}
                  >
                    <Printer className="h-4 w-4 mr-2" /> Download PDF
                  </Button>
                  {portalType === 'clinic' && (
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center"
                      onClick={() => setAppointmentDialogOpen(true)}
                    >
                      <Calendar className="h-4 w-4 mr-2" /> Schedule Appointment
                    </Button>
                  )}
                  {portalType === 'admin' && quote.clinic_id && (
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center text-red-600"
                      onClick={() => quoteSystem.unassignQuoteFromClinic(quoteId)}
                    >
                      <X className="h-4 w-4 mr-2" /> Unassign from Clinic
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <CardFooter className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => onQuoteAction && onQuoteAction('back', quoteId)}>
            Back to List
          </Button>
          {portalType === 'patient' && (
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={handleDownloadPdf}
                className="flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" /> Download PDF
              </Button>
              {quote.status !== 'accepted' && quote.status !== 'rejected' && (
                <Button 
                  onClick={() => setAppointmentDialogOpen(true)}
                  className="flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" /> Request Consultation
                </Button>
              )}
            </div>
          )}
        </CardFooter>

        {/* Email Dialog */}
        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Email Quote</DialogTitle>
              <DialogDescription>
                Send this quote to the patient or another recipient.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Recipient Email
                </label>
                <Input
                  id="email"
                  placeholder="email@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  type="email"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={!recipientEmail.trim() || quoteSystem.loading}>
                {quoteSystem.loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Quote
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Appointment Dialog */}
        <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {portalType === 'patient' ? 'Request Consultation' : 'Schedule Appointment'}
              </DialogTitle>
              <DialogDescription>
                {portalType === 'patient' 
                  ? 'Request a free consultation to discuss your treatment options.'
                  : 'Schedule an appointment with this patient.'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500 mb-4">
                {portalType === 'patient'
                  ? 'The clinic will contact you within 24-48 hours to arrange a convenient time.'
                  : 'This will mark the quote as "in progress" and notify the patient.'}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAppointmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRequestAppointment}
                disabled={quoteSystem.loading}
              >
                {quoteSystem.loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    {portalType === 'patient' ? 'Request Consultation' : 'Schedule Appointment'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  // If we're showing a list of quotes
  return (
    <div className="space-y-6">
      {quoteSystem.loading && quoteSystem.quotes.length === 0 ? (
        <div className="w-full flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : quoteSystem.quotes.length === 0 ? (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-1">No Quotes Found</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              {portalType === 'admin' 
                ? 'There are no quotes in the system yet.' 
                : portalType === 'clinic'
                  ? 'No quotes have been assigned to your clinic yet.'
                  : 'You have not created any quotes yet.'}
            </p>
            {portalType === 'patient' && (
              <Button onClick={() => onQuoteAction && onQuoteAction('create', '')}>
                Get My Free Quote
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quoteSystem.quotes.map((quote) => (
              <QuoteCard 
                key={quote.id} 
                quote={quote} 
                portalType={portalType}
                onAction={onQuoteAction} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface QuoteCardProps {
  quote: QuoteData;
  portalType: 'admin' | 'clinic' | 'patient';
  onAction?: (action: string, quoteId: string) => void;
}

function QuoteCard({ quote, portalType, onAction }: QuoteCardProps) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    sent: 'bg-purple-100 text-purple-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-gray-100 text-gray-800',
    expired: 'bg-orange-100 text-orange-800'
  };

  const formattedDate = quote.created_at 
    ? formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })
    : 'recently';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">Quote #{quote.id}</CardTitle>
          <Badge className={statusColors[quote.status || 'pending']}>
            {quote.status?.toUpperCase() || 'PENDING'}
          </Badge>
        </div>
        <CardDescription>Created {formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          {portalType === 'admin' && (
            <p className="text-sm">
              <span className="font-medium">Patient:</span> {quote.patient_name || 'Unknown'}
            </p>
          )}
          {(portalType === 'admin' || portalType === 'patient') && quote.clinic_name && (
            <p className="text-sm">
              <span className="font-medium">Clinic:</span> {quote.clinic_name}
            </p>
          )}
          <p className="text-sm">
            <span className="font-medium">Total:</span> ${quote.total?.toFixed(2) || '0.00'}
          </p>
          {quote.promo_code && (
            <p className="text-sm">
              <span className="font-medium">Promo:</span> {quote.promo_code} 
              {quote.discount_percent && ` (${quote.discount_percent}% off)`}
            </p>
          )}
          <p className="text-sm">
            <span className="font-medium">Treatments:</span> {quote.treatments?.length || 0}
          </p>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="w-full flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onAction && onAction('view', quote.id)}
            className="flex items-center"
          >
            View Details <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          
          {portalType === 'admin' && quote.status === 'pending' && (
            <Button 
              size="sm"
              onClick={() => onAction && onAction('assign', quote.id)}
            >
              Assign to Clinic
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}