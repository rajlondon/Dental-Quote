import React, { useEffect, useState } from 'react';
import { useClinic } from '@/hooks/use-clinic';
import { Shield, Building2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ClinicModeIndicatorProps {
  clinicId?: string | null;
}

export const ClinicModeIndicator: React.FC<ClinicModeIndicatorProps> = ({ clinicId: propClinicId }) => {
  const { clinics } = useClinic();
  const [clinicId, setClinicId] = useState<string | null>(propClinicId || null);
  const [clinicName, setClinicName] = useState<string>('');
  
  useEffect(() => {
    // If clinicId was passed as a prop, use it
    if (propClinicId) {
      setClinicId(propClinicId);
    } 
    // Otherwise, check session storage and URL parameters
    else if (typeof window !== 'undefined') {
      // Check URL parameters first
      const params = new URLSearchParams(window.location.search);
      const urlClinicId = params.get('clinic');
      
      if (urlClinicId) {
        setClinicId(urlClinicId);
      } else {
        // Fall back to session storage
        const storedClinicId = sessionStorage.getItem('selected_clinic_id') || 
                              sessionStorage.getItem('clinic_id');
        if (storedClinicId) {
          setClinicId(storedClinicId);
        }
      }
    }
  }, [propClinicId]);
  
  // Lookup clinic name if we have a clinic ID
  useEffect(() => {
    if (clinicId && clinics && clinics.length > 0) {
      const clinic = clinics.find(c => c.id.toString() === clinicId);
      if (clinic) {
        setClinicName(clinic.name);
      } else {
        setClinicName(`Clinic #${clinicId}`);
      }
    }
  }, [clinicId, clinics]);
  
  if (!clinicId) return null;
  
  return (
    <Alert className="border-blue-500 bg-blue-50 mb-4 clinic-mode-indicator">
      <Shield className="h-4 w-4 text-blue-500" />
      <AlertTitle className="flex items-center text-blue-700">
        <Building2 className="h-4 w-4 mr-2" /> 
        Clinic Mode
      </AlertTitle>
      <AlertDescription className="text-blue-600">
        Creating quote on behalf of a patient for <strong>{clinicName}</strong>
      </AlertDescription>
    </Alert>
  );
};

export default ClinicModeIndicator;