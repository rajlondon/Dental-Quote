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
  
  return (
    <React.Fragment key={stableKey}>
      {/* Enhanced protection against automatic page refreshes on this route */}
      <script dangerouslySetInnerHTML={{ 
        __html: `
          // Prevent automatic refreshes on clinic portal with enhanced protection
          if (window.location.reload && !window.__clinicPortalReloadBlocked) {
            console.log("🛡️ Blocking automatic refreshes for clinic portal");
            window.__clinicPortalReloadBlocked = true;
            
            // Store original reload function
            window.__originalReload = window.location.reload;
            
            // Replace with a version that only blocks on clinic portal
            window.location.reload = function(...args) {
              if (window.location.pathname.includes('clinic-portal')) {
                console.log("🛡️ Blocked page reload on clinic portal");
                return undefined;
              } else {
                return window.__originalReload.apply(this, args);
              }
            };
            
            // Inject special event handler to block programmatic refreshes too
            window.addEventListener('beforeunload', function(e) {
              if (window.location.pathname.includes('clinic-portal')) {
                const now = new Date();
                const refreshTime = sessionStorage.getItem('last_manual_refresh');
                
                // Allow manual refreshes if explicitly set (with 2s grace period)
                if (refreshTime && (now.getTime() - parseInt(refreshTime, 10)) < 2000) {
                  console.log("🔄 Allowing manual refresh");
                  return;
                }
                
                console.log("🛡️ Blocked programmatic page refresh");
                e.preventDefault();
                e.returnValue = '';
                return '';
              }
            });
            
            // Block history API-based refreshes (navigating to same URL)
            const originalPushState = history.pushState;
            history.pushState = function(...args) {
              const currentPath = window.location.pathname;
              const newPath = args[2];
              
              // Check if trying to navigate to same URL (which causes a refresh)
              if (currentPath === newPath && currentPath.includes('clinic-portal')) {
                console.log("🛡️ Blocked redundant navigation that would cause refresh");
                return undefined;
              }
              
              return originalPushState.apply(this, args);
            };
          }
          
          // Mark this clinic portal session as initialized
          window.__clinicPortalInitialized = true;
        `
      }} />
      
      {/* Actual portal component with stable key to prevent remounting */}
      <ClinicPortalPage key={stableKey} disableAutoRefresh={true} />
    </React.Fragment>
  );
};

export default StableClinicPortal;