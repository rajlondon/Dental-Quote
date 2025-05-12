/**
 * Bridge Quote Adapter
 * 
 * This component adapts our unified ClinicQuoteItem format to the format expected
 * by the QuoteDetail component from the legacy system.
 */
import React from 'react';
import { ClinicQuoteItem } from '@/hooks/use-clinic-treatment-bridge';
import { QuoteRequest, QuoteVersion } from '@/types/quote';
import QuoteDetail, { ActionButton } from '@/components/quotes/quote-detail';

interface BridgeQuoteAdapterProps {
  item: ClinicQuoteItem;
  portalType: 'patient' | 'clinic' | 'admin';
  onBack?: () => void;
  actions?: ActionButton[];
}

export function BridgeQuoteAdapter({
  item,
  portalType,
  onBack,
  actions = []
}: BridgeQuoteAdapterProps) {
  // Convert ClinicQuoteItem to a format compatible with QuoteRequest
  const adaptedQuoteRequest: QuoteRequest = {
    id: typeof item.id === 'string' ? parseInt(item.id) : item.id as number,
    // Required fields from QuoteRequest
    name: item.patientName,
    email: item.patientEmail || 'unknown@example.com',
    treatment: 'Dental Treatment', // Default treatment category
    consent: true, // Assume consent is given
    status: item.status as any, // Cast to QuoteStatus
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : item.createdAt.toISOString(),
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : item.updatedAt.toISOString(),
    hasXrays: false,
    viewedByAdmin: true,
    viewedByClinic: true,
    
    // Optional fields
    budget: item.totalPrice,
    // Add special information related to source type
    adminNotes: item.sourceType === 'package' 
      ? 'Created from treatment package' 
      : item.sourceType === 'special_offer' 
        ? 'Created from special offer' 
        : undefined,
  };
  
  // Create versions array for compatibility
  const adaptedVersions: QuoteVersion[] = [{
    id: 1,
    quoteRequestId: adaptedQuoteRequest.id,
    versionNumber: 1,
    createdById: 1, // Default admin ID
    createdAt: adaptedQuoteRequest.createdAt,
    status: 'draft', // Default version status
    quoteData: {
      treatments: item.treatments.map((t, index) => ({
        id: index + 1, // Generate sequential IDs
        treatmentName: t.name,
        quantity: t.quantity,
        unitPrice: t.price,
        total: t.price * t.quantity,
        category: t.isPackage ? 'Package' : t.isSpecialOffer ? 'Special Offer' : 'Standard Treatment'
      })),
      subtotal: item.totalPrice,
      total: item.totalPrice,
      currency: item.currency || 'GBP',
    }
  }];
  
  return (
    <QuoteDetail
      quoteRequest={adaptedQuoteRequest}
      versions={adaptedVersions}
      portalType={portalType}
      onBack={onBack}
      actions={actions?.map(action => ({
        ...action,
        variant: action.variant || "default"
      }))}
    />
  );
}