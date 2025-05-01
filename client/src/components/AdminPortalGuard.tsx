import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAdminAuth } from '@/hooks/use-admin-auth';

/**
 * AdminPortalGuard - Version using dedicated admin auth
 * This component ensures admin authentication is valid
 * and implements basic protections to prevent refreshing
 */
const AdminPortalGuard: React.FC = () => {
  const [, navigate] = useLocation();
  const { adminUser, isLoading } = useAdminAuth();
  
  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !adminUser) {
      console.log("🔒 AdminPortalGuard: No admin authentication, redirecting to login");
      navigate('/admin-login');
      return;
    }
  }, [adminUser, isLoading, navigate]);

  // Install protections when we're authenticated and staying on the page
  useEffect(() => {
    // Don't install protections if still loading or not authenticated
    if (isLoading || !adminUser) {
      return;
    }
    
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
        // Ignore auth/user requests because the new admin hook uses its own cached authentication
        if (typeof url === 'string' && 
            (url.includes('/api/auth/check') || url.includes('/api/auth/status') || url.includes('/api/auth/user'))) {
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
  }, [adminUser, isLoading]);
  
  return null;
};

export default AdminPortalGuard;