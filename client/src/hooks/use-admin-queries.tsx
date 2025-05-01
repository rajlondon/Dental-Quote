import React, { createContext, useContext, useEffect } from 'react';
import { useToast } from './use-toast';
import { queryClient } from '@/lib/queryClient';

// Context for admin portal queries
const AdminQueryContext = createContext<{
  preventRedirects: boolean;
}>({
  preventRedirects: true
});

/**
 * Provider component that prevents auto-refresh in the admin portal
 * Uses the same approach as the clinic portal to prevent refresh issues
 */
export const AdminQueryProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { toast } = useToast();
  
  // Install very aggressive protections for admin portal
  useEffect(() => {
    console.log('AdminQueryProvider mounted - prevents all auto-refreshes');
    
    // Flag to track navigation intention
    let isIntentionalNavigation = false;
    
    // Track intentional clicks
    const handleClick = (e: MouseEvent) => {
      // Check if clicking a navigation element
      let target = e.target as HTMLElement;
      while (target && target !== document.body) {
        if (
          target.tagName.toLowerCase() === 'a' || 
          target.tagName.toLowerCase() === 'button' ||
          target.getAttribute('role') === 'link' ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('dropdown-item') ||
          target.closest('.dropdown-menu') ||
          target.closest('nav')
        ) {
          console.log('Detected intentional navigation interaction');
          isIntentionalNavigation = true;
          
          // Reset the flag after a short time
          setTimeout(() => {
            isIntentionalNavigation = false;
          }, 500);
          break;
        }
        target = target.parentElement as HTMLElement;
      }
    };
    
    // Block reload attempts in the admin portal
    const preventReload = (e: BeforeUnloadEvent) => {
      if (window.location.pathname.includes('admin-portal') && !isIntentionalNavigation) {
        console.log('🛡️ Blocked page reload attempt on admin portal');
        
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
      return undefined;
    };
    
    // Override React Query's automatic refetching
    const originalRefetchQueries = queryClient.refetchQueries;
    const originalInvalidateQueries = queryClient.invalidateQueries;
    
    // Block automatic refetches in the admin portal
    if (window.location.pathname.includes('admin-portal')) {
      console.log('🛡️ Blocking React Query automatic refetches in admin portal');
      
      // Override the refetch method
      queryClient.refetchQueries = function(...args: any[]) {
        console.log('⛔ Blocked React Query refetch:', args);
        return Promise.resolve();
      };
      
      // Override the invalidate method
      queryClient.invalidateQueries = function(...args: any[]) {
        console.log('⛔ Blocked React Query invalidate:', args);
        return Promise.resolve();
      };
      
      // Block window focus events
      const blockFocus = () => {
        if (window.location.pathname.includes('admin-portal')) {
          console.log('⛔ Blocking window focus event in admin portal');
          // Return the event object's bubbles and cancelable properties
          // to prevent React Query from detecting the focus event
          return {
            bubbles: false,
            cancelable: false
          };
        }
      };
      
      // Override window.onfocus
      const originalFocus = window.onfocus;
      window.onfocus = blockFocus;
      
      // Show a one-time notification
      if (sessionStorage.getItem('admin_portal_notification') !== 'true') {
        sessionStorage.setItem('admin_portal_notification', 'true');
        
        toast({
          title: 'Admin Portal Protection Active',
          description: 'Auto-refresh has been disabled to ensure stable session.',
          duration: 3000,
        });
      }
    }
    
    // Set up event listeners
    document.addEventListener('click', handleClick, { capture: true });
    window.addEventListener('beforeunload', preventReload);
    
    // Clean up when provider unmounts
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('beforeunload', preventReload);
      
      // Restore original functions
      if (originalRefetchQueries) {
        queryClient.refetchQueries = originalRefetchQueries;
      }
      if (originalInvalidateQueries) {
        queryClient.invalidateQueries = originalInvalidateQueries;
      }
      
      console.log('AdminQueryProvider unmounted - restored React Query functions');
    };
  }, [toast]);
  
  return (
    <AdminQueryContext.Provider value={{
      preventRedirects: true
    }}>
      {children}
    </AdminQueryContext.Provider>
  );
};

/**
 * Hook to access admin query settings
 */
export const useAdminQuerySettings = () => {
  return useContext(AdminQueryContext);
};