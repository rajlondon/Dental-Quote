import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Clinic {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  image_url?: string;
  rating?: number;
  specialties?: string[];
}

/**
 * Hook for interacting with clinic data
 * This hook fetches and manages clinic information for the dental quote system
 */
export function useClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all clinics
  const fetchClinics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/clinics');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setClinics(data.clinics || []);
      return data.clinics || [];
    } catch (err) {
      setError('Failed to load clinics. Please try again later.');
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

  // Get a single clinic by ID
  const getClinic = useCallback(async (clinicId: string) => {
    if (!clinicId) {
      setError('Clinic ID is required');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/clinics/${clinicId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCurrentClinic(data.clinic);
      return data.clinic;
    } catch (err) {
      setError('Failed to load clinic details. Please try again later.');
      console.error('Error loading clinic details:', err);
      toast({
        title: 'Error',
        description: 'Failed to load clinic details',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get clinics by country
  const getClinicsByCountry = useCallback(async (country: string) => {
    if (!country) {
      setError('Country is required');
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/clinics/country/${country}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.clinics || [];
    } catch (err) {
      setError(`Failed to load clinics for ${country}. Please try again later.`);
      console.error('Error loading clinics by country:', err);
      toast({
        title: 'Error',
        description: `Failed to load clinics for ${country}`,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get clinics by specialties
  const getClinicsBySpecialties = useCallback(async (specialties: string[]) => {
    if (!specialties.length) {
      setError('At least one specialty is required');
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/clinics/specialties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ specialties }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.clinics || [];
    } catch (err) {
      setError('Failed to load clinics by specialties. Please try again later.');
      console.error('Error loading clinics by specialties:', err);
      toast({
        title: 'Error',
        description: 'Failed to load clinics by specialties',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch mock clinic data for testing when API endpoints are not yet available
  const fetchMockClinics = useCallback(() => {
    const mockClinics: Clinic[] = [
      {
        id: '1',
        name: 'Istanbul Dental Center',
        address: '123 Main Street',
        city: 'Istanbul',
        country: 'Turkey',
        email: 'info@istanbuldentalcenter.com',
        phone: '+90 212 555 1234',
        website: 'https://istanbuldentalcenter.com',
        description: 'Leading dental clinic in Istanbul specializing in implants and cosmetic dentistry.',
        image_url: '/images/clinics/istanbul-dental.jpg',
        rating: 4.8,
        specialties: ['Implants', 'Cosmetic Dentistry', 'Orthodontics']
      },
      {
        id: '2',
        name: 'Antalya Smile Clinic',
        address: '456 Beach Road',
        city: 'Antalya',
        country: 'Turkey',
        email: 'contact@antalyasmile.com',
        phone: '+90 242 555 6789',
        website: 'https://antalyasmile.com',
        description: 'Premium dental care in the heart of Antalya with a focus on dental tourism.',
        image_url: '/images/clinics/antalya-smile.jpg',
        rating: 4.7,
        specialties: ['Veneers', 'Teeth Whitening', 'Full Mouth Rehabilitation']
      },
      {
        id: '3',
        name: 'Budapest Dental Solutions',
        address: '789 River Street',
        city: 'Budapest',
        country: 'Hungary',
        email: 'info@budapestdental.com',
        phone: '+36 1 555 7890',
        website: 'https://budapestdental.com',
        description: 'Affordable and high-quality dental care in the center of Budapest.',
        image_url: '/images/clinics/budapest-dental.jpg',
        rating: 4.9,
        specialties: ['Dental Implants', 'Root Canal', 'Crowns and Bridges']
      }
    ];

    setClinics(mockClinics);
    setLoading(false);
    return mockClinics;
  }, []);

  return {
    clinics,
    currentClinic,
    loading,
    error,
    fetchClinics,
    getClinic,
    getClinicsByCountry,
    getClinicsBySpecialties,
    fetchMockClinics
  };
}