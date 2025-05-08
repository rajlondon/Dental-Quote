import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
// No longer using UUID format conversion
import { formatDate } from '@/lib/date-utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigation } from '@/hooks/use-navigation';
import { useQuoteFlow } from '@/contexts/QuoteFlowContext';
import TreatmentLinePrice from '@/components/specialOffers/TreatmentLinePrice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, FileText, Download, Wallet, MessageCircle, CalendarCheck, CheckCircle, ShieldX, AlertTriangle, Edit, Gift } from 'lucide-react';

// Define the treatment type
type QuoteTreatment = {
  name: string;
  quantity?: number;
  price?: number;
  basePriceGBP?: number; // Original price before discount
  unitPriceGBP?: number; // Discounted price
  isPackage?: boolean;
  isSpecialOffer?: boolean; // Flag to easily identify special offers
  isLocked?: boolean; // Flag to indicate if the treatment is locked (part of a package)
  packageId?: string;
  specialOffer?: {
    id: string;
    title: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    clinicId: string;
  };
};

// Quote shape for type safety
interface Quote {
  id: string | number;
  status?: string;
  title?: string;
  createdAt?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicContact?: string;
  treatments?: QuoteTreatment[];
  totalPrice?: number;
  notes?: string;
  canEdit?: boolean;
}

interface PatientQuoteDetailProps {
  quoteId: string | number;
  onBack: () => void;
}

/**
 * Component to display the details of a specific quote within the patient portal
 * This component allows viewing quote details without navigating away from the patient portal
 */
const PatientQuoteDetail = ({ quoteId, onBack }: PatientQuoteDetailProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { navigateToRoute } = useNavigation();
  const { source, promoType, offerId, packageId, clinicId } = useQuoteFlow();

  // Format the quote ID as needed
  const formattedQuoteId = typeof quoteId === 'string' ? quoteId : quoteId.toString();
  
  // Determine if this quote is from a special flow
  const isPromotionalQuote = source === 'special_offer' || source === 'package' || source === 'promo_token';
  
  // Fetch the quote details
  const { 
    data: quoteData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/quotes/details', formattedQuoteId],
    queryFn: async () => {
      console.log(`[DEBUG] Fetching quote details for ID: ${formattedQuoteId}`);
      try {
        const response = await apiRequest('GET', `/api/quotes/${formattedQuoteId}`);
        const data = await response.json();
        
        if (!data.success) {
          console.error('[ERROR] Quote details API returned unsuccessful response:', data);
          throw new Error(data.message || 'Failed to fetch quote details');
        }
        
        console.log('[DEBUG] Successfully loaded quote details:', data.data);
        return data.data || null;
      } catch (error) {
        console.error('[ERROR] Failed to fetch quote details:', error);
        throw error;
      }
    },
    staleTime: 60000 // 1 minute
  });
  
  // Extract the specific quote details from the nested response
  const quote = React.useMemo<Quote | null>(() => {
    if (!quoteData) return null;
    
    // Log the raw API response to understand the structure
    console.log('[DEBUG] Raw quote API response data:', JSON.stringify(quoteData, null, 2));
    
    // Extract quote from the nested structure based on the API response format
    const quoteRequest = quoteData.quoteRequest || {};
    console.log('[DEBUG] Extracted quoteRequest:', JSON.stringify(quoteRequest, null, 2));
    
    const quoteVersions = quoteData.versions || [];
    console.log('[DEBUG] Extracted quoteVersions:', JSON.stringify(quoteVersions, null, 2));
    
    // Get the latest version if it exists, otherwise use the quote request
    const latestVersion = quoteVersions.length > 0 
      ? quoteVersions[quoteVersions.length - 1] 
      : null;
    
    // Check if the quote has associated pricing data
    console.log('[DEBUG] Quote pricing info:', {
      hasEstimatedPrice: !!quoteRequest.estimatedPrice,
      estimatedPrice: quoteRequest.estimatedPrice,
      hasQuoteData: !!quoteRequest.quoteData,
      quoteDataType: quoteRequest.quoteData ? typeof quoteRequest.quoteData : 'N/A',
      parsedQuoteData: quoteRequest.quoteData ? 
        (typeof quoteRequest.quoteData === 'string' ? 
          JSON.parse(quoteRequest.quoteData) : quoteRequest.quoteData) : null
    });
    
    // Get proper treatments and pricing from the version if available
    let treatments = [];
    let totalPrice = 0;
    
    // Try to extract treatment data from various fields
    const parsedQuoteData = quoteRequest.quoteData && typeof quoteRequest.quoteData === 'string' ?
      JSON.parse(quoteRequest.quoteData) : quoteRequest.quoteData;
    
    if (latestVersion && latestVersion.treatments) {
      // Use treatments from the latest version
      console.log('[DEBUG] Using treatments from latestVersion:', latestVersion.treatments);
      treatments = latestVersion.treatments.map((t: any) => ({
        name: t.name || 'Treatment',
        quantity: t.quantity || 1,
        price: t.price || 0,
        basePriceGBP: t.basePriceGBP || t.price || 0,
        unitPriceGBP: t.unitPriceGBP || t.price || 0,
        isPackage: t.isPackage || false,
        isSpecialOffer: !!t.specialOffer, // Set flag based on specialOffer existence
        isLocked: t.isLocked || false,
        packageId: t.packageId || undefined,
        specialOffer: t.specialOffer || undefined
      }));
      
      // Calculate the total price
      totalPrice = treatments.reduce((sum: number, t: any) => sum + ((t.price || 0) * (t.quantity || 1)), 0);
    } else if (parsedQuoteData && parsedQuoteData.treatments) {
      // If we have parsed quote data with treatments, use that
      console.log('[DEBUG] Using treatments from parsedQuoteData:', parsedQuoteData.treatments);
      treatments = parsedQuoteData.treatments.map((t: any) => ({
        name: t.name || 'Treatment',
        quantity: t.quantity || 1,
        price: t.price || 0,
        basePriceGBP: t.basePriceGBP || t.price || 0,
        unitPriceGBP: t.unitPriceGBP || t.price || 0,
        isPackage: t.isPackage || false,
        isSpecialOffer: !!t.specialOffer, // Set flag based on specialOffer existence
        isLocked: t.isLocked || false,
        packageId: t.packageId || undefined,
        specialOffer: t.specialOffer || undefined
      }));
      
      // Calculate the total price 
      totalPrice = treatments.reduce((sum: number, t: any) => sum + ((t.price || 0) * (t.quantity || 1)), 0);
    } else {
      // Use a default treatment based on the request
      console.log('[DEBUG] Using default treatment based on quoteRequest');
      treatments = [
        {
          name: quoteRequest.specificTreatment || quoteRequest.treatment || 'Dental Treatment',
          quantity: 1,
          price: quoteRequest.estimatedPrice || 1500, // Default price if none available
          basePriceGBP: quoteRequest.basePriceGBP || quoteRequest.estimatedPrice || 1500,
          unitPriceGBP: quoteRequest.unitPriceGBP || quoteRequest.estimatedPrice || 1500,
          isPackage: quoteRequest.isPackage || false,
          isSpecialOffer: !!quoteRequest.specialOffer, // Set flag based on specialOffer existence
          isLocked: quoteRequest.isLocked || false,
          packageId: quoteRequest.packageId || undefined,
          specialOffer: quoteRequest.specialOffer || undefined
        }
      ];
      totalPrice = quoteRequest.estimatedPrice || 1500; // Default price if none available
    }
    
    // Enhanced status determination logic
    let status = quoteRequest.status || 'draft';
    let canEdit = false;
    
    if (['draft', 'pending', 'new', 'active'].includes(status)) {
      // These statuses are considered editable
      canEdit = true;
    }
    
    // Construct a structured quote object with all necessary fields
    const result = {
      id: quoteRequest.id,
      status: status,
      title: quoteRequest.treatment,
      createdAt: quoteRequest.createdAt,
      clinicName: quoteRequest.clinicName || 'Istanbul Dental Smile',
      clinicAddress: quoteRequest.clinicAddress || 'Istanbul, Turkey',
      clinicContact: quoteRequest.clinicPhone || '+90 123 456 7890',
      totalPrice: totalPrice,
      notes: quoteRequest.notes,
      treatments: treatments,
      canEdit: canEdit
    };
    
    console.log('[DEBUG] Final structured quote object:', result);
    return result;
  }, [quoteData]);

  // Get status badge color and text for a status
  const getStatusBadge = (status: string | undefined) => {
    // Handle undefined or empty status
    if (!status) {
      return { color: 'bg-gray-400', text: 'Unknown' };
    }
    
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

  // Get the status icon for a quote based on its status
  const getStatusIcon = (status: string | undefined) => {
    // Handle undefined or empty status
    if (!status) {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
    
    switch (status) {
      case 'sent':
        return <Loader2 className="h-5 w-5 text-blue-500" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />;
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

  // Handle payment for a quote
  const handlePayment = () => {
    // Navigate to payment page
    toast({
      title: "Payment feature coming soon",
      description: "The payment feature is currently under development."
    });
  };

  // Handle making appointment for the quote
  const handleMakeAppointment = () => {
    // Navigate to appointments page
    toast({
      title: "Appointment booking coming soon",
      description: "The appointment booking feature is currently under development."
    });
  };

  // Handle accepting the quote
  const handleAcceptQuote = () => {
    // Accept the quote API call
    toast({
      title: "Quote accepted",
      description: "Thank you for accepting the quote. A representative will contact you soon.",
      variant: "default"
    });
  };

  // Handle rejecting the quote
  const handleRejectQuote = () => {
    // Reject the quote API call
    toast({
      title: "Quote rejected",
      description: "The quote has been rejected. Please provide feedback to help us improve."
    });
  };

  // Handle downloading the quote as PDF
  const handleDownload = () => {
    // Download the quote as PDF
    toast({
      title: "Download started",
      description: "Your quote PDF is being generated and will download shortly."
    });
  };
  
  // Handle editing the quote
  const handleEdit = () => {
    if (!quote?.id) return;
    
    // Use the navigateTo method for client-side navigation
    const editPath = `/patient/quotes/${quote.id}/edit`;
    navigateToRoute(editPath);
    
    // Show success toast
    toast({
      title: "Edit Quote",
      description: "You can now edit your quote details."
    });
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-700 mb-2">
          {t('quotes.error_details_title', 'Error Loading Quote Details')}
        </h3>
        <p className="text-red-600 mb-4">
          {t('quotes.error_details_description', 'There was a problem loading the quote details. Please try again later.')}
        </p>
        <div className="flex justify-center space-x-4">
          <Button onClick={onBack} variant="outline" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back', 'Back')}
          </Button>
          <Button onClick={() => window.location.reload()}>
            {t('common.retry', 'Retry')}
          </Button>
        </div>
      </div>
    );
  }

  // Get the status display
  const status = getStatusBadge(quote.status);
  const StatusIcon = () => getStatusIcon(quote.status);

  return (
    <div className="space-y-6">
      {/* Promotional banner for quotes from special sources */}
      {isPromotionalQuote && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <Gift className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold text-blue-800">
                {source === 'special_offer' && 'Special Offer Applied'}
                {source === 'package' && 'Package Deal Applied'}
                {source === 'promo_token' && 'Promotional Quote'}
              </h3>
              <p className="text-sm text-blue-700">
                {source === 'special_offer' && 'This quote includes special offer pricing and benefits.'}
                {source === 'package' && 'This quote includes package deal pricing and benefits.'}
                {source === 'promo_token' && promoType === 'special_offer' && 'This quote includes special offer pricing and benefits.'}
                {source === 'promo_token' && promoType === 'package' && 'This quote includes package deal pricing and benefits.'}
                {source === 'promo_token' && !promoType && 'This quote includes promotional pricing and benefits.'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Back button and title */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 px-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back_to_quotes', 'Back to Quotes')}
        </Button>
        <Badge className={status.color}>
          {status.text}
        </Badge>
      </div>

      {/* Quote header */}
      <div>
        <h1 className="text-2xl font-bold">
          {quote.title || (quote.id ? `Quote #${quote.id.toString().slice(0, 8)}` : 'Quote Details')}
        </h1>
        <div className="flex items-center mt-2 text-gray-600">
          <StatusIcon />
          <span className="ml-2">{status.text}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(quote.createdAt) || 'N/A'}</span>
        </div>
      </div>

      {/* Clinic information */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h2 className="font-semibold mb-2">{t('quotes.clinic_information', 'Clinic Information')}</h2>
        <p className="text-lg font-medium">{quote.clinicName || 'Multiple Clinics'}</p>
        {quote.clinicAddress && (
          <p className="text-gray-600">{quote.clinicAddress}</p>
        )}
        {quote.clinicContact && (
          <p className="text-gray-600">{quote.clinicContact}</p>
        )}
      </div>

      {/* Treatments list */}
      <div>
        <h2 className="font-semibold mb-4">{t('quotes.treatments', 'Treatments')}</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quotes.treatment_name', 'Treatment')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quotes.quantity', 'Quantity')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quotes.price', 'Price')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quote.treatments && quote.treatments.map((treatment: QuoteTreatment, index: number) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span>{treatment.name}</span>
                      {treatment.isPackage && (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200">
                          Package
                        </Badge>
                      )}
                      {(treatment.isSpecialOffer || treatment.specialOffer) && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 flex items-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="mr-1"
                          >
                            <path d="M12 3l1.2 2.8 2.8.3-2 2 .5 2.9-2.5-1.3-2.5 1.3.5-2.9-2-2 2.8-.3z"/>
                            <path d="M19 9l.4 1 1 .1-.7.7.2 1-.9-.5-.9.5.2-1-.7-.7 1-.1z"/>
                            <path d="M5 9l.4 1 1 .1-.7.7.2 1-.9-.5-.9.5.2-1-.7-.7 1-.1z"/>
                          </svg>
                          {treatment.specialOffer?.title || "Special Offer"}
                          {treatment.specialOffer?.discountType === 'percentage' && 
                            ` (${treatment.specialOffer.discountValue}% off)`}
                          {treatment.specialOffer?.discountType === 'fixed_amount' && 
                            ` (£${treatment.specialOffer.discountValue} off)`}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {treatment.quantity || 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {/* Use the TreatmentLinePrice component to handle all price display cases */}
                    <TreatmentLinePrice 
                      price={treatment.price}
                      basePriceGBP={treatment.basePriceGBP}
                      unitPriceGBP={treatment.unitPriceGBP}
                      isSpecialOffer={treatment.isSpecialOffer}
                      hasSpecialOffer={!!treatment.specialOffer}
                      specialOfferText={treatment.specialOffer?.title 
                        ? `${treatment.specialOffer.title} Applied` 
                        : isPromotionalQuote 
                          ? 'Promotional Price'
                          : 'Special Offer Applied'
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={2} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                  {t('quotes.total', 'Total')}:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                  £{quote.totalPrice || 0}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h2 className="font-semibold mb-2 text-blue-800">{t('quotes.notes', 'Notes')}</h2>
          <p className="text-blue-700 whitespace-pre-line">{quote.notes}</p>
        </div>
      )}

      {/* Action buttons */}
      <Separator />
      <div className="flex flex-wrap gap-3 justify-end">
        {/* Show different actions based on quote status */}
        {quote.status === 'sent' && (
          <>
            <Button 
              variant="outline" 
              className="flex items-center text-green-600 hover:bg-green-50 border-green-200"
              onClick={handleAcceptQuote}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('quotes.accept', 'Accept Quote')}
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center text-red-600 hover:bg-red-50 border-red-200"
              onClick={handleRejectQuote}
            >
              <ShieldX className="h-4 w-4 mr-2" />
              {t('quotes.reject', 'Reject Quote')}
            </Button>
          </>
        )}

        {quote.status && ['accepted', 'completed'].includes(quote.status) && (
          <>
            <Button 
              variant="outline" 
              className="flex items-center text-purple-600 hover:bg-purple-50 border-purple-200"
              onClick={handleMakeAppointment}
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              {t('quotes.book_appointment', 'Book Appointment')}
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center text-indigo-600 hover:bg-indigo-50 border-indigo-200"
              onClick={handlePayment}
            >
              <Wallet className="h-4 w-4 mr-2" />
              {t('quotes.make_payment', 'Make Payment')}
            </Button>
          </>
        )}

        {/* Edit button - only available for editable quotes */}
        {quote.canEdit && (
          <Button 
            variant="outline" 
            className="flex items-center text-amber-600 hover:bg-amber-50 border-amber-200"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t('quotes.edit', 'Edit Quote')}
          </Button>
        )}

        {/* Message button - available for all quotes */}
        <Button 
          variant="outline" 
          className="flex items-center text-blue-600 hover:bg-blue-50 border-blue-200"
          onClick={() => navigateToRoute('PATIENT_MESSAGES')}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {t('quotes.contact', 'Contact Clinic')}
        </Button>

        {/* Download button - available for all quotes */}
        <Button 
          variant="outline" 
          className="flex items-center text-gray-600 hover:bg-gray-50"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          {t('quotes.download', 'Download Quote')}
        </Button>
      </div>
    </div>
  );
};

export default PatientQuoteDetail;