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

    // Store the original reload function
    const originalReload = window.location.reload;
    
    // Override reload to check for clinic portal pages
    window.location.reload = function preventReload(...args) {
      console.warn('⚠️ Automatic page reload blocked by ClinicGuard');
      refreshBlockedRef.current = true;
      
      toast({
        title: 'Refresh Prevented',
        description: 'Automatic refresh was blocked to prevent reconnection issues.',
      });
      
      // Always return false to prevent the reload
      return false;
    };
    
    // Restore the original reload function when the component unmounts
    return () => {
      // Use type assertion to restore the original function
      (window.location as any).reload = originalReload;
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