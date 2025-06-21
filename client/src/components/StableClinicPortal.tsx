import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import ClinicPortalPage from '@/pages/ClinicPortalPage';
import { useToast } from '@/hooks/use-toast';

/**
 * Special wrapper component for the clinic portal that prevents refresh cycles
 * ENHANCED: Now checks for repeated initialization attempts and prevents them
 */
const StableClinicPortal: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Track when this component was first mounted to prevent double loads
  const hasInitialized = React.useRef<boolean>(false);

  // Track if we're currently displaying the clinic portal
  const isPortalActive = React.useRef<boolean>(false);

  // This one-time key prevents remounting when parent components rerender
  const stableKey = React.useMemo(() => {
    // If we already have a key in sessionStorage, use that for consistency
    const existingKey = sessionStorage.getItem('stable_clinic_portal_key');
    if (existingKey) {
      console.log("Reusing existing clinic portal key:", existingKey);
      return existingKey;
    }

    // Otherwise generate a new one
    const newKey = `stable-clinic-portal-${Date.now()}`;
    sessionStorage.setItem('stable_clinic_portal_key', newKey);
    console.log("Generated new clinic portal key:", newKey);
    return newKey;
  }, []);

  // ENHANCED: More comprehensive initialization tracking
  useEffect(() => {
    // Skip if initialization already happened
    if (hasInitialized.current) {
      console.log("StableClinicPortal already initialized, skipping setup");
      return;
    }

    console.log("StableClinicPortal initializing with key:", stableKey);
    hasInitialized.current = true;
    isPortalActive.current = true;

    // Set a flag for the clinic portal being active
    sessionStorage.setItem('clinic_portal_active', 'true');

    // Create a timestamp immediately for the clinic portal
    if (!sessionStorage.getItem('clinic_portal_timestamp')) {
      const timestamp = Date.now();
      sessionStorage.setItem('clinic_portal_timestamp', timestamp.toString());
      console.log("StableClinicPortal set initial timestamp:", timestamp);
    }

    // Notify if WebSocket is enabled
    if (user?.role === 'clinic') {
      toast({
        title: "Clinic Portal Active",
        description: "Connected to real-time updates for your clinic",
        duration: 3000,
      });
    }

    // Cleanup on unmount
    return () => {
      console.log("StableClinicPortal unmounting");
      isPortalActive.current = false;

      // Don't remove the timestamp on unmount, as that can cause refresh cycles
      // if the user navigates back to the clinic portal
    };
  }, [stableKey, user, toast]);

  return null;
  }

  return (
    <React.Fragment>
      <ClinicPortalPage disableAutoRefresh={true} />
    </React.Fragment>
  );
};

export default StableClinicPortal;