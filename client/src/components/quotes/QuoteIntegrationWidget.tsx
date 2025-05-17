import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileText, Mail, Calendar, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { TreatmentList } from './TreatmentList';
import { useQuoteSystem } from '@/hooks/use-quote-system';

export type PortalType = 'admin' | 'clinic' | 'patient';

export interface QuoteIntegrationWidgetProps {
  portalType: PortalType;
  quoteId?: string;
  onQuoteAction?: (action: string, quoteId: string) => void;
}

export const QuoteIntegrationWidget: React.FC<QuoteIntegrationWidgetProps> = ({
  portalType,
  quoteId,
  onQuoteAction,
}) => {
  const { toast } = useToast();
  const quoteSystem = useQuoteSystem(portalType);
  const [emailAddress, setEmailAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');

  // If we are viewing a specific quote, load its details
  useEffect(() => {
    if (quoteId) {
      quoteSystem.loadQuoteDetails(quoteId);
    } else {
      quoteSystem.loadQuotes();
    }
  }, [quoteSystem, quoteId]);

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Function to get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'confirmed':
      case 'accepted':
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'rejected':
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'assigned':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Assigned</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">In Progress</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Sent</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Expired</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  // Handle apply promo code
  const handleApplyPromoCode = () => {
    if (!quoteId || !promoCode.trim()) return;
    
    quoteSystem.applyPromoCode(quoteId, promoCode.trim())
      .then(() => {
        toast({
          title: "Promo code applied",
          description: `Promo code ${promoCode} has been applied to your quote.`,
          variant: "success",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to apply promo code",
          description: error.message || "Please try again with a valid promo code.",
          variant: "destructive",
        });
      });
  };

  // Handle remove promo code
  const handleRemovePromoCode = () => {
    if (!quoteId) return;
    
    quoteSystem.removePromoCode(quoteId)
      .then(() => {
        setPromoCode('');
        toast({
          title: "Promo code removed",
          description: "Promo code has been removed from your quote.",
          variant: "success",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to remove promo code",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      });
  };

  // Handle download PDF
  const handleDownloadPdf = () => {
    if (!quoteId) return;
    
    quoteSystem.downloadQuotePdf(quoteId)
      .then(() => {
        toast({
          title: "PDF generated",
          description: "Your quote PDF has been generated and downloaded.",
          variant: "success",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to generate PDF",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      });
  };

  // Handle send email
  const handleSendEmail = () => {
    if (!quoteId || !emailAddress.trim()) return;
    
    quoteSystem.sendQuoteEmail(quoteId, emailAddress.trim())
      .then(() => {
        toast({
          title: "Email sent",
          description: `Quote has been sent to ${emailAddress}.`,
          variant: "success",
        });
        setEmailAddress('');
      })
      .catch((error) => {
        toast({
          title: "Failed to send email",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      });
  };

  // Handle request appointment
  const handleRequestAppointment = () => {
    if (!quoteId) return;
    
    quoteSystem.requestAppointment(quoteId)
      .then(() => {
        toast({
          title: "Appointment requested",
          description: "Your appointment request has been sent to the clinic.",
          variant: "success",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to request appointment",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      });
  };

  // Handle update treatment quantity
  const handleUpdateQuantity = (treatmentId: string, quantity: number) => {
    if (!quoteId) return;
    
    quoteSystem.updateTreatmentQuantity(quoteId, treatmentId, quantity)
      .then(() => {
        toast({
          title: "Quantity updated",
          description: "Treatment quantity has been updated.",
          variant: "success",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to update quantity",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      });
  };

  // Handle remove treatment
  const handleRemoveTreatment = (treatmentId: string) => {
    if (!quoteId) return;
    
    quoteSystem.removeTreatment(quoteId, treatmentId)
      .then(() => {
        toast({
          title: "Treatment removed",
          description: "Treatment has been removed from your quote.",
          variant: "success",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to remove treatment",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      });
  };

  // Handle status update
  const handleUpdateStatus = (status: string) => {
    if (!quoteId) return;
    
    quoteSystem.updateQuoteStatus(quoteId, status)
      .then(() => {
        toast({
          title: "Status updated",
          description: `Quote status has been updated to ${status}.`,
          variant: "success",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to update status",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      });
  };

  // Single quote detail view
  if (quoteId) {
    if (quoteSystem.loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (quoteSystem.error) {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Quote
            </CardTitle>
            <CardDescription>
              There was a problem loading the quote details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{quoteSystem.error}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => quoteSystem.loadQuoteDetails(quoteId)}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    if (!quoteSystem.currentQuote) {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Quote Not Found</CardTitle>
            <CardDescription>
              The requested quote could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>The quote may have been deleted or you don't have permission to view it.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => onQuoteAction && onQuoteAction('back', '')}>
              Back to Quotes
            </Button>
          </CardFooter>
        </Card>
      );
    }

    const { currentQuote } = quoteSystem;
    const canEdit = 
      portalType === 'admin' || 
      (portalType === 'patient' && ['pending', 'in_progress'].includes(currentQuote.status || ''));

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center">
                Quote #{currentQuote.id}
                {getStatusBadge(currentQuote.status || 'pending')}
              </CardTitle>
              <CardDescription>
                Created on {formatDate(currentQuote.created_at || '')}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="flex items-center gap-1" onClick={handleDownloadPdf}>
                <Download className="h-4 w-4" /> PDF
              </Button>
              {portalType === 'patient' && currentQuote.status === 'pending' && (
                <Button variant="default" className="flex items-center gap-1" onClick={handleRequestAppointment}>
                  <Calendar className="h-4 w-4" /> Request Appointment
                </Button>
              )}
              {portalType === 'clinic' && currentQuote.status === 'assigned' && (
                <>
                  <Button 
                    variant="success" 
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdateStatus('accepted')}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Accept
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex items-center gap-1"
                    onClick={() => handleUpdateStatus('rejected')}
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </>
              )}
              {portalType === 'admin' && (
                <Button 
                  variant="outline" 
                  onClick={() => onQuoteAction && onQuoteAction('assign', currentQuote.id || '')}
                  disabled={!!currentQuote.clinic_id}
                >
                  Assign to Clinic
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient & Clinic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Patient Information</h3>
                <div className="space-y-1">
                  <p className="text-sm"><span className="font-medium">Name:</span> {currentQuote.patient_name || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {currentQuote.patient_email || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Phone:</span> {currentQuote.patient_phone || 'N/A'}</p>
                </div>
              </div>
              {currentQuote.clinic_id && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Clinic Information</h3>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">Name:</span> {currentQuote.clinic_name || 'N/A'}</p>
                    {/* Add more clinic details if available */}
                  </div>
                </div>
              )}
            </div>

            {/* Treatment List */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Treatment Details</h3>
              <TreatmentList 
                treatments={currentQuote.treatments || []}
                editable={canEdit}
                onUpdateQuantity={canEdit ? handleUpdateQuantity : undefined}
                onRemoveTreatment={canEdit ? handleRemoveTreatment : undefined}
              />
            </div>

            {/* Pricing Summary */}
            <div className="bg-slate-50 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-3">Pricing Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(currentQuote.subtotal || 0).toFixed(2)}</span>
                </div>
                {currentQuote.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount {currentQuote.discount_percent ? `(${currentQuote.discount_percent}%)` : ''}:</span>
                    <span>-${(currentQuote.discount_amount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>${(currentQuote.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Promo Code Section */}
            {canEdit && (
              <div className="border p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-3">Promo Code</h3>
                <div className="flex items-end gap-2">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="promo-code">Enter promo code</Label>
                    <Input 
                      id="promo-code" 
                      placeholder="Enter promo code" 
                      value={promoCode} 
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={!!currentQuote.promo_code}
                    />
                  </div>
                  {currentQuote.promo_code ? (
                    <Button variant="outline" className="mb-1.5" onClick={handleRemovePromoCode}>
                      Remove
                    </Button>
                  ) : (
                    <Button 
                      className="mb-1.5" 
                      onClick={handleApplyPromoCode}
                      disabled={!promoCode.trim()}
                    >
                      Apply
                    </Button>
                  )}
                </div>
                {currentQuote.promo_code && (
                  <p className="text-sm text-green-600 mt-2">
                    Promo code <span className="font-semibold">{currentQuote.promo_code}</span> applied for {currentQuote.discount_percent}% discount.
                  </p>
                )}
              </div>
            )}

            {/* Email Quote Section */}
            <div className="border p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-3">Send Quote</h3>
              <div className="flex items-end gap-2">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter email address" 
                    value={emailAddress} 
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                </div>
                <Button 
                  className="mb-1.5 flex items-center gap-1" 
                  onClick={handleSendEmail}
                  disabled={!emailAddress.trim()}
                >
                  <Mail className="h-4 w-4" /> Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quotes list view
  if (quoteSystem.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (quoteSystem.error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Quotes
          </CardTitle>
          <CardDescription>
            There was a problem loading the quotes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{quoteSystem.error}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => quoteSystem.loadQuotes()}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!quoteSystem.quotes || quoteSystem.quotes.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Quotes Found</CardTitle>
          <CardDescription>
            There are no quotes available at this time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            {portalType === 'patient' && "You haven't created any quotes yet. Get started by creating a new quote."}
            {portalType === 'clinic' && "No quotes have been assigned to your clinic yet."}
            {portalType === 'admin' && "There are no quotes in the system yet."}
          </p>
        </CardContent>
        <CardFooter>
          {portalType === 'admin' && (
            <Button onClick={() => onQuoteAction && onQuoteAction('create', '')}>
              <FileText className="mr-2 h-4 w-4" /> Create New Quote
            </Button>
          )}
          {portalType === 'patient' && (
            <Button onClick={() => onQuoteAction && onQuoteAction('create', '')}>
              <FileText className="mr-2 h-4 w-4" /> Create New Quote
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Created</TableHead>
              {portalType === 'admin' && <TableHead>Patient</TableHead>}
              {(portalType === 'admin' || portalType === 'patient') && <TableHead>Clinic</TableHead>}
              <TableHead>Treatments</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quoteSystem.quotes.map(quote => (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">{quote.id}</TableCell>
                <TableCell>{formatDate(quote.created_at || '')}</TableCell>
                {portalType === 'admin' && (
                  <TableCell>{quote.patient_name || 'N/A'}</TableCell>
                )}
                {(portalType === 'admin' || portalType === 'patient') && (
                  <TableCell>{quote.clinic_name || 'Not Assigned'}</TableCell>
                )}
                <TableCell>{quote.treatments?.length || 0} items</TableCell>
                <TableCell>${(quote.total || 0).toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(quote.status || 'pending')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onQuoteAction && onQuoteAction('view', quote.id || '')}
                    >
                      View
                    </Button>
                    {portalType === 'admin' && !quote.clinic_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onQuoteAction && onQuoteAction('assign', quote.id || '')}
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};