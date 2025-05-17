/**
 * Hook for accessing clinic data
 * This hook provides access to the list of clinics and clinic details
 */
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface Clinic {
  id: string;
  name: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  location?: string;
  specialties?: string[];
}

export function useClinics() {
  return useQuery({
    queryKey: ['/api/clinics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/clinics');
      return response.json() as Promise<Clinic[]>;
    }
  });
}

export function useClinicDetails(clinicId: string | undefined) {
  return useQuery({
    queryKey: [`/api/clinics/${clinicId}`],
    queryFn: async () => {
      if (!clinicId) return null;
      const response = await apiRequest('GET', `/api/clinics/${clinicId}`);
      return response.json() as Promise<Clinic>;
    },
    enabled: !!clinicId
  });
}