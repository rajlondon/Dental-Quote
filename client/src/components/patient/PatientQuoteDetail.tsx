import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, FileText, Clock, CalendarClock, Download, Building, User, DollarSign, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PatientQuoteDetailProps {
  quoteId: string | number;
  onBack: () => void;
}

/**
 * Component to display the details of a specific quote within the patient portal
 */
export function PatientQuoteDetail({ quoteId, onBack }: PatientQuoteDetailProps) {
  const { t } = useTranslation();
  
  // Fetch specific quote data
  const {
    data: quote,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [`/api/quotes/${quoteId}`],
    queryFn: async () => {
      console.log(`[DEBUG] PatientQuoteDetail: Fetching quote ${quoteId} from API`);
      try {
        const response = await apiRequest('GET', `/api/quotes/${quoteId}`);
        const data = await response.json();
        
        if (!data.success) {
          console.error('[ERROR] Quote API returned unsuccessful response:', data);
          throw new Error(data.message || 'Failed to fetch quote details');
        }
        
        console.log('[DEBUG] Successfully loaded quote:', data.data);
        return data.data;
      } catch (error) {
        console.error(`[ERROR] Failed to fetch quote ${quoteId}:`, error);
        throw error;
      }
    }
  });
  
  // Ensure we have the latest data when this component mounts
  useEffect(() => {
    console.log(`[DEBUG] PatientQuoteDetail mounted, refreshing quote ${quoteId} data`);
    refetch();
  }, [quoteId, refetch]);
  
  // Get the status badge for the quote
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return { color: 'bg-blue-500', text: 'Sent' };
      case 'in_progress':
        return { color: 'bg-yellow-500', text: 'In Progress' };
      case 'accepted':
        return { color: 'bg-green-500', text: 'Accepted' };
      case 'rejected':
        return { color: 'bg-red-500', text: 'Rejected' };
      case 'completed':
        return { color: 'bg-green-700', text: 'Completed' };
      case 'cancelled':
        return { color: 'bg-gray-500', text: 'Cancelled' };
      case 'expired':
        return { color: 'bg-gray-700', text: 'Expired' };
      default:
        return { color: 'bg-gray-400', text: status.charAt(0).toUpperCase() + status.slice(1) };
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">{t('quotes.loading_details', 'Loading quote details...')}</p>
      </div>
    );
  }
  
  // Show error state
  if (error || !quote) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quotes
        </Button>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FileText className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-700 mb-2">
            {t('quotes.error_details_title', 'Error Loading Quote')}
          </h3>
          <p className="text-red-600 mb-4">
            {t('quotes.error_details_description', 'There was a problem loading this quote. Please try again later.')}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            {t('common.retry', 'Retry')}
          </Button>
        </div>
      </div>
    );
  }
  
  // Get status badge for this quote
  const status = getStatusBadge(quote.status);
  
  // Extract treatment items from the quote (handle different data structures)
  const treatmentItems = quote.treatmentLines || quote.treatments || [];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quotes
        </Button>
        
        {(quote.status === 'accepted' || quote.status === 'completed') && (
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Download Quote PDF
          </Button>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Quote Overview Card */}
        <Card className="col-span-3 md:col-span-2">
          <CardHeader className="pb-3 flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-xl">
                {quote.title || `Quote #${quote.id.toString().slice(0, 8)}`}
              </CardTitle>
              <p className="text-gray-500 text-sm mt-1">
                Created on {formatDate(quote.createdAt) || 'N/A'}
              </p>
            </div>
            <Badge className={status.color}>{status.text}</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Clinic</p>
                    <p className="text-gray-600">{quote.clinicName || 'Multiple Clinics'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Patient</p>
                    <p className="text-gray-600">{quote.name}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <CalendarClock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-gray-600">{status.text}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Total</p>
                    <p className="text-gray-600">£{quote.totalPrice || 'TBD'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions Card */}
        <Card className="col-span-3 md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {t('quotes.actions', 'Actions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quote.status === 'sent' && (
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Accept Quote
              </Button>
            )}
            
            {quote.status === 'in_progress' && (
              <Button className="w-full">
                Track Progress
              </Button>
            )}
            
            {['pending', 'sent', 'in_progress'].includes(quote.status) && (
              <Button variant="outline" className="w-full">
                Request Changes
              </Button>
            )}
            
            <Button variant="outline" className="w-full text-red-600 hover:bg-red-50 border-red-200">
              Cancel Quote
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Treatment Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {t('quotes.treatments', 'Treatments')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {treatmentItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('quotes.treatment_name', 'Treatment')}</TableHead>
                  <TableHead>{t('quotes.quantity', 'Quantity')}</TableHead>
                  <TableHead>{t('quotes.price', 'Price')}</TableHead>
                  <TableHead className="text-right">{t('quotes.total', 'Total')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatmentItems.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name || item.treatment || 'Unknown Treatment'}</TableCell>
                    <TableCell>{item.quantity || 1}</TableCell>
                    <TableCell>£{item.price || 0}</TableCell>
                    <TableCell className="text-right">£{(item.price || 0) * (item.quantity || 1)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">
                    {t('quotes.total', 'Total')}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    £{quote.totalPrice || treatmentItems.reduce((sum: number, item: any) => 
                      sum + ((item.price || 0) * (item.quantity || 1)), 0)
                    }
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p>{t('quotes.no_treatments', 'No treatments found in this quote.')}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Additional Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {t('quotes.additional_details', 'Additional Details')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notes">
            <TabsList>
              <TabsTrigger value="notes">{t('quotes.notes', 'Notes')}</TabsTrigger>
              <TabsTrigger value="timeline">{t('quotes.timeline', 'Timeline')}</TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="pt-4">
              <div className="prose max-w-none">
                {quote.notes ? (
                  <div dangerouslySetInnerHTML={{ __html: quote.notes }} />
                ) : (
                  <p className="text-gray-500">
                    {t('quotes.no_notes', 'No additional notes for this quote.')}
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="timeline" className="pt-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1 mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Clock className="h-4 w-4 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-medium">Quote Created</p>
                    <p className="text-sm text-gray-500">{formatDate(quote.createdAt) || 'N/A'}</p>
                  </div>
                </div>
                
                {quote.status !== 'pending' && (
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <Calendar className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                      <p className="font-medium">Quote Sent</p>
                      <p className="text-sm text-gray-500">{formatDate(quote.sentAt || quote.updatedAt) || 'N/A'}</p>
                    </div>
                  </div>
                )}
                
                {quote.status === 'accepted' && (
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <CalendarClock className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                      <p className="font-medium">Quote Accepted</p>
                      <p className="text-sm text-gray-500">{formatDate(quote.acceptedAt || quote.updatedAt) || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default PatientQuoteDetail;