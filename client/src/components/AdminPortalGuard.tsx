import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';  // CHANGED: Use working auth
import { Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';
import { AdminQueryProvider } from '@/hooks/use-admin-queries';

// Augment the window interface to add our navigation helper
declare global {
  interface Window {
    markAdminPortalNavigation?: () => void;
  }
}

/**
 * AdminPortalGuard - Updated to use the working auth system
 */
interface AdminPortalGuardProps {
  children: React.ReactNode;
}

const AdminPortalGuard: React.FC<AdminPortalGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();  // CHANGED: Use working auth
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  const refreshBlockedRef = useRef(false);

  // Implement the navigation vs refresh detection system (from ClinicGuard)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Session storage key to track if we've shown the notification
    const SESSION_NOTIFICATION_KEY = 'admin_refresh_notification_shown';

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
    window.markAdminPortalNavigation = markNavigating;

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
      // If logout is in progress, don't block - check both local and session storage for safety
      const isLoggingOut = 
        sessionStorage.getItem('admin_intentional_logout') === 'true' || 
        localStorage.getItem('admin_logout_in_progress') === 'true';

      // Let normal navigation proceed
      if (isNavigating || isLoggingOut) {
        console.log('Detected intentional navigation or logout, allowing it to proceed');
        return undefined;
      }

      if (window.location.pathname.includes('admin-portal')) {
        console.log('🛡️ Blocked programmatic page reload on admin portal');
        console.warn('⚠️ Automatic page reload blocked by AdminPortalGuard');

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

  // CHANGED: Updated logic to use working auth
  if (!user || user.role !== 'admin') {
    return <Redirect to="/portal-login" />;  // CHANGED: Redirect to working login
  }

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Wrap children in AdminQueryProvider to prevent redirects in queries
  return (
    <AdminQueryProvider>
      {children}
    </AdminQueryProvider>
  );
};

export default AdminPortalGuard;
