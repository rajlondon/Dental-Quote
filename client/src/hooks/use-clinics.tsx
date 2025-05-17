import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  websiteUrl?: string;
  description?: string;
  isVerified?: boolean;
}

/**
 * Hook for managing clinic data in the admin and patient portals
 */
export const useClinics = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isLoadingClinic, setIsLoadingClinic] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all clinics
  const { isLoading, refetch: refetchClinics } = useQuery({
    queryKey: ['/api/integration/admin/clinics'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/integration/admin/clinics');
        
        if (response.data.success) {
          setClinics(response.data.clinics);
          setError(null);
          return response.data.clinics;
        } else {
          setError(response.data.message || 'Failed to load clinics');
          return [];
        }
      } catch (err: any) {
        setError(err.message || 'Error loading clinics');
        return [];
      }
    },
  });

  // Fetch clinic details
  const fetchClinicDetails = async (clinicId: string) => {
    setIsLoadingClinic(true);
    try {
      const response = await axios.get(`/api/integration/admin/clinics/${clinicId}`);
      
      if (response.data.success) {
        setSelectedClinic(response.data.clinic);
        setError(null);
        return response.data.clinic;
      } else {
        setError(response.data.message || 'Failed to load clinic details');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Error loading clinic details');
      return null;
    } finally {
      setIsLoadingClinic(false);
    }
  };

  // Create clinic mutation
  const createClinicMutation = useMutation({
    mutationFn: async (clinicData: Omit<Clinic, 'id'>) => {
      const response = await axios.post('/api/integration/admin/clinics', clinicData);
      
      if (response.data.success) {
        return response.data.clinic;
      } else {
        throw new Error(response.data.message || 'Failed to create clinic');
      }
    },
    onSuccess: (newClinic) => {
      setClinics((prev) => [...prev, newClinic]);
      toast({
        title: 'Success',
        description: 'Clinic created successfully',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update clinic mutation
  const updateClinicMutation = useMutation({
    mutationFn: async ({ clinicId, clinicData }: { clinicId: string; clinicData: Partial<Clinic> }) => {
      const response = await axios.patch(`/api/integration/admin/clinics/${clinicId}`, clinicData);
      
      if (response.data.success) {
        return response.data.clinic;
      } else {
        throw new Error(response.data.message || 'Failed to update clinic');
      }
    },
    onSuccess: (updatedClinic) => {
      setClinics((prev) => 
        prev.map((clinic) => (clinic.id === updatedClinic.id ? updatedClinic : clinic))
      );
      setSelectedClinic(updatedClinic);
      toast({
        title: 'Success',
        description: 'Clinic updated successfully',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get clinic by ID (from local state if available, otherwise fetch from API)
  const getClinicById = async (clinicId: string): Promise<Clinic | null> => {
    // Check if we already have the clinic in our state
    const existingClinic = clinics.find((c) => c.id === clinicId);
    if (existingClinic) {
      setSelectedClinic(existingClinic);
      return existingClinic;
    }
    
    // Otherwise fetch from API
    return fetchClinicDetails(clinicId);
  };

  // Create a new clinic
  const createClinic = async (clinicData: Omit<Clinic, 'id'>) => {
    return createClinicMutation.mutateAsync(clinicData);
  };

  // Update an existing clinic
  const updateClinic = async (clinicId: string, clinicData: Partial<Clinic>) => {
    return updateClinicMutation.mutateAsync({ clinicId, clinicData });
  };

  return {
    clinics,
    selectedClinic,
    isLoading,
    isLoadingClinic,
    error,
    getClinicById,
    createClinic,
    updateClinic,
    refetchClinics,
    // For direct access to mutation state if needed
    createClinicMutation,
    updateClinicMutation,
  };
};