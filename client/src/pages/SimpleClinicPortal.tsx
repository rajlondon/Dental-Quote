import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

/**
 * A simplified version of the clinic portal without any complex initialization
 * that may cause page reloads
 */
const SimpleClinicPortal: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // No complex effects or initialization
  
  const handleLogout = async () => {
    try {
      // Clear any session data
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      
      // Simple logout sequence
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear React Query cache
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Show toast
      toast({
        title: 'Successfully logged out',
        description: 'You have been logged out of your account.',
      });
      
      // Redirect
      setLocation('/portal-login');
      
    } catch (err) {
      console.error('Logout error:', err);
      setLocation('/portal-login');
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Please log in first</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Simple Clinic Portal</h1>
      <p className="text-lg">Welcome, {user.email}</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a simplified version of the clinic portal without any complex initialization.</p>
          <p className="mt-4">User ID: {user.id}</p>
          <p>Role: {user.role}</p>
          
          <div className="mt-8">
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Note: This is a simplified version of the clinic portal for testing purposes.</p>
      </div>
    </div>
  );
};

export default SimpleClinicPortal;