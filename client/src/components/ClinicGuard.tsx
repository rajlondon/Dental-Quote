import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';
import { ClinicQueryProvider } from '@/hooks/use-clinic-queries';

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

    // Instead of trying to override window.location.reload (which is read-only),
    // use the beforeunload event to catch reload attempts
    const preventReload = (e: BeforeUnloadEvent) => {
      if (window.location.pathname.includes('clinic-portal')) {
        console.warn('⚠️ Automatic page reload blocked by ClinicGuard');
        refreshBlockedRef.current = true;
        
        // Show a toast notification
        toast({
          title: 'Refresh Prevented',
          description: 'Automatic refresh was blocked to prevent reconnection issues.',
        });
        
        // Cancel the event
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
      return undefined;
    };
    
    // Add event listener for beforeunload
    window.addEventListener('beforeunload', preventReload);
    
    // Remove event listener when the component unmounts
    return () => {
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

  if (user.role !== 'clinic_staff' && user.role !== 'admin') {
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