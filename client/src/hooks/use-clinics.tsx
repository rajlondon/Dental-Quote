import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

export interface Clinic {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  specialties?: string[];
  rating?: number;
  imageUrl?: string;
}

export function useClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to load all available clinics
  const loadClinics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/integration/admin/clinics');
      
      if (response.data.success) {
        setClinics(response.data.clinics || []);
        return response.data.clinics;
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

  // Load clinics on initial render
  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  // Get clinic details by ID
  const getClinicById = useCallback((clinicId: string): Clinic | undefined => {
    return clinics.find(clinic => clinic.id === clinicId);
  }, [clinics]);

  // Search clinics by name or specialty
  const searchClinics = useCallback((searchTerm: string): Clinic[] => {
    if (!searchTerm.trim()) return clinics;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return clinics.filter(clinic => 
      clinic.name.toLowerCase().includes(lowercaseSearch) || 
      clinic.specialties?.some(specialty => 
        specialty.toLowerCase().includes(lowercaseSearch)
      )
    );
  }, [clinics]);

  // Filter clinics by country
  const filterClinicsByCountry = useCallback((country: string): Clinic[] => {
    if (!country.trim()) return clinics;
    
    return clinics.filter(clinic => 
      clinic.country?.toLowerCase() === country.toLowerCase()
    );
  }, [clinics]);

  // Filter clinics by city
  const filterClinicsByCity = useCallback((city: string): Clinic[] => {
    if (!city.trim()) return clinics;
    
    return clinics.filter(clinic => 
      clinic.city?.toLowerCase() === city.toLowerCase()
    );
  }, [clinics]);

  // Get all available countries (for filters)
  const getAvailableCountries = useCallback((): string[] => {
    const countriesSet = new Set<string>();
    
    clinics.forEach(clinic => {
      if (clinic.country) {
        countriesSet.add(clinic.country);
      }
    });
    
    return Array.from(countriesSet).sort();
  }, [clinics]);

  // Get all available cities (for filters)
  const getAvailableCities = useCallback((): string[] => {
    const citiesSet = new Set<string>();
    
    clinics.forEach(clinic => {
      if (clinic.city) {
        citiesSet.add(clinic.city);
      }
    });
    
    return Array.from(citiesSet).sort();
  }, [clinics]);

  // Get all available specialties (for filters)
  const getAvailableSpecialties = useCallback((): string[] => {
    const specialtiesSet = new Set<string>();
    
    clinics.forEach(clinic => {
      if (clinic.specialties && clinic.specialties.length > 0) {
        clinic.specialties.forEach(specialty => {
          specialtiesSet.add(specialty);
        });
      }
    });
    
    return Array.from(specialtiesSet).sort();
  }, [clinics]);

  return {
    clinics,
    loading,
    error,
    loadClinics,
    getClinicById,
    searchClinics,
    filterClinicsByCountry,
    filterClinicsByCity,
    getAvailableCountries,
    getAvailableCities,
    getAvailableSpecialties
  };
}