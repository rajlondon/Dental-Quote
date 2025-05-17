import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, FileText, Eye, Clock, CheckCircle, Download, Send, Trash, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TreatmentList } from './TreatmentList';
import { quoteIntegrationService, QuoteData } from '@/services/quote-integration-service';
import { useToast } from '@/hooks/use-toast';

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
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const { toast } = useToast();

  // Load quotes based on portal type
  useEffect(() => {
    const loadQuotes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let quotesData: QuoteData[] = [];
        
        if (portalType === 'admin') {
          const data = await quoteIntegrationService.getAdminQuotes();
          quotesData = data;
        } else if (portalType === 'clinic' && clinicId) {
          const data = await quoteIntegrationService.getClinicQuotes(clinicId);
          quotesData = data;
        } else if (portalType === 'patient' && patientId) {
          const data = await quoteIntegrationService.getPatientQuotes(patientId);
          quotesData = data;
        }
        
        setQuotes(quotesData);
      } catch (err) {
        setError('Failed to load quotes. Please try again later.');
        console.error('Error loading quotes:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (!quoteId) {
      loadQuotes();
    }
  }, [portalType, quoteId, patientId, clinicId]);

  // Load single quote if quoteId is provided
  useEffect(() => {
    const loadQuoteDetails = async () => {
      if (!quoteId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let quoteData: QuoteData | null = null;
        
        if (portalType === 'admin') {
          quoteData = await quoteIntegrationService.getAdminQuote(quoteId);
        } else if (portalType === 'clinic' && clinicId) {
          quoteData = await quoteIntegrationService.getClinicQuote(clinicId, quoteId);
        } else if (portalType === 'patient' && patientId) {
          quoteData = await quoteIntegrationService.getPatientQuote(patientId, quoteId);
        }
        
        if (quoteData) {
          setCurrentQuote(quoteData);
          setActiveTab('details');
        } else {
          setError('Quote not found');
        }
      } catch (err) {
        setError('Failed to load quote details. Please try again later.');
        console.error('Error loading quote details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (quoteId) {
      loadQuoteDetails();
    }
  }, [quoteId, portalType, patientId, clinicId]);

  const handleViewQuote = async (id: string) => {
    setLoading(true);
    
    try {
      let quoteData: QuoteData | null = null;
      
      if (portalType === 'admin') {
        quoteData = await quoteIntegrationService.getAdminQuote(id);
      } else if (portalType === 'clinic' && clinicId) {
        quoteData = await quoteIntegrationService.getClinicQuote(clinicId, id);
      } else if (portalType === 'patient' && patientId) {
        quoteData = await quoteIntegrationService.getPatientQuote(patientId, id);
      }
      
      if (quoteData) {
        setCurrentQuote(quoteData);
        setActiveTab('details');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load quote details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setCurrentQuote(null);
    setActiveTab('list');
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const blob = await quoteIntegrationService.downloadQuotePdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Download successful',
        description: 'The quote PDF has been downloaded',
      });
    } catch (err) {
      toast({
        title: 'Download failed',
        description: 'Failed to download quote PDF',
        variant: 'destructive',
      });
    }
  };

  const handleSendEmail = async (id: string, email: string) => {
    try {
      await quoteIntegrationService.sendQuoteEmail(id, email);
      
      toast({
        title: 'Email sent',
        description: 'The quote has been sent to the provided email',
      });
    } catch (err) {
      toast({
        title: 'Email failed',
        description: 'Failed to send email',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await quoteIntegrationService.updateQuoteStatus(id, status);
      
      // Update the quote in state
      if (currentQuote && currentQuote.id === id) {
        setCurrentQuote({ ...currentQuote, status });
      }
      
      // Update in the list
      setQuotes(quotes.map(q => q.id === id ? { ...q, status } : q));
      
      toast({
        title: 'Status updated',
        description: `Quote status has been updated to ${status}`,
      });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: 'Failed to update quote status',
        variant: 'destructive',
      });
    }
  };

  const handleRequestAppointment = async (id: string) => {
    try {
      await quoteIntegrationService.requestAppointment(id);
      
      toast({
        title: 'Appointment requested',
        description: 'Your appointment request has been sent',
      });
      
      // Update the quote status in state
      if (currentQuote && currentQuote.id === id) {
        setCurrentQuote({ ...currentQuote, status: 'appointment_requested' });
      }
      
      // Update in the list
      setQuotes(quotes.map(q => q.id === id ? { ...q, status: 'appointment_requested' } : q));
    } catch (err) {
      toast({
        title: 'Request failed',
        description: 'Failed to request appointment',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTreatmentQuantity = async (quoteId: string, treatmentId: string, quantity: number) => {
    try {
      await quoteIntegrationService.updateTreatmentQuantity(quoteId, treatmentId, quantity);
      
      // Update the quote in state
      if (currentQuote && currentQuote.id === quoteId && currentQuote.treatments) {
        const updatedTreatments = currentQuote.treatments.map(t => 
          t.id === treatmentId ? { ...t, quantity } : t
        );
        
        setCurrentQuote({
          ...currentQuote,
          treatments: updatedTreatments,
        });
      }
      
      toast({
        title: 'Quantity updated',
        description: 'Treatment quantity has been updated',
      });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: 'Failed to update treatment quantity',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveTreatment = async (quoteId: string, treatmentId: string) => {
    try {
      await quoteIntegrationService.removeTreatment(quoteId, treatmentId);
      
      // Update the quote in state
      if (currentQuote && currentQuote.id === quoteId && currentQuote.treatments) {
        const updatedTreatments = currentQuote.treatments.filter(t => t.id !== treatmentId);
        
        setCurrentQuote({
          ...currentQuote,
          treatments: updatedTreatments,
        });
      }
      
      toast({
        title: 'Treatment removed',
        description: 'The treatment has been removed from your quote',
      });
    } catch (err) {
      toast({
        title: 'Removal failed',
        description: 'Failed to remove treatment',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'appointment_requested':
        return <Badge variant="info">Appointment Requested</Badge>;
      case 'appointment_scheduled':
        return <Badge variant="info">Appointment Scheduled</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading && !quotes.length && !currentQuote) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !quotes.length && !currentQuote) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="list" disabled={loading}>Quote List</TabsTrigger>
          <TabsTrigger value="details" disabled={!currentQuote || loading}>Quote Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          {quotes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">No quotes found</p>
                {onQuoteAction && (
                  <Button 
                    onClick={() => onQuoteAction('create', '')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" /> Create New Quote
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <QuoteCard 
                  key={quote.id} 
                  quote={quote} 
                  portalType={portalType} 
                  onAction={(action, quoteId) => {
                    if (action === 'view') {
                      handleViewQuote(quoteId);
                    } else if (onQuoteAction) {
                      onQuoteAction(action, quoteId);
                    }
                  }} 
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="details">
          {currentQuote ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Quote #{currentQuote.id.substring(0, 8)}</CardTitle>
                      <CardDescription>
                        Created {currentQuote.created_at ? formatDistanceToNow(new Date(currentQuote.created_at), { addSuffix: true }) : 'recently'}
                      </CardDescription>
                    </div>
                    <div>
                      {getStatusBadge(currentQuote.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Patient Information</h3>
                      <div className="text-sm">
                        <p className="py-1"><span className="font-medium">Name:</span> {currentQuote.patient_name || 'Not specified'}</p>
                        <p className="py-1"><span className="font-medium">Email:</span> {currentQuote.patient_email || 'Not specified'}</p>
                        <p className="py-1"><span className="font-medium">Phone:</span> {currentQuote.patient_phone || 'Not specified'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Clinic Information</h3>
                      <div className="text-sm">
                        <p className="py-1"><span className="font-medium">Clinic:</span> {currentQuote.clinic_name || 'Not assigned'}</p>
                        {currentQuote.promo_code && (
                          <p className="py-1"><span className="font-medium">Promo Code:</span> {currentQuote.promo_code}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-4">Treatments</h3>
                    <TreatmentList 
                      treatments={currentQuote.treatments || []} 
                      readOnly={portalType !== 'patient' || currentQuote.status === 'completed' || currentQuote.status === 'cancelled'}
                      onUpdateQuantity={
                        portalType === 'patient' && currentQuote.status !== 'completed' && currentQuote.status !== 'cancelled' 
                          ? (treatmentId, quantity) => handleUpdateTreatmentQuantity(currentQuote.id, treatmentId, quantity)
                          : undefined
                      }
                      onRemoveTreatment={
                        portalType === 'patient' && currentQuote.status !== 'completed' && currentQuote.status !== 'cancelled'
                          ? (treatmentId) => handleRemoveTreatment(currentQuote.id, treatmentId)
                          : undefined
                      }
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-sm">
                      <p className="font-medium">Subtotal</p>
                      <p className="text-lg">${currentQuote.subtotal?.toFixed(2) || '0.00'}</p>
                    </div>
                    {(currentQuote.discount_amount && currentQuote.discount_amount > 0) && (
                      <div className="text-sm">
                        <p className="font-medium">Discount {currentQuote.discount_percent ? `(${currentQuote.discount_percent}%)` : ''}</p>
                        <p className="text-lg text-destructive">-${currentQuote.discount_amount.toFixed(2)}</p>
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="font-medium">Total</p>
                      <p className="text-lg font-bold">${currentQuote.total?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handleBackToList}
                  >
                    Back to List
                  </Button>
                  
                  <div className="flex flex-wrap gap-2">
                    {portalType === 'patient' && currentQuote.status === 'pending' && (
                      <Button 
                        variant="default" 
                        onClick={() => handleRequestAppointment(currentQuote.id)}
                      >
                        <Clock className="h-4 w-4 mr-2" /> Request Appointment
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handleDownloadPdf(currentQuote.id)}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                    
                    {portalType === 'admin' && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const email = prompt('Enter email address to send quote:');
                          if (email) {
                            handleSendEmail(currentQuote.id, email);
                          }
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" /> Send by Email
                      </Button>
                    )}
                    
                    {portalType === 'admin' && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const newStatus = prompt('Enter new status (pending, confirmed, completed, cancelled):');
                          if (newStatus) {
                            handleUpdateStatus(currentQuote.id, newStatus);
                          }
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Update Status
                      </Button>
                    )}
                    
                    {onQuoteAction && (
                      <Button 
                        variant="default" 
                        onClick={() => onQuoteAction('edit', currentQuote.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit Quote
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Select a quote to view details</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface QuoteCardProps {
  quote: QuoteData;
  portalType: 'admin' | 'clinic' | 'patient';
  onAction?: (action: string, quoteId: string) => void;
}

function QuoteCard({ quote, portalType, onAction }: QuoteCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Quote #{quote.id.substring(0, 8)}</CardTitle>
            <CardDescription>
              {quote.created_at ? formatDistanceToNow(new Date(quote.created_at), { addSuffix: true }) : 'Recently'}
            </CardDescription>
          </div>
          <div>
            {quote.status && (
              <Badge 
                variant={
                  quote.status === 'confirmed' || quote.status === 'completed' 
                    ? 'success' 
                    : quote.status === 'cancelled' 
                      ? 'destructive' 
                      : 'outline'
                }
              >
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1).replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <p><span className="font-medium">Patient:</span> {quote.patient_name || 'Not specified'}</p>
            {portalType === 'admin' && quote.clinic_name && (
              <p><span className="font-medium">Clinic:</span> {quote.clinic_name}</p>
            )}
          </div>
          <div className="text-right">
            <p className="font-medium">Total Amount</p>
            <p className="text-lg font-bold">${quote.total?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {onAction && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAction('view', quote.id)}
          >
            <Eye className="h-4 w-4 mr-2" /> View
          </Button>
        )}
        
        {portalType === 'admin' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const newStatus = prompt('Enter new status (pending, confirmed, completed, cancelled):');
              if (newStatus && onAction) {
                onAction('updateStatus', quote.id);
              }
            }}
          >
            <CheckCircle className="h-4 w-4 mr-2" /> Status
          </Button>
        )}
        
        {portalType === 'patient' && quote.status === 'pending' && onAction && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onAction('requestAppointment', quote.id)}
          >
            <Clock className="h-4 w-4 mr-2" /> Request Appointment
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}