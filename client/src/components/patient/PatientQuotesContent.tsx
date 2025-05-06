import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, CheckCircle, Clock, FileText, ShieldX, AlertTriangle, Loader2, Plus, Eye, PencilIcon, Trash, DownloadIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { useNavigation } from '@/hooks/use-navigation';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

// TypeScript interfaces for better type safety
interface Quote {
  id: number;
  userId: number;
  name: string;
  email: string;
  treatment: string;
  specificTreatment?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  clinicName?: string;
  treatmentCount?: number;
  totalPrice?: number;
  title?: string;
  [key: string]: any; // Allow additional properties
}

interface StatusBadge {
  color: string;
  text: string;
}

interface QuoteCardProps {
  quote: Quote;
  getStatusBadge: (status: string) => StatusBadge;
  getStatusIcon: (status: string) => React.ReactNode;
  onClick: () => void;
}

/**
 * Patient quotes display component optimized for use directly in the patient portal
 * This component DISPLAYS quotes data, while PatientQuotesPage is now only a redirect component
 */
export function PatientQuotesContent() {
  const { t } = useTranslation();
  const { navigateTo, navigateToRoute } = useNavigation();
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
  const getStatusBadge = (status: string): StatusBadge => {
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
  const getStatusIcon = (status: string): React.ReactNode => {
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
        <Button
          onClick={() => {
            navigateToRoute('YOUR_QUOTE');
          }}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('quotes.new_quote', 'New Quote Request')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* Left empty for alignment purposes */}
        </div>
        <div>
          <Button 
            onClick={() => {
              navigateToRoute('YOUR_QUOTE');
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Quote Request
          </Button>
        </div>
      </div>
      
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
                  navigateToRoute('PATIENT_QUOTE_DETAIL', { id: quote.id.toString() });
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
                  navigateToRoute('PATIENT_QUOTE_DETAIL', { id: quote.id.toString() });
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
                  navigateToRoute('PATIENT_QUOTE_DETAIL', { id: quote.id.toString() });
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
function QuoteCard({ quote, getStatusBadge, getStatusIcon, onClick }: QuoteCardProps) {
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
          <div className="flex gap-2">
            <TooltipProvider>
              {/* View details button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:bg-blue-50 border-blue-200"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent card click
                      onClick(); // Use the same navigation function
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Details</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Edit button - only show if quote is still in certain states */}
              {['pending', 'assigned', 'in_progress'].includes(quote.status) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 text-amber-600 hover:bg-amber-50 border-amber-200"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent card click
                        // Navigate to edit page or show modal
                        window.alert('Edit functionality will be implemented soon');
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Quote</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Accept button - only show for sent quotes */}
              {quote.status === 'sent' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:bg-green-50 border-green-200"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent card click
                        // Action to accept the quote
                        window.alert('Accept functionality will be implemented soon');
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Accept Quote</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Download button - for completed quotes */}
              {['accepted', 'completed'].includes(quote.status) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 text-purple-600 hover:bg-purple-50 border-purple-200"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent card click
                        // Action to download quote PDF
                        window.alert('Download functionality will be implemented soon');
                      }}
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download Quote</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Delete button - available for all quotes */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:bg-red-50 border-red-200"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent card click
                      // Action to delete quote (with confirmation)
                      if (window.confirm('Are you sure you want to delete this quote?')) {
                        window.alert('Delete functionality will be implemented soon');
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Quote</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default PatientQuotesContent;