/**
 * This module prevents the admin portal from automatically refetching queries
 * and causing the refresh issue
 */

import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

/**
 * Hook to completely disable refetching in the admin portal
 * This should be used in the AdminPortalPage component to prevent
 * automatic refreshes
 */
export function useDisableRefetch(): void {
  useEffect(() => {
    console.log("🔄 Disabling refetch for all queries in admin portal");
    
    // Get existing default options
    const existingOptions = queryClient.getDefaultOptions();
    
    // Create a backup of the original settings
    const originalQueryOptions = { ...existingOptions.queries };
    
    // Store original settings to restore later
    (window as any).__originalQueryOptions = originalQueryOptions;
    
    // Override ALL query options to prevent any refetching
    queryClient.setDefaultOptions({
      ...existingOptions,
      queries: {
        ...existingOptions.queries,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        retry: false,
        retryOnMount: false,
        staleTime: Infinity,
        gcTime: Infinity, // In newer React Query v5, cacheTime is now gcTime
      }
    });
    
    // Create a patch for the reactive variable tracking
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url;
      
      // Block ALL auth requests on admin portal
      if (typeof url === 'string' && url.includes('/api/auth/')) {
        console.log(`🛡️ [Admin Mode] Blocking auth request: ${url}`);
        
        // Return fake successful response
        return Promise.resolve(new Response(JSON.stringify({ 
          success: true,
          message: "Simulated success response in admin mode"
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
      
      // Let other requests through
      return originalFetch.apply(window, [input, init] as any);
    };
    
    // Block all React Query refetches
    const originalRefetch = queryClient.refetchQueries;
    queryClient.refetchQueries = function(...args: any[]) {
      console.log("🛡️ [Admin Mode] Blocking React Query refetch:", args);
      return Promise.resolve();
    };
    
    // Block invalidations too
    const originalInvalidate = queryClient.invalidateQueries;
    queryClient.invalidateQueries = function(...args: any[]) {
      console.log("🛡️ [Admin Mode] Blocking React Query invalidate:", args);
      return Promise.resolve();
    };
    
    // Return cleanup function
    return () => {
      // Restore original settings
      if ((window as any).__originalQueryOptions) {
        queryClient.setDefaultOptions({
          ...existingOptions,
          queries: (window as any).__originalQueryOptions
        });
        delete (window as any).__originalQueryOptions;
      }
      
      // Restore fetch
      window.fetch = originalFetch;
      
      // Restore React Query methods
      queryClient.refetchQueries = originalRefetch;
      queryClient.invalidateQueries = originalInvalidate;
      
      console.log("🔄 Restored original refetch behavior");
    };
  }, []);
}