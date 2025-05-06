/**
 * Unified Treatment Plan Hook
 * Provides consistent treatment plan functionality across all portals
 * with role-based permissions and operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { TreatmentPlan, TreatmentPlanStatus, TreatmentItem } from '@shared/models/treatment-plan';
import { ensureUuidFormat } from '@/utils/id-converter';

// API paths
const API_TREATMENT_PLANS = '/api/v1/treatment-plans';
const API_TREATMENT_LINES = '/api/v1/treatment-lines';

// Interface for the hook arguments
interface UseTreatmentPlansOptions {
  quoteId?: string;
  planId?: string | number;
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

// Interface for treatment summary
interface TreatmentSummary {
  totalTreatmentLines: number;
  totalCost: number;
  clinics: Array<{
    id: string;
    name: string;
    treatmentCount: number;
    totalCost: number;
  }>;
}

/**
 * Unified hook for treatment plans across all portals
 */
export function useUnifiedTreatmentPlans(options: UseTreatmentPlansOptions = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract options with defaults
  const {
    quoteId,
    planId,
    page = 1,
    limit = 10,
    status,
    search
  } = options;
  
  // Format IDs consistently
  const formattedQuoteId = quoteId ? ensureUuidFormat(quoteId) : undefined;
  const formattedPlanId = planId ? (typeof planId === 'string' ? ensureUuidFormat(planId) : planId) : undefined;
  
  // Build query parameter string
  const getQueryString = () => {
    const params = new URLSearchParams();
    
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    if (formattedQuoteId) params.append('quoteId', formattedQuoteId);
    
    return params.toString();
  };
  
  // Helper function to check permissions
  const hasPermission = (action: 'view' | 'create' | 'update' | 'delete'): boolean => {
    if (!user) return false;
    
    switch (user.role) {
      case 'admin':
        // Admin can do everything
        return true;
        
      case 'clinic_staff':
        // Clinic staff can perform all actions but only on their own plans
        return true;
        
      case 'patient':
        // Patients can view and update their own plans, but not create or delete
        return action === 'view' || action === 'update';
        
      default:
        return false;
    }
  };
  
  // Query to fetch treatment plans or a single plan
  const {
    data: treatmentPlans,
    isLoading: isLoadingPlans,
    error: plansError,
    refetch: refetchPlans
  } = useQuery({
    queryKey: formattedPlanId ? 
      [API_TREATMENT_PLANS, formattedPlanId] : 
      [API_TREATMENT_PLANS, getQueryString()],
    queryFn: async () => {
      console.log(`[API] Fetching treatment plan data with options:`, options);
      
      try {
        // Different endpoint based on whether we're fetching a single plan or multiple
        const endpoint = formattedPlanId ? 
          `${API_TREATMENT_PLANS}/${formattedPlanId}` : 
          `${API_TREATMENT_PLANS}?${getQueryString()}`;
        
        const response = await apiRequest('GET', endpoint);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch treatment plans');
        }
        
        return result.data;
      } catch (error) {
        console.error('[ERROR] Failed to fetch treatment plans:', error);
        throw error;
      }
    },
    enabled: hasPermission('view'),
  });

  // Query to fetch treatment summary stats if needed
  const {
    data: treatmentSummary,
    isLoading: isLoadingSummary,
    error: summaryError,
    refetch: refetchSummary
  } = useQuery({
    queryKey: [API_TREATMENT_PLANS, 'summary', formattedQuoteId],
    queryFn: async () => {
      if (!formattedQuoteId) return null;
      
      try {
        const response = await apiRequest('GET', `${API_TREATMENT_PLANS}/summary/${formattedQuoteId}`);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch treatment summary');
        }
        
        return result.data as TreatmentSummary;
      } catch (error) {
        console.error('[ERROR] Failed to fetch treatment summary:', error);
        return null;
      }
    },
    enabled: !!formattedQuoteId && hasPermission('view'),
  });

  // Mutation to create a new treatment plan
  const createTreatmentPlan = useMutation({
    mutationFn: async (planData: Partial<TreatmentPlan>) => {
      const response = await apiRequest('POST', API_TREATMENT_PLANS, planData);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create treatment plan');
      }
      
      return result.data;
    },
    onSuccess: () => {
      toast({
        title: 'Treatment plan created',
        description: 'The treatment plan was created successfully.',
      });
      
      // Invalidate treatment plans queries to refetch data
      queryClient.invalidateQueries({ queryKey: [API_TREATMENT_PLANS] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create treatment plan',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation to update a treatment plan
  const updateTreatmentPlan = useMutation({
    mutationFn: async ({ id, data }: { id: string | number, data: Partial<TreatmentPlan> }) => {
      const response = await apiRequest('PATCH', `${API_TREATMENT_PLANS}/${id}`, data);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update treatment plan');
      }
      
      return result.data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Treatment plan updated',
        description: 'The treatment plan was updated successfully.',
      });
      
      // Invalidate specific treatment plan query to refetch data
      queryClient.invalidateQueries({ queryKey: [API_TREATMENT_PLANS, variables.id] });
      queryClient.invalidateQueries({ queryKey: [API_TREATMENT_PLANS] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update treatment plan',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation to delete a treatment plan
  const deleteTreatmentPlan = useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiRequest('DELETE', `${API_TREATMENT_PLANS}/${id}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete treatment plan');
      }
      
      return result.data;
    },
    onSuccess: (_, id) => {
      toast({
        title: 'Treatment plan deleted',
        description: 'The treatment plan was deleted successfully.',
      });
      
      // Invalidate treatment plans queries to refetch data
      queryClient.invalidateQueries({ queryKey: [API_TREATMENT_PLANS] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete treatment plan',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation to add a treatment to a plan
  const addTreatmentToPlan = useMutation({
    mutationFn: async ({ planId, treatment }: { planId: string | number, treatment: TreatmentItem }) => {
      const response = await apiRequest('POST', `${API_TREATMENT_PLANS}/${planId}/treatments`, treatment);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to add treatment');
      }
      
      return result.data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Treatment added',
        description: 'The treatment was added to the plan successfully.',
      });
      
      // Invalidate specific treatment plan query to refetch data
      queryClient.invalidateQueries({ queryKey: [API_TREATMENT_PLANS, variables.planId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add treatment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation to update a treatment in a plan
  const updateTreatmentInPlan = useMutation({
    mutationFn: async ({ 
      planId, 
      treatmentId, 
      treatment 
    }: { 
      planId: string | number, 
      treatmentId: string | number, 
      treatment: Partial<TreatmentItem> 
    }) => {
      const response = await apiRequest(
        'PATCH', 
        `${API_TREATMENT_PLANS}/${planId}/treatments/${treatmentId}`, 
        treatment
      );
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update treatment');
      }
      
      return result.data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Treatment updated',
        description: 'The treatment was updated successfully.',
      });
      
      // Invalidate specific treatment plan query to refetch data
      queryClient.invalidateQueries({ queryKey: [API_TREATMENT_PLANS, variables.planId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update treatment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation to remove a treatment from a plan
  const removeTreatmentFromPlan = useMutation({
    mutationFn: async ({ planId, treatmentId }: { planId: string | number, treatmentId: string | number }) => {
      const response = await apiRequest('DELETE', `${API_TREATMENT_PLANS}/${planId}/treatments/${treatmentId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to remove treatment');
      }
      
      return result.data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Treatment removed',
        description: 'The treatment was removed from the plan successfully.',
      });
      
      // Invalidate specific treatment plan query to refetch data
      queryClient.invalidateQueries({ queryKey: [API_TREATMENT_PLANS, variables.planId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove treatment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Return everything needed by the UI components
  return {
    // Data
    treatmentPlans,
    treatmentSummary,
    
    // Loading states
    isLoadingPlans,
    isLoadingSummary,
    
    // Errors
    plansError,
    summaryError,
    
    // Refetch functions
    refetchPlans,
    refetchSummary,
    
    // Mutations
    createTreatmentPlan,
    updateTreatmentPlan,
    deleteTreatmentPlan,
    addTreatmentToPlan,
    updateTreatmentInPlan,
    removeTreatmentFromPlan,
    
    // Helper functions
    hasPermission,
  };
}