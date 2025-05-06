import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, CheckCircle, Clock, FileText, ShieldX, AlertTriangle, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/date-utils';
import { ROUTES } from '@/lib/routes';

/**
 * Patient quotes display component optimized for use directly in the patient portal
 * This component DISPLAYS quotes data, while PatientQuotesPage is now only a redirect component
 */
export function PatientQuotesContent() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = React.useState('all');

  // Fetch user quotes with error handling
  const {
    data: quotes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/quotes/user'],
    queryFn: async () => {
      console.log('[DEBUG] PatientQuotesContent: Fetching quotes from API');
      try {
        const response = await apiRequest('GET', '/api/quotes/user');
        const data = await response.json();
        
        if (!data.success) {
          console.error('[ERROR] Quotes API returned unsuccessful response:', data);
          return [];
        }
        
        console.log('[DEBUG] Successfully loaded quotes:', data.data);
        return data.data || [];
      } catch (error) {
        console.error('[ERROR] Failed to fetch quotes:', error);
        throw error;
      }
    }
  });
  
  // Ensure we have the latest data when this component mounts
  React.useEffect(() => {
    console.log('[DEBUG] PatientQuotesContent mounted, refreshing quotes data');
    refetch();
  }, [refetch]);

  // Filter quotes by status based on active tab
  const filteredQuotes = React.useMemo(() => {
    return quotes.filter(quote => {
      if (activeTab === 'in_progress') {
        return ['sent', 'in_progress'].includes(quote.status);
      } else if (activeTab === 'completed') {
        return ['accepted', 'rejected', 'completed', 'cancelled', 'expired'].includes(quote.status);
      }
      return true; // 'all' tab
    });
  }, [quotes, activeTab]);

  // Get the status badge color and text for a quote
  const getStatusBadge = (status) => {
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

  // Get the icon for a quote based on its status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'in_progress':
        return <CalendarClock className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <ShieldX className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-gray-700" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">{t('quotes.loading', 'Loading your quotes...')}</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-700 mb-2">
          {t('quotes.error_title', 'Error Loading Quotes')}
        </h3>
        <p className="text-red-600 mb-4">
          {t('quotes.error_description', 'There was a problem loading your quotes. Please try again later.')}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          {t('common.retry', 'Retry')}
        </Button>
      </div>
    );
  }

  // Show empty state
  if (quotes.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          {t('quotes.no_quotes_title', 'No Quotes Yet')}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {t('quotes.no_quotes_description', 'You haven\'t requested any quotes yet. Get started by creating your first quote request.')}
        </p>
        <Button asChild>
          <a href="/quote-request" className="inline-flex items-center gap-2">
            {t('quotes.new_quote', 'New Quote Request')}
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">{t('quotes.all', 'All')}</TabsTrigger>
          <TabsTrigger value="in_progress">{t('quotes.in_progress', 'In Progress')}</TabsTrigger>
          <TabsTrigger value="completed">{t('quotes.completed', 'Completed')}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                getStatusBadge={getStatusBadge}
                getStatusIcon={getStatusIcon}
                onClick={() => {
                  // Navigate to the quote detail view
                  console.log(`[DEBUG] Navigating to quote ${quote.id}`);
                  sessionStorage.setItem('patient_portal_section', 'quotes');
                  setLocation(`/portal/quotes/${quote.id}`);
                }}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="in_progress" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                getStatusBadge={getStatusBadge}
                getStatusIcon={getStatusIcon}
                onClick={() => {
                  // Navigate to the quote detail view
                  console.log(`[DEBUG] Navigating to quote ${quote.id}`);
                  sessionStorage.setItem('patient_portal_section', 'quotes');
                  setLocation(`/portal/quotes/${quote.id}`);
                }}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                getStatusBadge={getStatusBadge}
                getStatusIcon={getStatusIcon}
                onClick={() => {
                  // Navigate to the quote detail view
                  console.log(`[DEBUG] Navigating to quote ${quote.id}`);
                  sessionStorage.setItem('patient_portal_section', 'quotes');
                  setLocation(`/portal/quotes/${quote.id}`);
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Card component for individual quotes
function QuoteCard({ quote, getStatusBadge, getStatusIcon, onClick }) {
  const { t } = useTranslation();
  const status = getStatusBadge(quote.status);
  const statusIcon = getStatusIcon(quote.status);
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {quote.title || `Quote #${quote.id.toString().slice(0, 8)}`}
            </CardTitle>
            <CardDescription className="line-clamp-1">
              {quote.clinicName || 'Multiple Clinics'}
            </CardDescription>
          </div>
          <Badge className={status.color}>{status.text}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">{t('quotes.created_date', 'Created')}</span>
            <span className="font-medium">{formatDate(quote.createdAt) || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t('quotes.treatments', 'Treatments')}</span>
            <span className="font-medium">{quote.treatmentCount || 'Multiple'}</span>
          </div>
          {quote.totalPrice && (
            <div className="flex justify-between">
              <span className="text-gray-500">{t('quotes.estimated_cost', 'Est. Cost')}</span>
              <span className="font-medium">£{quote.totalPrice}</span>
            </div>
          )}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="pt-3 pb-3">
        <div className="flex items-center text-sm text-gray-600 w-full justify-between">
          <div className="flex items-center">
            {statusIcon}
            <span className="ml-2">{status.text}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
            {t('quotes.view_details', 'View Details')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default PatientQuotesContent;