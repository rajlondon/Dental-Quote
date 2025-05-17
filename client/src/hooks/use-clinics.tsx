import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Clinic {
  id: string;
  name: string;
  location: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  specialties?: string[];
  services?: string[];
}

interface UseClinicsResult {
  clinics: Clinic[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClinics(): UseClinicsResult {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClinics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch from an API
      // For now, we'll return mock data to make the integration work
      const mockClinics: Clinic[] = [
        {
          id: "c1",
          name: "Dental Excellence Istanbul",
          location: "Istanbul, Turkey",
          email: "contact@dentalexcellence.com",
          phone: "+90 123 456 7890",
          website: "https://dentalexcellence.com",
          description: "Leading dental clinic specializing in cosmetic dentistry and implants.",
          specialties: ["Implants", "Veneers", "Whitening"]
        },
        {
          id: "c2",
          name: "Smile Design Clinic",
          location: "Antalya, Turkey",
          email: "info@smiledesign.com",
          phone: "+90 987 654 3210",
          website: "https://smiledesign.com",
          description: "Premium dental treatments with state-of-the-art technology.",
          specialties: ["Cosmetic Dentistry", "Full Mouth Reconstruction"]
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setClinics(mockClinics);
    } catch (err: any) {
      console.error('Error fetching clinics:', err);
      setError(err.message || 'Failed to load clinics');
      toast({
        title: 'Error',
        description: 'Failed to load clinics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  return {
    clinics,
    isLoading,
    error,
    refetch: fetchClinics
  };
}

// Additional utility to match the imported function name
export function useClinicList() {
  const { clinics, isLoading, error, refetch } = useClinics();
  
  return {
    data: clinics,
    isLoading,
    error,
    refetch
  };
}