/**
 * Quote Integration Widget
 * 
 * This component provides a unified interface for interacting with quotes
 * across all three portals (admin, clinic, patient).
 */
import React, { useEffect, useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TreatmentList } from './TreatmentList';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Eye, ArrowRight, Download, Mail, Check, ArrowLeft, 
  Calendar, Loader2, AlertTriangle, User, Building2, 
  Activity, BadgePercent, RefreshCw
} from 'lucide-react';
import { useQuoteSystem } from '@/hooks/use-quote-system';
import { QuoteData, Treatment } from '@/services/quote-integration-service';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

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
  const quoteSystem = useQuoteSystem(portalType, userId);
  const [activeTab, setActiveTab] = useState<string>('details');

  useEffect(() => {
    if (quoteId) {
      quoteSystem.setSelectedQuoteId(quoteId);
    }
  }, [quoteId]);

  // If it's a detailed view of a single quote
  if (quoteId) {
    const quote = quoteSystem.selectedQuote;
    const isLoading = quoteSystem.selectedQuoteQuery.isLoading;

    if (isLoading) {
      return (
        <Card className="w-full">
          <CardContent className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading quote information...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!quote) {
      return (
        <Card className="w-full">
          <CardContent className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <AlertTriangle className="h-8 w-8 text-warning mb-4" />
              <p className="text-muted-foreground">Quote not found or no longer available.</p>
              <Button 
                variant="link" 
                onClick={() => onQuoteAction?.('back', '')}
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quotes
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center">
              Quote #{quote.id.toString().padStart(5, '0')}
              <Badge className="ml-3" variant={getStatusVariant(quote.status)}>
                {formatStatus(quote.status)}
              </Badge>
            </CardTitle>
            <CardDescription>
              Created on {format(new Date(quote.created_at), 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => onQuoteAction?.('back', '')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quotes
          </Button>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="details" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
              {portalType === 'admin' && (
                <TabsTrigger value="assignment">Assignment</TabsTrigger>
              )}
              {portalType === 'clinic' && (
                <TabsTrigger value="patient">Patient</TabsTrigger>
              )}
              {portalType === 'patient' && (
                <TabsTrigger value="clinics">Clinics</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Patient</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="font-medium">{quote.patient_name}</p>
                      <p className="text-sm text-muted-foreground">{quote.patient_email}</p>
                      {quote.patient_phone && (
                        <p className="text-sm text-muted-foreground">{quote.patient_phone}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{formatCurrency(quote.total)}</p>
                      <p className="text-sm text-muted-foreground">
                        {quote.discount_amount > 0 ? (
                          <>Subtotal: {formatCurrency(quote.subtotal)}</>
                        ) : (
                          'No discount applied'
                        )}
                      </p>
                      {quote.discount_amount > 0 && (
                        <p className="text-sm font-medium text-green-600">
                          Discount: -{formatCurrency(quote.discount_amount)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Status Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant={getStatusVariant(quote.status)}>
                          {formatStatus(quote.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Updated:</span>
                        <span className="text-sm">
                          {format(new Date(quote.updated_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      
                      {quote.assigned_to && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Assigned To:</span>
                          <span className="text-sm">{quote.assigned_to_name || 'Clinic #' + quote.assigned_to}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {quote.promo_code && (
                <Alert>
                  <BadgePercent className="h-4 w-4" />
                  <AlertTitle>Promo Code Applied</AlertTitle>
                  <AlertDescription>
                    {quote.promo_code} - {quote.discount_amount > 0 
                      ? `Saved ${formatCurrency(quote.discount_amount)}`
                      : 'Promo code applied'}
                  </AlertDescription>
                </Alert>
              )}
              
              {quote.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{quote.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="treatments">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Treatment List</CardTitle>
                  <CardDescription>
                    Treatments selected for this quote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TreatmentList 
                    treatments={quote.treatments || []} 
                    editable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {portalType === 'admin' && (
              <TabsContent value="assignment">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Clinic Assignment</CardTitle>
                    <CardDescription>
                      Manage which clinic is handling this quote
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {quote.assigned_to ? (
                      <div className="space-y-4">
                        <Alert>
                          <Building2 className="h-4 w-4" />
                          <AlertTitle>Currently Assigned</AlertTitle>
                          <AlertDescription>
                            This quote is assigned to {quote.assigned_to_name || 'Clinic #' + quote.assigned_to}
                          </AlertDescription>
                        </Alert>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => onQuoteAction?.('reassign', quote.id)}
                          >
                            Reassign to Different Clinic
                          </Button>
                          <Button 
                            variant="outline" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => quoteSystem.unassignQuoteMutation.mutate({ quoteId: quote.id })}
                          >
                            Unassign
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Not Assigned</AlertTitle>
                          <AlertDescription>
                            This quote has not been assigned to a clinic yet.
                          </AlertDescription>
                        </Alert>
                        
                        <Button onClick={() => onQuoteAction?.('assign', quote.id)}>
                          Assign to Clinic
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {portalType === 'clinic' && (
              <TabsContent value="patient">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Information</CardTitle>
                    <CardDescription>
                      Contact details and additional information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2">Contact Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{quote.patient_name}</p>
                              <p className="text-sm text-muted-foreground">Name</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{quote.patient_email}</p>
                              <p className="text-sm text-muted-foreground">Email</p>
                            </div>
                          </div>
                          {quote.patient_phone && (
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{quote.patient_phone}</p>
                                <p className="text-sm text-muted-foreground">Phone</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Additional Details</h3>
                        <div className="space-y-2">
                          {quote.preferred_dates && (
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{quote.preferred_dates}</p>
                                <p className="text-sm text-muted-foreground">Preferred Dates</p>
                              </div>
                            </div>
                          )}
                          
                          {quote.preferred_contact_method && (
                            <div className="flex items-start gap-2">
                              <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{quote.preferred_contact_method}</p>
                                <p className="text-sm text-muted-foreground">Preferred Contact Method</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2">Actions</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => onQuoteAction?.('email', quote.id)}>
                          <Mail className="h-4 w-4 mr-2" /> Email Quote
                        </Button>
                        
                        <Button variant="outline" onClick={() => quoteSystem.downloadPdfMutation.mutate({ quoteId: quote.id })}>
                          <Download className="h-4 w-4 mr-2" /> Download PDF
                        </Button>
                        
                        {quote.status === 'pending' && (
                          <Button 
                            variant="outline"
                            onClick={() => quoteSystem.updateQuoteStatusMutation.mutate({ 
                              quoteId: quote.id, 
                              status: 'in_progress' 
                            })}
                          >
                            Start Processing
                          </Button>
                        )}
                        
                        {quote.status === 'in_progress' && (
                          <Button 
                            onClick={() => quoteSystem.updateQuoteStatusMutation.mutate({ 
                              quoteId: quote.id, 
                              status: 'completed' 
                            })}
                          >
                            <Check className="h-4 w-4 mr-2" /> Mark as Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {portalType === 'patient' && (
              <TabsContent value="clinics">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assigned Clinic</CardTitle>
                    <CardDescription>
                      Information about the clinic handling your quote
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {quote.assigned_to ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          {quote.clinic_logo ? (
                            <img 
                              src={quote.clinic_logo} 
                              alt={quote.assigned_to_name || 'Clinic logo'} 
                              className="w-16 h-16 object-contain rounded-md"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                              <Building2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div>
                            <h3 className="font-medium text-lg">
                              {quote.assigned_to_name || 'Clinic #' + quote.assigned_to}
                            </h3>
                            {quote.clinic_location && (
                              <p className="text-sm text-muted-foreground">{quote.clinic_location}</p>
                            )}
                          </div>
                        </div>
                        
                        {quote.clinic_description && (
                          <p className="text-sm">{quote.clinic_description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          {quote.clinic_website && (
                            <Button variant="outline" asChild>
                              <a href={quote.clinic_website} target="_blank" rel="noopener noreferrer">
                                Visit Website
                              </a>
                            </Button>
                          )}
                          
                          <Button onClick={() => quoteSystem.requestAppointmentMutation.mutate({ quoteId: quote.id })}>
                            Request Appointment
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <h3 className="font-medium text-lg mb-1">Not Assigned Yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Your quote has not been assigned to a clinic yet. 
                          Our team will review your request and match you with the right clinic soon.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Quote ID: {quote.id}
          </div>
          <div className="space-x-2">
            {portalType === 'admin' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => quoteSystem.downloadPdfMutation.mutate({ quoteId: quote.id })}
                >
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
                {quote.status === 'pending' && (
                  <Button 
                    onClick={() => onQuoteAction?.('assign', quote.id)}
                  >
                    Assign to Clinic
                  </Button>
                )}
              </>
            )}
            
            {portalType === 'clinic' && (
              <>
                {quote.status === 'pending' && (
                  <Button 
                    onClick={() => quoteSystem.updateQuoteStatusMutation.mutate({ 
                      quoteId: quote.id, 
                      status: 'in_progress' 
                    })}
                  >
                    Start Processing
                  </Button>
                )}
              </>
            )}
            
            {portalType === 'patient' && (
              <Button 
                variant="outline" 
                onClick={() => quoteSystem.downloadPdfMutation.mutate({ quoteId: quote.id })}
              >
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  }

  // List view of all quotes
  return (
    <div className="space-y-4">
      {quoteSystem.isLoading ? (
        <Card className="w-full">
          <CardContent className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading quotes...</p>
            </div>
          </CardContent>
        </Card>
      ) : quoteSystem.quotes.length === 0 ? (
        <Card className="w-full">
          <CardContent className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No Quotes Found</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                {portalType === 'admin' 
                  ? "There are no quotes in the system yet."
                  : portalType === 'clinic'
                    ? "No quotes have been assigned to your clinic yet."
                    : "You haven't requested any quotes yet."}
              </p>
              {portalType === 'admin' && (
                <Button onClick={() => onQuoteAction?.('create', '')}>
                  Create New Quote
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quoteSystem.quotes.map((quote: QuoteData) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">
                    #{quote.id.toString().padStart(5, '0')}
                  </TableCell>
                  <TableCell>{quote.patient_name}</TableCell>
                  <TableCell>{format(new Date(quote.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{formatCurrency(quote.total)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(quote.status)}>
                      {formatStatus(quote.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onQuoteAction?.('view', quote.id)}
                        title="View Quote"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {portalType === 'admin' && quote.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onQuoteAction?.('assign', quote.id)}
                          title="Assign to Clinic"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {portalType === 'clinic' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onQuoteAction?.('email', quote.id)}
                          title="Email Quote"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => quoteSystem.refetchQuotes()}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${quoteSystem.isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}

// Helper functions
function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' | 'success' | 'destructive' {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'assigned':
    case 'in_progress':
      return 'default';
    case 'completed':
    case 'accepted':
      return 'success';
    case 'rejected':
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}

function formatStatus(status: string): string {
  // Convert statuses like in_progress to In Progress
  const words = status.split('_');
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function handleUpdateQuantity(treatmentId, quantity) {
  // Implement updating treatment quantity
  console.log('Update quantity:', treatmentId, quantity);
}

function handleRemoveTreatment(treatmentId) {
  // Implement removing treatment
  console.log('Remove treatment:', treatmentId);
}