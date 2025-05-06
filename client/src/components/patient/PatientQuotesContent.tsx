import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarClock, 
  CheckCircle, 
  Clock, 
  FileText, 
  ShieldX, 
  AlertTriangle, 
  Loader2, 
  Plus, 
  Eye, 
  Edit, 
  Trash, 
  Download,
  MessageCircle,
  MoreVertical,
  Wallet
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  canEdit?: boolean;
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
  onView: (quoteId: number) => void;
  onEdit: (quoteId: number) => void;
  onDownload: (quoteId: number) => void;
  onContactClinic: (quoteId: number) => void;
  onMakePayment?: (quoteId: number) => void;
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
function QuoteCard({ 
  quote, 
  getStatusBadge, 
  getStatusIcon, 
  onView,
  onEdit,
  onDownload,
  onContactClinic,
  onMakePayment 
}: QuoteCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { navigateTo, navigateToRoute } = useNavigation();
  const status = getStatusBadge(quote.status);
  const statusIcon = getStatusIcon(quote.status);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Handle viewing quote details
  const handleViewDetails = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent parent card click
    
    // Store the current section in session storage
    sessionStorage.setItem('patient_portal_section', 'quotes');
    sessionStorage.setItem('viewing_quote_id', quote.id.toString());
    
    // Navigate to patient portal with quote ID as query parameter
    window.location.href = `/patient-portal?section=quotes&quoteId=${quote.id}`;
  };
  
  // Handle editing the quote
  const handleEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Navigate to edit page with params
    window.location.href = `/patient-portal?section=quotes&action=edit&id=${quote.id}`;
    
    toast({
      title: "Edit Quote",
      description: "You can now edit your quote details."
    });
  };
  
  // Handle downloading the quote
  const handleDownload = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Call API to download quote PDF
    window.open(`/api/quotes/${quote.id}/pdf`, '_blank');
    
    toast({
      title: "Downloading Quote",
      description: "Your quote PDF is being generated and will download shortly."
    });
  };
  
  // Handle contacting the clinic
  const handleContactClinic = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Navigate to messages
    navigateToRoute('PATIENT_MESSAGES');
    
    toast({
      title: "Contact Clinic",
      description: "You can now message the clinic about your quote."
    });
  };
  
  // Handle making a payment
  const handleMakePayment = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Navigate to payment page
    window.location.href = `/treatment-payment/${quote.id}`;
    
    toast({
      title: "Payment",
      description: "Redirecting to payment page..."
    });
  };
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleViewDetails} // Use our new handler directly
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
                    onClick={handleViewDetails} // Use our new direct navigation handler
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Details</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Action Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-gray-600 hover:bg-gray-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  
                  {/* View Details */}
                  <DropdownMenuItem onClick={(e) => handleViewDetails()}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  
                  {/* Edit - only for specific statuses or if canEdit is true */}
                  {(quote.canEdit || ['draft', 'pending', 'sent'].includes(quote.status)) && (
                    <DropdownMenuItem onClick={(e) => handleEdit()}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Quote
                    </DropdownMenuItem>
                  )}
                  
                  {/* Download */}
                  <DropdownMenuItem onClick={(e) => handleDownload()}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </DropdownMenuItem>
                  
                  {/* Contact Clinic */}
                  <DropdownMenuItem onClick={(e) => handleContactClinic()}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Clinic
                  </DropdownMenuItem>
                  
                  {/* Make Payment - only for accepted quotes */}
                  {quote.status === 'accepted' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => handleMakePayment()}>
                        <Wallet className="h-4 w-4 mr-2" />
                        Make Payment
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default PatientQuotesContent;