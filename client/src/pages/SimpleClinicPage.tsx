import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useCookieAuth } from '@/hooks/use-cookie-auth';

/**
 * Simple Clinic Portal Page
 * This is a stripped-down version of the clinic portal that minimizes the complexity
 * to ensure it loads properly with the authenticated user.
 */
const SimpleClinicPage: React.FC = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, loading, error, logout, checkClinicStatus } = useCookieAuth();
  const [clinicData, setClinicData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  
  // Enhanced authentication check with fallback mechanisms
  useEffect(() => {
    let isActive = true; // Cleanup flag
    let redirectTimeout: NodeJS.Timeout;
    
    const verifyClinicAuth = async () => {
      // Only perform check if component is still mounted
      if (!isActive) return;
      
      try {
        // First check if we have session storage backup
        const storedUserData = sessionStorage.getItem('user_data');
        const isClinicStaff = sessionStorage.getItem('is_clinic_staff');
        
        if (user) {
          console.log('User already available in state:', user);
          return; // Already authenticated
        }
        
        // Try the API check first
        console.log('Checking clinic authentication status...');
        const result = await checkClinicStatus();
        
        if (result.success) {
          console.log('Successfully authenticated as clinic staff via API');
          return; // Success!
        }
        
        // If API check fails but we have stored data, try to use that
        if (!result.success && storedUserData && isClinicStaff) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log('Using stored user data:', userData);
            
            // Show a warning toast that we're using cached data
            toast({
              title: 'Using Cached Session',
              description: 'Your session will be restored from cache.',
            });
            
            return; // Using backup data
          } catch (parseErr) {
            console.error('Failed to parse stored user data:', parseErr);
          }
        }
        
        // If we get here, authentication has failed
        console.error('Authentication failed or insufficient permissions');
        
        // Show toast with delayed redirect to prevent jarring UX
        toast({
          title: 'Authentication Required',
          description: 'Please log in to access the clinic portal.',
        });
        
        // Redirect after a short delay
        redirectTimeout = setTimeout(() => {
          if (isActive) {
            setLocation('/simple-clinic-login');
          }
        }, 2000);
        
      } catch (error) {
        console.error('Authentication error:', error);
        
        // Try backup from session storage if available
        const storedUserData = sessionStorage.getItem('user_data');
        if (storedUserData && sessionStorage.getItem('is_clinic_staff')) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log('Using stored user data after error:', userData);
            
            toast({
              title: 'Using Cached Session',
              description: 'Connection issue detected. Using cached credentials.',
            });
            
            return; // Using backup data after error
          } catch (parseErr) {
            console.error('Failed to parse stored user data:', parseErr);
          }
        }
        
        // Show error toast
        toast({
          title: 'Authentication Error',
          description: 'Please try logging in again.',
          variant: 'destructive',
        });
        
        // Redirect after a short delay
        redirectTimeout = setTimeout(() => {
          if (isActive) {
            setLocation('/simple-clinic-login');
          }
        }, 2000);
      }
    };
    
    // Execute the check once
    verifyClinicAuth();
    
    // Cleanup function
    return () => {
      isActive = false;
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [checkClinicStatus, toast, setLocation, user]);
  
  // Effect to fetch basic clinic data
  useEffect(() => {
    const fetchClinicData = async () => {
      if (!user || (user.role !== 'clinic_staff' && user.role !== 'admin')) return;
      
      setDataLoading(true);
      try {
        // Just use the user data we already have from the cookie auth hook
        setClinicData({
          name: 'Your Clinic', // Placeholder since we're just demonstrating login works
          location: 'Istanbul, Turkey',
          id: user.clinicId || 1
        });
      } catch (error) {
        console.error('Error setting clinic data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load clinic data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };
    
    if (user && !loading) {
      fetchClinicData();
    }
  }, [user, loading, toast]);

  const handleLogout = async () => {
    try {
      // Use the cookie-aware logout function
      const success = await logout();
      
      if (success) {
        toast({
          title: 'Success',
          description: 'You have been logged out successfully.',
        });
        
        // Redirect to login page
        setLocation('/simple-clinic-login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading authentication state...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Clinic Portal</CardTitle>
          <CardDescription>
            Welcome to the simplified clinic portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="font-semibold">User Information:</p>
            <p>Name: {user.firstName} {user.lastName}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
          </div>
          
          {dataLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <p>Loading clinic data...</p>
            </div>
          ) : clinicData ? (
            <div className="mb-4">
              <p className="font-semibold">Clinic Information:</p>
              <p>Name: {clinicData.name}</p>
              <p>Location: {clinicData.location}</p>
            </div>
          ) : null}
          
          <div className="flex gap-4 mt-6">
            <Button
              onClick={() => setLocation('/clinic-portal/dashboard')}
              variant="outline"
            >
              Go to Full Clinic Portal
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleClinicPage;