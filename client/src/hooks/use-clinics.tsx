import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

export interface Clinic {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  specialty?: string;
  address?: string;
  rating?: number;
  logoUrl?: string;
  bannerImageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
}

export function useClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load all clinics
  const loadClinics = useCallback(async (): Promise<Clinic[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/integration/admin/clinics');
      
      if (response.data.success) {
        const fetchedClinics = response.data.clinics || [];
        setClinics(fetchedClinics);
        return fetchedClinics;
      } else {
        throw new Error(response.data.message || 'Failed to load clinics');
      }
    } catch (err: any) {
      const errorMessage = 'Failed to load clinics: ' + (err.message || 'Unknown error');
      setError(errorMessage);
      console.error('Error loading clinics:', err);
      toast({
        title: 'Error',
        description: 'Failed to load clinics',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load a specific clinic by ID
  const loadClinicDetails = useCallback(async (clinicId: string): Promise<Clinic> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/integration/admin/clinics/${clinicId}`);
      
      if (response.data.success) {
        const clinicData = response.data.clinic;
        setSelectedClinic(clinicData);
        return clinicData;
      } else {
        throw new Error(response.data.message || 'Failed to load clinic details');
      }
    } catch (err: any) {
      const errorMessage = 'Failed to load clinic details: ' + (err.message || 'Unknown error');
      setError(errorMessage);
      console.error('Error loading clinic details:', err);
      toast({
        title: 'Error',
        description: 'Failed to load clinic details',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get active clinics (for dropdowns, etc.)
  const getActiveClinics = useCallback(() => {
    return clinics.filter(c => c.isActive);
  }, [clinics]);

  // Create new clinic
  const createClinic = useCallback(async (clinicData: Omit<Clinic, 'id'>): Promise<Clinic> => {
    try {
      const response = await axios.post('/api/integration/admin/clinics', clinicData);
      
      if (response.data.success) {
        const newClinic = response.data.clinic;
        setClinics(prevClinics => [...prevClinics, newClinic]);
        toast({
          title: 'Success',
          description: 'Clinic created successfully',
        });
        return newClinic;
      } else {
        throw new Error(response.data.message || 'Failed to create clinic');
      }
    } catch (err: any) {
      console.error('Error creating clinic:', err);
      toast({
        title: 'Error',
        description: 'Failed to create clinic: ' + (err.message || 'Unknown error'),
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  // Update existing clinic
  const updateClinic = useCallback(async (clinicId: string, updateData: Partial<Clinic>): Promise<Clinic> => {
    try {
      const response = await axios.put(`/api/integration/admin/clinics/${clinicId}`, updateData);
      
      if (response.data.success) {
        const updatedClinic = response.data.clinic;
        setClinics(prevClinics => 
          prevClinics.map(c => c.id === clinicId ? updatedClinic : c)
        );
        
        if (selectedClinic?.id === clinicId) {
          setSelectedClinic(updatedClinic);
        }
        
        toast({
          title: 'Success',
          description: 'Clinic updated successfully',
        });
        
        return updatedClinic;
      } else {
        throw new Error(response.data.message || 'Failed to update clinic');
      }
    } catch (err: any) {
      console.error('Error updating clinic:', err);
      toast({
        title: 'Error',
        description: 'Failed to update clinic: ' + (err.message || 'Unknown error'),
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast, selectedClinic]);

  // Toggle clinic active status
  const toggleClinicStatus = useCallback(async (clinicId: string, isActive: boolean): Promise<Clinic> => {
    try {
      const response = await axios.patch(`/api/integration/admin/clinics/${clinicId}/status`, { 
        isActive 
      });
      
      if (response.data.success) {
        const updatedClinic = response.data.clinic;
        setClinics(prevClinics => 
          prevClinics.map(c => c.id === clinicId ? updatedClinic : c)
        );
        
        if (selectedClinic?.id === clinicId) {
          setSelectedClinic(updatedClinic);
        }
        
        toast({
          title: 'Success',
          description: `Clinic ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
        
        return updatedClinic;
      } else {
        throw new Error(response.data.message || 'Failed to update clinic status');
      }
    } catch (err: any) {
      console.error('Error updating clinic status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update clinic status: ' + (err.message || 'Unknown error'),
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast, selectedClinic]);

  // Delete clinic
  const deleteClinic = useCallback(async (clinicId: string): Promise<boolean> => {
    try {
      const response = await axios.delete(`/api/integration/admin/clinics/${clinicId}`);
      
      if (response.data.success) {
        setClinics(prevClinics => prevClinics.filter(c => c.id !== clinicId));
        
        if (selectedClinic?.id === clinicId) {
          setSelectedClinic(null);
        }
        
        toast({
          title: 'Success',
          description: 'Clinic deleted successfully',
        });
        
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete clinic');
      }
    } catch (err: any) {
      console.error('Error deleting clinic:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete clinic: ' + (err.message || 'Unknown error'),
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast, selectedClinic]);

  return {
    clinics,
    selectedClinic,
    loading,
    error,
    loadClinics,
    loadClinicDetails,
    getActiveClinics,
    createClinic,
    updateClinic,
    toggleClinicStatus,
    deleteClinic,
  };
}