import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

/**
 * A simplified version of the ClinicGuard that doesn't use the complex useAuth hook
 * This component directly checks the clinic status endpoint to authenticate users
 */
interface SimpleClinicGuardProps {
  children: React.ReactNode;
}

const SimpleClinicGuard: React.FC<SimpleClinicGuardProps> = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Directly fetch authentication status to bypass the complex hooks
  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/clinic-status');
        
        if (response.data.success && response.data.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          console.log('Successfully authenticated as clinic staff via SimpleClinicGuard');
          
          // Set session markers
          sessionStorage.setItem('clinic_portal_access_successful', 'true');
          sessionStorage.setItem('is_clinic_staff', 'true');
          sessionStorage.setItem('disable_promo_redirect', 'true');
          sessionStorage.setItem('clinic_session_active', 'true');
          
          // Set cookies for cross-component awareness
          document.cookie = "is_clinic_staff=true; path=/; max-age=86400; SameSite=Lax";
          document.cookie = "no_promo_redirect=true; path=/; max-age=86400; SameSite=Lax";
        } else {
          console.error('Authentication failed or insufficient permissions');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('SimpleClinicGuard: Redirecting to simple-clinic-login due to missing authentication');
    toast({
      title: 'Authentication Required',
      description: 'Please log in to access the clinic portal.',
    });
    return <Redirect to="/simple-clinic-login" />;
  }

  // Verified clinic staff or admin, allow access
  return <>{children}</>;
};

export default SimpleClinicGuard;