import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Patient interface
export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  treatment: string;
  status: string;
  lastVisit: string | null;
}

// Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Response interface
export interface PatientsResponse {
  success: boolean;
  message: string;
  data: {
    patients: Patient[];
    pagination: Pagination;
  };
}

export function usePatients(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
} = {}) {
  const { toast } = useToast();
  const { page = 1, limit = 10, search = '', status = 'all' } = params;

  return useQuery({
    queryKey: ['/api/clinic/patients', page, limit, search, status],
    queryFn: async () => {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (search) {
        queryParams.append('search', search);
      }
      
      if (status !== 'all') {
        queryParams.append('status', status);
      }
      
      try {
        // Make the API request
        const response = await apiRequest('GET', `/api/clinic/patients?${queryParams.toString()}`);
        const data: PatientsResponse = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch patients');
        }
        
        return data.data;
      } catch (error) {
        // Show toast notification but don't navigate or redirect
        toast({
          title: "Error loading patients",
          description: error instanceof Error ? error.message : "Failed to load patients data",
          variant: "destructive",
        });
        
        // Re-throw error for React Query to handle
        throw error;
      }
    },
    retry: false, // Disable retries to prevent redirect loops
  });
}