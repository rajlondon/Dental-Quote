/**
 * Unified Treatment Plans Hook
 * 
 * This hook provides a centralized way to interact with treatment plans
 * across all portals (patient, clinic, admin) with proper permissions handling.
 */
import React, { createContext, ReactNode, useContext } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
  UseQueryResult
} from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import {
  TreatmentPlan,
  TreatmentItem,
  TreatmentPlanStatus,
  TreatmentPlanFilters,
  CreateTreatmentPlanRequest,
  UpdateTreatmentPlanRequest,
  TreatmentPlanResponse,
  TreatmentPlansListResponse,
  PlanConversionOptions
} from '@shared/models/treatment-plan';

// Define the context interface
interface UnifiedTreatmentPlansContextType {
  // Queries
  useTreatmentPlan: (id?: string) => UseQueryResult<TreatmentPlan, Error>;
  useTreatmentPlans: (filters?: TreatmentPlanFilters) => UseQueryResult<{
    plans: TreatmentPlan[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }, Error>;
  
  // Mutations
  createTreatmentPlan: UseMutationResult<TreatmentPlan, Error, CreateTreatmentPlanRequest>;
  updateTreatmentPlan: UseMutationResult<TreatmentPlan, Error, UpdateTreatmentPlanRequest>;
  deleteTreatmentPlan: UseMutationResult<void, Error, string>;
  changeTreatmentPlanStatus: UseMutationResult<TreatmentPlan, Error, { id: string; status: TreatmentPlanStatus }>;
  
  // Conversion utilities
  convertQuoteToTreatmentPlan: UseMutationResult<TreatmentPlan, Error, { 
    quoteId: string; 
    options?: PlanConversionOptions;
  }>;
  convertPackageToTreatmentPlan: UseMutationResult<TreatmentPlan, Error, { 
    packageId: string; 
    options?: PlanConversionOptions;
  }>;
  convertSpecialOfferToTreatmentPlan: UseMutationResult<TreatmentPlan, Error, { 
    offerId: string; 
    options?: PlanConversionOptions;
  }>;
  
  // Helper functions
  getTreatmentPlanTotalPrice: (treatments: TreatmentItem[]) => number;
  calculateFinalPrice: (totalPrice: number, discountPercentage?: number) => number;
  
  // User context
  userRole: 'patient' | 'clinic' | 'admin' | 'visitor';
  canEdit: (plan?: TreatmentPlan) => boolean;
  canDelete: (plan?: TreatmentPlan) => boolean;
  canChangeStatus: (plan?: TreatmentPlan) => boolean;
}

// Create context
export const UnifiedTreatmentPlansContext = createContext<UnifiedTreatmentPlansContextType | null>(null);

// Provider component
export function UnifiedTreatmentPlansProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: patientUser } = useAuth();
  const { user: adminUser } = useAdminAuth();
  
  // Determine user role based on available auth contexts
  let userRole: 'patient' | 'clinic' | 'admin' | 'visitor' = 'visitor';
  
  if (adminUser) {
    userRole = 'admin';
  } else if (patientUser) {
    // Check if user has clinic role - this is a simplification
    // In a real app, you'd have a more robust role system
    if (patientUser.role === 'clinic_staff') {
      userRole = 'clinic';
    } else {
      userRole = 'patient';
    }
  }
  
  // Utility functions
  const getTreatmentPlanTotalPrice = (treatments: TreatmentItem[]): number => {
    return treatments.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  };
  
  const calculateFinalPrice = (totalPrice: number, discountPercentage?: number): number => {
    if (!discountPercentage) return totalPrice;
    
    const discount = totalPrice * (discountPercentage / 100);
    return totalPrice - discount;
  };
  
  // Permission checks
  const canEdit = (plan?: TreatmentPlan): boolean => {
    if (!plan) return userRole !== 'visitor';
    
    switch (userRole) {
      case 'admin':
        return true;
      case 'clinic':
        // Clinics can edit plans that are assigned to them or created by them
        return plan.clinicId === patientUser?.id || plan.createdBy === patientUser?.id;
      case 'patient':
        // Patients can only edit their own draft or proposed plans
        return plan.patientId === patientUser?.id && 
          (plan.status === TreatmentPlanStatus.DRAFT || plan.status === TreatmentPlanStatus.PROPOSED);
      default:
        return false;
    }
  };
  
  const canDelete = (plan?: TreatmentPlan): boolean => {
    if (!plan) return userRole === 'admin';
    
    switch (userRole) {
      case 'admin':
        return true;
      case 'clinic':
        // Clinics can delete only draft plans that are assigned to them
        return plan.clinicId === patientUser?.id && plan.status === TreatmentPlanStatus.DRAFT;
      case 'patient':
        // Patients can't delete plans
        return false;
      default:
        return false;
    }
  };
  
  const canChangeStatus = (plan?: TreatmentPlan): boolean => {
    if (!plan) return userRole !== 'visitor';
    
    switch (userRole) {
      case 'admin':
        return true;
      case 'clinic':
        // Clinics can change status of plans assigned to them
        return plan.clinicId === patientUser?.id;
      case 'patient':
        // Patients can only accept or reject proposed plans
        return plan.patientId === patientUser?.id && 
          plan.status === TreatmentPlanStatus.PROPOSED;
      default:
        return false;
    }
  };
  
  // Queries
  const useTreatmentPlan = (id?: string): UseQueryResult<TreatmentPlan, Error> => {
    return useQuery({
      queryKey: ['/api/v1/treatment-plans', id],
      queryFn: async () => {
        if (!id) return null;
        
        const response = await apiRequest('GET', `/api/v1/treatment-plans/${id}`);
        const result: TreatmentPlanResponse = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error(result.message || 'Failed to fetch treatment plan');
        }
        
        return result.data;
      },
      enabled: !!id
    });
  };
  
  const useTreatmentPlans = (
    filters?: TreatmentPlanFilters
  ): UseQueryResult<{
    plans: TreatmentPlan[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }, Error> => {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    // Auto-apply user role filters for security
    if (userRole === 'patient' && patientUser?.id) {
      queryParams.set('patientId', patientUser.id);
    } else if (userRole === 'clinic' && patientUser?.id) {
      queryParams.set('clinicId', patientUser.id);
    }
    
    const queryString = queryParams.toString();
    
    return useQuery({
      queryKey: ['/api/v1/treatment-plans', queryString],
      queryFn: async () => {
        const url = `/api/v1/treatment-plans${queryString ? `?${queryString}` : ''}`;
        const response = await apiRequest('GET', url);
        const result: TreatmentPlansListResponse = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error(result.message || 'Failed to fetch treatment plans');
        }
        
        return result.data;
      }
    });
  };
  
  // Mutations
  const createTreatmentPlan = useMutation({
    mutationFn: async (data: CreateTreatmentPlanRequest): Promise<TreatmentPlan> => {
      // Auto-apply user context
      if (userRole === 'patient' && patientUser?.id) {
        data.patientId = patientUser.id;
      } else if (userRole === 'clinic' && patientUser?.id) {
        data.clinicId = patientUser.id;
      }
      
      const response = await apiRequest('POST', '/api/v1/treatment-plans', data);
      const result: TreatmentPlanResponse = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to create treatment plan');
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/treatment-plans'] });
      toast({
        title: 'Treatment plan created',
        description: 'The treatment plan has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create treatment plan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const updateTreatmentPlan = useMutation({
    mutationFn: async (data: UpdateTreatmentPlanRequest): Promise<TreatmentPlan> => {
      const response = await apiRequest('PUT', `/api/v1/treatment-plans/${data.id}`, data);
      const result: TreatmentPlanResponse = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to update treatment plan');
      }
      
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/treatment-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/treatment-plans', data.id] });
      toast({
        title: 'Treatment plan updated',
        description: 'The treatment plan has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update treatment plan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const deleteTreatmentPlan = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiRequest('DELETE', `/api/v1/treatment-plans/${id}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete treatment plan');
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/treatment-plans'] });
      queryClient.removeQueries({ queryKey: ['/api/v1/treatment-plans', id] });
      toast({
        title: 'Treatment plan deleted',
        description: 'The treatment plan has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete treatment plan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const changeTreatmentPlanStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TreatmentPlanStatus }): Promise<TreatmentPlan> => {
      const response = await apiRequest('PATCH', `/api/v1/treatment-plans/${id}/status`, { status });
      const result: TreatmentPlanResponse = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to change treatment plan status');
      }
      
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/treatment-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/treatment-plans', data.id] });
      toast({
        title: 'Status updated',
        description: `The treatment plan status is now "${data.status}".`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Conversion utilities
  const convertQuoteToTreatmentPlan = useMutation({
    mutationFn: async ({ quoteId, options }: { quoteId: string; options?: PlanConversionOptions }): Promise<TreatmentPlan> => {
      const response = await apiRequest('POST', `/api/v1/treatment-plans/convert/quote/${quoteId}`, options || {});
      const result: TreatmentPlanResponse = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to convert quote to treatment plan');
      }
      
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/treatment-plans'] });
      toast({
        title: 'Quote converted',
        description: 'The quote has been converted to a treatment plan successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Conversion failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const convertPackageToTreatmentPlan = useMutation({
    mutationFn: async ({ packageId, options }: { packageId: string; options?: PlanConversionOptions }): Promise<TreatmentPlan> => {
      const response = await apiRequest('POST', `/api/v1/treatment-plans/convert/package/${packageId}`, options || {});
      const result: TreatmentPlanResponse = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to convert package to treatment plan');
      }
      
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/treatment-plans'] });
      toast({
        title: 'Package converted',
        description: 'The package has been converted to a treatment plan successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Conversion failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const convertSpecialOfferToTreatmentPlan = useMutation({
    mutationFn: async ({ offerId, options }: { offerId: string; options?: PlanConversionOptions }): Promise<TreatmentPlan> => {
      const response = await apiRequest('POST', `/api/v1/treatment-plans/convert/special-offer/${offerId}`, options || {});
      const result: TreatmentPlanResponse = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to convert special offer to treatment plan');
      }
      
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/treatment-plans'] });
      toast({
        title: 'Special offer converted',
        description: 'The special offer has been converted to a treatment plan successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Conversion failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Context value
  const contextValue: UnifiedTreatmentPlansContextType = {
    // Queries
    useTreatmentPlan,
    useTreatmentPlans,
    
    // Mutations
    createTreatmentPlan,
    updateTreatmentPlan,
    deleteTreatmentPlan,
    changeTreatmentPlanStatus,
    
    // Conversion utilities
    convertQuoteToTreatmentPlan,
    convertPackageToTreatmentPlan,
    convertSpecialOfferToTreatmentPlan,
    
    // Helper functions
    getTreatmentPlanTotalPrice,
    calculateFinalPrice,
    
    // User context
    userRole,
    canEdit,
    canDelete,
    canChangeStatus,
  };
  
  return (
    <UnifiedTreatmentPlansContext.Provider value={contextValue}>
      {children}
    </UnifiedTreatmentPlansContext.Provider>
  );
}

// Hook to use the treatment plans context
export function useUnifiedTreatmentPlans() {
  const context = useContext(UnifiedTreatmentPlansContext);
  
  if (!context) {
    throw new Error('useUnifiedTreatmentPlans must be used within a UnifiedTreatmentPlansProvider');
  }
  
  return context;
}