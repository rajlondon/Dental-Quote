import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';
import { ClinicQueryProvider } from '@/hooks/use-clinic-queries';

// Augment the window interface to add our navigation helper
declare global {
  interface Window {
    markClinicPortalNavigation?: () => void;
  }
}

// This component guards against unauthorized access to the clinic portal
// and provides a protected environment that prevents refresh cycles
interface ClinicGuardProps {
  children: React.ReactNode;
}

const ClinicGuard: React.FC<ClinicGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  const refreshBlockedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Session storage key to track if we've shown the notification
    const SESSION_NOTIFICATION_KEY = 'clinic_refresh_notification_shown';
    
    // Track navigation actions to distinguish between navigation and reload
    let isNavigating = false;
    
    // Create a function to mark when we're navigating intentionally
    const markNavigating = () => {
      isNavigating = true;
      // Reset after a short delay
      setTimeout(() => {
        isNavigating = false;
      }, 100);
    };
    
    // Create a function that other components can call
    window.markClinicPortalNavigation = markNavigating;
    
    // Listen for click events on links and buttons
    const handleClick = (e: MouseEvent) => {
      // Check if the click was on an anchor tag, a button, or any element with role="link" 
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
          markNavigating();
          break;
        }
        target = target.parentElement as HTMLElement;
      }
    };
    
    // Only prevent actual page reloads, not navigation
    const preventReload = (e: BeforeUnloadEvent) => {
      // Let normal navigation proceed
      if (isNavigating) {
        console.log('Detected intentional navigation, allowing it to proceed');
        return undefined;
      }
      
      if (window.location.pathname.includes('clinic-portal')) {
        console.log('🛡️ Blocked programmatic page reload on clinic portal');
        console.warn('⚠️ Automatic page reload blocked by ClinicGuard');
        
        // Only show the toast if we haven't shown it this session
        const notificationShown = sessionStorage.getItem(SESSION_NOTIFICATION_KEY);
        
        if (!notificationShown && !refreshBlockedRef.current) {
          refreshBlockedRef.current = true;
          
          // Mark that we've shown the notification this session
          sessionStorage.setItem(SESSION_NOTIFICATION_KEY, 'true');
          
          // Show a toast notification with a short duration
          toast({
            title: 'Session Protection Active',
            description: 'This portal prevents page reloads to maintain your secure session.',
            duration: 3000, // 3 seconds
          });
        }
        
        // Cancel the event
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
      return undefined;
    };
    
    // Add event listeners
    document.addEventListener('click', handleClick, { capture: true });
    window.addEventListener('beforeunload', preventReload);
    
    // Remove all event listeners when the component unmounts
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('beforeunload', preventReload);
    };
  }, [toast]);

  // Wait for auth to load
  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        setInitialized(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    console.log('ClinicGuard: Redirecting to clinic-login due to missing user');
    // Set a specific flag to prevent interference from promo detection
    sessionStorage.setItem('disable_promo_redirect', 'true');
    sessionStorage.setItem('redirecting_from_clinic_guard', 'true');
    
    // Use /clinic-login endpoint for better cross-site compatibility with authorization
    return <Redirect to="/clinic-login" />;
  }

  if (user.role !== 'clinic_staff' && user.role !== 'admin') {
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to access the clinic portal.',
      variant: 'destructive',
    });
    console.log('ClinicGuard: Redirecting to clinic-login due to invalid role:', user.role);
    
    // Set specific flags to prevent interference
    sessionStorage.setItem('disable_promo_redirect', 'true');
    sessionStorage.setItem('redirecting_from_clinic_guard', 'true');
    
    // Use /clinic-login endpoint for better cross-site compatibility with authorization
    return <Redirect to="/clinic-login" />;
  }
  
  // Ensure we're not in a redirect loop by checking if we're coming from the login page
  useEffect(() => {
    // Debug log for navigation
    console.log("ClinicGuard: Navigation check for clinic user", {
      role: user.role,
      pathname: window.location.pathname,
      userId: user.id,
      clinicId: user.clinicId
    });

    // Store session markers in multiple locations for redundancy
    const storeSessionMarkers = () => {
      // 1. Store in sessionStorage that we've successfully accessed the clinic portal
      sessionStorage.setItem('clinic_portal_access_successful', 'true');
      
      // 2. Set cookies to mark that this is a clinic staff session with longer expiration
      // This will help other components know not to do promo redirects
      document.cookie = "is_clinic_staff=true; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "is_clinic_login=true; path=/; max-age=86400; SameSite=Lax";
      
      // 3. Store clinic user ID in sessionStorage (useful for reconnecting WebSockets)
      if (user.id) {
        sessionStorage.setItem('clinic_user_id', user.id.toString());
      }
      
      // 4. Store clinic ID in sessionStorage if available
      if (user.clinicId) {
        sessionStorage.setItem('clinic_id', user.clinicId.toString());
      }
      
      // 5. Store timestamp of last successful clinic access
      sessionStorage.setItem('last_clinic_access', Date.now().toString());
    };
    
    // Execute immediately
    storeSessionMarkers();
    
    // Also set a periodic refresh of these session markers
    const refreshInterval = setInterval(storeSessionMarkers, 5 * 60 * 1000); // Every 5 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [user]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Wrap children in ClinicQueryProvider to prevent redirects in queries
  return (
    <ClinicQueryProvider>
      {children}
    </ClinicQueryProvider>
  );
};

export default ClinicGuard;