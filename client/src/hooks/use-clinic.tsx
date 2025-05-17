import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define clinic interface
export interface Clinic {
  id: string;
  name: string;
  location: string;
  email?: string;
  phone?: string;
  description?: string;
  logo?: string;
  specialties?: string[];
}

interface ClinicContextType {
  clinics: Clinic[];
  selectedClinic: Clinic | null;
  isLoading: boolean;
  isLoadingClinic: boolean;
  error: string | null;
  getClinicById: (clinicId: string) => Promise<Clinic | null>;
  setSelectedClinic: (clinic: Clinic | null) => void;
}

const ClinicContext = createContext<ClinicContextType | null>(null);

// Sample mock data for clinics
const MOCK_CLINICS: Clinic[] = [
  {
    id: '1',
    name: 'Istanbul Dental Center',
    location: 'Istanbul, Turkey',
    email: 'info@istanbuldentalcenter.com',
    phone: '+90 212 555 1234',
    description: 'Leading dental clinic specializing in implants and cosmetic dentistry',
    specialties: ['Implants', 'Cosmetic Dentistry', 'Orthodontics']
  },
  {
    id: '2',
    name: 'Antalya Smile Clinic',
    location: 'Antalya, Turkey',
    email: 'contact@antalyasmile.com',
    phone: '+90 242 555 5678',
    description: 'Premium dental care with a focus on comprehensive treatment plans',
    specialties: ['Smile Makeover', 'Implants', 'Root Canal Therapy']
  },
  {
    id: '3',
    name: 'Izmir Dental Arts',
    location: 'Izmir, Turkey',
    email: 'appointments@izmirdentalarts.com',
    phone: '+90 232 555 9012',
    description: 'Innovative dental techniques with state-of-the-art technology',
    specialties: ['All-on-4 Implants', 'Zirconia Crowns', 'Laser Dentistry']
  }
];

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClinic, setIsLoadingClinic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load clinics on initial render
    loadClinics();
  }, []);

  const loadClinics = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await axios.get('/api/clinics');
      // setClinics(response.data);
      
      // For this demo, we'll just use mock data after a small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setClinics(MOCK_CLINICS);
      setError(null);
    } catch (err) {
      console.error('Error loading clinics:', err);
      setError('Failed to load clinics. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getClinicById = async (clinicId: string): Promise<Clinic | null> => {
    setIsLoadingClinic(true);
    try {
      // In a real app, this would be an API call to get specific clinic details
      // const response = await axios.get(`/api/clinics/${clinicId}`);
      // const clinic = response.data;
      
      // For this demo, we'll find the clinic in our mock data
      const clinic = MOCK_CLINICS.find(c => c.id === clinicId) || null;
      
      if (clinic) {
        setSelectedClinic(clinic);
        return clinic;
      }
      return null;
    } catch (err) {
      console.error(`Error loading clinic ${clinicId}:`, err);
      setError(`Failed to load clinic information. Please try again later.`);
      return null;
    } finally {
      setIsLoadingClinic(false);
    }
  };

  return (
    <ClinicContext.Provider
      value={{
        clinics,
        selectedClinic,
        isLoading,
        isLoadingClinic,
        error,
        getClinicById,
        setSelectedClinic
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};