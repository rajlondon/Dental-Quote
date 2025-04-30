import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import ClinicPortalPage from '@/pages/ClinicPortalPage';

/**
 * Special wrapper component for the clinic portal that prevents refresh cycles
 */
const StableClinicPortal: React.FC = () => {
  const { user } = useAuth();
  
  // This one-time key prevents remounting when parent components rerender
  const stableKey = React.useMemo(() => 
    `stable-clinic-portal-${Date.now()}`, []);
    
  return (
    <React.Fragment key={stableKey}>
      {/* Block automatic page refreshes on this route */}
      <script dangerouslySetInnerHTML={{ 
        __html: `
          // Prevent automatic refreshes on clinic portal
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
          }
        `
      }} />
      
      {/* Actual portal component with stable key to prevent remounting */}
      <ClinicPortalPage key={stableKey} disableAutoRefresh={true} />
    </React.Fragment>
  );
};

export default StableClinicPortal;