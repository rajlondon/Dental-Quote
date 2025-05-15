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
  
  // A single authentication check on mount with rate limiting protection
  useEffect(() => {
    let isActive = true; // Cleanup flag
    
    const verifyClinicAuth = async () => {
      // Only perform one check when component mounts
      if (!isActive) return;
      
      try {
        const result = await checkClinicStatus();
        
        if (!result.success) {
          console.error('Authentication failed or insufficient permissions');
          toast({
            title: 'Authentication Required',
            description: 'Please log in to access the clinic portal.',
          });
          setLocation('/simple-clinic-login');
        } else {
          console.log('Successfully authenticated as clinic staff');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        toast({
          title: 'Authentication Error',
          description: 'Please try logging in again.',
          variant: 'destructive',
        });
        setLocation('/simple-clinic-login');
      }
    };
    
    // Execute the check once
    verifyClinicAuth();
    
    // Cleanup function
    return () => {
      isActive = false;
    };
  }, [checkClinicStatus, toast, setLocation]);
  
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