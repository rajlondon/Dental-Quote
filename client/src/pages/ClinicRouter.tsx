import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import clinicsData from '@/data/clinics.json';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useClinicRouting } from '@/hooks/use-clinic-routing';
import ClinicDetailPage from './ClinicDetailPage';

interface ClinicRouterProps {
  // No props needed for now
}

/**
 * Enhanced Clinic Router Component
 * 
 * This component handles routing to clinic detail pages with improved error handling,
 * debugging, and fallback mechanisms for better user experience.
 */
const ClinicRouter: React.FC<ClinicRouterProps> = () => {
  const [match, params] = useRoute('/clinic/:id');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { navigateToClinic } = useClinicRouting();
  
  const [loading, setLoading] = useState(true);
  const [validClinic, setValidClinic] = useState(false);
  const [clinicData, setClinicData] = useState<any | null>(null);
  const [routingAttempts, setRoutingAttempts] = useState(0);

  // Function to validate the clinic ID
  const validateClinicId = (id: string | undefined): boolean => {
    if (!id) {
      console.error('ClinicRouter: No clinic ID provided');
      return false;
    }

    console.log(`ClinicRouter: Validating clinic ID: ${id}`);
    
    // Try to find the clinic in our local data
    const clinic = clinicsData.find(c => c.id === id);
    
    if (clinic) {
      console.log(`ClinicRouter: Found clinic: ${clinic.name}`);
      setClinicData(clinic);
      return true;
    } else {
      console.error(`ClinicRouter: Clinic ID not found: ${id}`);
      return false;
    }
  };

  // Attempt to handle routing when component mounts or params change
  useEffect(() => {
    // Safety check - if not on clinic route, don't try to handle
    if (!match) {
      console.log('ClinicRouter: Not on a clinic route, skipping');
      return;
    }
    
    // Reset state
    setLoading(true);
    setValidClinic(false);
    setClinicData(null);
    
    console.log('ClinicRouter: Handling clinic route with params:', params);
    
    // Safety check - if params or id is undefined, this is a serious issue
    if (!params || !params.id) {
      console.error('ClinicRouter: Critical error - params.id is undefined or empty');
      toast({
        title: 'Clinic Not Found',
        description: 'There was a problem with the clinic URL. The ID is missing.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    
    // Validate the clinic ID
    const isValid = validateClinicId(params.id);
    setValidClinic(isValid);
    
    // If clinic is valid, we're done
    if (isValid) {
      setLoading(false);
      return;
    }
    
    // If clinic is invalid, increment routing attempts
    setRoutingAttempts(prev => prev + 1);
    
    // If we've tried too many times, give up
    if (routingAttempts >= 3) {
      console.error(`ClinicRouter: Too many routing attempts (${routingAttempts}), giving up`);
      toast({
        title: 'Clinic Navigation Failed',
        description: 'We encountered a problem finding this clinic. Please try a different clinic.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    
    // If first attempt failed, try alternative approaches to find the clinic
    // (this code would implement fallback strategies)
    
    // Finally, set loading to false
    setLoading(false);
  }, [match, params, toast, routingAttempts]);

  // If we're not on a clinic route, render nothing (this component shouldn't be rendered)
  if (!match) {
    return null;
  }

  // If we're loading, show a loading spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading clinic information...</p>
      </div>
    );
  }

  // If the clinic is invalid, show an error message
  if (!validClinic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-lg mx-auto">
          <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Clinic Not Found</h1>
          <p className="mb-8 text-gray-600">
            We couldn't find the clinic you're looking for. The URL may be incorrect or the clinic may no longer be available.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/clinic-debug')}
            >
              Open Debug Tools
            </Button>
          </div>
          
          {/* Debug information - only show in development */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
              <h3 className="font-medium mb-2">Debug Information</h3>
              <p className="text-sm mb-2">Routing attempts: {routingAttempts}</p>
              <p className="text-sm mb-2">Clinic ID: {params?.id || 'undefined'}</p>
              
              <div className="mt-4">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => navigateToClinic(params?.id || '')}
                  className="flex items-center"
                >
                  Try Alternate Routing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If all is well, render the ClinicDetailPage
  return <ClinicDetailPage />;
};

export default ClinicRouter;