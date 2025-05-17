/**
 * Hook for fetching clinic data
 */
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface Clinic {
  id: number;
  name: string;
  location: string;
  specialties?: string[];
  rating?: number;
  logo_url?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
}

/**
 * Hook to fetch a list of all available clinics
 */
export function useClinicList() {
  return useQuery({
    queryKey: ['/api/clinics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/clinics');
      const data = await response.json();
      return data as Clinic[];
    }
  });
}

/**
 * Hook to fetch a specific clinic by ID
 */
export function useClinicDetail(clinicId: string | number | null | undefined) {
  return useQuery({
    queryKey: [`/api/clinics/${clinicId}`],
    queryFn: async () => {
      if (!clinicId) return null;
      const response = await apiRequest('GET', `/api/clinics/${clinicId}`);
      const data = await response.json();
      return data as Clinic;
    },
    enabled: !!clinicId
  });
}