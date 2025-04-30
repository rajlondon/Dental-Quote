import React, { useEffect } from 'react';
import { Redirect, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

// A simpler clinic guard that uses the standard auth mechanism
const ClinicGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // If loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Redirect to="/portal-login" />;
  }

  // If user isn't a clinic role, redirect appropriately
  if (user.role !== 'clinic_staff') {
    // If admin, go to admin portal
    if (user.role === 'admin') {
      return <Redirect to="/admin-portal" />;
    }
    
    // If patient, go to patient portal
    if (user.role === 'patient') {
      return <Redirect to="/patient-portal" />;
    }
    
    // For any other role, go to home
    return <Redirect to="/" />;
  }

  // Allow access to clinic staff
  return <>{children}</>;
};

export default ClinicGuard;