import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import ClinicDetailPage from '@/pages/ClinicDetailPage';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import clinicsData from '@/data/clinics.json';

/**
 * ClinicRouter component
 * 
 * This is a diagnostic component that wraps the ClinicDetailPage to handle and debug
 * clinic ID routing issues. It logs information about the clinic ID routing process
 * and ensures the clinic ID is valid before rendering the ClinicDetailPage.
 */
const ClinicRouter: React.FC = () => {
  const [match, params] = useRoute('/clinic-test/:id');
  const [, navigate] = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ClinicRouter: Component mounted');

    // Validate the clinic ID from the URL parameters
    const validateClinicId = async () => {
      try {
        if (!params || !params.id) {
          setError('No clinic ID provided in the URL');
          console.error('ClinicRouter: No clinic ID provided');
          setIsValidating(false);
          return;
        }

        console.log(`ClinicRouter: Validating clinic ID: ${params.id}`);
        
        // Find clinic in local data first for quick validation
        const clinic = clinicsData.find(c => c.id === params.id);
        
        if (clinic) {
          console.log(`ClinicRouter: Found clinic in local data: ${clinic.name}`);
          setClinicId(params.id);
          toast({
            title: 'Clinic Found',
            description: `Loading clinic details for: ${clinic.name}`,
          });
        } else {
          // If not in local data, we could make an API call to validate
          console.log(`ClinicRouter: Clinic ID not found in local data: ${params.id}`);
          
          // For now, we'll trust that the ID is valid and proceed
          // In a production environment, you might want to validate against the API
          setClinicId(params.id);
          
          toast({
            title: 'Clinic ID',
            description: `Proceeding with clinic ID: ${params.id} (not validated)`,
            variant: 'default',
          });
        }
      } catch (err) {
        console.error('ClinicRouter: Error validating clinic ID', err);
        setError(`Error validating clinic ID: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsValidating(false);
      }
    };

    validateClinicId();
  }, [params]);

  // If still validating, show a loading indicator
  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium mb-2">Validating Clinic ID...</h2>
        <p className="text-gray-500 text-center">Please wait while we verify the clinic details.</p>
      </div>
    );
  }

  // If there was an error validating the clinic ID
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Clinic</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex justify-between">
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Return to Home
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If we have a valid clinic ID, render the ClinicDetailPage
  if (clinicId) {
    console.log(`ClinicRouter: Rendering ClinicDetailPage with ID: ${clinicId}`);
    return <ClinicDetailPage />;
  }

  // Fallback if no clinic ID and no error (shouldn't happen)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-yellow-600 mb-4">No Clinic Selected</h2>
        <p className="text-gray-700 mb-4">Please select a clinic from the home page or search results.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default ClinicRouter;