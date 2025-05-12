import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'wouter';

interface ClinicAccessDeniedPageProps {
  title?: string;
  message?: string;
  buttonLabel?: string;
  redirectUrl?: string;
}

const ClinicAccessDeniedPage: React.FC<ClinicAccessDeniedPageProps> = ({
  title = "Clinic Staff Access",
  message = "This page is not available for clinic staff.",
  buttonLabel = "Return to Clinic Portal",
  redirectUrl = "/clinic-portal"
}) => {
  const navigate = useNavigate();

  // Helper to handle navigation
  const handleRedirect = () => {
    // First set a session flag to prevent redirection loops
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('clinic_dashboard_requested', 'true');
      sessionStorage.setItem('disable_promo_redirect', 'true');
      
      // Set cookies to ensure the login process can't be hijacked
      document.cookie = "is_clinic_login=true; path=/; max-age=3600; SameSite=Lax";
      document.cookie = "no_promo_redirect=true; path=/; max-age=3600; SameSite=Lax";
      document.cookie = "is_clinic_staff=true; path=/; max-age=3600; SameSite=Lax";
      document.cookie = "user_role=clinic_staff; path=/; max-age=3600; SameSite=Lax";
      document.cookie = "disable_quote_redirect=true; path=/; max-age=3600; SameSite=Lax";
    }
    
    // Then navigate to the clinic portal
    navigate(redirectUrl);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="mb-6">{message}</p>
      <Button 
        variant="default" 
        className="px-6 py-2" 
        onClick={handleRedirect}
      >
        {buttonLabel}
      </Button>
    </div>
  );
};

export default ClinicAccessDeniedPage;