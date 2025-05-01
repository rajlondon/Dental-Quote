import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  treatment: string;
  status: string;
  lastVisit: string | null;
  clinicId?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PatientsResponse {
  success: boolean;
  message: string;
  data: {
    patients: Patient[];
    pagination: PaginationInfo;
  };
}

export interface UsePatientParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const usePatients = ({ 
  page = 1, 
  limit = 10,
  search = '',
  status = 'all'
}: UsePatientParams = {}) => {
  return useQuery<PatientsResponse>({ 
    queryKey: ['/api/clinic/patients', page, limit, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) {
        params.append('search', search);
      }
      
      if (status && status !== 'all') {
        params.append('status', status);
      }
      
      const res = await apiRequest(
        'GET', 
        `/api/clinic/patients?${params.toString()}`
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch patients');
      }
      
      return res.json();
    },
    placeholderData: (previousData) => previousData, // Replacement for keepPreviousData in V5
    staleTime: 1000 * 60, // 1 minute
    retry: false
  });
};