import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

/**
 * Simple Clinic Portal Page
 * This is a stripped-down version of the clinic portal that minimizes the complexity
 * to ensure it loads properly with the authenticated user.
 */
const SimpleClinicPage: React.FC = () => {
  const { user, isLoading, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [clinicData, setClinicData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  
  // Effect to fetch basic clinic data
  useEffect(() => {
    const fetchClinicData = async () => {
      if (!user || user.role !== 'clinic_staff') return;
      
      setDataLoading(true);
      try {
        // Fetch basic clinic info
        const { data } = await api.get('/clinics/profile');
        setClinicData(data);
      } catch (error) {
        console.error('Error fetching clinic data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load clinic data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };
    
    if (user && !isLoading) {
      fetchClinicData();
    }
  }, [user, isLoading, toast]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: 'Success',
        description: 'You have been logged out successfully.',
      });
      setLocation('/clinic-login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading authentication state...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    useEffect(() => {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access the clinic portal.',
      });
      setLocation('/clinic-login');
    }, []);
    
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Redirecting to login...</p>
      </div>
    );
  }

  if (user.role !== 'clinic_staff' && user.role !== 'admin') {
    // Redirect to login if not authorized
    useEffect(() => {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      setLocation('/clinic-login');
    }, []);
    
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