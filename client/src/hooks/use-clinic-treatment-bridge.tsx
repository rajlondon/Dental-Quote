/**
 * Clinic Treatment Bridge Hook
 * 
 * This hook acts as a bridge between the legacy quote system and the new unified treatment plans system.
 * It provides a consistent interface for clinic staff to interact with treatment plans and quotes,
 * regardless of which underlying system is being used.
 */
import React, { useMemo } from 'react';
import { useUnifiedTreatmentPlans } from '@/hooks/use-unified-treatment-plans';
import { useQuotes } from '@/hooks/use-quotes';
import { QuoteStatus } from '@/types/quote';
import {
  TreatmentPlan,
  TreatmentPlanStatus,
  TreatmentItem,
  TreatmentPlanFilters
} from '@shared/models/treatment-plan';

// Add a type for the expired status which will be needed in the legacy system
// but isn't in the current TreatmentPlanStatus enum
type ExtendedTreatmentPlanStatus = TreatmentPlanStatus | 'EXPIRED';

// Type definitions for the bridge interface - consistent across both systems
export interface ClinicQuoteItem {
  id: string | number;
  patientName: string;
  patientEmail?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  status: string;
  totalPrice: number;
  currency: string;
  treatments: {
    name: string;
    quantity: number;
    price: number;
    currency?: string;
    isPackage?: boolean;
    isSpecialOffer?: boolean;
    packageId?: string;
    specialOfferId?: string;
  }[];
  source?: string;
  sourceType?: 'standard' | 'package' | 'special_offer';
}

// Interface for the bridge hook to maintain a consistent API
export interface ClinicTreatmentBridgeResult {
  // Queries
  allItems: ClinicQuoteItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  
  // Item details
  getItemDetails: (id: string | number) => {
    data: ClinicQuoteItem | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  
  // Mutations
  updateItemStatus: (id: string | number, newStatus: string) => Promise<void>;
  
  // Utility functions
  mapStatusToLegacy: (status: TreatmentPlanStatus) => QuoteStatus;
  mapStatusToUnified: (status: QuoteStatus) => TreatmentPlanStatus;
  
  // System info
  usingUnifiedSystem: boolean;
}

// Define type for a TreatmentItem with extended properties
interface ExtendedTreatmentItem extends TreatmentItem {
  isPackage?: boolean;
  isSpecialOffer?: boolean;
  packageId?: string;
  specialOfferId?: string;
}

// Define type for TreatmentPlan with extended properties
interface ExtendedTreatmentPlan extends Omit<TreatmentPlan, 'treatments'> {
  treatments: ExtendedTreatmentItem[];
  patientEmail?: string;
  packageId?: string;
  specialOfferId?: string;
  source?: string;
}

/**
 * Hook that provides a unified interface to work with both the legacy quote system
 * and the new unified treatment plans system.
 */
export function useClinicTreatmentBridge(): ClinicTreatmentBridgeResult {
  // Get access to both systems
  const unifiedSystem = useUnifiedTreatmentPlans();
  const legacySystem = useQuotes();
  
  // Check which system to use based on environment or user preference
  // For now, we'll use a feature flag from localStorage
  const usingUnifiedSystem = useMemo(() => {
    // Check if we should force using the unified system
    return localStorage.getItem('use_unified_treatment_system') === 'true';
  }, []);
  
  // Define mapping functions between the two systems' status values
  const mapStatusToLegacy = (unifiedStatus: TreatmentPlanStatus): QuoteStatus => {
    // Map the new unified status to legacy status
    switch (unifiedStatus) {
      case TreatmentPlanStatus.DRAFT:
        return 'draft';
      case TreatmentPlanStatus.PROPOSED:
        return 'sent';
      case TreatmentPlanStatus.ACCEPTED:
        return 'accepted';
      case TreatmentPlanStatus.REJECTED:
        return 'rejected';
      case TreatmentPlanStatus.IN_PROGRESS:
        return 'in_progress';
      case TreatmentPlanStatus.COMPLETED:
        return 'completed';
      case TreatmentPlanStatus.CANCELLED:
        return 'cancelled';
      default:
        return 'draft';
    }
  };
  
  const mapStatusToUnified = (legacyStatus: QuoteStatus): TreatmentPlanStatus => {
    // Map the legacy status to unified status
    switch (legacyStatus) {
      case 'draft':
      case 'assigned':
        return TreatmentPlanStatus.DRAFT;
      case 'in_progress':
        return TreatmentPlanStatus.IN_PROGRESS;
      case 'sent':
        return TreatmentPlanStatus.PROPOSED;
      case 'accepted':
        return TreatmentPlanStatus.ACCEPTED;
      case 'rejected':
        return TreatmentPlanStatus.REJECTED;
      case 'completed':
        return TreatmentPlanStatus.COMPLETED;
      case 'cancelled':
        return TreatmentPlanStatus.CANCELLED;
      case 'expired':
        // Since 'EXPIRED' doesn't exist in TreatmentPlanStatus, map to CANCELLED
        return TreatmentPlanStatus.CANCELLED;
      default:
        return TreatmentPlanStatus.DRAFT;
    }
  };
  
  // Query for all treatment plans/quotes
  const { 
    useTreatmentPlans,
    changeTreatmentPlanStatus 
  } = unifiedSystem;
  
  const { 
    clinicQuotesQuery, 
    getQuoteQuery, 
    updateQuoteMutation 
  } = legacySystem;
  
  // Use the appropriate data source based on which system we're using
  // Helper function to safely convert nullable values to non-nullable
  const safeString = (value: string | null | undefined): string => {
    return value !== null && value !== undefined ? value : '';
  };
  
  const safeBool = (value: boolean | null | undefined): boolean => {
    return value === true;
  };
  
  // Only send parameters supported by API
  const treatmentPlansQuery = useTreatmentPlans({
    limit: 50,
    offset: 0
  });
  
  // Convert unified treatment plans to the common format
  const convertUnifiedPlanToClinicQuote = (plan: TreatmentPlan): ClinicQuoteItem => {
    // Handle nullable fields safely
    const patientName = safeString(plan.patientName) || 'Unknown Patient';
    
    return {
      id: plan.id,
      patientName,
      patientEmail: safeString((plan as ExtendedTreatmentPlan).patientEmail),
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      status: plan.status,
      totalPrice: plan.totalPrice || plan.treatments.reduce(
        (sum, t) => sum + (t.price * (t.quantity || 1)), 0
      ),
      currency: 'GBP', // Default currency
      treatments: plan.treatments.map(t => ({
        name: t.name,
        quantity: t.quantity || 1,
        price: t.price,
        // These fields might not exist in the TreatmentItem type
        isPackage: safeBool((t as ExtendedTreatmentItem).isPackage),
        isSpecialOffer: safeBool((t as ExtendedTreatmentItem).isSpecialOffer),
        packageId: safeString((t as ExtendedTreatmentItem).packageId),
        specialOfferId: safeString((t as ExtendedTreatmentItem).specialOfferId)
      })),
      source: safeString((plan as ExtendedTreatmentPlan).source || plan.sourceId),
      sourceType: determineSourceType(plan)
    };
  };
  
  // Helper function to determine source type from the unified plan
  const determineSourceType = (plan: TreatmentPlan): 'standard' | 'package' | 'special_offer' => {
    const extendedPlan = plan as ExtendedTreatmentPlan;
    
    if (extendedPlan.packageId || plan.sourceType === 'PACKAGE') {
      return 'package';
    } else if (extendedPlan.specialOfferId || plan.offerId || plan.sourceType === 'SPECIAL_OFFER') {
      return 'special_offer';
    } else {
      return 'standard';
    }
  };
  
  // Format data from unified treatment plans
  const unifiedItems = useMemo(() => {
    if (usingUnifiedSystem && treatmentPlansQuery.data?.plans) {
      return treatmentPlansQuery.data.plans.map(convertUnifiedPlanToClinicQuote);
    }
    return [];
  }, [usingUnifiedSystem, treatmentPlansQuery.data]);
  
  // Format data from legacy quotes
  const legacyItems = useMemo(() => {
    if (!usingUnifiedSystem && clinicQuotesQuery.data) {
      return clinicQuotesQuery.data.map(quote => {
        // Access safely with optional chaining
        const treatments = quote.treatments?.map(t => ({
          name: t.name || 'Unnamed Treatment',
          quantity: t.quantity || 1,
          price: t.price || 0,
          isPackage: !!t.packageId,
          isSpecialOffer: !!t.specialOfferId
        })) || [];
        
        return {
          id: quote.id,
          patientName: quote.patientName || 'Unknown Patient',
          patientEmail: quote.patientEmail,
          createdAt: quote.createdAt,
          updatedAt: quote.updatedAt,
          status: quote.status,
          totalPrice: (quote.totalGBP || 0),
          currency: 'GBP',
          treatments,
          source: 'legacy',
          sourceType: 'standard' as const
        };
      });
    }
    return [];
  }, [usingUnifiedSystem, clinicQuotesQuery.data]);
  
  // Combine items based on which system we're using
  const allItems = usingUnifiedSystem ? unifiedItems : legacyItems;
  
  // Function to get details for a specific item - but without conditionally calling hooks
  const getItemDetails = (id: string | number) => {
    // First convert IDs to the right format regardless of which system we're using
    const planId = typeof id === 'number' ? id.toString() : id;
    const quoteId = typeof id === 'string' ? parseInt(id) : id;
    
    // We always call both hooks to avoid conditional hook calls
    const planQuery = unifiedSystem.useTreatmentPlan(planId);
    const quoteQuery = getQuoteQuery(quoteId as number);
    
    // But we only use the data from the appropriate system
    if (usingUnifiedSystem) {
      return {
        data: planQuery.data ? convertUnifiedPlanToClinicQuote(planQuery.data) : null,
        isLoading: planQuery.isLoading,
        error: planQuery.error,
        refetch: planQuery.refetch
      };
    } else {
      // Format the legacy quote data to match our common format
      const formattedData = quoteQuery.data?.quoteRequest ? {
        id: quoteQuery.data.quoteRequest.id,
        patientName: quoteQuery.data.quoteRequest.patientName || 'Unknown Patient',
        patientEmail: quoteQuery.data.quoteRequest.patientEmail,
        createdAt: quoteQuery.data.quoteRequest.createdAt,
        updatedAt: quoteQuery.data.quoteRequest.updatedAt,
        status: quoteQuery.data.quoteRequest.status,
        totalPrice: quoteQuery.data.quoteRequest.totalGBP || 0,
        currency: 'GBP',
        treatments: (quoteQuery.data.quoteRequest.treatments || []).map(t => ({
          name: t.name || 'Unnamed Treatment',
          quantity: t.quantity || 1,
          price: t.price || 0,
          isPackage: !!t.packageId,
          isSpecialOffer: !!t.specialOfferId
        }))
      } : null;
      
      return {
        data: formattedData,
        isLoading: quoteQuery.isLoading,
        error: quoteQuery.error,
        refetch: quoteQuery.refetch
      };
    }
  };
  
  // Function to update the status of an item
  const updateItemStatus = async (id: string | number, newStatus: string) => {
    try {
      if (usingUnifiedSystem) {
        // Convert to string if it's a number
        const planId = typeof id === 'number' ? id.toString() : id;
        
        // Map the status to the unified system's status
        const unifiedStatus = mapStatusToUnified(newStatus as QuoteStatus);
        
        // Update the plan's status
        await changeTreatmentPlanStatus.mutateAsync({
          id: planId,
          status: unifiedStatus
        });
        
        // Refresh data
        treatmentPlansQuery.refetch();
      } else {
        // Convert to number if it's a string
        const quoteId = typeof id === 'string' ? parseInt(id) : id;
        
        // Update the quote's status
        await updateQuoteMutation.mutateAsync({
          id: quoteId as number,
          data: { status: newStatus as QuoteStatus }
        });
        
        // Refresh data
        clinicQuotesQuery.refetch();
      }
    } catch (error) {
      console.error(`Failed to update status for item ${id}:`, error);
      throw error;
    }
  };
  
  // Function to refetch all data
  const refetch = async () => {
    if (usingUnifiedSystem) {
      await treatmentPlansQuery.refetch();
    } else {
      await clinicQuotesQuery.refetch();
    }
  };
  
  // Return the unified interface
  return {
    allItems,
    isLoading: usingUnifiedSystem ? treatmentPlansQuery.isLoading : clinicQuotesQuery.isLoading,
    error: usingUnifiedSystem ? treatmentPlansQuery.error : clinicQuotesQuery.error,
    refetch,
    getItemDetails,
    updateItemStatus,
    mapStatusToLegacy,
    mapStatusToUnified,
    usingUnifiedSystem
  };
}