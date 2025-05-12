import React from 'react';
import { useNavigate } from 'wouter';
import { Button } from '@/components/ui/button';
import { LockKeyhole, AlertTriangle } from 'lucide-react';

interface ClinicAccessDeniedPageProps {
  title?: string;
  message?: string;
  buttonLabel?: string;
  redirectUrl?: string;
}

/**
 * Specialized access denied page for clinic portal
 * Provides a clear error message and recovery options to guide clinic staff
 */
const ClinicAccessDeniedPage: React.FC<ClinicAccessDeniedPageProps> = ({
  title = "Access Denied",
  message = "You don't have permission to access this clinic portal. Please verify your credentials and try again.",
  buttonLabel = "Return to Login",
  redirectUrl = "/clinic-login"
}) => {
  const [, navigate] = useNavigate();
  
  const handleRedirect = () => {
    // Clear any potentially problematic session data
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('clinic_login_in_progress');
      sessionStorage.removeItem('clinic_session_active');
      sessionStorage.removeItem('clinic_dashboard_requested');
      sessionStorage.removeItem('clinic_portal_access_successful');
      
      // Explicitly remove cookies that could be preventing login
      document.cookie = "clinic_session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "is_clinic_staff=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    
    // Navigate to login page or specified redirect URL
    navigate(redirectUrl);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{message}</p>
          
          <div className="flex items-center justify-center mt-2 space-x-2 text-sm text-gray-500">
            <LockKeyhole className="w-4 h-4" />
            <span>Restricted access</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <Button
            className="w-full"
            onClick={handleRedirect}
          >
            {buttonLabel}
          </Button>
          
          <p className="mt-4 text-xs text-center text-gray-500">
            If you believe this is a mistake, please contact your administrator
            or try clearing your browser cookies and cache.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClinicAccessDeniedPage;