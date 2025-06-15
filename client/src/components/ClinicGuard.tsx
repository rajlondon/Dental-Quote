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
    return <Redirect to="/portal-login" />;
  }

  if (user.role !== 'clinic' && user.role !== 'admin') {
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to access the clinic portal.',
      variant: 'destructive',
    });
    return <Redirect to="/portal-login" />;
  }

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