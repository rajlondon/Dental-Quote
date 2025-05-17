import React from 'react';
import { useClinic } from '@/hooks/use-clinic';
import { Bell, CheckCircle, Clinic } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ClinicModeIndicatorProps {
  clinicId?: string | null;
}

/**
 * Component to display when the quote builder is being used in clinic mode
 * Provides visual feedback and clinic context information
 */
export const ClinicModeIndicator: React.FC<ClinicModeIndicatorProps> = ({ clinicId }) => {
  const { selectedClinic, isLoadingClinic } = useClinic();
  
  // Don't show anything if no clinic ID is provided
  if (!clinicId) return null;
  
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r">
      <div className="flex items-center">
        <Clinic className="h-5 w-5 text-blue-500 mr-2" />
        <div className="flex flex-col">
          <div className="flex items-center">
            <h3 className="text-blue-800 font-medium">
              Clinic Mode Active
            </h3>
            <Badge variant="outline" className="ml-2 bg-blue-100">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span className="text-xs">Verified</span>
            </Badge>
          </div>
          
          {isLoadingClinic ? (
            <p className="text-blue-600 text-sm mt-1">Loading clinic information...</p>
          ) : selectedClinic ? (
            <p className="text-blue-600 text-sm mt-1">
              Creating quote for <strong>{selectedClinic.name}</strong>
            </p>
          ) : (
            <p className="text-blue-600 text-sm mt-1">
              Creating quote for clinic ID: <strong>{clinicId}</strong>
            </p>
          )}
          
          <p className="text-xs text-blue-500 mt-2">
            Any quote created here will be associated with your clinic
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClinicModeIndicator;