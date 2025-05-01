import React, { useEffect } from 'react';

/**
 * AdminPortalGuard - Simplified Version
 * This component implements basic protections to prevent
 * admin portal page from auto-refreshing
 */
const AdminPortalGuard: React.FC = () => {
  useEffect(() => {
    console.log("🛡️ AdminPortalGuard: Installing simplified protection");
    
    // Set a global flag for admin portal
    if (typeof window !== 'undefined') {
      (window as any).__inAdminPortal = true;
      
      // Add event handlers to block refresh
      const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
        if ((window as any).__inAdminPortal) {
          // Cancel the event but don't show a dialog
          e.preventDefault();
          e.returnValue = '';
          console.log('⛔ Blocked beforeunload event in admin portal');
          return '';
        }
      };
      
      // Actually attach the event listener
      window.addEventListener('beforeunload', beforeUnloadHandler);
      
      // Block some refresh-triggering requests
      const originalFetch = window.fetch;
      window.fetch = function(input, init) {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url;
        
        // Basic pattern matching for problematic requests
        if (typeof url === 'string' && 
            (url.includes('/api/auth/check') || url.includes('/api/auth/status'))) {
          console.log(`🛡️ Blocking problematic request: ${url}`);
          return Promise.resolve(new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        return originalFetch.apply(window, [input, init] as any);
      };
      
      // Disable automatic React Query retries
      (window as any).__disableReactQueryRetries = true;
      
      // Add a custom event listener instead of overriding postMessage
      const messageHandler = (event: MessageEvent) => {
        if (typeof event.data === 'object' && 
            event.data && 
            (event.data.type === 'vite:beforeUpdate' || 
             event.data.type === 'vite:invalidate')) {
          console.log('🛡️ Blocking HMR update in admin portal:', event.data.type);
          event.stopImmediatePropagation();
          return false;
        }
      };
      
      // Attach as a capturing listener to have priority
      window.addEventListener('message', messageHandler, true);
      
      // Cleanup function
      return () => {
        console.log('🧹 AdminPortalGuard: Cleaning up simplified protection');
        window.removeEventListener('beforeunload', beforeUnloadHandler);
        window.removeEventListener('message', messageHandler, true);
        window.fetch = originalFetch;
        delete (window as any).__inAdminPortal;
        delete (window as any).__disableReactQueryRetries;
      };
    }
  }, []);
  
  return null;
};

export default AdminPortalGuard;